import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ItemcategoryService } from 'src/app/services/getAllServices/itemcategory/itemcategory.service';
import { ItemTypeService } from 'src/app/services/getAllServices/itemType/item-type.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-type-category',
  templateUrl: './type-category.component.html',
  styleUrls: ['./type-category.component.css']
})
export class TypeCategoryComponent {
  storesSec:any[] =[];
  TypeCatForm : FormGroup;

  apiUrl= environment.apiUrl;
  imgApiUrl= environment.imgApiUrl;

  constructor(private itemCatServices: ItemcategoryService , private fb: FormBuilder,
    private toast: ToastrService, private http: HttpClient,private renderer: Renderer2,
    private cdr: ChangeDetectorRef

  ){
    this.TypeCatForm= this.fb.group({
      name:['', Validators.required],
      localName:['', Validators.required],
      note:['',Validators.required],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })

  }

  ngOnInit(): void {
    this.getAllItemCat();
    
    
}



getAllItemCat(){
  this.itemCatServices.getitemCat(this.pageNumber, this.pageSize).subscribe(
    (response) => {
      this.storesSec = response.categories; // Assign the fetched Warehouses
      this.filteredItemCat = this.storesSec;
      this.totalCount = response.totalCount; // Assuming response contains totalCount
      this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
      console.log('item cat :', this.storesSec);
    },
    (error) => {
      console.error('Error fetching item cat section:', error); // Handle errors
    }
  );
}


 // handle array of attachments
 fileNames: string[] = []; // Array to store file names

 get attachments(): FormArray {
   return this.TypeCatForm.get('attachments') as FormArray;
 }

 // Method to handle file selection
 onFileSelected(event: Event): void {
   const input = event.target as HTMLInputElement;
   if (input.files && input.files.length > 0) {
     const file = input.files[0];
     const fileData = {
       name: file.name,
       size: file.size,
       type: file.type,
       lastModified: file.lastModified,
       file: file, // Store the actual file object if needed for upload
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
  const nameControl = this.TypeCatForm.get('name');

  if (!nameControl || nameControl.invalid) {
    console.log('Form is invalid because the name field is invalid.');
    console.log('Name field errors:', nameControl?.errors);
    this.TypeCatForm.markAllAsTouched();
    this.cdr.detectChanges();
    return; // Stop submission if the name field is invalid
  }
  const formData = new FormData();

  // Append form fields
  formData.append('name', this.TypeCatForm.get('name')?.value || '');
  formData.append('localName', this.TypeCatForm.get('localName')?.value || '');
  formData.append('note', this.TypeCatForm.get('note')?.value || '');

  // Append each attachment file
  this.attachments.controls.forEach((control) => {
    const file = control.value;
    if (file) {
      formData.append('AttachmentFiles', file, file.name);
    }
  });

  console.log('FormData contents:');
  formData.forEach((value, key) => {
    console.log(key, value);
  });

  const headers = new HttpHeaders({
    'tenant': localStorage.getItem('tenant') || ''
  });

  this.http.post(this.apiUrl + 'StoresSection/item-category?', formData, { headers })
    .subscribe(
      (response: any) => {
        console.log('Response:', response);
        this.toast.success('تمت الإضافة بنجاح');
        this.getAllItemCat();
        this.TypeCatForm.reset({
          name:[''],
          localName:[''],
          note:[''],
        });
        this.attachments.clear(); // Clear attachments
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
      },
      (error: any) => {
        console.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى', error);
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
    this.TypeCatForm.patchValue({
      name: this.selectedCategory.name,
      localName: this.selectedCategory.localName,
      note: this.selectedCategory.note,
    });

    this.isModalOpen = true;
  } else {
    alert('Please select a type category to update.');
  }
}

closeModal() {
  this.isModalOpen = false;
  this.TypeCatForm.reset();
}

updateCategory() {
    const updatedCategory = { ...this.TypeCatForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.itemCatServices.updateItemCat(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Category updated successfully:', response);
        this.toast.success('تم تحديث البيانات بنجاح')
        // Update the local categories array if necessary
        const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.storesSec[index] = updatedCategory;
        }

        this.getAllItemCat();
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

  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
deleteItemType(){
  const selectedItems = this.filteredItemCat.filter(item => item.checked);

  if (selectedItems.length === 0) {
    this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
    return;
  }

  const successfulDeletions: number[] = [];
  const failedDeletions: { id: number; error: any }[] = [];

  selectedItems.forEach((item, index) => {
    this.itemCatServices.deleteItemTypeById(item.id).subscribe({
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
  this.filteredItemCat = this.filteredItemCat.filter(item => !successfulDeletions.includes(item.id));

  // Update selected count
  this.selectedCount = this.filteredItemCat.filter(item => item.checked).length;

  // Log results
  console.log('Deleted successfully:', successfulDeletions);
  console.log('Failed to delete:', failedDeletions);

  // Refresh the table or data if needed
  this.getAllItemCat();

  // Show final message
  if (failedDeletions.length > 0) {
    this.toast.warning(
      `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,
    
    );
    this.getAllItemCat();
    this.closeConfirmationModal();
  } else {
    this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
    this.getAllItemCat();
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
    this.getAllItemCat();
  }
}

  // Filter data based on search term
  filteredItemCat: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getItemCatWithoutPaging() {
    this.itemCatServices.getAllitemCat().subscribe(response => {
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
      this.getItemCatWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllItemCat();
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
      this.filteredItemCat = this.storesSec.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )
  
    } else {
      // If no search query, reset to show all fetched data
      this.filteredItemCat = this.storesSec;
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
toggleDropdownCol() {
  this.showDropdownCol = !this.showDropdownCol; // Toggle the dropdown visibility
  console.log('Dropdown visibility:', this.showDropdownCol); // Check if it’s toggling
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
}
