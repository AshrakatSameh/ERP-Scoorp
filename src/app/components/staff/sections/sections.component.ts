import { HttpClient, HttpHeaders } from '@angular/common/http';  // Import HttpClient
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from 'src/app/services/getAllServices/Department/department.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.css']
})
export class SectionsComponent {

  deps: any[] = [];
  depForm: FormGroup;
  isModalOpen = false;
  selectedDep: any = null;
  isDropdownOpen: boolean = false;

  pageNumber: number = 1;
  pageSize: number = 10;

  apiUrl = `${environment.apiUrl}Departments/CreateDepartment`;

  constructor(
    private departmentService: DepartmentService,
    private fb: FormBuilder,
    private http: HttpClient ,
    private toast: ToastrService ,private cdr: ChangeDetectorRef
  ) {
    this.depForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.getAllDeps();
  }

  // select checkbox
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  // Set each item's checked status to match selectAll
  this.deps.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.deps.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.deps.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.deps.filter(item => item.checked).length;
}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
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
      this.depForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        description: this.selectedCategory.description,
      });

      this.isModalOpen = true;
    } else {
      alert('ألأرجاء تحديد العنصر');
    }
  }

  closeModal() {
    this.depForm.reset();
    this.isModalOpen = false;
    this.selectedCategory =null;
  }



 

  updateCategory() {
      const updatedCategory = { ...this.depForm.value, id: this.selectedCategory.id };
      const nameControl = this.depForm.get('name');
  
      if (!nameControl || nameControl.invalid) {
        console.log('Form is invalid because the name field is invalid.');
        console.log('Name field errors:', nameControl?.errors);
        this.depForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      // Call the update service method using the category's id
      this.departmentService.updateDepartment(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Unit category updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.deps.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.deps[index] = updatedCategory;
          }

          this.getAllDeps();
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
      this.departmentService.deleteDepartment(item.id).subscribe({
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
    this.getAllDeps();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllDeps();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllDeps();
      this.closeConfirmationModal();
      if (this.filteredDeps.length === 0 && this.pageNumber > 1) {
        // Move to the previous page if the current page is empty
        this.pageNumber -= 1;  // Adjust the page number to the previous one
        this.changePage(this.pageNumber)
        this.getAllDeps(); 
      } else {
        this.getAllDeps();
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
  
  



  getAllDeps() {
    this.departmentService.getAllDepartmentsPaging(this.pageNumber, this.pageSize).subscribe(response => {
      this.deps = response.data;
      this.filteredDeps= this.deps;
      this.totalCount = response.totalCount; // Assuming response contains totalCount
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      console.log(this.deps);
    }, error => {
      console.error('Error fetching Dep data:', error);
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
      this.getAllDeps();
    }
  }


  @ViewChild('myModal', { static: false }) modal!: ElementRef;
  ngAfterViewInit(): void {
    this.modal.nativeElement.addEventListener('hidden.bs.modal', () => {
      // Fallback cleanup in case Bootstrap doesn't properly clean up
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    });
  }
  onSubmitAdd() {
    const nameControl = this.depForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.depForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();
    formData.append('name', this.depForm.get('name')?.value);
    formData.append('localName', this.depForm.get('localName')?.value);
    formData.append('description', this.depForm.get('description')?.value);

    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });

    this.http.post(this.apiUrl, formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تمت الإضافة بنجاح');
         
          this.getAllDeps();
          // Close the modal programmatically
          const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
          if (modalInstance) {
            modalInstance.hide();
          }
          // Ensure proper cleanup after modal closure
          setTimeout(() => {
            document.body.classList.remove('modal-open');
            
            document.body.style.overflow = '';
          }, 300);          this.getAllDeps();
          this.depForm.reset();
        },
        (error: any) => {
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
  }


   // Filter data based on search term
   filteredDeps: any[] = [];   // Holds the filtered results (used for search)
   searchQuery: string = '';          // Holds the search query
   totalRecords: number = 0;
   offers: any[] = [];
   getDepsWithoutPaging() {
     this.departmentService.getAllDepartments().subscribe(response => {
       this.deps = response.data;
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
       this.getDepsWithoutPaging();
     } else {
       // If no search query, fetch paginated data
       this.getAllDeps();
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
       this.filteredDeps = this.deps.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase())) 

       )
 
     } else {
       // If no search query, reset to show all fetched data
       this.filteredDeps = this.deps;
     }
   }
}
