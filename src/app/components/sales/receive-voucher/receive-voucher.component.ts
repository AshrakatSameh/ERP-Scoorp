import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { data } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { DeliveryStatus } from 'src/app/enums/DeliveryStatus ';
import { GoodsReceiptStatus } from 'src/app/enums/GoodsReceiptStatus';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';
import { ItemsService } from 'src/app/services/getAllServices/Items/items.service';
import { LocationService } from 'src/app/services/getAllServices/Location/location.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { SalesService } from 'src/app/services/getAllServices/Sales/sales.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { WarehouseService } from 'src/app/services/getAllServices/Warehouse/warehouse.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-receive-voucher',
  templateUrl: './receive-voucher.component.html',
  styleUrls: ['./receive-voucher.component.css']
})
export class ReceiveVoucherComponent implements OnInit {


  goods: any[] = [];
  goodsForm: FormGroup;

  receiptStatus = GoodsReceiptStatus;  // Access the PaymentType enum
  receiptStatusList: { key: string, value: string }[] = [];

  imgApiUrl= environment.imgApiUrl;
  apiUrl = environment.apiUrl + 'GoodsReceipt'
  buttons = ['الأصناف', 'الملاحظات', 'المهام', 'مرفقات']
  selectedButton: number | null = null; // To track which button is clicked

