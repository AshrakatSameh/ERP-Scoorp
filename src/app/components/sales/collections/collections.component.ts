import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PaymentType } from 'src/app/enums/PaymentType';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { CollectionsService } from 'src/app/services/getAllServices/Collections/collections.service';
import { ContractService } from 'src/app/services/getAllServices/Contracts/contract.service';
import { ConvenantBoxService } from 'src/app/services/getAllServices/ConvenantBox/convenant-box.service';
import { ConvenantService } from 'src/app/services/getAllServices/Convenants/convenant.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';
import { PaymentMethodService } from 'src/app/services/getAllServices/PaymentMethods/payment-method.service';
import { PriceListService } from 'src/app/services/getAllServices/PriceList/price-list.service';
import { ProjactService } from 'src/app/services/getAllServices/Projects/projact.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit {

imgApiUrl= environment.imgApiUrl;
  costCenters: any[] = [];
  convenants: any[] = [];
  representatives:any[]=[];
  contracts:any[]=[];
  paymentMethod:any[]=[];
  clients:any[]=[];
  collections:any[]=[];

  isModalOpen = false;
  selectedCategory: any = null;

  paymentType = PaymentType;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  paymentTypeList: { key: number; value: string }[] = [];
  
  collectionForm!: FormGroup;
  
  commentForm:FormGroup;
  comments:any[] =[];

userId:any;


  constructor(private costCenterService: CostCenterService, private representService:RepresentativeService,
      private convenantBoxService: ConvenantBoxService, private contractService:ContractService,
      private paymentService:PaymentMethodService, private clientService:ClientsService,
      private collectionService:CollectionsService, private fb:FormBuilder, private teamService:TeamsService,
      private http:HttpClient, private priceList: PriceListService,private renderer: Renderer2, private project: ProjactService,
      private contract:ContractService, private ngZone:NgZone,
      private toast:ToastrService) { 
        this.userId = JSON.parse(localStorage.getItem("userData")!).user_id;
    this.collectionForm= this.fb.group({
      code: ['', Validators.required || null],
      clientId: ['', Validators.required || null],
      representativeId: ['', Validators.required || null],
      teamId: ['', Validators.required || null],
      paymentMethodId: ['', Validators.required || null],
      clientPhone:[],
      clientEmail:[],
      costCenterId: ['', Validators.required || null],
      covenantBoxId: ['', Validators.required || null],
      value:[0],
      installmentId:[''],
      projectId:[''],
      contractId:[''],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    });

        // Initializing Comment Form
        this.commentForm = this.fb.group({
          content:['', Validators.required],
          entityId:['', Validators.required],
          parentCommentId:[''],
          attachmentFiles: this.fb.array([])
        })
    // this.paymentTypeList = Object.keys(PaymentType)
    // .map((key, index) => ({
    //   key: index,  // Use the index as the numeric key
    //   value: PaymentType[key as keyof typeof PaymentType]  // Get the value from the enum
    // }));
  }

  ngOnInit(): void {
    this.getAllCostCenters();
    this.getAllConvenantBoxes();
    this.getAllRepresentative();
    this.getAllContracts();
    this.getAllPaymentMethods();
    this.getAllClients();
    this.getAllCollections();
    this.getAllTeams();
    this.getAllProjects();
    
    this.paymentTypeList = [
      { key: 0, value: 'Cash' },
      { key: 1, value: 'Deferred' },
      { key: 2, value: 'CashOrDeferred' }
    ];
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


  buttons = ['التعليقات', 'المهام', 'المرفقات', 'الارتباطات', 'التوقيع', 'الختم']
  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }


projects:any[]=[];

