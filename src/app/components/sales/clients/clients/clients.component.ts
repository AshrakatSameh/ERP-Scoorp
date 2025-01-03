import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgZone } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { PaymentType } from 'src/app/enums/PaymentType';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';
import { PaymentPeriodsService } from 'src/app/services/getAllServices/PaymentPeriods/payment-periods.service';
import { PriceListService } from 'src/app/services/getAllServices/PriceList/price-list.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { SupervisorService } from 'src/app/services/getAllServices/Supervisors/supervisor.service';
import { TagService } from 'src/app/services/getAllServices/Tag/tag.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  apiUrl = `${environment.apiUrl}Clients/CreateClient`



  clients: any[] = [];
  supervisors: any[] = [];
  tags: any[] = [];
  paymentType = PaymentType;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  paymentTypeList: { key: number; value: string }[] = [];

  clientForm: FormGroup;

  constructor(private clientService: ClientsService, private fb: FormBuilder,
    private supervisorService: SupervisorService, private tagService: TagService, private http: HttpClient,
    private priceList: PriceListService, private payments: PaymentPeriodsService, private repre: RepresentativeService,
    private teamService: TeamsService, private costCenterService: CostCenterService, private toast: ToastrService,
    private renderer:Renderer2,     private cdr: ChangeDetectorRef, 
    private ngZone:NgZone
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      priceListId: ['', Validators.required],
      tagId: [''],
      paymentPeriodId: ['', Validators.required],
      paymentMethodId: [''],
      deliveryMethod: [''],
      representativeId: ['', Validators.required],
      teamId: [''],
      costCenterId: [''],
      creditLimit: ['', Validators.required],
      attachments: this.fb.array([]) // Array to hold attachments
    })
  }

  ngOnInit(): void {
    this.getAllClients();
    this.getAllTags();
    this.getAllPriceLists();
    this.getAllPaymentsPeriods();
    this.getAllRepresentatives();
    this.getAllCostCenters();
    this.getAllTeams();
    this.paymentTypeList = [
      { key: 0, value: 'Cash' },
      { key: 1, value: 'Deferred' },
      { key: 2, value: 'CashOrDeferred' }
    ];
  }
  isCodeVisible = false;  
  toggleCode(): void {
    this.isCodeVisible = !this.isCodeVisible;  // Toggle the visibility
  }
  buttons = ['المعلومات الأساسية', 'المواقع والفروع', 'المرفقات', 'المهام', 'الحساب البنكي',
    'الأشعارات والتذكير', 'التقارير', 'معلومات التواصل', 'بيانات للضريبه', 'الإستبيانات']
  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  getAllClients() {
    this.clientService.getAllCliensts(this.pageNumber, this.pageSize).subscribe(response => {
      this.clients = response.data;
      this.filteredClients = this.clients;
      this.totalCount = response.totalCount; // Assuming response contains totalCount
      this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
      console.log(this.clients);
    }, error => {
      console.error('Error fetching clients data:', error)
    })

  }
  getAllTags() {
    this.tagService.getUserTags().subscribe(response => {
      this.tags = response.item1;
      console.log(this.tags);
    }, error => {
      console.error('Error fetching tags data:', error)
    })

  }

  prices: any[] = [];
  getAllPriceLists() {
    this.priceList.getAllPriceLists().subscribe(response => {
      this.prices = response.data;
      console.log('price lists:', this.costCenters);
    }, error => {
      console.error('Error fetching price lists data:', error)
    })

  }

  paymentPeriod: any[] = [];
  getAllPaymentsPeriods() {
    this.payments.getAllPaymentPeriods().subscribe(response => {
      this.paymentPeriod = response.paymentPeriods;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching price lists data:', error)
    })

  }
  paymentM: any[] = [];
  getAllPaymentMethods() {
    this.payments.getAllPaymentPeriods().subscribe(response => {
      this.paymentPeriod = response.paymentPeriods;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching price lists data:', error)
    })

  }

  representatives: any[] = [];
  getAllRepresentatives() {
    this.repre.getAllRepresentative().subscribe(response => {
      this.representatives = response;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching price lists data:', error)
    })

  }

  team: any[] = [];
  getAllTeams() {
    this.teamService.getTeams().subscribe(response => {
      this.team = response.teams;
      console.log(this.team);
    }, error => {
      console.error('Error fetching teams data:', error)
    })

  }
  costCenters: any[] = [];
  getAllCostCenters() {
    this.costCenterService.getAllCostCaners().subscribe(response => {
      this.costCenters = response.costCenters;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching costCenters data:', error)
    })

  }


  // Getter for attachments FormArray
  get attachments(): FormArray {
    return this.clientForm.get('attachments') as FormArray;
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
  // Handle file selection
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

  // Remove an attachment
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
  initializeForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      phone: ['', Validators.required],
      email: ['', Validators.required],
      priceListId: ['', Validators.required],
      tagId: [''],
      paymentPeriodId: ['', Validators.required],
      paymentMethodId: [''],
      deliveryMethod: [''],
      representativeId: ['', Validators.required],
      teamId: [''],
      costCenterId: [''],
      creditLimit: ['', Validators.required],
      attachments: this.fb.array([])
    });
  }
  onSubmit(): void {
    const nameControl = this.clientForm.get('name');

    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.clientForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }

    console.log(this.clientForm.value)
    const formValues = this.clientForm.value;
    this.clientService.createClient(formValues).subscribe({
      next: (response) => {
        // console.log('Client created successfully:', response);
        this.toast.success('تمت الإضافة بنجاح');
        this.getAllClients();
        this.clientForm = this.initializeForm();
        this.attachments.clear(); 
          const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
                if (modalInstance) {
                  modalInstance.hide();
                }
                // Ensure proper cleanup after modal closure
                setTimeout(() => {
                  document.body.classList.remove('modal-open');
                  
                  document.body.style.overflow = '';
                }, 300);

      },
      error: (error) => {
        console.error('Error creating client:', error);
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');

      },
    });
  }

 
  // ازرار الاجراءات
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
      this.getAllClients();
    }
  }


  // Update 
  storesSec: any[] = [];
  isModalOpen = false;
  selectedCategory: any = null;

  onCheckboxChange(category: any) {
    this.updateSelectAll();
    this.selectedCategory = category;  // Store the selected category data
  }

  openModalForSelected() {
    if (this.selectedCategory) {
      this.clientForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        phone: this.selectedCategory.phone,
        email: this.selectedCategory.email,
        code: this.selectedCategory.code,
        priceListId: this.selectedCategory.priceListId,
        tagId: this.selectedCategory.tagId,
        paymentPeriodId: this.selectedCategory.paymentPeriodId,
        paymentMethodId: this.selectedCategory.paymentMethodId,
        deliveryMethod: this.selectedCategory.deliveryMethod,
        representativeId: this.selectedCategory.representativeId,
        teamId: this.selectedCategory.teamId,
        costCenterId: this.selectedCategory.costCenterId,
        creditLimit: this.selectedCategory.creditLimit,
      });

      this.isModalOpen = true;
    } else {
      alert('Please select a client to update.');
    }
  }

  closeModal() {
    this.clientForm.reset();
    this.isModalOpen = false;
    this.selectedCategory =null;
  }

  updateCategory() {
    if (this.clientForm.valid) {
      const updatedCategory = { ...this.clientForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.clientService.updateClient(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Category updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllClients();
          this.closeModal();  // Close the modal after successful update
          this.selectedCategory= null;
          this.selectedCount=0;

        },
        (error) => {
          console.error('Error updating client:', error);
          console.log('Updated client Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error(errorMessage, 'Error');
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
    const selectedItems = this.filteredClients.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.clientService.deleteClientById(item.id).subscribe({
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
    this.filteredClients = this.filteredClients.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredClients.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllClients();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllClients();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllClients();
      this.closeConfirmationModal();
      if (this.filteredClients.length === 0 && this.pageNumber > 1) {
        // Move to the previous page if the current page is empty
        this.pageNumber -= 1;  // Adjust the page number to the previous one
        this.changePage(this.pageNumber)
        this.getAllClients(); 
      } else {
        this.getAllClients();
      }
    }
  }


   // select checkbox

 selectAll = false;

 selectedCount = 0;
 
 toggleAllCheckboxes() {
   // Set each item's checked status to match selectAll
   this.clients.forEach(item => (item.checked = this.selectAll));
   // Update the selected count
   this.selectedCount = this.selectAll ? this.clients.length : 0;
 }
 
 updateSelectAll() {
   // Update selectAll if all items are checked
   this.selectAll = this.clients.every(item => item.checked);
   // Calculate the number of selected items
   this.selectedCount = this.clients.filter(item => item.checked).length;
 }


  // Filter data based on search term
  filteredClients: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getClientsWithoutPaging() {
    this.clientService.getCliensts().subscribe(response => {
      this.clients = response.data;
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
      this.getClientsWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllClients();
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
      this.filteredClients = this.clients.filter(item =>
        (item.phone && item.phone.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.email && item.email.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredClients = this.clients;
    }
  }

  // dropdown table columns
columns = [
  // { name: 'id', displayName: 'المسلسل', visible: true },
  { name: 'localName', displayName: 'الإسم المحلي', visible: true },
  { name: 'phone', displayName: 'رقم الجوال', visible: false },
  { name: 'email', displayName: 'البريد الإلكتروني', visible: false },
  { name: 'code', displayName: 'الكود', visible: false },
  { name: 'creditLimit', displayName: 'حد الإئتمان', visible: false },
  { name: 'deliveryMethod', displayName: 'طريقة التسليم', visible: false },
  { name: 'representativeName', displayName: 'المندوب', visible: false },
  { name: 'teamName', displayName: 'الفريق', visible: false },
  { name: 'priceListName', displayName: 'قائمة السعر', visible: false },
  { name: 'paymentMethodName', displayName: 'طريقة الدفع', visible: false },
  { name: 'paymentPeriodName', displayName: 'فترة الدفع', visible: false },
  { name: 'warehouseName', displayName: 'المستودع', visible: false },
  

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
}
