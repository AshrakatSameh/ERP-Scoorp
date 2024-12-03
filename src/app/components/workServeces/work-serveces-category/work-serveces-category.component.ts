import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ServiceCategoryService } from 'src/app/services/getAllServices/ServiceCategory/service-category.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-work-serveces-category',
  templateUrl: './work-serveces-category.component.html',
  styleUrls: ['./work-serveces-category.component.css']
})
export class WorkServecesCategoryComponent implements OnInit {
  apiUrl = environment.apiUrl;
  serviceCategoryForm: FormGroup;

  constructor(private serCategory: ServiceCategoryService, private fb: FormBuilder, private http: HttpClient,
    private toast: ToastrService
  ) {
    this.serviceCategoryForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description: [''],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.getAllServiceCategories();
  }

  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllServiceCategories();
    }
  }
  categories: any[] = [];
  getAllServiceCategories() {
    this.serCategory.getServiceCategoriesPaging(this.pageNumber,this.pageSize).subscribe(
      (response) => {
        this.categories = response.categories; // Assign the fetched Warehouses
        this.filteredServiceCategory= this.categories;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
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
   return this.serviceCategoryForm.get('attachments') as FormArray;
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
       file: [file]  // Store the file in the form group
       // name: file.name,
       // size: file.size,
       // type: file.type,
       // lastModified: file.lastModified,
       // file: file, 
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

    // Append simple fields like 'name' and 'description'
    formData.append('name', this.serviceCategoryForm.get('name')?.value || '');
    formData.append('localName', this.serviceCategoryForm.get('localName')?.value || '');
    formData.append('description', this.serviceCategoryForm.get('description')?.value || '');


    // Append each attachment file
    this.attachments.controls.forEach((control) => {
      const file = control.value;
      if (file) {
        formData.append('AttachmentFiles', file); // Append each file under 'AttachmentFiles'
      }
    });

    // Log the FormData contents for debugging (optional, FormData doesn't stringify easily, so we won't see the contents directly)
    console.log('FormData:', formData);

    // Set headers with tenant information
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });

    // POST request with FormData
    this.http.post(this.apiUrl + 'WorkServiceCategory', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تمت الإضافة بنجاح');
          this.getAllServiceCategories();
          this.serviceCategoryForm.reset();
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
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
          console.error('Error:', error);
          console.log(this.serviceCategoryForm.value);
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
      this.serviceCategoryForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        description: this.selectedCategory.description
      });

      this.isModalOpen = true;
    } else {
      alert('Please select a type to update.');
    }
  }

  closeModal() {
    this.serviceCategoryForm.reset();
    this.isModalOpen = false;
  }

  updateCategory() {
    if (this.serviceCategoryForm.valid) {
      const updatedCategory = { ...this.serviceCategoryForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.serCategory.updateServiceCategory(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Service category updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllServiceCategories();
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating category :', error);
          console.log('Updated category  Data:', updatedCategory);
          // alert('An error occurred while updating the item category .');
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
    const selectedItems = this.filteredServiceCategory.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.serCategory.deleteServiceCategoryById(item.id).subscribe({
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
    this.filteredServiceCategory = this.filteredServiceCategory.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredServiceCategory.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllServiceCategories();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllServiceCategories();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllServiceCategories();
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

  // edit and delete toggle
  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }


  // Method to fetch and display data based on search condition
  // Filter data based on search term
  filteredServiceCategory: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  getServiceCatrWithoutPaging() {
    this.serCategory.getServiceCategories().subscribe(response => {
      this.categories = response.categories;
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
      this.getServiceCatrWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllServiceCategories();
    }
  }
  // Method to trigger search when the user types or submits the search query
  onSearchInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.getAllServiceCategories();
  }

  // Method to apply search filter on the full data
  applySearchFilter() {
    if (this.searchQuery.trim()) {
      // Filter the data based on the search query
      this.filteredServiceCategory = this.categories.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        // (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredServiceCategory = this.categories;
    }
  }

}
