import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { StoresSectionService } from 'src/app/services/getAllServices/StoresSection/stores-section.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-unit-category',
  templateUrl: './unit-category.component.html',
  styleUrls: ['./unit-category.component.css']
})
export class UnitCategoryComponent implements OnDestroy {

  storesSec: any[] = [];
  unitCatForm: FormGroup;
  apiUrl = environment.apiUrl;
  imgApiUrl = environment.imgApiUrl;
  constructor(private mysrv: StoresSectionService, private fb: FormBuilder,
    private toast: ToastrService, private http: HttpClient, private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private ngZone:NgZone
  ) {
    this.unitCatForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      note: [''],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })

  }
  ngOnDestroy(): void {
    this.removeDocumentClickListener();
  }

  ngOnInit(): void {
    this.getAllUnitCat();
    this. getCategoriesWithoutPag();
  }

  getAllUnitCat() {
    this.mysrv.getUnitCategories(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.storesSec = response.categories; // Assign the fetched Warehouses
        this.filteredUnitCat = this.storesSec;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        console.log('store section:', this.storesSec);
      },
      (error) => {
        console.error('Error fetching stores section:', error); // Handle errors
      }
    );
  }
  allCat:any[]=[];
  getCategoriesWithoutPag(){
    this.mysrv.getAllUnitCategories().subscribe((res)=>{
      this.allCat= res.categories;
      console.log(this.allCat);

    },
    (error) => {
      console.error('Error fetching stores section:', error); // Handle errors
    })
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
      this.getAllUnitCat();
    }
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.unitCatForm.get('attachments') as FormArray;
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
  
      // Construct the file data to store in the FormArray
      const fileData = {
        fileTitle: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: null, // Placeholder for URL after upload
        file: file // Store the actual file object
      };
  
      // Add the file data to the FormArray
      this.attachments.push(this.fb.control(fileData));
  
      console.log('Attachments after file selection:', this.attachments.value);
  
      // Reset the input value to allow selecting the same file again
      input.value = '';
    }
  }
  
  
  // Method to remove a file from the attachments FormArray
  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
    if(this.attachments.length==0) this.toggleDragDrop();
    console.log(this.attachments)
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
    const nameControl = this.unitCatForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.unitCatForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
  
    const name = nameControl.value;
  
    // Debug: Log the current storesSec array to ensure it has data
  
    // Check if the name already exists in storesSec
    const nameExists = this.allCat.some((category: any) => {
      return category.name?.trim().toLowerCase() === name.trim().toLowerCase();
    });
  
    if (nameExists) {
      console.log(`Name "${name}" already exists in the database.`);
      this.toast.error('اسم الفئة موجود بالفعل، يرجى اختيار اسم آخر.');
      return; // Stop further processing if the name exists
    }
  
    console.log(`Name "${name}" does not exist. Proceeding with submission.`);
  
    // Continue with form submission if name does not exist
    const formData = new FormData();
    formData.append('name', this.unitCatForm.get('name')?.value);
    formData.append('localName', this.unitCatForm.get('localName')?.value);
    formData.append('note', this.unitCatForm.get('note')?.value);
    console.log(this.attachments)
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
      tenant: localStorage.getItem('tenant') || '' // Add your tenant value here
    });
  
    this.http.post(this.apiUrl + 'StoresSection/unit-category', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تمت الإضافة بنجاح');
          this.getAllUnitCat();
  
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
  
          this.unitCatForm.reset({
            name: [''],
            localName: [''],
            note: [''],
            attachmentFiles: this.fb.array([]),
            attachments: this.fb.array([])
          });
          this.attachments.clear();
        },
        (error: any) => {
          console.log(error);
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
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
  
  openModalForSelected() {
    if (this.selectedCategory) {
      this.unitCatForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        note: this.selectedCategory.note,
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
    this.unitCatForm.reset();
    this.resetAttachments();
  }
  resetAttachments(){
    this.attachments.clear();
  }
  updateCategory() {
    if (this.unitCatForm.valid) {
      const updatedCategory = { ...this.unitCatForm.value, id: this.selectedCategory.id };
      console.log(updatedCategory,this.attachments)
      updatedCategory.attachmentFiles = this.attachments;
      // Call the update service method using the category's id
      this.mysrv.updateUnitCat(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Unit category updated successfully:', updatedCategory, response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllUnitCat();
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
    // this.mysrv.deleteUnitCatById(this.selectedCategory.id).subscribe(
    //   (response)=>{
    //     console.log('Item type deleted successfully:', response);
    //     this.toast.success('تم المسح بنجاح');
    //     this.getAllUnitCat();
    //     this.closeConfirmationModal(); 
    //     this.selectedCategory=null;
    //     this.selectedCount=0;
    //   },error => {
    //     console.error('Error delete Unit category:', error);
    //     console.log(this.selectedCategory.id);
    //     // alert('An error occurred while updating the item type .');
    //     const errorMessage = error.error?.message || 'An unexpected error occurred.';
    //     this.toast.error('حدث خطأ: لا يمكن مسحه لإرتباطه بكيان اخر!');   
    //     console.log(error)   
    //    }
    // )
    // _________________________________________________________________________________________
    // _____________________________________________________________________________________________
    // if (this.selectedCategories.length === 0) {
    //   this.toast.warning('لم يتم تحديد أي عنصر للحذف.');
    //   return;
    // }

    // const ids = this.selectedCategories.map((item) => item.id); // Collect all selected IDs

    // this.isLoading = true; // Show loading state
    // this.mysrv.deleteMultipleUnitCats(ids).subscribe(
    //   () => {
    //     this.toast.success('تم الحذف بنجاح');
    //     this.getAllUnitCat(); // Refresh the table
    //     this.selectedCategories = []; // Clear selected categories
    //     this.selectedCount = 0; // Reset count
    //     this.selectAll = false; // Reset Select All state
    //     this.isLoading = false; // Stop loading
    //   },
    //   (error) => {
    //     console.error('Error deleting items:', error);
    //     const errorMessage = error.error?.message || 'حدث خطأ أثناء الحذف.';
    //     this.toast.error(errorMessage);
    //     this.isLoading = false; // Stop loading
    //   }
    // );
    // ===============================================================================
    const selectedItems = this.filteredUnitCat.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.mysrv.deleteUnitCatById(item.id).subscribe({
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
    this.filteredUnitCat = this.filteredUnitCat.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredUnitCat.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllUnitCat();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllUnitCat();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllUnitCat();
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




  // select checkbox
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

  // Filter data based on search term
  filteredUnitCat: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getUnitCatWithoutPaging() {
    this.mysrv.getAllUnitCategories().subscribe(response => {
      this.storesSec = response.categories;
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
      this.getUnitCatWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllUnitCat();
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
      this.filteredUnitCat = this.storesSec.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.note && item.note.toUpperCase().includes(this.searchQuery.toUpperCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredUnitCat = this.storesSec;
    }
  }


  // dropdown table columns
  columns = [
    // { name: 'id', displayName: 'المسلسل', visible: true },
    { name: 'localName', displayName: 'الإسم المحلي', visible: true },
    { name: 'note', displayName: 'ملاحظة', visible: true },
    { name: 'attachments', displayName: 'المرفقات', visible: true },



  ];
  showDropdownCol = false;
  toggleDropdownCol(event: MouseEvent) {
    event.stopPropagation(); // Prevent the click from propagating to the document
    this.showDropdownCol = !this.showDropdownCol;
    console.log('Dropdown visibility:', this.showDropdownCol);
  }

  // Prevent dropdown from closing when clicking inside
  onDropdownClick(event: MouseEvent) {
    event.stopPropagation();
    console.log('Clicked inside dropdown, propagation stopped.');
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showDropdownCol = false; // Close the dropdown when clicking outside
    console.log('Dropdown closed due to outside click.');
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