getAllProjects() {
    this.project.getProjactsWithoutPag().subscribe(response => {
      this.projects = response.projects;
      // console.log('projects: ',this.projects);
    }, error => {
      console.error('Error fetching projects data:', error)
    })

  }

  // contracts:any[]=[];
  // getAllContracts() {
  //   this.project.getProjactsWithoutPag().subscribe(response => {
  //     this.projects = response.projects;
  //     //console.log(this.costCenters);
  //   }, error => {
  //     console.error('Error fetching projects data:', error)
  //   })

  // }
  getAllCostCenters() {
    this.costCenterService.getAllCostCaners().subscribe(response => {
      this.costCenters = response.costCenters;
      //console.log(this.costCenters);
    }, error => {
      console.error('Error fetching costCenters data:', error)
    })

  }
  getAllConvenantBoxes() {
    this.convenantBoxService.getConvenantBoxes().subscribe(response => {
      this.convenants = response.covenantBoxes;
      //console.log(this.convenants);
    }, error => {
      console.error('Error fetching convenants data:', error)
    })

  }
  getAllRepresentative() {
    this.representService.getAllRepresentative().subscribe(response => {
      this.representatives = response;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching representatives data:', error)
    })

  }
  getAllContracts() {
    this.contractService.getAllContracts().subscribe(response => {
      this.contracts = response.contracts;
      //console.log(this.contracts);
    }, error => {
      console.error('Error fetching contracts data:', error)
    })

  }
  getAllPaymentMethods() {
    this.paymentService.getAllPaymentMethods().subscribe(response => {
      this.paymentMethod = response.paymentMethods;
     // console.log(this.paymentMethods);
    }, error => {
      console.error('Error fetching paymentMethods data:', error)
    })

  }
  getAllClients() {
    this.clientService.getCliensts().subscribe(response => {
      this.clients = response.data;
    //  console.log(this.clients);
    }, error => {
      console.error('Error fetching clients data:', error)
    })

  }

  getAllCollections() {
    this.collectionService.getAllCollections(this.pageNumber, this.pageSize).subscribe(response => {
      this.collections = response.item1;
      this.filteredCollections = this.collections;
      this.totalCount = response.item2; // Assuming response contains totalCount
      this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
      //console.log(this.collections);
    }, error => {
      console.error('Error fetching collections data:', error)
    })

  }
  team:any[]=[];
  getAllTeams() {
    this.teamService.getTeams().subscribe(response => {
      this.team = response.teams;
    console.log(this.team);
    }, error => {
      console.error('Error fetching teams data:', error)
    })

  }


   // handle array of attachments
   fileNames: string[] = []; // Array to store file names

   get attachmentFiles(): FormArray {
     return this.collectionForm.get('attachmentFiles') as FormArray;
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
apiUrl = environment.apiUrl
  onSubmitAdd() {
    const formData = new FormData();
    formData.append('code', this.collectionForm.get('code')?.value);
    formData.append('clientId', this.collectionForm.get('clientId')?.value);
    // formData.append('code', this.collectionForm.get('code')?.value);
    formData.append('representativeId', this.collectionForm.get('representativeId')?.value);
    formData.append('teamId', this.collectionForm.get('teamId')?.value);
    formData.append('paymentMethodId', this.collectionForm.get('paymentMethodId')?.value);
    formData.append('clientPhone', this.collectionForm.get('clientPhone')?.value);
    formData.append('clientEmail', this.collectionForm.get('clientEmail')?.value);
    formData.append('costCenterId', this.collectionForm.get('costCenterId')?.value);
    formData.append('covenantBoxId', this.collectionForm.get('covenantBoxId')?.value);
    formData.append('value', this.collectionForm.get('value')?.value);
    this.attachmentFiles.controls.forEach((control) => {
      const fileData = control.value;
      if (fileData && fileData.file instanceof File) {
        // Append the actual file object
        formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
      }
    });
  // attachmentFiles
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });
  
    this.http.post(this.apiUrl + 'Collections/Create', formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        this.toast.success('تمت الإضافة بنجاح');
        this.getAllCollections();
        this.collectionForm.reset({
          code: [null],
      clientId: [null],
      representativeId: [null],
      teamId: [null],
      paymentMethodId: [null],
      clientPhone:[],
      clientEmail:[],
      costCenterId: [null],
      covenantBoxId: [null],
      value:[0],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
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


  // Update
onCheckboxChange(category: any) {
  this.updateSelectAll();
  this.selectedCategory = category;  // Store the selected category data
}

openModalForSelected() {
  console.log(this.selectedCategory)
  if (this.selectedCategory) {
    this.collectionForm.patchValue({
      code: this.selectedCategory.code,
      clientId: this.selectedCategory.clientId,
      representativeId: this.selectedCategory.representativeId,
      teamId: this.selectedCategory.teamId,
      paymentMethodId: this.selectedCategory.paymentMethodId,
      clientPhone: this.selectedCategory.clientPhone,
      clientEmail: this.selectedCategory.clientEmail,
      costCenterId: this.selectedCategory.costCenterId,
      covenantBoxId: this.selectedCategory.covenantBoxId,
      value: this.selectedCategory.value
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
    alert('Please select a category to update.');
  }
}

closeModal() {
  this.collectionForm.reset();
  this.isModalOpen = false;
  this.selectedCategory =null;
  this.resetAttachments();
}
resetAttachments(){
  this.attachmentFiles.clear();
}

updateCategory() {
  if (this.collectionForm.valid) {
    const updatedCategory = { ...this.collectionForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.collectionService.updateItemType(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Category updated successfully:', response);
        this.toast.success('تم التحديث بنجاح')
        // Update the local categories array if necessary
        const index = this.collections.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.collections[index] = updatedCategory;
        }

        this.getAllCollections();
        this.closeModal();  // Close the modal after successful update
      },
      (error) => {
        console.error('Error updating collection:', error);
        console.log('Updated collection Data:', updatedCategory);
        // alert('An error occurred while updating the item type .');
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error(errorMessage, 'Error');       }
    );
    }
  }

  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllCollections();
    }
  }

  
  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  deleteItem(){
    const selectedItems = this.filteredCollections.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.collectionService.deleteItemById(item.id).subscribe({
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
    this.filteredCollections = this.filteredCollections.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredCollections.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllCollections();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllCollections();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllCollections();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }



  // dropdown table columns
columns = [
  // { name: 'id', displayName: 'المسلسل', visible: true },
  { name: 'clientEmail', displayName: 'ايميل العميل', visible: true },
  { name: 'clientPhone', displayName: 'رقم الهاتف', visible: true },
  { name: 'code', displayName: 'كود ', visible: true },
  { name: 'clientName', displayName: 'اسم العميل', visible: true },
  { name: 'representativeName', displayName: 'المندوب', visible: false },
  { name: 'teamName', displayName: 'الفريق', visible: false },
  { name: 'paymentMethodName', displayName: 'طريقة الدفع', visible: false },
  { name: 'costCenterName', displayName: 'مركز التكلفة', visible: false },
  { name: 'attachmentFiles', displayName: 'المرفقات', visible: true },


];
showDropdownCol= false;
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
    this.collections.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.collections.length : 0;
  }
  
  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.collections.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.collections.filter(item => item.checked).length;
  }

  // Filter data based on search term
  filteredCollections: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getCoolectionsWithoutPaging() {
    this.collectionService.getAllCollectionsWithoutPaging().subscribe(response => {
      this.collections = response.item1;
      this.applySearchFilter(); // Filter data based on search query

    }, error => {
      console.error('Error fetching collections: ', error)
    }
    )
  }
  // Method to fetch and display data based on search condition
  fetchSaleOffers() {
    // Check if there's a search query that is not empty
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      // If there's a search query, fetch all data without pagination
      this.getCoolectionsWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllCollections();
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
      this.filteredCollections = this.collections.filter(item =>
        (item.clientName && item.clientName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.costCenterName && item.costCenterName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.paymentMethodName && item.paymentMethodName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.teamName && item.teamName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.clientEmail && item.clientEmail.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.clientPhone && item.clientPhone.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredCollections = this.collections;
    }
  }




    // Add Comment Logic
    addComment(parent:any =''){
      this.collectionService.postCollectionsComment({
        Content:this.commentForm.controls['content'].value,
        EntityId:this.selectedCategory.id,
        ParentCommentId:parent
      }).subscribe((res)=> console.log(res));
      this.getComments();
      this.commentForm.reset();
      if(parent) this.replayId = '';
    }
  
    getComments(){
      this.collectionService.getCollectionsComments(this.selectedCategory.id).subscribe((res)=>{
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
      this.collectionService.updateCollectionsComment(commentId,{
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
