import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DeliveryStatus } from 'src/app/enums/DeliveryStatus ';
import { PaymentType } from 'src/app/enums/PaymentType';
import { RequestStage } from 'src/app/enums/RequestStage';

import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';
import { ItemsService } from 'src/app/services/getAllServices/Items/items.service';
import { PriceListService } from 'src/app/services/getAllServices/PriceList/price-list.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { SalesService } from 'src/app/services/getAllServices/Sales/sales.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { WarehouseService } from 'src/app/services/getAllServices/Warehouse/warehouse.service';
import { WarehouseCatService } from 'src/app/services/getAllServices/WarehouseCategories/warehouse-cat.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {





  costCenters: any[] = [];
  salesOffers: any[] = [];

  clients: any[] = [];
  warehouses: any[] = [];
  representatives: any[] = []
  teams: any[] = [];
  priceLists: any[] = [];
  saleOfferForm: FormGroup;
  tableData = [
    {
      selectedItemId: null,
      code: '',
      unit: '',
      unitPrice: 0,
      tax: 0,
      discount: 0,
      total: 0,
    },
  ];

  paymentType = PaymentType;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  paymentTypeList: { key: string, value: string }[] = [];
  requestStage = RequestStage;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  requestStageList: { key: string, value: string }[] = [];

  updateStatusForm: FormGroup

  apiUrl = environment.apiUrl;
  constructor(private salesService: SalesService, private clientService: ClientsService,
    private teamService: TeamsService, private representative: RepresentativeService,
    private wareService: WarehouseService, private fb: FormBuilder,
    private pricelistService: PriceListService, private costService: CostCenterService,
    private http: HttpClient, private toast: ToastrService, private itemService: ItemsService, private renderer: Renderer2,
    private cdr: ChangeDetectorRef, private ngZone:NgZone
  ) {

    this.saleOfferForm = this.fb.group({
      clientId: ['', Validators.required ],
      representativeId: ['', Validators.required ],
      teamId: ['', null],
      clientPurchaseOrder: [''],
      costCenterId: ['', null],
      warehouseId: ['', null],
      offerExpiryDate: [''],
      paymentPeriod: [''],
      paymentType: ['', null],
      items: this.fb.array([] , Validators.required ) ,
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])




    });



    this.paymentTypeList = Object.keys(this.paymentType).map(key => ({
      key: key,
      value: this.paymentType[key as keyof typeof PaymentType]
    }));

    this.requestStageList = Object.keys(this.requestStage).map(key => ({
      key: key,
      value: this.requestStage[key as keyof typeof RequestStage]
    }));

    this.updateStatusForm = this.fb.group({
      requestId: ['', Validators.required],
      requestStage: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllSaleOffers();
    this.getAllPriceLists();
    this.getAllWarehouses();
    this.getAllTeams();
    this.getAllRepresentatives();
    this.getcostCenters();
    this.getAllClients();
    this.getAllItems();
    // this.getSalesOfferWithoutPaging();
  }

  // buttons=['المعلومات الأساسية','المواقع و الفروع','المرفقات','المهام' ,'الحساب البنكي','الأشعارات والتذكير','التقارير','معلومات التواصل','بيانات الضريبه','الاستبيانات']
  buttons = ['الأصناف', 'الملاحظات', 'المهام', 'مرفقات','الانشطه']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }




  get items(): FormArray {
    return this.saleOfferForm.get('items') as FormArray;
  }
  addItem() {
    const itemGroup = this.fb.group({
      itemId: [null],
      quantity: [0],
      unitPrice: [0],
      discount: [0],
      salesTax: [0],
      unit: [0],
      notes: [''],
    });

    this.items.push(itemGroup);
  }
  // Method to remove an item from the FormArray
  removeItem(index: number) {
    this.items.removeAt(index);
  }



  getAllSaleOffers() {
    this.salesService.getSalesOffers(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.salesOffers = response.saleOffers;
        this.filteredSalesOffers = this.salesOffers;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        this.mapRequestStage();
        console.log(this.salesOffers);
      },
      error: (err) => {
        console.error('Error fetching salesOffers data:', err);
        this.salesOffers = []; // Ensure it's initialized as an empty array
      }
    });
  }

  getAllClients() {
    this.clientService.getCliensts().subscribe(response => {
      this.clients = response.data;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  clients:', error)
    })
  }
  itemss: any[] = [];
  getAllItems() {
    this.itemService.getAllItems().subscribe(response => {
      this.itemss = response.item1;
      console.log(this.itemss)
    }, error => {
      console.error('Error fetching items: ', error)
    }
    )
  }
  getAllWarehouses() {
    this.wareService.getAllWarehouses().subscribe(response => {
      this.warehouses = response.data;
      //console.log(this.warehouses);
    }, error => {
      console.error('Error fetching  warehouses:', error)
    })
  }

  getAllRepresentatives() {
    this.representative.getAllRepresentative().subscribe(response => {
      this.representatives = response;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  representatives:', error)
    })
  }

  getAllTeams() {
    this.teamService.getTeams().subscribe(response => {
      this.teams = response.teams;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  teams:', error)
    })
  }

  getAllPriceLists() {
    this.pricelistService.getAllPriceLists().subscribe(response => {
      this.priceLists = response.data;
      //console.log(this.priceLists);
    }, error => {
      console.error('Error fetching price lists data:', error)
    })
  }
  getcostCenters() {
    this.costService.getAllCostCaners().subscribe(response => {
      this.costCenters = response.costCenters;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching costs data:', error)
    })
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.saleOfferForm.get('attachments') as FormArray;
  }
    // Method to handle files dropped into the ngx-file-drop zone
    dropped(event: any): void {
      if (event && event.length) {
        for (const droppedFile of event) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
    
          if (fileEntry.isFile) {
            fileEntry.file((file: File) => {
              const fileData = {
                fileTitle: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl: null, // Placeholder for URL after upload
                file: file,
              };
              this.attachments.push(this.fb.control(fileData));
            });
          }
        }
      } else {
        console.error('No files detected in the dropped event:', event);
      }
    }
    
  
  
    // Method to handle when a file is over the drop zone
    fileOver(event: any): void {
      console.log('File is over the drop zone:', event);
    }
  
    // Method to handle when a file leaves the drop zone
    fileLeave(event: any): void {
      console.log('File has left the drop zone:', event);
    }
  // Method to handle file selection
  onFileSelected(event: Event): void {
    this.toggleDragDrop();
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Add the selected file to the FormArray as a FormControl
      const fileData = {
        fileTitle: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: null, // Placeholder for URL after upload
        file: file,
      };
      this.attachments.push(this.fb.control(fileData));
      console.log(this.attachments)
      // Reset the input value to allow selecting the same file again
      input.value = '';
    }
  }

  // Method to remove a file from the attachments FormArray
  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
    if(this.attachments.length==0) this.toggleDragDrop();
  }

  @ViewChild('myModal', { static: false }) modal!: ElementRef;
  ngAfterViewInit(): void {
    this.modal.nativeElement.addEventListener('hidden.bs.modal', () => {
      // Fallback cleanup in case Bootstrap doesn't properly clean up
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    });
  }
  initializeSaleOfferForm(): FormGroup {
    return this.fb.group({
      clientId: ['', Validators.required],
      representativeId: ['', Validators.required],
      teamId: [''],
      clientPurchaseOrder: [''],
      costCenterId: [''],
      warehouseId: [''],
      offerExpiryDate: [''],
      paymentPeriod: [''],
      paymentType: [''],
      items: this.fb.array([], Validators.required),
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([]),
    });
  }
  
  onSubmit() {
    const clientControl = this.saleOfferForm.get('clientId');
    const representativeControl = this.saleOfferForm.get('representativeId');
    const itemsArray = this.saleOfferForm.get('items') as FormArray;
  
    // Validate clientId field
    if (!clientControl || clientControl.invalid) {
      console.log('Form is invalid because the client id field is invalid.');
      console.log('Client field errors:', clientControl?.errors);
      this.saleOfferForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
  
    // Validate representativeId field
    if (!representativeControl || representativeControl.invalid) {
      console.log('Form is invalid because the representative id field is invalid.');
      console.log('Representative field errors:', representativeControl?.errors);
      representativeControl?.markAsTouched();
      this.cdr.detectChanges();
      return;
    }
  
    // Validate items array
    if (!itemsArray || itemsArray.length === 0) {
      console.log('Form is invalid because the items array is empty.');
      this.items.clear(); // Clear items if validation fails
      return;
    }
  
    // Form data preparation
    const formData = new FormData();
    formData.append('clientId', clientControl.value);
    formData.append('representativeId', representativeControl.value);
    formData.append('teamId', this.saleOfferForm.get('teamId')?.value);
    formData.append('clientPurchaseOrder', this.saleOfferForm.get('clientPurchaseOrder')?.value);
    formData.append('costCenterId', this.saleOfferForm.get('costCenterId')?.value);
    formData.append('warehouseId', this.saleOfferForm.get('warehouseId')?.value);
    formData.append('offerExpiryDate', this.saleOfferForm.get('offerExpiryDate')?.value);
    formData.append('paymentPeriod', this.saleOfferForm.get('paymentPeriod')?.value);
    formData.append('paymentType', this.saleOfferForm.get('paymentType')?.value);
  
    this.items.controls.forEach((item, index) => {
      const itemValue = item.value;
      formData.append(`items[${index}].itemId`, itemValue.itemId);
      formData.append(`items[${index}].quantity`, itemValue.quantity);
      formData.append(`items[${index}].unitPrice`, itemValue.unitPrice);
      formData.append(`items[${index}].salesTax`, itemValue.salesTax);
      formData.append(`items[${index}].discount`, itemValue.discount);
      formData.append(`items[${index}].unit`, itemValue.unit);
      formData.append(`items[${index}].notes`, itemValue.notes);
    });
  
    this.attachments.controls.forEach((control) => {
      const fileData = control.value;
      if (fileData && fileData.file instanceof File) {
        // Append the actual file object
        formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
      }
    });
  
    const headers = new HttpHeaders({
      tenant: localStorage.getItem('tenant') || '',
    });
  
    this.http.post(this.apiUrl + 'SaleOffer', formData, { headers }).subscribe(
      (response) => {
        console.log('Response:', response);
        this.toast.success('تمت الإضافة بنجاح');
        this.getAllSaleOffers();
        // Reset the form but keep validators intact
        
        this.saleOfferForm = this.initializeSaleOfferForm();
  
        this.items.clear();
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
  
        // Cleanup modal
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
        }, 300);
  
        this.attachments.clear();
      },
      (error) => {
        console.error('Error:', error);
        const errorMessage = error.error?.message || 'حدث خطأ';
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      }
    );
  }
  

  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllSaleOffers();
    }
  }

  isDropdownOpen: boolean = false;
  private documentClickListener: any; // Listener reference for cleanup

  toggleDropdownOptions(): void {
    this.isDropdownOpen = !this.isDropdownOpen;

    // Add document click listener when the dropdown is open
    if (this.isDropdownOpen) {
      this.documentClickListener = this.renderer.listen('document', 'click', (event: Event) => {
        const targetElement = event.target as HTMLElement;
        const clickedInsideDropdown = targetElement.closest('.dropdown'); // Check if click is inside dropdown
        if (!clickedInsideDropdown) {
          this.isDropdownOpen = false; // Close the dropdown
        }
      });
    } else {
      this.removeDocumentClickListener();
    }
  }
  private removeDocumentClickListener(): void {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }
  storesSec: any[] = [];
  isModalOpen = false;
  selectedCategory: any = null;

  onCheckboxChange(category: any) {
    // this.updateSelectAll();
    // this.selectedCategory = category;  
    //--------------------------------------------------------------------------
    this.updateSelectAll();

    if (category.checked) {
      // If the checkbox is checked, set the selected category
      this.selectedCategory = category;
    } else {
      // If the checkbox is unchecked, clear the selected category
      this.selectedCategory = null;
    }
  }
  item: any
  ItemsById(id: number) {
    this.itemService.getItemDetails(id).subscribe(
      (data) => {
        this.item = data;
        console.log('Fetched item:', this.item);
      },
      (error) => {
        console.error('Error fetching item:', error);
      }
    );
  }
  itemName: any;
  getItemNameById(itemId: number): string { 
    const item = this.itemss.find(i => i.itemId === itemId);
    return item ? item.itemName : '';
  }
  openModalForSelected() {
    if (this.selectedCategory) {
      this.saleOfferForm.patchValue({
        clientId: this.selectedCategory.clientId,
        representativeId: this.selectedCategory.representativeId,
        teamId: this.selectedCategory.teamId,
        purchaseOrderNumber: this.selectedCategory.purchaseOrderNumber,
        costCenterId: this.selectedCategory.costCenterId,
        warehouseId: this.selectedCategory.warehouseId,
        offerExpiryDate: this.selectedCategory.offerExpiryDate,
        paymentPeriod: this.selectedCategory.paymentPeriod,
        paymentType: this.selectedCategory.paymentType,
      });
      this.selectedCategory.items.forEach((item: any) => {
        const itemName = this.getItemNameById(item.itemId);
        if (!item.itemId) {
          console.error('Invalid itemId:', item);
          return;
        }
        const items = this.fb.group({
          itemId: [item.itemId], // Bind itemId to the form
          itemName: [itemName], // Bind the itemName for display purposes
          quantity: [item.quantity], // Ensure quantity is valid
          unitPrice: [item.unitPrice], // Ensure unitPrice is valid
          salesTax: [item.salesTax],
          discount: [item.discount],
          unit: [item.unit],
          notes: [item.notes],
        });
        this.items.push(items);
      });
      this.attachments.clear();
      if (this.selectedCategory.attachments?.length) {
        this.selectedCategory.attachments.forEach((attachment: any) => {
          this.attachments.push(this.fb.group({ file: attachment })); // Existing attachment
          console.log(this.attachments.controls);
        });
      }
      this.getActivities();
      this.isModalOpen = true;
    } else {
      alert('الرجاء اختيار العنصر');
    }
  }
