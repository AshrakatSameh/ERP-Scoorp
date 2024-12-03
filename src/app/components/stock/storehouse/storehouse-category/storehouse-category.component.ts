import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { WarehouseCatService } from 'src/app/services/getAllServices/WarehouseCategories/warehouse-cat.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-storehouse-category',
  templateUrl: './storehouse-category.component.html',
  styleUrls: ['./storehouse-category.component.css']
})
export class StorehouseCategoryComponent implements OnInit {

  apiUrl = `${environment.apiUrl}WarehouseCategories/CreateCategory`
imgApiUrl= environment.imgApiUrl;
  public wares: any[] = [];
  pageNumber: number = 1;
  pageSize: number = 10;

  CatForm: FormGroup;

  constructor(private warehaouseService: WarehouseCatService, private fb: FormBuilder, private http: HttpClient,
    private toast: ToastrService, private renderer: Renderer2,     private cdr: ChangeDetectorRef

  ) {

    this.CatForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description: [''],
      parentCategory: [''],
      
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }

  ngOnInit(): void {
    this.getAllWaresCat()
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
    this.wares.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.wares.length : 0;
  }
  
  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.wares.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.wares.filter(item => item.checked).length;
  }

  getAllWaresCat() {
    this.warehaouseService.getWarehouseCategories(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.wares = data.data;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        console.log(this.wares);
      }, error => {
        console.error('Error fetching tenant data:', error);
      });
  }

// handle array of attachments
fileNames: string[] = []; // Array to store file names

get attachments(): FormArray {
  return this.CatForm.get('attachments') as FormArray;
}

  // Method to handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

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
  isCategoryNameUnique(name: string): boolean {
    return !this.wares.some((category) => category.name === name);
  }
  // onSubmit() {
  //   const formData = new FormData();
  //   const name = this.CatForm.get('name')!.value;
  //   const localName = this.CatForm.get('localName')!.value;
  //   const description = this.CatForm.get('description')!.value;
  //   const parentCategory = this.CatForm.get('parentCategory')!.value;


  //   if (name) {
  //     formData.append('name', name);
  //     formData.append('localName', localName);
  //     formData.append('description', description);
  //     formData.append('parentCategory', parentCategory);
  //     this.attachments.controls.forEach((control) => {
  //       const file = control.value;  // Get the file from the FormControl
  //       if (file) {
  //         formData.append('AttachmentFiles', file, file.name); // Append the file with its name
  //       }
  //     });



  //   } else {
  //     console.error('One or more form fields are null');
  //     return;
  //   }

  //   const tenantId = localStorage.getItem('tenant');
  //   const headers = new HttpHeaders({
  //     tenant: tenantId || '', // Set tenantId header if available
  //     'Content-Type': 'application/json',
  //   });
  //   const url = `${this.apiUrl}?Name=${encodeURIComponent(name)}&LocalName=${encodeURIComponent(localName)}&description=${encodeURIComponent(description)}&parentCategory=${encodeURIComponent(parentCategory)}}`;
  //   this.http.post<any>(url, formData, { headers }).subscribe(
  //     (response) => {
  //       // alert('Done');
  //       console.log('Category created successfully:', response);
  //       // Reset form after successful submission
  //       this.toast.success('تم الإضافة بنجاح');
  //       this.getAllWaresCat();
  //       this.CatForm.reset({
  //         name: [''],
  //         localName: [''],
  //         description: [''],
  //         parentCategory: [''],
  //       });
  //       const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
  //       if (modalInstance) {
  //         modalInstance.hide();
  //       }
  //       // Ensure proper cleanup after modal closure
  //       setTimeout(() => {
  //         document.body.classList.remove('modal-open');
          
  //         document.body.style.overflow = '';
  //       }, 300);
  //     },
  //     (error) => {
  //       console.error('Error creating Category:', error.error);
  //       const errorMessage = error.error?.message || 'An unexpected error occurred.';
  //       this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى")

  //       // Handle error
  //     }
  //   );
  // }
  onSubmit() {
    const nameControl = this.CatForm.get('name');

  // Mark all fields as touched to trigger validation messages
  if (!nameControl || nameControl.invalid) {
    console.log('Form is invalid because the name field is invalid.');
    console.log('Name field errors:', nameControl?.errors);
    this.CatForm.markAllAsTouched(); // Mark all fields as touched
    this.cdr.detectChanges(); // Trigger change detection if necessary
    return; // Stop submission if the name field is invalid
  }

  const name = this.CatForm.get('name')!.value;

  // Check if the category name is unique before proceeding
  if (!this.isCategoryNameUnique(name)) {
    // Set form error if name is not unique
    this.CatForm.get('name')?.setErrors({ nameNotUnique: true });
    return; // Prevent form submission
  }


    // Proceed with the form submission (if name is unique)
    const formData = new FormData();
    const localName = this.CatForm.get('localName')!.value;
    const description = this.CatForm.get('description')!.value;
    const parentCategory = this.CatForm.get('parentCategory')!.value;

    formData.append('name', name);
    formData.append('localName', localName);
    formData.append('description', description);
    formData.append('parentCategory', parentCategory);

    // Add attachments (if any)
    this.attachments.controls.forEach((control) => {
      const file = control.value;
      if (file) {
        formData.append('AttachmentFiles', file, file.name);
      }
    });

    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '',
    });

    this.http.post<any>(this.apiUrl, formData, { headers }).subscribe(
      (response) => {
        console.log('Category created successfully:', response);
        this.toast.success('تم الإضافة بنجاح');
        this.getAllWaresCat(); // Refresh the category list
        this.CatForm.reset(); // Reset form
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        modalInstance?.hide(); // Hide modal
      },
      (error) => {
        console.error('Error creating Category:', error.error);
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
      }
    );
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
      this.getAllWaresCat();
    }
  }

  // Update
  storesSec:any[] =[];
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
    this.CatForm.patchValue({
      name: this.selectedCategory.name,
      localName: this.selectedCategory.localName,
      note: this.selectedCategory.note,
      code: this.selectedCategory.code,
    });

    this.isModalOpen = true;
  } else {
    alert('Please select a category to update.');
  }
}

