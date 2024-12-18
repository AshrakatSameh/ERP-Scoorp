import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SalesService } from 'src/app/services/getAllServices/Sales/sales.service';
import { SalesComponent } from '../sales.component';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentPeriodsService } from 'src/app/services/getAllServices/PaymentPeriods/payment-periods.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { InvoiceStatus } from 'src/app/enums/InvoiceStatus';
import { ItemsService } from 'src/app/services/getAllServices/Items/items.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';
import { InvoiceType } from 'src/app/enums/InvoiceType';
import { PriceListService } from 'src/app/services/getAllServices/PriceList/price-list.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-sales-invoices',
  templateUrl: './sales-invoices.component.html',
  styleUrls: ['./sales-invoices.component.css']
})
export class SalesInvoicesComponent implements OnInit {


  salesForm: FormGroup;

  priceLists: any[] = [];
  salesIvoices: any[] = [];
  representatives: any[] = []
  clients: any[] = [];
  payPeriods: any[] = [];
  teams: any[] = [];
  itemsList: any[] = [];
  costCenters: any[] = [];


  invoiceStatus = InvoiceStatus;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  invoiceStatusList: { key: string, value: string }[] = [];

  invoiceType = InvoiceType;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  invoiceTypeList: { key: string, value: string }[] = [];

  comments:any[] =[];
  imgApiUrl= environment.imgApiUrl;
  commentForm:FormGroup;

  userId:any;
  constructor(private salesInvoiceService: SalesService, private clientService: ClientsService,
    private representService: RepresentativeService, private fb: FormBuilder, private payService: PaymentPeriodsService,
    private teamService: TeamsService, private itemServices: ItemsService,private renderer: Renderer2,
    private costService: CostCenterService, private priceService: PriceListService,
    private http: HttpClient, private toast: ToastrService, private itemService: ItemsService,
    private cdr: ChangeDetectorRef,private ngZone:NgZone, private jwtHelper:JwtHelperService

  ) {
    this.userId = this.jwtHelper.decodeToken(localStorage.getItem("authToken")!).UserId;


    this.salesForm = this.fb.group({
      clientId:  ['', Validators.required],
      representativeId:  ['', Validators.required],
      teamId:  [''],
      invoiceNumber: [''],
      priceListId:  [''],
      paymentPeriodId:  ['', Validators.required],
      invoiceType: [''],
      costCenterId:  [''],
      driver: [''],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([]),

      items: this.fb.array([], Validators.required) 
      // purchaseOrderNumber: ['', Validators.required],

      // note:[],
      // AttachmentFiles:[],
      // saleOfferId:[],
      // deliveryNoteId:[],

    });


    this.invoiceStatusList = Object.keys(this.invoiceStatus).map(key => ({
      key: key,
      value: this.invoiceStatus[key as keyof typeof InvoiceStatus]
    }));
    this.invoiceTypeList = Object.keys(this.invoiceType).map(key => ({
      key: key,
      value: this.invoiceType[key as keyof typeof InvoiceType]
    }));


        // Initializing Comment Form
        this.commentForm = this.fb.group({
          content:['', Validators.required],
          entityId:['', Validators.required],
          parentCommentId:[''],
          attachmentFiles: this.fb.array([])
        })

  }
  ngOnInit(): void {
    this.getAllSaleIncoices();
    this.getAllClients();
    this.getAllTeams();
    this.getAllRepresentatives();
    this.getAllCostcenters();
    this.getAllPayPeriods();
    this.getAllPriceLists();
    this.getAllItems();

  }

  buttons = ['الأصناف', 'الملاحظات', 'المهام', 'مرفقات']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  getAllSaleIncoices() {
    this.salesInvoiceService.getSalesInvoices(this.pageNumber, this.pageSize).subscribe(response => {
      this.salesIvoices = response.salesInvoices;
      this.filteredSalesInvoices = this.salesIvoices;
      this.totalCount = response.totalCount; // Assuming response contains totalCount
      this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
      console.log(this.salesIvoices);
      this.mapInvoiceStatus()
    }, error => {
      console.error('Error fetching sales data:', error)
    })
  }


  getAllRepresentatives() {
    this.representService.getAllRepresentative().subscribe(response => {
      this.representatives = response;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  representatives:', error)
    })
  }

  getAllClients() {
    this.clientService.getCliensts().subscribe(response => {
      this.clients = response.data;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  clients:', error)
    })
  }

