import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TagService } from 'src/app/services/getAllServices/Tag/tag.service';
import { WarehouseService } from 'src/app/services/getAllServices/Warehouse/warehouse.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit{
  tags: any[] = [];
  tagForm : FormGroup;
  apiUrl= environment.apiUrl;
  imgApiUrl= environment.apiUrl;
  constructor(private tagService: TagService, private fb: FormBuilder,
    private http: HttpClient, private toast:ToastrService, private renderer:Renderer2,private ngZone:NgZone
  ){
    this.tagForm= this.fb.group({
      name:['', Validators.required],
      description:[''],
      attachments: this.fb.array([])

    })
  }

  
  ngOnInit(): void {
   this.getAllTags();

}

getAllTags(){
  this.tagService.getUserTagsPaging(this.pageNumber, this.pageSize).subscribe(response=>{
      this.tags= response.item1;
      this.totalCount = response.item2; // Assuming response contains totalCount
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      console.log(this.tags);
    }, error =>{
      console.error('Error fetching tags data:' , error)
    })
    
  }

  


// handle array of attachments
fileNames: string[] = []; // Array to store file names

get attachments(): FormArray {
  return this.tagForm.get('attachments') as FormArray;
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
onSubmitAdd(): void {

  const formData = new FormData();
  formData.append('name', this.tagForm.get('name')?.value);
  formData.append('description', this.tagForm.get('description')?.value);

  // Append each attachment file
  this.attachments.controls.forEach((control) => {
    const fileData = control.value;
    if (fileData && fileData.file instanceof File) {
      // Append the actual file object
      formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
    }
  });
  console.log('FormData contents:');
  formData.forEach((value, key) => {
    console.log(key, value);
  });

  const headers = new HttpHeaders({
    'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
  });

  this.http.post(this.apiUrl + 'Tag/CreateTag?', formData, { headers })
    .subscribe(
      (response: any) => {
        console.log('Response:', response);
        this.toast.success('تمت الإضافة بنجاح');
       
        this.getAllTags();
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

        this.tagForm.reset();
        // alert('Submit successfully');
      },
      (error: any) => {
        console.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');

      }
    );
}

// select checkbox
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  // Set each item's checked status to match selectAll
  this.tags.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.tags.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.tags.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.tags.filter(item => item.checked).length;
}
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

 // Update

 
 openModalForSelected() {
   if (this.selectedCategory) {
     this.tagForm.patchValue({
       name: this.selectedCategory.name,
       description: this.selectedCategory.description,
     });
     this.attachments.clear();

     if (this.selectedCategory.attachments) {
       this.selectedCategory.attachments.forEach((attachment: any) => {
         this.addAttachmentToForm(attachment);
       });
     }
     this.isModalOpen = true;
   } else {
     alert("الرجاء تحديد عنصر");
   }
 }
 addAttachmentToForm(attachment: any) {
   const attachmentExists = this.attachments.controls.some((control: any) => 
     control.value.fileUrl === attachment.fileUrl || control.value.fileTitle === attachment.fileTitle
   );
 
   if (!attachmentExists) {
     this.attachments.push(this.fb.group({
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
   this.tagForm.reset();
 }

 updateCategory() {
   if (this.tagForm.valid) {
     const updatedCategory = { ...this.tagForm.value, id: this.selectedCategory.id };

     // Call the update service method using the category's id
     this.tagService.updateTag(this.selectedCategory.id, updatedCategory).subscribe(
       (response) => {
         console.log('Unit category updated successfully:', response);
         this.toast.success('تم تحديث البيانات بنجاح')
         // Update the local categories array if necessary
         const index = this.tags.findIndex(cat => cat.id === updatedCategory.id);
         if (index !== -1) {
           this.tags[index] = updatedCategory;
         }

         this.getAllTags();
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
   } else {
     this.toast.warning('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
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


  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  selectedCategories: any[] = []; // Array to hold selected categories
  isLoading: boolean = false; // Loading indicator
  deleteItemType() {
  const selectedItems = this.tags.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.tagService.deleteTagById(item.id).subscribe({
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
    this.tags = this.tags.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.tags.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllTags();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllTags();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllTags();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
      this.getAllTags();
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