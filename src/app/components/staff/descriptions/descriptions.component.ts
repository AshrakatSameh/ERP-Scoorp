import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { NgZone } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { JobDescriptionsService } from 'src/app/services/getAllServices/JobDescriptions/job-descriptions.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-descriptions',
  templateUrl: './descriptions.component.html',
  styleUrls: ['./descriptions.component.css']
})
export class DescriptionsComponent {

  storesSec: any[] = [];
  JobForm: FormGroup;
  isModalOpen = false;

  pageNumber: number = 1;
  pageSize: number = 10;

  constructor(private jobServices: JobDescriptionsService, private fb: FormBuilder,
    private toast: ToastrService, private http: HttpClient, private ngZone:NgZone, private cdr: ChangeDetectorRef
  ) {
    this.JobForm = this.fb.group({
      name: ['', Validators.required],
      localName: ['', Validators.required],
      description: ['', Validators.required],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })

  }


  ngOnInit(): void {

    this.getAllJobDes()
  }
  getAllJobDes() {
    this.jobServices.getJobDes(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.storesSec = response.jobDescriptions; // Assign the fetched Warehouses
        this.filteredDeps = this.storesSec;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        console.log('Job Des :', this.storesSec);
      },
      (error) => {
        console.error('Error fetching Job Des:', error); // Handle errors
      }
    );
  }

  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }



  onSubmitAdd(): void {
    const nameControl = this.JobForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.JobForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
      // Call the service to post the data
      const formData = this.JobForm.value; // Get the form data
      this.jobServices.creategetJobDes(formData).subscribe(
        response => {
          console.log('Job Des  created successfully!', response);
          this.toast.success('تمت الإضافة بنجاح');
          this.getAllJobDes();
          // Handle success, show notification, etc.
        },
        error => {
          console.error('Error creating Job Des :', error);
          console.log(formData);
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
          // Handle error, show notification, etc.
        }
      );
   
  }


  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.JobForm.get('attachments') as FormArray;
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
      const fileData = {
        fileTitle: [file.name],
        fileType: [file.type],
        fileSize: [file.size],
        fileUrl: [null],  // URL will be set after uploading
        file: [file] 
      };
      // Add the selected file to the FormArray as a FormControl
      this.attachments.push(this.fb.control(file));

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
  apiUrl = environment.apiUrl + 'JobDescriptions';
  onSubmit() {
    const nameControl = this.JobForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.JobForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();
    formData.append('name', this.JobForm.get('name')?.value);
    formData.append('localName', this.JobForm.get('localName')?.value);
    formData.append('description', this.JobForm.get('description')?.value);

    // Append each attachment file
    this.attachments.controls.forEach((control) => {
      const file = control.value;
      if (file) {
        formData.append('AttachmentFiles', file); // Append each file under 'AttachmentFiles'
      }
    });

    const headers = new HttpHeaders({
      tenant: localStorage.getItem('tenant') || ''  // Add your tenant value here
    });

    this.http.post(this.apiUrl, formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        this.toast.success('تمت الإضافة بنجاح');
         
        this.getAllJobDes();
        // Close the modal programmatically
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
        this.JobForm.reset();
        this.attachments.clear();
      }, error => {
        console.error('Error:', error);
        this.toast.error('Error in submit')
      });
  }

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
    if (this.selectedCategory) {
      this.JobForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        description: this.selectedCategory.description,
      });

      this.isModalOpen = true;
    } else {
      alert('الرجاء تحديد العنصر');
    }
  }


  closeModal() {
    this.JobForm.reset();
    this.isModalOpen = false;
    this.selectedCategory =null;
  }


  updateCategory() {
      const updatedCategory = { ...this.JobForm.value, id: this.selectedCategory.id };
      const nameControl = this.JobForm.get('name');
  
      if (!nameControl || nameControl.invalid) {
        console.log('Form is invalid because the name field is invalid.');
        console.log('Name field errors:', nameControl?.errors);
        this.JobForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      // Call the update service method using the category's id
      this.jobServices.updateJobDes(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Unit category updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllJobDes();
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating unit category:', error);
          console.log('Updated unit category Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
 
  }

  deleteItemType() {
    const selectedItems = this.filteredDeps.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.jobServices.deleteJobDesById(item.id).subscribe({
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
    this.filteredDeps = this.filteredDeps.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredDeps.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllJobDes();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllJobDes();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllJobDes();
      this.closeConfirmationModal();
      if (this.filteredDeps.length === 0 && this.pageNumber > 1) {
        // Move to the previous page if the current page is empty
        this.pageNumber -= 1;  // Adjust the page number to the previous one
        this.changePage(this.pageNumber)
        this.getAllJobDes(); 
      } else {
        this.getAllJobDes();
      }
    }
  }
  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }



  totalCount: number = 0; // Total count of items from the API
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.selectedForDelete = []; 
      this.selectedCategory = null; 
      this.selectedCount = 0; 
      this.selectAll= false; 
      this.getAllJobDes();
    }
  
  }
  // Filter data based on search term
  filteredDeps: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  getJobDescWithoutPaging() {
    this.jobServices.getAllgetJobDes().subscribe(response => {
      this.storesSec = response.jobDescriptions;
      this.applySearchFilter(); // Filter data based on search query

    }, error => {
      console.error('Error fetching jobs: ', error)
    }
    )
  }
  // Method to fetch and display data based on search condition
  fetchSaleOffers() {
    // Check if there's a search query that is not empty
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      // If there's a search query, fetch all data without pagination
      this.getJobDescWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllJobDes();
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
      this.filteredDeps = this.storesSec.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toUpperCase().includes(this.searchQuery.toUpperCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))

      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredDeps = this.storesSec;
    }
  }

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.storesSec.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.storesSec.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.storesSec.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.storesSec.filter(item => item.checked).length;
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
