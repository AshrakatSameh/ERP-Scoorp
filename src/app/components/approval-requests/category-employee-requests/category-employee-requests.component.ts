import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EmpRequestCategService } from 'src/app/services/getAllServices/EmployeeRequestCategory/emp-request-categ.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-category-employee-requests',
  templateUrl: './category-employee-requests.component.html',
  styleUrls: ['./category-employee-requests.component.css']
})
export class CategoryEmployeeRequestsComponent implements OnInit {

  EmpReqCategoryForm: FormGroup;
  apiUrl = environment.apiUrl;
  constructor(private empReqService: EmpRequestCategService, private fb: FormBuilder, private http: HttpClient,
    private toast: ToastrService, private renderer: Renderer2, private cdr: ChangeDetectorRef

  ) {
    this.EmpReqCategoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [' '],
      // attachments: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.getAllEmpRequestCategories();
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
      this.getAllEmpRequestCategories();
    }
  }
  categories: any[] = [];
  getAllEmpRequestCategories() {
    this.empReqService.getEmployeeReqCategoryPaging(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.categories = response.categories; // Assign the fetched Warehouses
        this.filteredEmpRequestCategory= this.categories;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        console.log('categories :', this.categories);
        this.applySearchFilter();
      },
      (error) => {
        console.error('Error fetching categories section:', error); // Handle errors
      }
    );
  }
 // handle array of attachments
 fileNames: string[] = []; // Array to store file names

 get attachments(): FormArray {
   return this.EmpReqCategoryForm.get('attachments') as FormArray;
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
    const nameControl = this.EmpReqCategoryForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.EmpReqCategoryForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();

    // Append simple fields like 'name' and 'description'
    formData.append('name', this.EmpReqCategoryForm.get('name')?.value || '');
    formData.append('description', this.EmpReqCategoryForm.get('description')?.value || '');


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
    this.http.post(this.apiUrl + 'EmployeeRequestCategories', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تم الإضافة بنجاح');
          this.getAllEmpRequestCategories();
          this.EmpReqCategoryForm.reset({
            name: [''],
            description: [' '],
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
          this.attachments.clear();
        },
        (error: any) => {
          console.error('Error:', error);
          console.log(this.EmpReqCategoryForm.value);
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى'); 

        }
      );
  }

  // Update
  isModalOpen = false;
  selectedCategory: any = null;
  storesSec: any[] = [];
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
      this.EmpReqCategoryForm.patchValue({
        name: this.selectedCategory.name,
        description: this.selectedCategory.description
      });

      this.isModalOpen = true;
    } else {
      alert('Please select a type to update.');
    }
  }

  closeModal() {
    this.EmpReqCategoryForm.reset();
    this.isModalOpen = false;
  }

  updateCategory() {
    if (this.EmpReqCategoryForm.valid) {
      const updatedCategory = { ...this.EmpReqCategoryForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.empReqService.updateEmployeeReqCategory(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Employee request category updated successfully:', response);
          this.toast.success('تم تجديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllEmpRequestCategories();
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating category :', error);
          console.log('Updated category  Data:', updatedCategory);
          // alert('An error occurred while updating the item category .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى'); 
        }
      );
    }
  }

  // select checkbox

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.categories.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.categories.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.categories.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.categories.filter(item => item.checked).length;
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

  deleteItemType() {
    const selectedItems = this.filteredEmpRequestCategory.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.empReqService.deleteEmpReqCategoryById(item.id).subscribe({
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
    this.filteredEmpRequestCategory = this.filteredEmpRequestCategory.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredEmpRequestCategory.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllEmpRequestCategories();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllEmpRequestCategories();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllEmpRequestCategories();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }



  // Method to fetch and display data based on search condition
  // Filter data based on search term
  filteredEmpRequestCategory: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  getCatWithoutPaging() {
    this.empReqService.getEmployeeReqCategory().subscribe(response => {
      this.categories = response.categories; // Assign the fetched Warehouses
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
      this.getCatWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllEmpRequestCategories();
    }
  }
  // Method to trigger search when the user types or submits the search query
  onSearchInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.getAllEmpRequestCategories();
  }

  // Method to apply search filter on the full data
  applySearchFilter() {
    if (this.searchQuery.trim()) {
      // Filter the data based on the search query
      this.filteredEmpRequestCategory = this.categories.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        // (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredEmpRequestCategory = this.categories;
    }
  }

}