// Method to add a new delivery note item
updateItem() {
  const newItem = this.fb.group({
    itemId: [null],               // Default value, can be selected later
    itemName: [''],               // To be filled based on selection
    quantity: [0],       // Default quantity
    unitPrice: [0],               // Default price
    salesTax: [0],                // Default sales tax
    discount: [0],                 // Default discount
    unit: [''],                   // Default unit
    notes: [''],                  // Default notes
  });
  
  this.items.push(newItem);
}
onAddItemButtonClick() {
  this.addItem();
}
  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.saleOfferForm.reset();
    this.resetAttachments();
  }
  resetAttachments(){
    this.attachments.clear();
  }

  updateCategory() {
      const updatedCategory = { ...this.saleOfferForm.value, id: this.selectedCategory.id };

      const clientControl = this.saleOfferForm.get('clientId');
      const representativeControl = this.saleOfferForm.get('representativeId');
      const itemsArray = this.saleOfferForm.get('items') as FormArray;
      
      // Validate clientId field
      if (!clientControl || clientControl.invalid) {
        console.log('Form is invalid because the client id field is invalid.');
        console.log('Client field errors:', clientControl?.errors);
        this.saleOfferForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission
      }
      
      // Validate representativeId field
      if (!representativeControl || representativeControl.invalid) {
        console.log('Form is invalid because the representative id field is invalid.');
        console.log('Representative field errors:', representativeControl?.errors);
        representativeControl?.markAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission
      }
      
      // Validate items array
      if (!itemsArray || itemsArray.length === 0) {
        console.log('Form is invalid because the items array is empty.');
        itemsArray?.markAllAsTouched();
        this.cdr.detectChanges();
        // alert('The items array must have at least one item.');
        return; // Stop submission
      }
      
      // Call the update service method using the category's id
      this.salesService.updateSaleOffer(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Sale offer updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllSaleOffers();
          this.closeModal();  // Close the modal after successful update
          this.saleOfferForm.reset();
        },
        (error) => {
          console.error('Error updating sale offer:', error);
          console.log('Updated sale offer Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'حدث خطأ';
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
  
  }

  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  deleteItemType() {
    const selectedItems = this.filteredSalesOffers.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.salesService.deleteSaleOfferById(item.id).subscribe({
        next: () => {
          successfulDeletions.push(item.id);
          this.toast.success(`تم حذف العنصر: ${item.name}`);
          if (index === selectedItems.length - 1) {
            this.finalizeDeletion(successfulDeletions, failedDeletions);
          }
        },
        error: (error) => {
          failedDeletions.push({ id: item.id, error });
          this.toast.error(
            `تعذر حذف العنصر: ${item.name}. مرتبط بكيان آخر أو حدث خطأ.`,

          );
          if (index === selectedItems.length - 1) {
            this.finalizeDeletion(successfulDeletions, failedDeletions);
          }
        },
      });
    });

  }
  finalizeDeletion(successfulDeletions: number[], failedDeletions: { id: number; error: any }[]) {
    // Remove successfully deleted items from the table
    this.filteredSalesOffers = this.filteredSalesOffers.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredSalesOffers.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllSaleOffers();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllSaleOffers();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllSaleOffers();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }


  loadClients() {
    this.clientService.getCliensts().subscribe({
      next: (data) => {
        this.clients = data.returnInvoices;
        // Load invoices only after clients are successfully fetched
        this.loadSalesOffer();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.clients = []; // Ensure it's initialized as an empty array
      }
    });
  }

  sales: any[] = []
  loadSalesOffer() {
    this.salesService.getSalesOfferWithoutPaging().subscribe({
      next: (data) => {
        this.sales = data.returnInvoices;
        // Map client names only when both invoices and clients are loaded
        this.mapClientNames();
        // this.mapDeliveryStatus();
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
        this.sales = []; // Ensure it's initialized as an empty array
      }
    });
  }

  mapClientNames() {
    if (this.clients.length && this.sales.length) {
      this.sales.forEach(sale => {
        const client = this.clients.find(c => c.id === sale.clientId);
        sale.clientName = client ? client.name : 'Unknown'; // Handle missing client cases
      });
    }
  }

  mapRequestStage() {
    this.salesOffers.forEach(offer => {
      // Assuming each offer has a `requestStage` property that is a number
      offer.requestStageName = this.getRequestStageName(offer.requestStage);
    });
  }

  // Get the name of the request stage from the number
  getRequestStageName(stageNumber: number): string {
    // Define a mapping array for the numeric indices to the enum values
    const stageMapping: string[] = [
      RequestStage.PriceOffer,        // 0
      RequestStage.SalesOrder,   // 1
      RequestStage.GoodsDelivery,    // 2
      RequestStage.Canceld,     // 3
      RequestStage.Invoiced   // 4
    ];

    return stageMapping[stageNumber] || 'Unknown';
  }


  // Update Status

  requestId: number = 0; // Store selected request ID
  requestStag: any // Store selected request stage
  selectedNoteId!: number;

  selectNoteId(note: any) {
    this.requestId = note.id;
    console.log(note.id)
  }
  updateSaleOfferStatus(item: any) {
    const requestId = item.id;
    const requestStage = item.requestStage;

    if (requestId && requestStage !== undefined) {
      this.salesService.updateStatusSaleOffer(requestId, requestStage).subscribe({
        next: (response) => {
          console.log('Status updated successfully:', response);
          this.toast.success('تم تحديث الحالة بنجاح');
        },
        error: (error) => {
          console.error('Error updating status:', error);
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error("لا يمكن التغيير الى هذه الحالة");
        }
      });
    } else {
      this.toast.warning('اختر حالة صالحة');
    }
  }

  // dropdown table columns
  columns = [
    // { name: 'id', displayName: 'المسلسل', visible: true },
    { name: 'clientPurchaseOrder', displayName: 'طلب شراء العميل', visible: true },
    { name: 'offerExpiryDate', displayName: 'تاريخ انتهاء العرض', visible: true },
    { name: 'code', displayName: 'كود ', visible: true },
    { name: 'clientName', displayName: 'اسم العميل', visible: true },
    { name: 'representativeName', displayName: 'المندوب', visible: false },
    { name: 'teamName', displayName: 'الفريق', visible: false },
    { name: 'warehouseName', displayName: 'المستودع', visible: false },
    { name: 'costCenterName', displayName: 'مركز التكلفة', visible: false },
    { name: 'attachments', displayName: 'المرفقات', visible: true },


  ];
  showDropdownCol = false;
  toggleDropdownCol() {
    this.showDropdownCol = !this.showDropdownCol; // Toggle the dropdown visibility
    console.log('Dropdown visibility:', this.showDropdownCol); // Check if it’s toggling
  }
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const dropdownElement = document.querySelector('.dropdown-menu');
  const iconElement = document.querySelector('.fa-right-left');

  // Close dropdown if the click is outside both the dropdown and the icon
  if (dropdownElement && !dropdownElement.contains(event.target as Node) && iconElement && !iconElement.contains(event.target as Node)) {
    this.showDropdownCol = false;
    console.log('Dropdown closed');
  }
}
  isColumnVisible(columnName: string): boolean {
    const column = this.columns.find(col => col.name === columnName);
    return column ? column.visible : false;
  }

  toggleColumnVisibility(columnName: string) {
    const column = this.columns.find(col => col.name === columnName);
    if (column) {
      column.visible = !column.visible;
    }
  }

  // select checkbox

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.salesOffers.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.salesOffers.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.salesOffers.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.salesOffers.filter(item => item.checked).length;
  }



  // Filter data based on search term
  filteredSalesOffers: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getSalesOfferWithoutPaging() {
    this.salesService.getSalesOfferWithoutPaging().subscribe(response => {
      this.salesOffers = response.saleOffers;
      this.applySearchFilter(); // Filter data based on search query

    }, error => {
      console.error('Error fetching items: ', error)
    }
    )
  }
  // Method to fetch and display data based on search condition
  fetchSaleOffers() {
    // Check if there's a search query that is not empty
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      // If there's a search query, fetch all data without pagination
      this.getSalesOfferWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllSaleOffers();
    }
  }
  // Method to trigger search when the user types or submits the search query
  onSearchInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.fetchSaleOffers();
  }

  // Method to apply search filter on the full data
  applySearchFilter() {
    if (this.searchQuery.trim()) {
      // Filter the data based on the search query
      this.filteredSalesOffers = this.salesOffers.filter(item =>
        (item.clientName && item.clientName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.costCenterName && item.costCenterName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.warehouseName && item.warehouseName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.teamName && item.teamName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.representativeName && item.representativeName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.clientPurchaseOrder && item.clientPurchaseOrder.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredSalesOffers = this.salesOffers;
    }
  }

  
// Toggle Drag and Drop
showDragDrop =true;
toggleDragDrop(){
  this.showDragDrop = !this.showDragDrop;
}

//Audio
mediaRecorder: MediaRecorder | null = null;
audioChunks: Blob[] = [];
isRecording = false;
recCount =-1;
startRecording() {
  this.isRecording = true;
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.start();
    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };
  }).catch((error) => {
    console.error("Error accessing microphone:", error);
  });
  this.recCount++;
}
isSaving = false;

stopRecording() {
  this.isRecording = false;
  if (this.mediaRecorder) {
    this.isSaving = true;
    this.mediaRecorder.stop();
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      this.audioChunks = [];
      this.ngZone.run(() => {
        this.uploadAudio(audioBlob);
        this.isSaving = false; // Angular will detect this change
        this.toggleDragDrop();
      });
    };
  }
}

async uploadAudio(audioBlob: Blob) {
  const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
  const fileData = {
    fileTitle: this.recCount > 0 ? `${audioFile.name.slice(0, 9)}(${this.recCount})${audioFile.name.slice(9)}` : audioFile.name,
    fileType: audioFile.type,
    fileName: audioFile.name,
    fileSize: audioFile.size,
    file: audioFile,
  };

  // Create a URL for the audio Blob
  const audioUrl = URL.createObjectURL(audioBlob);

  // Update the attachment with audio URL
  this.attachments.push(this.fb.control({ ...fileData, audioUrl }));

  // Trigger change detection
  // this.changeDetectorRef.detectChanges();
}

activities: any[] = [];
getActivities(){
  this.salesService.getSaleOfferActivities(this.selectedCategory.id).subscribe((res)=>{
    this.activities = res;
    console.log(res)
  })
}
}