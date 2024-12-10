import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as bootstrap from 'bootstrap';
import { Modal } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from 'src/app/services/getAllServices/storage/storage.service';
import { WarehouseService } from 'src/app/services/getAllServices/Warehouse/warehouse.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit {

  apiUrl = `${environment.apiUrl}StoresSection/storage-place`
imgApiUrl= environment.imgApiUrl;

  myForm!: FormGroup;
  pageNumber: number = 1;
  pageSize: number = 10;
  public stores: any[] = [];
  constructor(private storageS: StorageService, private fb: FormBuilder, private http: HttpClient,
    private toast: ToastrService, private wareService: WarehouseService, private modalService: NgbModal,
    private cdr: ChangeDetectorRef

  ) {

    this.myForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      note: [''],
      code: [''],
      warehouseId: ['', Validators.required],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    });

  }
  ngOnInit(): void {
    this.getAllStorage();
    this.getAllWareHouses();
  }

  getAllStorage() {
    this.storageS.getStorage(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.stores = response.places; // Assign the fetched Warehouses
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        console.log('items :', this.stores);
      },
      (error) => {
        console.error('Error fetching item types storage:', error); // Handle errors
      }
    );
  }

  storehouse: any[] = [];
  getAllWareHouses() {
    this.wareService.getWarehouses(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.storehouse = data.data;
        console.log(this.storehouse);
      }, error => {
        console.error('Error fetching tenant storehouse:', error);
      });
  }


  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.myForm.get('attachments') as FormArray;
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
    const nameControl = this.myForm.get('name');

    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.myForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();
    formData.append('name', this.myForm.get('name')?.value);
    formData.append('localName', this.myForm.get('localName')?.value);
    formData.append('note', this.myForm.get('note')?.value);
    formData.append('code', this.myForm.get('code')?.value);
    formData.append('warehouseId', this.myForm.get('warehouseId')?.value);

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

    this.http.post(this.apiUrl, formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        this.getAllStorage();
        // alert('submit successfully');
        this.toast.success('تم الإضافة بنجاح');
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');

          document.body.style.overflow = '';
        }, 300);
        this.myForm.reset({
          name: [''],
          localName: [''],
          note: [''],
          code: [''],
          warehouseId: [''],
        })
      }, error => {
        console.error('Error:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
      });

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
      this.getAllStorage();
    }
  }


  // Update
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
    if (this.selectedCategory) {
      this.myForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        note: this.selectedCategory.note,
        code: this.selectedCategory.code,
        warehouseId: this.selectedCategory.warehouseId,
      });
      this.attachments.clear();
      if (this.selectedCategory.attachments?.length) {
        this.selectedCategory.attachments.forEach((attachment: any) => {
          this.attachments.push(this.fb.group({ file: attachment })); // Existing attachment
          console.log(this.attachments.controls);
        });
      }
      this.isModalOpen = true;
    } else {
      alert('Please select a category to update.');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.myForm.reset();
    this.resetAttachments();
  }
  resetAttachments(){
    this.attachments.clear();
  }

  updateCategory() {
    if (this.myForm.valid) {
      const updatedCategory = { ...this.myForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.storageS.updateStorage(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Category updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllStorage();
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating category:', error);
          console.log('Updated Category Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
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
    const selectedItems = this.stores.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.storageS.deleteStorageById(item.id).subscribe({
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
    this.stores = this.stores.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.stores.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllStorage();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllStorage();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllStorage();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  // select checkbox
  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.stores.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.stores.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.stores.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.stores.filter(item => item.checked).length;
  }

  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }


}

