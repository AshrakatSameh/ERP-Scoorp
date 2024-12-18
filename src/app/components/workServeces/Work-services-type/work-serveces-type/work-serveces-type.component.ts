import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ServiceTypesService } from 'src/app/services/getAllServices/ServiceTypes/service-types.service';
import { UserService } from 'src/app/services/getAllServices/Users/user.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-work-serveces-type',
  templateUrl: './work-serveces-type.component.html',
  styleUrls: ['./work-serveces-type.component.css']
})
export class WorkServecesTypeComponent implements OnInit {

  types: any[] = [];
  users: any[] = [];
  serviceTypeForm: FormGroup;
  apiUrl = environment.apiUrl;
  imgApiUrl= environment.imgApiUrl;

  dropdownSettings = {};
  dropdownSettingsList: any[] = [];

  constructor(private servTypes: ServiceTypesService, private fb: FormBuilder, private http: HttpClient,
    private toast: ToastrService, private userServ: UserService, private renderer: Renderer2,
    private cdr: ChangeDetectorRef, private ngZone: NgZone
  ) {
    this.serviceTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      approvalLevels: this.fb.array([], Validators.required), // Array of approval levels
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.getAllServiceTypes();
    this.getAllUsers();

    this.addApprovalLevel();
  }

  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllServiceTypes();
    }
  }
  getAllServiceTypes() {
    this.servTypes.getServiceTypesPaging(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.types = response.serviceRequests; // Assign the fetched Warehouses
        this.filteredServiceType= this.types;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        console.log('types :', this.types);
        this.applySearchFilter();
      },
      (error) => {
        console.error('Error fetching types section:', error); // Handle errors
      }
    );
  }
  getAllUsers() {
    this.userServ.getUsers().subscribe(
      (response) => {
        this.users = response; // Assign the fetched Warehouses
        console.log('users :', this.users);
      },
      (error) => {
        console.error('Error fetching users section:', error); // Handle errors
      }
    );
  }

  get ApprovalLevels(): FormArray {
    return this.serviceTypeForm.get('approvalLevels') as FormArray;
  }
  addApprovalLevel() {
    const approvalLevel = this.fb.group({
      Level: [this.ApprovalLevels.length + 1],
      approverUserIds: [[]]
    });

    this.ApprovalLevels.push(approvalLevel);

    // Ensure each dropdown has unique settings
    this.dropdownSettingsList = this.ApprovalLevels.controls.map(() => ({
      singleSelection: false,
      idField: 'id',
      textField: 'userName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true
    }));
  }

  removeApprovalLevel(index: number) {
    this.ApprovalLevels.removeAt(index);
  }

  getApproverUserIds(levelIndex: number): FormArray {
    return this.ApprovalLevels.at(levelIndex).get('approverUserIds') as FormArray;
  }
  addApproverUserId(levelIndex: number) {
    this.getApproverUserIds(levelIndex).push(this.fb.control(''));
  }

  removeApproverUserId(levelIndex: number, userIdIndex: number) {
    this.getApproverUserIds(levelIndex).removeAt(userIdIndex);
  }


  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.serviceTypeForm.get('attachments') as FormArray;
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

  initializeTypeForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      approvalLevels: this.fb.array([], Validators.required), // Array of approval levels
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    });
  }
  onSubmitAdd(): void {
    const nameControl = this.serviceTypeForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.serviceTypeForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const approvalControl = this.serviceTypeForm.get('approvalLevels');
  
    if (!approvalControl || approvalControl.invalid) {
      console.log('Form is invalid because the approvalLevels field is invalid.');
      console.log('approvalLevels field errors:', approvalControl?.errors);
      this.serviceTypeForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();

    // Append simple fields like 'name' and 'description'
    formData.append('name', this.serviceTypeForm.get('name')?.value || '');
    formData.append('description', this.serviceTypeForm.get('description')?.value || '');

    // Loop over ApprovalLevels to append nested data correctly
    this.ApprovalLevels.controls.forEach((levelControl, levelIndex) => {
      const level = levelControl.get('Level')?.value;
      formData.append(`ApprovalLevels[${levelIndex}].level`, level);

      // Get the ApproverUserIds from the control (which is an array of user objects)
      const approverUserIds = levelControl.get('approverUserIds')?.value || [];

      // Ensure approverUserIds is an array of user IDs, not objects
      approverUserIds.forEach((user: any, userIdIndex: number) => {
        // Append the approverUserId to FormData
        formData.append(`ApprovalLevels[${levelIndex}].approverUserIds[${userIdIndex}]`, user.id); // Assuming 'user.id' is the unique identifier
      });
    });
    // Append each attachment file
    this.attachments.controls.forEach((control) => {
      const fileData = control.value;
      if (fileData && fileData.file instanceof File) {
        // Append the actual file object
        formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
      }
    });

    // Log the FormData contents for debugging (optional, FormData doesn't stringify easily, so we won't see the contents directly)
    console.log('FormData:', formData);

    // Set headers with tenant information
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });

    // POST request with FormData
    this.http.post(this.apiUrl + 'ServiceTypes/create', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success("تم الإضافة بنجاح");
          this.getAllServiceTypes();
          this.serviceTypeForm= this.initializeTypeForm();
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
          console.log(this.serviceTypeForm.value);
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى")
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
      this.serviceTypeForm.patchValue({
        name: this.selectedCategory.name,
        description: this.selectedCategory.description
      });
      this.getActivities();
      this.isModalOpen = true;
    } else {
      alert('الرجاء تحديد العنصر');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
  }

  updateCategory() {
      const updatedCategory = { ...this.serviceTypeForm.value, id: this.selectedCategory.id };
      const nameControl = this.serviceTypeForm.get('name');
  
      if (!nameControl || nameControl.invalid) {
        console.log('Form is invalid because the name field is invalid.');
        console.log('Name field errors:', nameControl?.errors);
        this.serviceTypeForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      const approvalControl = this.serviceTypeForm.get('approvalLevels');
    
      if (!approvalControl || approvalControl.invalid) {
        console.log('Form is invalid because the approvalLevels field is invalid.');
        console.log('approvalLevels field errors:', approvalControl?.errors);
        this.serviceTypeForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      // Call the update service method using the category's id
      this.servTypes.updateServiceType(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Service type updated successfully:', response);
          this.toast.success('تم تحديت البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllServiceTypes();
          this.serviceTypeForm= this.initializeTypeForm();

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
    
  }

  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }

  deleteItemType() {
    const selectedItems = this.filteredServiceType.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.servTypes.deleteServiceTypeById(item.id).subscribe({
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
    this.filteredServiceType = this.filteredServiceType.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredServiceType.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllServiceTypes();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllServiceTypes();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllServiceTypes();
      this.closeConfirmationModal();
      if (this.filteredServiceType.length === 0 && this.pageNumber > 1) {
        // Move to the previous page if the current page is empty
        this.pageNumber -= 1;  // Adjust the page number to the previous one
        this.changePage(this.pageNumber)
        this.getAllServiceTypes(); // Re-fetch items for the updated page
      } else {
        // If the page is not empty, just re-fetch the data
        this.getAllServiceTypes();
      }
    }
  }


  // select checkbox

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.types.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.types.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.types.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.types.filter(item => item.checked).length;
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


  // Method to fetch and display data based on search condition
  // Filter data based on search term
  filteredServiceType: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  getTypesWithoutPaging() {
    this.servTypes.getServiceTypes().subscribe(response => {
      this.types = response.serviceRequests;
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
      this.getTypesWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllServiceTypes();
    }
  }
  // Method to trigger search when the user types or submits the search query
  onSearchInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.getAllServiceTypes();
  }

  // Method to apply search filter on the full data
  applySearchFilter() {
    if (this.searchQuery.trim()) {
      // Filter the data based on the search query
      this.filteredServiceType = this.types.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase())) ||
        (item.serviceTypeName && item.serviceTypeName.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredServiceType = this.types;
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
  this.servTypes.getServiceTypesActivities(this.selectedCategory.id).subscribe((res)=>{
    this.activities = res;
    console.log(res)
  })
}
}
