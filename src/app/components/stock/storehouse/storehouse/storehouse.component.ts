import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { WarehouseService } from 'src/app/services/getAllServices/Warehouse/warehouse.service';
import { WarehouseCatService } from 'src/app/services/getAllServices/WarehouseCategories/warehouse-cat.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-storehouse',
  templateUrl: './storehouse.component.html',
  styleUrls: ['./storehouse.component.css']
})
export class StorehouseComponent implements OnInit {

  apiUrl = `${environment.apiUrl}Warehouses/CreateWarehouse`
imgApiUrl= environment.imgApiUrl;

  public storehouse: any[] = [];
  itemCategory: any[] = [];


  storeHouseForm: FormGroup;

  constructor(private storeHouseService: WarehouseService, private fb: FormBuilder,private renderer:Renderer2,
    private http: HttpClient, private warehouseCat: WarehouseCatService, private toast: ToastrService,
    private cdr: ChangeDetectorRef
  ) {

    this.storeHouseForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description: [''],
      warehouseCategoryId: ['', Validators.required],
      
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.getAllWareHouses();
    this.getAllWareHousesCat();
  }


  getAllWareHouses() {
    this.storeHouseService.getWarehouses(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.storehouse = data.data;
        this.filteredWarehouses=this.storehouse;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        console.log(this.storehouse);
      }, error => {
        console.error('Error fetching tenant storehouse:', error);
      });
  }

  getAllWareHousesCat() {
    this.warehouseCat.getWarehouseCategories(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.itemCategory = data.data;
        console.log(this.itemCategory);
      }, error => {
        console.error('Error fetching tenant storehouse:', error);
      });
  }


// handle array of attachments
fileNames: string[] = []; // Array to store file names

get attachments(): FormArray {
  return this.storeHouseForm.get('attachments') as FormArray;
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
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];

    // Push the file object directly to the FormArray
    this.attachments.push(this.fb.control(file));

    // Clear the file input after selection
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
  onSubmit() {
    const nameControl = this.storeHouseForm.get('name');

    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.storeHouseForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();
    const name = this.storeHouseForm.get('name')?.value || '';
    const localName = this.storeHouseForm.get('localName')?.value || '';
    const description = this.storeHouseForm.get('description')?.value || '';
    const warehouseCategoryId = this.storeHouseForm.get('warehouseCategoryId')?.value || '';
  
    // Append form fields
    formData.append('name', name);
    formData.append('localName', localName);
    formData.append('description', description);
    formData.append('warehouseCategoryId', warehouseCategoryId);
  
    // Append files
    this.attachments.controls.forEach((control) => {
      const file = control.value; // Directly access the file object
      if (file) {
        formData.append('AttachmentFiles', file, file.name); // Append file with its name
      }
    });
  
    // Headers setup with tenant ID
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Accept': 'application/json',
    });
  
    // Make the API request
    this.http.post<any>(this.apiUrl, formData, { headers }).subscribe(
      (response) => {
        console.log('Warehouse created successfully:', response);
        this.toast.success('تمت الإضافة بنجاح');
  
        // Close modal and reset form
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
  
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
        }, 300);
  
        this.getAllWareHouses();
        this.storeHouseForm.reset({
          name: '',
          localName: '',
          description: '',
          warehouseCategoryId: '',
        });
  
        // Clear attachments
        this.attachments.clear();
      },
      (error: HttpErrorResponse) => {
        console.error('Error creating warehouse:', error.error);
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      }
    );
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
      this.getAllWareHouses();
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

  // Update warehouse

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
      this.storeHouseForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        description: this.selectedCategory.clientId,
        warehouseCategoryId: this.selectedCategory.assignedToId
      });

      this.isModalOpen = true;
    } else {
      alert('Please select a category to update.');
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  updateCategory() {
    if (this.storeHouseForm.valid) {
      const updatedCategory = { ...this.storeHouseForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.storeHouseService.updateWarehouse(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Warehouse updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllWareHouses();
          this.closeModal();  // Close the modal after successful update
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating warehouse:', error);
          console.log('Updated warehouse Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
        }
      );
    }else{
      this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى")
    }
  }

  showConfirmationModal = false;

  openConfirmationModal() {
    if(this.selectedCategory== null){
      alert('الرجاء تحديد العنصر');

    }else
    
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  deleteItemType() {
    const selectedItems = this.storehouse.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }
  
    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];
  
    selectedItems.forEach((item, index) => {
      this.storeHouseService.deleteWarehouseById(item.id).subscribe({
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
    this.storehouse = this.storehouse.filter(item => !successfulDeletions.includes(item.id));
  
    // Update selected count
    this.selectedCount = this.storehouse.filter(item => item.checked).length;
  
    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);
  
    // Refresh the table or data if needed
    this.getAllWareHouses();
  
    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,
      
      );
      this.getAllWareHouses();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllWareHouses();
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
    this.storehouse.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.storehouse.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.storehouse.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.storehouse.filter(item => item.checked).length;
  }


    // Filter data based on search term
filteredWarehouses: any[] = [];   // Holds the filtered results (used for search)
searchQuery: string = '';          // Holds the search query
totalRecords: number = 0;
offers: any[] = [];
getWarehousesWithoutPaging() {
  this.storeHouseService.getAllWarehouses().subscribe(response => {
    this.storesSec = response.data;
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
    this.getWarehousesWithoutPaging();
  } else {
    // If no search query, fetch paginated data
    this.getAllWareHouses();
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
    this.filteredWarehouses = this.storehouse.filter(item =>
      (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.note && item.note.toLowerCase().includes(this.searchQuery.toLowerCase()))
    )

  } else {
    // If no search query, reset to show all fetched data
    this.filteredWarehouses = this.storehouse;
  }
}
}