  getAllPayPeriods() {
    this.payService.getAllPaymentPeriods().subscribe(response => {
      this.payPeriods = response.paymentPeriods;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  payments:', error)
    })
  }

  getAllTeams() {
    this.teamService.getTeams().subscribe(response => {
      this.teams = response.teams;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  teams:', error)
    })
  }


  getAllItems() {
    this.itemServices.getAllStoredItems().subscribe(response => {
      this.itemsList = response.items;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  items:', error)
    })
  }

  getAllCostcenters() {
    this.costService.getAllCostCaners().subscribe(response => {
      this.costCenters = response.costCenters;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  costCenters:', error)
    })
  }


  getAllPriceLists() {
    this.priceService.getAllPriceLists().subscribe(response => {
      this.priceLists = response.data;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  priceLists:', error)
    })
  }


  // Method to remove an item from the FormArray
  get Items(): FormArray {
    return this.salesForm.get('items') as FormArray;
  }
  tableData = [
    {
      selectedItemId: null,
      quantity: '',
      unit: '',
      unitPrice: 0,
      tax: 0,
      discount: 0,
      note: '',
    },
  ];
  removeItem(index: number) {
    this.Items.removeAt(index);
  }
  addDeliveryNoteItem() {
    const item = this.fb.group({
      itemId: [0],
      note: [null],
      unitPrice: [0],
      unit: [null],
      tax: [0],
      discount: [0],
      soldQuantity: [0]
    });
    this.Items.push(item);
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachmentFiles(): FormArray {
    return this.salesForm.get('attachmentFiles') as FormArray;
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
              this.attachmentFiles.push(this.fb.control(fileData));
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
      this.attachmentFiles.push(this.fb.control(fileData));
      console.log(this.attachmentFiles)
      // Reset the input value to allow selecting the same file again
      input.value = '';
    }
  }

  // Method to remove a file from the attachments FormArray
  removeAttachment(index: number): void {
    this.attachmentFiles.removeAt(index);
    if(this.attachmentFiles.length==0) this.toggleDragDrop();
  }

  @ViewChild('myModal', { static: false }) modal!: ElementRef;
  ngAfterViewInit(): void {
    this.modal.nativeElement.addEventListener('hidden.bs.modal', () => {
      // Fallback cleanup in case Bootstrap doesn't properly clean up
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    });
  }

