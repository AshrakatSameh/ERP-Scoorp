import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ContractTypeService } from 'src/app/services/getAllServices/ContractType/contract-type.service';

@Component({
  selector: 'app-type-of-contracts',
  templateUrl: './type-of-contracts.component.html',
  styleUrls: ['./type-of-contracts.component.css']
})
export class TypeOfContractsComponent {
  contractTypeForm:FormGroup;
  pageNumber: number = 1;
  pageSize: number = 10;
contractTypes:any[]=[];
  constructor(private http: HttpClient, private fb:FormBuilder,private contractService:ContractTypeService,
    private toast: ToastrService, private renderer:Renderer2
  ){
    this.contractTypeForm= this.fb.group({
      name:['', Validators.required],
      localName:['', Validators.required],
      description:['', Validators.required],
      //colorId:['',Validators.required]
    });
    this.getAllContractTypes();
  }

  getAllContractTypes(){
    this.contractService.getAllContractTypes(this.pageNumber, this.pageSize)
        .subscribe(data => {
          this.contractTypes = data.data;
          this.filteredTypeContracts= this.contractTypes;
          this.totalCount = data.totalCount; // Assuming response contains totalCount
          this.totalPages = Math.ceil(this.totalCount / this.pageSize); 
          // console.log(this.try)
        }, error => {
          console.error('Error fetching contracts data:', error);
        });
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
     
      // Call the service to post the data
      const formData = this.contractTypeForm.value; // Get the form data
      this.contractService.createContractType(formData).subscribe(
        response => {
          console.log('contract type created successfully!', response);
          // alert('contract type created successfully!')
          this.toast.success('تمت الإضافة بنجاح');
          this.getAllContractTypes();
          const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
          if (modalInstance) {
            modalInstance.hide();
          }
          // Ensure proper cleanup after modal closure
          setTimeout(() => {
            document.body.classList.remove('modal-open');
            
            document.body.style.overflow = '';
          }, 300);
          this.contractTypeForm.reset();
          // Handle success, show notification, etc.
        },
        error => {
          console.error('Error creating contract type:', error);
          console.log(formData)
          // Handle error, show notification, etc.
        }
      );
  
  }
  totalCount: number = 0; // Total count of items from the API
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllContractTypes();
    }
  }

  isFirstButtonClicked = false;
  isSecondButtonClicked = false;

  istableview = true;
  iscardsview=false;

  toggleFirstButtonClick() {
    this.isFirstButtonClicked = true;
  this.isSecondButtonClicked = false;
  this.toggleCardsonClick()
  }

  toggleSecondButtonClick() {
    this.isSecondButtonClicked = true;
  this.isFirstButtonClicked = false;
  this.toggleTableonClick();
  }

  toggleTableonClick(){
    this.istableview = true;  // Set table view to true
    this.iscardsview = false; // Set cards view to false
  }

  toggleCardsonClick(){
    this.istableview = false;
    this.iscardsview = true;
  }

  isDropdownOpen = false;
  isRowRemoved = false;

  openDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.removeRow();
    }
  }

  removeRow() {
    this.isRowRemoved = true;
  }

  isDropdownOpen2: boolean = false;
  private documentClickListener: any; // Listener reference for cleanup

  toggleDropdownOptions(): void {
    this.isDropdownOpen2 = !this.isDropdownOpen2;

    // Add document click listener when the dropdown is open
    if (this.isDropdownOpen2) {
      this.documentClickListener = this.renderer.listen('document', 'click', (event: Event) => {
        const targetElement = event.target as HTMLElement;
        const clickedInsideDropdown = targetElement.closest('.dropdown'); // Check if click is inside dropdown
        if (!clickedInsideDropdown) {
          this.isDropdownOpen2 = false; // Close the dropdown
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
  this.contractTypes.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.contractTypes.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.contractTypes.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.contractTypes.filter(item => item.checked).length;
}
  // Filter data based on search term
  filteredTypeContracts: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getContractsTypeWithoutPaging() {
    this.contractService.getAllContractTypesNoPaging().subscribe(response => {
      this.contractTypes = response.data;
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
      this.getContractsTypeWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllContractTypes();
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
      this.filteredTypeContracts = this.contractTypes.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )
  
    } else {
      // If no search query, reset to show all fetched data
      this.filteredTypeContracts = this.contractTypes;
    }
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
      this.contractTypeForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        description: this.selectedCategory.description,
      });

      this.isModalOpen = true;
    } else {
      alert("الرجاء تحديد عنصر");
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.contractTypeForm.reset();
  }

  updateCategory() {
    if (this.contractTypeForm.valid) {
      const updatedCategory = { ...this.contractTypeForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.contractService.updateContract(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Unit category updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.contractTypes.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.contractTypes[index] = updatedCategory;
          }

          this.getAllContractTypes();
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

  deleteItemType(){
    const selectedItems = this.filteredTypeContracts.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.contractService.deleteContractTypeById(item.id).subscribe({
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
    this.filteredTypeContracts = this.filteredTypeContracts.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredTypeContracts.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllContractTypes();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllContractTypes();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllContractTypes();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
  
  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
}
