import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EmpRequestCategService } from 'src/app/services/getAllServices/EmployeeRequestCategory/emp-request-categ.service';
import { EmpRequestsService } from 'src/app/services/getAllServices/EmployeeRequests/emp-requests.service';
import { EmpRequestTypeService } from 'src/app/services/getAllServices/EmployeeRequestType/emp-request-type.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-employee-requests',
  templateUrl: './employee-requests.component.html',
  styleUrls: ['./employee-requests.component.css']
})
export class EmployeeRequestsComponent implements OnInit {
  employeeRequestForm: FormGroup;

  apiUrl = environment.apiUrl;
  imgApiUrl= environment.imgApiUrl;

  comments:any[] =[];
  commentForm:FormGroup;
userId: any;



  constructor(private empService: EmpRequestsService, private fb: FormBuilder, private empType: EmpRequestTypeService,
    private http: HttpClient, private toast: ToastrService, private ngZone: NgZone, private renderer: Renderer2
   , private cdr: ChangeDetectorRef,
    private empCategory: EmpRequestCategService
  ) {
    // this.userId = JSON.parse(localStorage.getItem("userData")!).user_id;
    this.employeeRequestForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      categoryId:[''],
      requestTypeId: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      RequestValue: [''],
      Quantity: [''],

      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })


        // Initializing Comment Form
        this.commentForm = this.fb.group({
          content:['', Validators.required],
          entityId:['', Validators.required],
          parentCommentId:[''],
          attachmentFiles: this.fb.array([])
        })
  }
  ngOnInit(): void {
    this.getAllEmployeeRequests();
    this.getAllEmpRequestTypes();
    this.getAllEmpRequestCategory();
  }

  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllEmployeeRequestsPaging();
    }
  }
  requests: any[] = [];


  getAllEmployeeRequestsPaging() {
    this.empService.getEmployeeRequestspaging(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.requests = response.requests; // Assign the fetched Warehouses
        this.filteredEmpRequest = this.requests;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        console.log('requests :', this.requests);
      },
      (error) => {
        console.error(' Error fetching requests :', error); // Handle errors
      }
    );
  }
  types: any[] = [];
  getAllEmpRequestTypes() {
    this.empType.getEmpRequestTypes().subscribe(
      (response) => {
        this.types = response.requestTypes; // Assign the fetched Warehouses
        console.log('types :', this.types);
        // this.mapCategoryNames()
        // this.applySearchFilter();
      },
      (error) => {
        console.error('Error fetching types section:', error); // Handle errors
      }
    );
  }
  getTypeById(requestTypeId: number): string {
    const type = this.types.find(c => c.id === requestTypeId);
    return type ? type.name : '';
  }
  categories:any[]=[];
  getAllEmpRequestCategory() {
    this.empCategory.getEmployeeReqCategory().subscribe(
      (response) => {
        this.categories = response.categories; // Assign the fetched Warehouses
        // console.log('categories : ' , this.categories)
      },
      (error) => {
        console.error('Error fetching :', error); // Handle errors
      }
    );
  }
  getCategoryNameById(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.employeeRequestForm.get('attachments') as FormArray;
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
  onSubmitAdd(): void {
    const nameControl = this.employeeRequestForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.employeeRequestForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const requestTypeControl = this.employeeRequestForm.get('requestTypeId');
  
    if (!requestTypeControl || requestTypeControl.invalid) {
      console.log('Form is invalid because the requestTypeId field is invalid.');
      console.log('requestTypeId field errors:', requestTypeControl?.errors);
      this.employeeRequestForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData()

    // Append simple fields like 'name' and 'description'
    formData.append('name', this.employeeRequestForm.get('name')?.value || '');
    formData.append('description', this.employeeRequestForm.get('description')?.value || '');
    formData.append('requestTypeId', this.employeeRequestForm.get('requestTypeId')?.value || '');
    formData.append('categoryId', this.employeeRequestForm.get('categoryId')?.value || '');
    formData.append('startDate', this.employeeRequestForm.get('startDate')?.value || '');
    formData.append('endDate', this.employeeRequestForm.get('endDate')?.value || '');
    formData.append('RequestValue', this.employeeRequestForm.get('RequestValue')?.value || '');
    formData.append('Quantity', this.employeeRequestForm.get('Quantity')?.value || '');

    // Append each attachment file
    this.attachments.controls.forEach((control) => {
      const fileData = control.value;
      if (fileData && fileData.file instanceof File) {
        // Append the actual file object
        formData.append('attachments', fileData.file, fileData.fileTitle);
      }
    });

    // Log the FormData contents for debugging (optional, FormData doesn't stringify easily, so we won't see the contents directly)
    console.log('FormData:', formData);

    // Set headers with tenant information
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });

    // POST request with FormData
    this.http.post(this.apiUrl + 'EmployeeRequests', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تم الإضافة بنجاح');
          this.getAllEmployeeRequests();
          this.employeeRequestForm.reset();
          const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
          if (modalInstance) {
            modalInstance.hide();
          }
          // Ensure proper cleanup after modal closure
          setTimeout(() => {
            document.body.classList.remove('modal-open');
            
            document.body.style.overflow = '';
          }, 300);
          this.attachments.clear();
        },
        (error: any) => {
          console.error('Error:', error);
          console.log(this.employeeRequestForm.value);
        }
      );
  }

  // Update
  isModalOpen = false;
  selectedCategory: any = null;
  storesSec: any[] = [];

  onCheckboxChange(category: any, event: any) {
    if (event.target.checked) { // Check if the checkbox is checked
      this.selectedCategory = category; // Store the selected category data
      this.updateSelectAll();
      console.log(this.selectedCategory);
    } else {
      // Optionally, handle unchecking behavior here if needed
      this.selectedCategory = null; // Clear the selection if unchecked
      this.updateSelectAll();
      console.log('Checkbox unchecked, category deselected');
      // this.toast.error('Checkbox unchecked, category deselected');
    }
  }

  openModalForSelected() {
    if (this.selectedCategory) {
      this.employeeRequestForm.patchValue({
        name: this.selectedCategory.name,
        requestTypeId: this.selectedCategory.requestTypeId,
        categoryId:this.selectedCategory.categoryId,
        startDate: this.selectedCategory.startDate,
        endDate: this.selectedCategory.endDate,
        RequestValue: this.selectedCategory.RequestValue,
        Quantity: this.selectedCategory.Quantity,
        description: this.selectedCategory.description
      });
      this.attachments.clear();
      if (this.selectedCategory.attachments?.length) {
        this.selectedCategory.attachments.forEach((attachment: any) => {
          const fileData = {
            fileTitle: attachment.fileTitle,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            fileUrl: attachment.fileUrl, // Placeholder for URL after upload
            file: attachment,
          };
          this.attachments.push(this.fb.control(fileData));
          // this.attachments.push(this.fb.group({ file: attachment })); // Existing attachment
          console.log(this.attachments.controls);
        });
      }
      this.isModalOpen = true;
    } else {
      alert('Please select a type to update.');
    }
  }

  closeModal() {
    this.employeeRequestForm.reset();
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.attachments.reset();
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
  updateCategory() {
    if (this.employeeRequestForm.valid) {
      const updatedCategory = { ...this.employeeRequestForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.empService.updateEmployeeRequest(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Employee request updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllEmployeeRequests();
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating type :', error);
          console.log('Updated type  Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى'); 
        }
      );
    } else {
      console.log(this.employeeRequestForm)
    }
  }

  // select checkbox

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.requests.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.requests.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.requests.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.requests.filter(item => item.checked).length;
  }

  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }

  deleteItemType() {
    const selectedItems = this.filteredEmpRequest.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.empService.deleteEmpRequestById(item.id).subscribe({
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
    this.filteredEmpRequest = this.filteredEmpRequest.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredEmpRequest.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllEmployeeRequestsPaging();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllEmployeeRequestsPaging();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllEmployeeRequestsPaging();
      
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  // Method to fetch and display data based on search condition
  // Filter data based on search term
  filteredEmpRequest: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  getAllEmployeeRequests() {
    this.empService.getEmployeeRequests().subscribe(
      (response) => {
        this.requests = response.requests; // Assign the fetched Warehouses
        console.log('requests :', this.requests);
        this.applySearchFilter();
      },
      (error) => {
        console.error(' Error fetching requests section:', error); // Handle errors
      }
    );
  }
  fetchServiceType() {
    // Check if there's a search query that is not empty
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      // If there's a search query, fetch all data without pagination
      this.getAllEmployeeRequests();
    } else {
      this.getAllEmployeeRequestsPaging();
    }
  }
  // Method to trigger search when the user types or submits the search query
  onSearchInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.fetchServiceType();
  }

  // Method to apply search filter on the full data
  applySearchFilter() {
    if (this.searchQuery.trim()) {
      // Filter the data based on the search query
      this.filteredEmpRequest = this.requests.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        // (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredEmpRequest = this.requests;
    }
  }



    // Add Comment Logic
    addComment(parent:any =''){
      this.empService.postEmployeeRequestComment({
        Content:this.commentForm.controls['content'].value,
        EntityId:this.selectedCategory.id,
        ParentCommentId:parent
      }).subscribe((res)=> console.log(res));
      this.getComments();
      this.commentForm.reset();
      if(parent) this.replayId = '';
    }
  
    getComments(){
      this.empService.getEmployeeRequestComments(this.selectedCategory.id).subscribe((res)=>{
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
      this.empService.updateEmployeeRequestComment(commentId,{
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
  this.attachments.push(this.fb.control({ ...fileData, audioUrl }));

  // Trigger change detection
  // this.changeDetectorRef.detectChanges();
}
}