  comments:any[] =[];
  commentForm:FormGroup;

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }
  constructor(private salesService: SalesService, private fb: FormBuilder, private teamServ: TeamsService,
    private clientServ: ClientsService, private repServ: RepresentativeService, private costServ: CostCenterService,
    private wareSevice: WarehouseService, private locationService: LocationService, private toast: ToastrService,
    private http: HttpClient, private itemService: ItemsService, private renderer:Renderer2,private ngZone:NgZone
  ) {
    this.goodsForm = this.fb.group({
      clientId:  [null],
      representativeId:  [null],
      // code: ['', Validators.required],
      teamId:  [null],
      costCenterId:  [null],
      warehouseId:  [null],
      supplier: [''],
      locationLinkIds: this.fb.array([]),

      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([]),

      items: fb.array([]),

    });
    this.receiptStatusList = Object.keys(this.receiptStatus).map(key => ({
      key: key,
      value: this.receiptStatus[key as keyof typeof GoodsReceiptStatus]
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

    this.getAllGoodsReceipt();
    this.getAllClients();
    this.getAllRepresentatives();
    this.getAllTeams();
    this.getAllCostCenters();
    this.getAllWarehouses();
    this.getAllLocationss();
    this.getAllItems();


  }

  isCodeVisible = false;
  toggleCode(): void {
    this.isCodeVisible = !this.isCodeVisible;  // Toggle the visibility
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

  getAllGoodsReceipt() {
    this.salesService.getGoodsReceipt(this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        // this.goods = response.goodsReceipts;
        this.goods = (response.goodsReceipts || []).map((item: any) => ({ ...item, checked: false }));
        this.filteredgoodReceipts= this.goods;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        this.mapReceiptStatus();
        console.log(this.goods);
      },
      error: (err) => {
        console.error('Error fetching goods reciept data:', err);
      }
    });
  }

  clientList: any[] = [];
  getAllClients() {
    this.clientServ.getCliensts().subscribe({
      next: (response) => {
        this.clientList = response.data;
        // this.mapRequestStage();
        console.log(this.clientList);
      },
      error: (err) => {
        console.error('Error fetching goods reciept data:', err);
      }
    });
  }

  itemList: any[] = [];
  getAllItems() {
    this.itemService.getAllItems().subscribe(response => {
      this.itemList = response.item1;
      console.log(this.itemList);
    }, error => {
      console.error('Error fetching  items:', error)
    })
  }
  representatives: any[] = []

  getAllRepresentatives() {
    this.repServ.getAllRepresentative().subscribe(response => {
      this.representatives = response;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  representatives:', error)
    })
  }

  teamss: any[] = [];
  getAllTeams() {
    this.teamServ.getTeams().subscribe(response => {
      this.teamss = response.teams;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  teams:', error)
    })
  }
  costCenterss: any[] = []

  getAllCostCenters() {
    this.costServ.getAllCostCaners().subscribe(response => {
      this.costCenterss = response.costCenters;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching  costCenters:', error)
    })
  }

  warehouses: any[] = []

  getAllWarehouses() {
    this.wareSevice.getAllWarehouses().subscribe(response => {
      this.warehouses = response.data;
      //console.log(this.warehouses);
    }, error => {
      console.error('Error fetching  warehouses:', error)
    })
  }
  locations: any[] = []

  getAllLocationss() {
    this.locationService.getLocations().subscribe(response => {
      this.locations = response.data;
      //console.log(this.locations);
    }, error => {
      console.error('Error fetching  locations:', error)
    })
  }


  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachmentFiles (): FormArray {
    return this.goodsForm.get('attachmentFiles') as FormArray;
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
    const formData = new FormData();
    formData.append('clientId', this.goodsForm.get('clientId')?.value);
    formData.append('representativeId', this.goodsForm.get('representativeId')?.value);
    // formData.append('code', this.goodsForm.get('code')?.value);
    formData.append('teamId', this.goodsForm.get('teamId')?.value);
    formData.append('costCenterId', this.goodsForm.get('costCenterId')?.value);
    formData.append('warehouseId', this.goodsForm.get('warehouseId')?.value);
    formData.append('supplier', this.goodsForm.get('supplier')?.value);
    formData.append('locationLinkIds', this.goodsForm.get('locationLinkIds')?.value);
  // Append each attachment file
  this.attachmentFiles.controls.forEach((control) => {
    const fileData = control.value;
    if (fileData && fileData.file instanceof File) {
      // Append the actual file object
      formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
    }
  });
    this.items.controls.forEach((item, index) => {
      const itemValue = item.value;
      formData.append(`Items[${index}].itemId`, itemValue.itemId);
      formData.append(`Items[${index}].receivedQuantity`, itemValue.receivedQuantity);
      formData.append(`Items[${index}].unitPrice`, itemValue.unitPrice);
      formData.append(`Items[${index}].salesTax`, itemValue.salesTax);
      formData.append(`Items[${index}].discount`, itemValue.discount);
      formData.append(`Items[${index}].unit`, itemValue.unit);
      formData.append(`Items[${index}].notes`, itemValue.notes);
    });

    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });

    this.http.post(this.apiUrl, formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        this.toast.success('تم الإضافة بنجاح')
        this.getAllGoodsReceipt();
        this.goodsForm.reset({
          // clientId:  [null],
          // representativeId:  [null],
          // teamId:  [null],
          // costCenterId:  [null],
          // warehouseId:  [null],
          // supplier: [''],
          // locationLinkIds: this.fb.array([]),
          // attachmentFiles: this.fb.array([]),
          // attachments: this.fb.array([]),
    
          // items: this.fb.array([]),
    
        });
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
        this.attachmentFiles.clear();
      }, error => {
        console.error('Error:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      });
  }

  // Add items table
  get items(): FormArray {
    return this.goodsForm.get('items') as FormArray;
  }
  tableData = [
    {
      selectedItemId: null,
      receivedQuantity: '',
      unit: '',
      unitPrice: 0,
      tax: 0,
      discount: 0,
      note: '',
    },
  ];
  removeItem(index: number) {
    this.items.removeAt(index);
  }
  addGoodsReceiptItem() {
    const item = this.fb.group({
      itemId: [0],
      receivedQuantity: [0],
      unitPrice: [0],
      salesTax: [0],
      discount: [0],
      unit: [''],
      notes: [''],
    });
    this.items.push(item);
  }


  // Map the receipt status for each offer
  mapReceiptStatus() {
    this.goods.forEach(offer => {
      offer.receiptStatusName = this.getReceiptStatusName(offer.status);
    });
  }

  // Get the name of the receipt status from the numeric stage number
  getReceiptStatusName(stageNumber: number): string {
    // Define a mapping array for the numeric indices to the enum values
    const stageMapping = [
      GoodsReceiptStatus.Draft,        // 0
      GoodsReceiptStatus.InProgress,    // 1
      GoodsReceiptStatus.Completed,     // 2
      GoodsReceiptStatus.Canceled       // 3
    ];

    return stageMapping[stageNumber] ?? 'Unknown';
  }


  // Update status

  receiptStatuses = Object.values(GoodsReceiptStatus);
  NewStatus: any;
  selectedNoteId!: number;
  showPopup: boolean = false;

  updatedItems: any[] = [{
    receivedQuantity: 0,
    warehouseId: 0,
    itemId: 0
  }];

  // constructor(private deliveryNoteService: DeliveryNoteService) {}
  selectNoteId(note: any) {
    this.selectedNoteId = note.id;
    this.updatedItems = (note.items || []).map((item: any) => ({
      receivedQuantity: item?.receivedQuantity || 0,
      warehouseId: item?.warehouseId || 0,
      itemId: item?.itemId || 0
    }));
    console.log(note.id)
  }
  onStatusChange(note: any) {
    this.NewStatus = note.NewStatus; // Capture the new status from the dropdown

    if (note.status !== GoodsReceiptStatus.Draft && this.NewStatus !== GoodsReceiptStatus.Draft &&
      this.NewStatus !== GoodsReceiptStatus.InProgress && note.id === this.selectedNoteId) {
      this.showPopup = true; // Show popup for entering UpdatedItems
    } else if (note.id === this.selectedNoteId) {
      // Call the updateStatus with the current note and selected NewStatus
      this.updateStatus(note, this.NewStatus, []); // Call API with an empty array for Draft
    } else {
      console.error('No note selected');

    }
  }
  closePopup() {
    this.showPopup = false;
  }
  submitUpdatedItems() {
    const note = this.goods.find(n => n.id === this.selectedNoteId);
    if (note) {
      // Call updateStatus with the selected NewStatus and populated updatedItems
      this.updateStatus(note, this.NewStatus, this.updatedItems);
    }
    this.closePopup();
  }


  updateStatus(note: any, newStatus: any, updatedItems: any[]) {
    if (!note.id) {
      console.error('Note ID is required to update status.');
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('NewStatus', newStatus); // Append the new status
    // formData.append('UpdatedItems', JSON.stringify(updatedItems)); // Append updated items as a JSON string
    // Append each updated item only if it is defined and has necessary properties
    updatedItems.forEach((item, index) => {
      if (item && item.itemId !== undefined && item.receivedQuantity !== undefined && item.warehouseId !== undefined) {
        formData.append(`UpdatedItems[${index}].itemId`, item.itemId.toString());
        formData.append(`UpdatedItems[${index}].receivedQuantity`, item.receivedQuantity.toString());
        formData.append(`UpdatedItems[${index}].warehouseId`, item.warehouseId.toString());
      } else {
        console.warn(`Skipping item at index ${index} due to missing fields.`);
      }
    });
    this.salesService.updateGoodsReceiptStatus(note.id, formData).subscribe({
      next: (response) => {
        console.log('Goods receipt status updated:', response);
        this.toast.success('تم تحديث الحالة بنجاح');
        this.resetUpdatedItems();

      },
      error: (error) => {
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error('لا يمكن التحديث إلى هذه الحالة');
        console.log(updatedItems)

      }
    });
  }


  // add new inputs for new array
  addUpdatedItem() {
    // Add a new item to the updatedItems array
    this.updatedItems.push({
      receivedQuantity: 0,
      warehouseId: 0,
      itemId: 0
    });
  }

  removeUpdatedItem(index: number) {
    // Remove the item at the specified index
    if (this.updatedItems.length > 1) {
      this.updatedItems.splice(index, 1);
    } else {
      console.log('At least one item must remain.');
    }
  }
  resetUpdatedItems() {
    // Reset the updatedItems array to the initial state
    this.updatedItems = [{
      receivedQuantity: 0,
      warehouseId: 0,
      itemId: 0
    }];
  }

  // For Update
  // Update Delivery note
  storesSec: any[] = [];
  isModalOpen = false;
  selectedCategory: any = null;
  openModalForSelected() {
    if (this.selectedCategory) {
      this.goodsForm.patchValue({
        clientId: this.selectedCategory.clientId,
        representativeId: this.selectedCategory.representativeId,
        teamId: this.selectedCategory.teamId,
        // code: this.selectedCategory.code,
        // purchaseOrderNumber: this.selectedCategory.purchaseOrderNumber,
        costCenterId: this.selectedCategory.costCenterId,
        warehouseId: this.selectedCategory.warehouseId,
        supplier: this.selectedCategory.supplier,
        locationLinkIds: this.selectedCategory.locationLinkIds,
      });
      this.attachmentFiles.clear();
      if (this.selectedCategory.attachments?.length) {
        this.selectedCategory.attachments.forEach((attachment: any) => {
          this.attachmentFiles.push(this.fb.group({ file: attachment })); // Existing attachment
          console.log(this.attachmentFiles.controls);
        });
      }
      this.isModalOpen = true;
    } else {
      alert('Please select a category to update.');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.goodsForm.reset();
    this.selectedCategory =null;
    this.resetAttachments();
  }
  resetAttachments(){
    this.attachmentFiles.clear();
  }
  updateCategory() {
    if (this.goodsForm.valid) {
      const updatedCategory = { ...this.goodsForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.salesService.updateGoodsReceipt(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Goods receipt updated successfully:', response);
          this.toast.success('تم التحديث بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllGoodsReceipt();
          this.closeModal();  // Close the modal after successful update
          this.goodsForm.reset();
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating Goods receipt:', error);
          console.log('Updated Goods receipt Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An error occurred while updating the Goods receipt.';
          this.toast.error("لا يمكن التحديث لأنها ليست مسودة");
        }
      );
    }
  }

  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  deleteItemType() {
    const selectedItems = this.filteredgoodReceipts.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.salesService.deleteGoodsReceiptById(item.id).subscribe({
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
    this.filteredgoodReceipts = this.filteredgoodReceipts.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredgoodReceipts.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllGoodsReceipt();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllGoodsReceipt();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllGoodsReceipt();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
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
      this.getAllGoodsReceipt();
    }
  }



  // dropdown table columns
  columns = [
    // { name: 'id', displayName: 'المسلسل', visible: true },
    { name: 'supplier', displayName: 'المورد', visible: true },
    { name: 'code', displayName: 'كود ', visible: true },
    { name: 'clientName', displayName: 'اسم العميل', visible: true },
    { name: 'representativeName', displayName: 'المندوب', visible: false },
    { name: 'teamName', displayName: 'الفريق', visible: false },
    { name: 'warehouseName', displayName: 'المستودع', visible: false },
    { name: 'costCenterName', displayName: 'مركز التكلفة', visible: false },
    { name: 'attachmentFiles', displayName: 'المرفقات', visible: true },

  ];
  showDropdownCol = false;
  toggleDropdownCol() {
    this.showDropdownCol = !this.showDropdownCol; // Toggle the dropdown visibility
    console.log('Dropdown visibility:', this.showDropdownCol); // Check if it’s toggling
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
    this.goods.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.goods.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.goods.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.goods.filter(item => item.checked).length;
  }

 // Filter data based on search term
 filteredgoodReceipts: any[] = [];   // Holds the filtered results (used for search)
 searchQuery: string = '';          // Holds the search query
 totalRecords: number = 0;
 offers: any[] = [];
 getGoodsWithoutPaging() {
   this.salesService.getGoodsReceiptWithoutPaging().subscribe(response => {
     this.goods = response.goodsReceipts;
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
     this.getGoodsWithoutPaging();
   } else {
     // If no search query, fetch paginated data
     this.getAllGoodsReceipt();
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
     this.filteredgoodReceipts = this.goods.filter(item =>
      (item.clientName && item.clientName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.costCenterName && item.costCenterName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.teamName && item.teamName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.representativeName && item.representativeName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.supplier && item.supplier.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
     )

   } else {
     // If no search query, reset to show all fetched data
     this.filteredgoodReceipts = this.goods;
   }
 }
  

  // Add Comment Logic
  addComment(parent:any =''){
    this.salesService.postGoodsReceiptsComment({
      Content:this.commentForm.controls['content'].value,
      EntityId:this.selectedCategory.id,
      ParentCommentId:parent
    }).subscribe((res)=> console.log(res));
    this.getComments();
    this.commentForm.reset();
    if(parent) this.replayId = '';
  }

  getComments(){
    this.salesService.getGoodsReceiptsComments(this.selectedCategory.id).subscribe((res)=>{
      this.comments = res;
    })
  }
  replayId:any;
  toggleReplay(commentId:any){
    this.replayId = commentId;
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
