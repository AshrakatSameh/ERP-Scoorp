import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { InvoiceStatus } from 'src/app/enums/InvoiceStatus';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';
import { ItemsService } from 'src/app/services/getAllServices/Items/items.service';
import { PaymentPeriodsService } from 'src/app/services/getAllServices/PaymentPeriods/payment-periods.service';
import { PriceListService } from 'src/app/services/getAllServices/PriceList/price-list.service';
import { ProjactService } from 'src/app/services/getAllServices/Projects/projact.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { SalesService } from 'src/app/services/getAllServices/Sales/sales.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-return-invoices',
  templateUrl: './return-invoices.component.html',
  styleUrls: ['./return-invoices.component.css']
})
export class ReturnInvoicesComponent implements OnInit {

  clients: any[] = [];
  costCenters: any[] = [];
  priceLists: any[] = [];
  representatives: any[] = [];
  teams: any[] = [];
  projects: any[] = [];

imgApiUrl= environment.imgApiUrl;

  invoiceStatus = InvoiceStatus;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  invoiceStatusList: { key: string, value: string }[] = [];

  invoiceFrom: FormGroup;

  comments:any[] =[];
  commentForm:FormGroup;

  userId:any;
  constructor(private clientServ: ClientsService, private teamServ: TeamsService, private repServ: RepresentativeService,
    private priceServ: PriceListService, private costService: CostCenterService,
    private projectServ: ProjactService, private salesService: SalesService,private renderer: Renderer2,
    private http: HttpClient, private toast: ToastrService, private fb: FormBuilder,
    private payPeriodService: PaymentPeriodsService, private itemService: ItemsService,private ngZone:NgZone,
    private jwtHelper: JwtHelperService, private cdr: ChangeDetectorRef,) {
    this.userId = this.jwtHelper.decodeToken(localStorage.getItem("authToken")!).UserId;
    this.invoiceFrom = this.fb.group({
      returnInvoiceNumber: [''],
      clientId:  ['', Validators.required],
      representativeId:  ['', Validators.required],
      teamId:  ['', Validators.required || null],
      code: [],
      costCenterId:  ['', Validators.required || null],
      clientReturnReference: [''],
      projectId:  ['', Validators.required || null],
      priceListId:  ['', Validators.required || null],
      paymentPeriodId:  ['', Validators.required || null],
      driver: [''],

      items: fb.array([], Validators.required) ,
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])

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


        // Initializing Comment Form
        this.commentForm = this.fb.group({
          content:['', Validators.required],
          entityId:['', Validators.required],
          parentCommentId:[''],
          attachmentFiles: this.fb.array([])
        })
  }
  ngOnInit(): void {
    this.getAllClients();
    this.getAllPriceLists();
    this.getAllProjects();
    this.getAllRepresentatives();
    this.getAllTeams();
    this.getcostCenters();
    // this.getAllReturnInvoices();
    this.loadInvoices();
    this.getPaymentPeriods();
    this.getAllItems();
  }
  // buttons=['الأصناف','الملاحظات','المهام' ,'مرفقات']
  buttons = ['الأصناف', 'الملاحظات', 'المهام', 'مرفقات', 'الانشطه']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  itemList: any[] = [];
  getAllItems() {
    this.itemService.getAllItems().subscribe(response => {
      this.itemList = response.item1;
      // console.log(this.itemList);
    }, error => {
      console.error('Error fetching  items:', error)
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
  payPeriods: any[] = [];
  getPaymentPeriods() {
    this.payPeriodService.getAllPaymentPeriods().subscribe(response => {
      this.payPeriods = response.paymentPeriods;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching payment data:', error)
    })
  }
  getAllPriceLists() {
    this.priceServ.getAllPriceLists().subscribe(response => {
      this.priceLists = response.data;
      //console.log(this.priceLists);
    }, error => {
      console.error('Error fetching price lists data:', error)
    })
  }
  getAllRepresentatives() {
    this.repServ.getAllRepresentative().subscribe(response => {
      this.representatives = response;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  representatives:', error)
    })
  }

  getAllTeams() {
    this.teamServ.getTeams().subscribe(response => {
      this.teams = response.teams;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  teams:', error)
    })
  }

  getAllClients() {
    this.clientServ.getCliensts().subscribe(response => {
      this.clients = response.data;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  clients:', error)
    })
  }
  getAllProjects() {
    this.projectServ.getProjactsWithoutPag().subscribe(response => {
      this.projects = response.projects;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  projects:', error)
    })
  }

  invoices: any[] = [];


  clientss: any[] = [];
  loadClients() {
    this.clientServ.getCliensts().subscribe({
      next: (data) => {
        this.clients = data.returnInvoices;
        // Load invoices only after clients are successfully fetched
        this.loadInvoices();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.clients = []; // Ensure it's initialized as an empty array
      }
    });
  }

  loadInvoices() {
    this.salesService.getReturnInvoices(this.pageNumber, this.pageSize).subscribe({
      next: (data) => {
        this.invoices = data.returnInvoices.item1;
        this.filteredInvoices= this.invoices;
        this.totalCount = data.returnInvoices.item2; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        // Map client names only when both invoices and clients are loaded
        this.mapClientNames();
        this.mapInvoiceStatus();
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
        this.invoices = []; // Ensure it's initialized as an empty array
      }
    });
  }

  mapClientNames() {
    if (this.clients.length && this.invoices.length) {
      this.invoices.forEach(invoice => {
        const client = this.clients.find(c => c.id === invoice.clientId);
        invoice.clientName = client ? client.name : 'Unknown'; // Handle missing client cases
      });
    }
  }


  
  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachmentFiles(): FormArray {
    return this.invoiceFrom.get('attachmentFiles') as FormArray;
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
  apiUrl = environment.apiUrl;
  onSubmit() {
    const clientControl = this.invoiceFrom.get('clientId');
    const representativeControl = this.invoiceFrom.get('representativeId');
    const itemsArray = this.invoiceFrom.get('items') as FormArray;
    
    // Validate clientId field
    if (!clientControl || clientControl.invalid) {
      console.log('Form is invalid because the client id field is invalid.');
      console.log('Client field errors:', clientControl?.errors);
      this.invoiceFrom.markAllAsTouched();
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
    const formData = new FormData();
    formData.append('clientId', this.invoiceFrom.get('clientId')?.value);
    formData.append('returnInvoiceNumber', this.invoiceFrom.get('returnInvoiceNumber')?.value);
    formData.append('representativeId', this.invoiceFrom.get('representativeId')?.value);
    formData.append('teamId', this.invoiceFrom.get('teamId')?.value);
    formData.append('code', this.invoiceFrom.get('code')?.value);
    formData.append('costCenterId', this.invoiceFrom.get('costCenterId')?.value);

    formData.append('clientReturnReference', this.invoiceFrom.get('clientReturnReference')?.value);
    formData.append('projectId', this.invoiceFrom.get('projectId')?.value);
    formData.append('priceListId', this.invoiceFrom.get('priceListId')?.value);
    // formData.append('costCenterId', this.invoiceFrom.get('costCenterId')?.value);
    formData.append('paymentPeriodId', this.invoiceFrom.get('paymentPeriodId')?.value);
    formData.append('driver', this.invoiceFrom.get('driver')?.value);

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
      formData.append(`Items[${index}].returnedQuantity`, itemValue.returnedQuantity);
      formData.append(`Items[${index}].unitPrice`, itemValue.unitPrice);
      formData.append(`Items[${index}].salesTax`, itemValue.salesTax);
      formData.append(`Items[${index}].discount`, itemValue.discount);
      formData.append(`Items[${index}].unit`, itemValue.unit);
      formData.append(`Items[${index}].notes`, itemValue.notes);
    });
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });

    this.http.post(this.apiUrl + 'ReturnInvoice', formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        // alert('submit successfully');
        this.toast.success(('تمت الإضافة بنجاح'))
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
        this.loadInvoices();
        this.invoiceFrom.reset({
          returnInvoiceNumber: [],
          clientId:  [null],
          representativeId:  [null],
          teamId:  [null],
          code: [],
          costCenterId:  [null],
          clientReturnReference: [],
          projectId:  [null],
          priceListId:  [null],
          paymentPeriodId:  [null],
          driver: [],
    
          items: this.fb.array([]) || null,
          attachmentFiles: this.fb.array([]),
          attachments: this.fb.array([])
        });
        this.attachmentFiles.clear();
      }, error => {
        console.error('Error:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      });
  }


  // Add items table
  get items(): FormArray {
    return this.invoiceFrom.get('items') as FormArray;
  }
  tableData = [
    {
      itemId: null,
      returnedQuantity: '',
      unit: '',
      unitPrice: 0,
      salesTax: 0,
      discount: 0,
      note: '',
    },
  ];
  removeItem(index: number) {
    this.items.removeAt(index);
  }
  addreturnInvoiceItem() {
    const item = this.fb.group({
      itemId: [0],
      returnedQuantity: [0],
      unitPrice: [0],
      salesTax: [0],
      discount: [0],
      unit: [''],
      notes: [''],
    });
    this.items.push(item);
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
      this.loadInvoices();
    }
  }


  // Map the invoice status for each offer
  mapInvoiceStatus() {
    this.invoices.forEach(offer => {
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
  // Map the InvoiceStatus enum values to numeric keys
  InvoiceStatusMap: { [key in InvoiceStatus]: number } = {
    [InvoiceStatus.Draft]: 0,
    [InvoiceStatus.Approved]: 1,
    [InvoiceStatus.Staged]: 2,
    [InvoiceStatus.Closed]: 3,
    [InvoiceStatus.Reviewed]: 4
  };

  onUpdateStatus(item: any): void {
    const invoiceId = item.id;
    const selectedStatus = item.invoiceStatus as InvoiceStatus;  // Cast to ensure type safety
    const statusNumber = this.InvoiceStatusMap[selectedStatus];  // Map to the corresponding number

    this.salesService.updateInvoiceStatus(invoiceId, statusNumber)
      .subscribe({
        next: (response) => {
          console.log('Status updated successfully', response);
          this.toast.success('تم تحديث الحالة بنجاح');
        },
        error: (error) => {
          console.error('Error updating status', error);
          console.log('Selected status (number):', statusNumber);
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error('لا يمكن تحديث إلى هذه الحالة');
        }
      });
  }

  // dropdown table columns
  // onCheckboxChange(category: any) {
  //   this.updateSelectAll();
  // }
  columns = [
    // { name: 'id', displayName: 'المسلسل', visible: true },
    { name: 'code', displayName: 'كود ', visible: true },
    { name: 'clientName', displayName: 'اسم العميل', visible: true },
    { name: 'representativeName', displayName: 'المندوب', visible: false },
    { name: 'teamName', displayName: 'الفريق', visible: false },
    { name: 'notes', displayName: 'ملاحظات', visible: false },
    { name: 'costCenterName', displayName: 'مركز التكلفة', visible: false },
    { name: 'attachmentFiles', displayName: 'المرفقات', visible: true },


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
    this.invoices.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.invoices.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.invoices.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.invoices.filter(item => item.checked).length;
  }


   // Filter data based on search term
   filteredInvoices: any[] = [];   // Holds the filtered results (used for search)
   searchQuery: string = '';          // Holds the search query
   totalRecords: number = 0;
   offers: any[] = [];
   getReturnInvoiceWithoutPaging() {
     this.salesService.getReturnInvoicesWithoutPaging().subscribe(response => {
      this.invoices = response.returnInvoices.item1;
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
       this.getReturnInvoiceWithoutPaging();
     } else {
       // If no search query, fetch paginated data
       this.loadInvoices();
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
       this.filteredInvoices = this.invoices.filter(item =>
        (item.clientName && item.clientName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.costCenterName && item.costCenterName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.teamName && item.teamName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.representativeName && item.representativeName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
       )
 
     } else {
       // If no search query, reset to show all fetched data
       this.filteredInvoices = this.invoices;
     }
   }


   showConfirmationModal = false;

   openConfirmationModal() {
     this.showConfirmationModal = true;
   }
 
   closeConfirmationModal() {
     this.showConfirmationModal = false;
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

   deleteItemType() {

    const selectedItems = this.filteredInvoices.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.salesService.deleteReturnInvoiceById(item.id).subscribe({
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
    this.filteredInvoices = this.filteredInvoices.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredInvoices.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.loadInvoices();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.loadInvoices();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.loadInvoices();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }


    // Update
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
  
  itemName: any;
getItemNameById(itemId: number): string { 
  const item = this.itemList.find(i => i.itemId === itemId);
  return item ? item.itemName : '';
}
  openModalForSelected() {
    if (this.selectedCategory) {
      this.invoiceFrom.patchValue({
        returnInvoiceNumber: this.selectedCategory.returnInvoiceNumber,
        clientId: this.selectedCategory.clientId,
        representativeId: this.selectedCategory.representativeId,
        teamId: this.selectedCategory.teamId,
        code: this.selectedCategory.code,
        costCenterId: this.selectedCategory.costCenterId,
        clientReturnReference: this.selectedCategory.clientReturnReference,
        projectId: this.selectedCategory.projectId,
        priceListId: this.selectedCategory.priceListId,
        paymentPeriodId: this.selectedCategory.paymentPeriodId,
        driver : this.selectedCategory.driver ,
      });
      // Clear the items FormArray
    this.items.clear();

    // Add items from selectedCategory to FormArray
    this.selectedCategory.items.forEach((item: any) => {
      const itemName = this.getItemNameById(item.itemId);
      const returnItem = this.fb.group({
        itemId: [item.itemId],
        itemName: [itemName],
        returnedQuantity: [item.returnedQuantity],
        unitPrice: [item.unitPrice],
        salesTax: [item.salesTax],
        discount: [item.discount],
        unit: [item.unit],
        notes: [item.notes]
      });
      this.items.push(returnItem);
    });

      this.attachmentFiles.clear();

      if (this.selectedCategory.attachmentFiles) {
        this.selectedCategory.attachmentFiles.forEach((attachment: any) => {
          this.addAttachmentToForm(attachment);
        });
      }
      this.isModalOpen = true;
    } else {
      alert("الرجاء تحديد عنصر");
    }
  }
  // Method to add a new delivery note item
updateItem() {
  const newItem = this.fb.group({
    itemId: [null],               // Default value, can be selected later
    itemName: [''],               // To be filled based on selection
    requestedQuantity: [0],       // Default quantity
    unitPrice: [0],               // Default price
    salesTax: [0],                // Default sales tax
    discount: [0],                 // Default discount
    unit: [''],                   // Default unit
    notes: [''],                  // Default notes
  });
  
  this.items.push(newItem);
}
  addAttachmentToForm(attachment: any) {
    const attachmentExists = this.attachmentFiles.controls.some((control: any) => 
      control.value.fileUrl === attachment.fileUrl || control.value.fileTitle === attachment.fileTitle
    );
  
    if (!attachmentExists) {
      this.attachmentFiles.push(this.fb.group({
        fileTitle: [attachment.fileTitle || 'Unnamed File'],
        fileType: [attachment.fileType],
        fileSize: [attachment.fileSize],
        fileUrl: [attachment.fileUrl],
      }));
    }
  }
  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.invoiceFrom.reset();
    this.resetAttachments();
  }
  resetAttachments(){
    this.attachmentFiles.clear();
  }
  updateCategory() {
    if (this.invoiceFrom.valid) {
      const updatedCategory = { ...this.invoiceFrom.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.salesService.updateReturnInvoice(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Unit category updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.invoices.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.invoices[index] = updatedCategory;
          }

          this.loadInvoices();
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating return invoice:', error);
          console.log('Updated return invoice Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
    } else {
      this.toast.warning('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
    }
  }



    // Add Comment Logic
    addComment(parent:any =''){
      this.salesService.postReturnInvoiceComment({
        Content:this.commentForm.controls['content'].value,
        EntityId:this.selectedCategory.id,
        ParentCommentId:parent
      }).subscribe((res)=> console.log(res));
      this.getComments();
      this.commentForm.reset();
      if(parent) this.replayId = '';
    }
  
    getComments(){
      this.salesService.getReturnInvoiceComments(this.selectedCategory.id).subscribe((res)=>{
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
      this.salesService.updateReturnInvoiceComment(commentId,{
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

activities: any[] = [];
getActivities(){
  this.salesService.getReturnInvoiceActivities(this.selectedCategory.id).subscribe((res)=>{
    this.activities = res;
    console.log(res)
  })
}
}