closeModal() {
  this.isModalOpen = false;
}

isCategoryNameUniqueUpdate(name: string, excludeId: number | null): boolean {
  // Check if the name already exists in the list of categories, excluding the current category
  return !this.wares.some(
    (category) => category.name === name && category.id !== excludeId
  );
}
updateCategory() {
  const name = this.CatForm.get('name')!.value;

  // Check if the category name is unique (exclude current category from check)
  if (!this.isCategoryNameUniqueUpdate(name, this.selectedCategory?.id)) {
    // Set form error if name is not unique
    this.CatForm.get('name')?.setErrors({ nameNotUnique: true });
    return; // Prevent form submission
  }

  // Proceed with the form submission (if name is unique)
  const updatedCategory = { ...this.CatForm.value, id: this.selectedCategory.id };

  // Call the update service method using the category's id
  this.warehaouseService.updateWareCat(this.selectedCategory.id, updatedCategory).subscribe(
    (response) => {
      console.log('Category updated successfully:', response);
      this.toast.success('تم تحديث البيانات بنجاح');

      // Update the local categories array if necessary
      const index = this.wares.findIndex((cat) => cat.id === updatedCategory.id);
      if (index !== -1) {
        this.wares[index] = updatedCategory;
      }

      this.getAllWaresCat(); // Refresh the category list
      this.closeModal();  // Close the modal after successful update
    },
    (error) => {
      console.error('Error updating category:', error);
      console.log('Updated Category Data:', updatedCategory);
      this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
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
  const selectedItems = this.wares.filter(item => item.checked);

  if (selectedItems.length === 0) {
    this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
    return;
  }

  const successfulDeletions: number[] = [];
  const failedDeletions: { id: number; error: any }[] = [];

  selectedItems.forEach((item, index) => {
    this.warehaouseService.deleteWareCatById(item.id).subscribe({
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
  this.wares = this.wares.filter(item => !successfulDeletions.includes(item.id));

  // Update selected count
  this.selectedCount = this.wares.filter(item => item.checked).length;

  // Log results
  console.log('Deleted successfully:', successfulDeletions);
  console.log('Failed to delete:', failedDeletions);

  // Refresh the table or data if needed
  this.getAllWaresCat();

  // Show final message
  if (failedDeletions.length > 0) {
    this.toast.warning(
      `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,
    
    );
    this.getAllWaresCat();
    this.closeConfirmationModal();
  } else {
    this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
    this.getAllWaresCat();
    this.closeConfirmationModal();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}


}