  onSubmit() {
    const clientControl = this.salesForm.get('clientId');
    const representativeControl = this.salesForm.get('representativeId');
    const paymentPeriodControl = this.salesForm.get('paymentPeriodId');
    const itemsArray = this.salesForm.get('items') as FormArray;
    
    // Validate clientId field
    if (!clientControl || clientControl.invalid) {
      console.log('Form is invalid because the client id field is invalid.');
      console.log('Client field errors:', clientControl?.errors);
      this.salesForm.markAllAsTouched();
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
    if (!paymentPeriodControl || paymentPeriodControl.invalid) {
      console.log('Form is invalid because the payment period field is invalid.');
      console.log('payment period field errors:', paymentPeriodControl?.errors);
      paymentPeriodControl?.markAsTouched();
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
    
    const formData = new FormData();
    const getValue = (fieldName: string) =>
      this.salesForm.get(fieldName)?.value || ''; // Return empty string if null/undefined
  
    formData.append('clientId', getValue('clientId'));
    formData.append('representativeId', getValue('representativeId'));
    formData.append('teamId', getValue('teamId')); // Handles potential null
    formData.append('invoiceNumber', getValue('invoiceNumber'));
    formData.append('priceListId', getValue('priceListId')); // Handles potential null
    formData.append('paymentPeriodId', getValue('paymentPeriodId'));
    formData.append('costCenterId', getValue('costCenterId')); // Handles potential null
    formData.append('driver', getValue('driver'));
  
    // Append each attachment file
    this.attachmentFiles.controls.forEach((control) => {
      const fileData = control.value;
      if (fileData && fileData.file instanceof File) {
        // Append the actual file object
        formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
      }
    });
  
    // Append PriceListItems array
    const items = this.salesForm.get('items') as FormArray;
    items.controls.forEach((item, index) => {
      formData.append(`Items[${index}].itemId`, item.get('itemId')?.value || '');
      formData.append(`Items[${index}].note`, item.get('description')?.value || '');
      formData.append(`Items[${index}].unitPrice`, item.get('unitPrice')?.value || '');
      formData.append(`Items[${index}].unit`, item.get('unit')?.value || '');
      formData.append(`Items[${index}].tax`, item.get('tax')?.value || '');
      formData.append(`Items[${index}].discount`, item.get('discount')?.value || '');
      formData.append(`Items[${index}].soldQuantity`, item.get('soldQuantity')?.value || '');
    });
  
    const headers = new HttpHeaders({
      tenant: localStorage.getItem('tenant') || '',
    });
  
    this.http.post(this.apiUrl + 'SalesInvoice', formData, {
      headers,
      responseType: 'text',
    }).subscribe(
      (response) => {
        console.log('Response:', response);
        this.toast.success('تمت الإضافة بنجاح');
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
        }, 300);
        this.salesForm.reset({
          code: [],
          clientId: [null],
          representativeId: [null],
          teamId: [null],
          invoiceNumber: [null],
          priceListId: [null],
          paymentPeriodId: [null],
          invoiceType: [null],
          costCenterId: [null],
          driver: [null],
          attachmentFiles: this.fb.array([]),
          attachments: this.fb.array([]),
          items: this.fb.array([]) || null,
        });
        this.getAllSaleIncoices();
      },
      (error) => {
        console.error('Error:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      }
    );
  }
  

  apiUrl = environment.apiUrl;

  // Update invoice
  storesSec: any[] = [];
  isModalOpen = false;
  selectedCategory: any = null; 
  selectedForDelete: any[] = [];
  onCheckboxChange(category: any, event: any) {
    if (event.target.checked) {
      // Add the item to the selectedForDelete array
      this.selectedForDelete.push(category);
      // Update selectedCount
      this.selectedCount++;
      // If this is the first category selected, update selectedCategory for updating
      if (!this.selectedCategory) {
        this.selectedCategory = { ...category };
      }
    } else {
      // Remove the category from the selectedForDelete array if unchecked
      const index = this.selectedForDelete.findIndex((i) => i.id === category.id);
      if (index > -1) {
        this.selectedForDelete.splice(index, 1);
      }
      // Update selectedCount
      this.selectedCount--;
      // If this category is deselected and was the selectedCategory, clear it
      if (this.selectedCategory?.id === category.id) {
        this.selectedCategory = null;
      }
    }
    this.updateSelectAll(); // Update the "select all" checkbox status
  }
  

  openModalForSelected() {
    console.log(this.selectedCategory)
    if (this.selectedCategory) {
      this.salesForm.patchValue({
        code: this.selectedCategory.code,
        clientId: this.selectedCategory.clientId,
        representativeId: this.selectedCategory.representativeId,
        teamId: this.selectedCategory.teamId,
        invoiceNumber: this.selectedCategory.invoiceNumber,
        priceListId: this.selectedCategory.priceListId,
        paymentPeriodId: this.selectedCategory.paymentPeriodId,
        invoiceType: this.selectedCategory.invoiceType,
        costCenterId: this.selectedCategory.costCenterId,
        driver: this.selectedCategory.driver,
      });
      this.attachmentFiles.clear();
      if (this.selectedCategory.attachmentFiles?.length) {
        this.selectedCategory.attachmentFiles.forEach((attachment: any) => {
          this.attachmentFiles.push(this.fb.group({ file: attachment })); // Existing attachment
          console.log(this.attachmentFiles.controls);
        });
      }
      this.isModalOpen = true;
    } else {
      alert('الرجاء اختيار العنصر ');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.salesForm.reset();
    this.resetAttachments();
  }
  resetAttachments(){
    this.attachmentFiles.clear();
  }

  updateCategory() {
      const updatedCategory = { ...this.salesForm.value, id: this.selectedCategory.id };
      const clientControl = this.salesForm.get('clientId');
      const representativeControl = this.salesForm.get('representativeId');
      const paymentPeriodControl = this.salesForm.get('paymentPeriodId');
      const itemsArray = this.salesForm.get('items') as FormArray;
      
      // Validate clientId field
      if (!clientControl || clientControl.invalid) {
        console.log('Form is invalid because the client id field is invalid.');
        console.log('Client field errors:', clientControl?.errors);
        this.salesForm.markAllAsTouched();
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
      if (!paymentPeriodControl || paymentPeriodControl.invalid) {
        console.log('Form is invalid because the payment period field is invalid.');
        console.log('payment period field errors:', paymentPeriodControl?.errors);
        paymentPeriodControl?.markAsTouched();
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
      this.salesInvoiceService.updateSalesInvoice(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Sales invoice updated successfully:', response);
          this.toast.success('تم التحديث بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllSaleIncoices();
          this.selectedCategory = null;
          this.selectedCount=0;
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating sales invoice:', error);
          console.log('Updated sales invoice Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'حدث خطأ';
          this.toast.error(errorMessage, 'Error');
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
    const selectedItems = this.filteredSalesInvoices.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.salesInvoiceService.deleteSalesInvoiceById(item.id).subscribe({
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
    this.filteredSalesInvoices = this.filteredSalesInvoices.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredSalesInvoices.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllSaleIncoices();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllSaleIncoices();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllSaleIncoices();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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


  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.selectedForDelete = []; 
      this.selectedCategory = null; 
      this.selectedCount = 0; 
      this.selectAll= false; 
      this.getAllSaleIncoices();
    }
  }

  // Map the invoice status for each offer
  mapInvoiceStatus() {
    this.salesIvoices.forEach(offer => {
      offer.invoiceStatusName = this.getInvoiceStatusName(offer.invoiceStatus);
      console.log(offer.invoiceStatus)
    });
  }

  // Get the name of the receipt status from the numeric stage number
  getInvoiceStatusName(stageNumber: number): string {
    // Define a mapping array for the numeric indices to the enum values
    const stageMapping = [
      InvoiceStatus.Draft,        // 0
      InvoiceStatus.Approved,    // 1
      InvoiceStatus.Staged,     // 2
      InvoiceStatus.Closed,      // 3
      InvoiceStatus.Reviewed       // 4
    ];

    return stageMapping[stageNumber] ?? 'Unknown';
  }
  // Update status
  requestId: number = 0; // Store selected request ID
  requestStag: any // Store selected request stage
  selectedNoteId!: number;

  selectNoteId(note: any) {
    this.requestId = note.id;
    console.log(note.id)
  }
  updatesalesInvoiceStatus(item: any) {
    const invoiceId = item.id;
    const invoiceStatus = item.invoiceStatus;

    if (invoiceId && invoiceStatus !== undefined) {
      this.salesInvoiceService.updateStatusSalesInvoice(invoiceId, invoiceStatus).subscribe({
        next: (response) => {
          console.log('Status updated successfully:', response);
          this.toast.success('تم تحديث الحالة');
        },
        error: (error) => {
          console.error('Error updating status:', error);
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error("لا يمكن تحديث إلى هذه الحالة");
        }
      });
    } else {
      this.toast.warning('Please select a valid Request Stage!');
    }
  }
  // select checkbox

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.salesIvoices.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.salesIvoices.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.salesIvoices.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.salesIvoices.filter(item => item.checked).length;
  }



  // Filter data based on search term
  filteredSalesInvoices: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getSalesInvoicesWithoutPaging() {
    this.salesInvoiceService.getSalesInvoicesWithoutPaging().subscribe(response => {
      this.salesIvoices = response.salesInvoices;
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
      this.getSalesInvoicesWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllSaleIncoices();
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
      this.filteredSalesInvoices = this.salesIvoices.filter(item =>
        (item.clientName && item.clientName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.representativeName && item.representativeName.toUpperCase().includes(this.searchQuery.toUpperCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredSalesInvoices = this.salesIvoices;
    }
  }


  // Add Comment Logic
  addComment(parent:any =''){
    this.salesInvoiceService.postSalesInvoiceComment({
      Content:this.commentForm.controls['content'].value,
      EntityId:this.selectedCategory.id,
      ParentCommentId:parent
    }).subscribe((res)=> console.log(res));
    this.getComments();
    this.commentForm.reset();
    if(parent) this.replayId = '';
  }

  getComments(){
    this.salesInvoiceService.getSalesInvoiceComments(this.selectedCategory.id).subscribe((res)=>{
      this.comments = res;
    })
  }
  replayId:any;
  toggleReplay(commentId:any){
    this.replayId = commentId;
  }
  editedText:string ='';
  editId:any;
  //Edit Comment
  editComment(commentId:any,content:any){
    this.salesInvoiceService.updateSalesInvoiceComment(commentId,{
      content:this.editedText,
    }).subscribe((res)=> console.log(res));
    this.getComments();
    if(this.editedText) this.editedText ='';this.editId='';
  }
  toggleEdit(commentId:any,text:any){
    this.editId==commentId? this.editId='': this.editId= commentId;
    this.editedText = text;
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
  this.attachmentFiles.push(this.fb.control({ ...fileData, audioUrl }));
  // Trigger change detection
  // this.changeDetectorRef.detectChanges();
}
}
