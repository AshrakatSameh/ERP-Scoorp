import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { StoresSectionService } from 'src/app/services/getAllServices/StoresSection/stores-section.service';
import { UnitService } from 'src/app/services/getAllServices/unit/unit.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.css']
})
export class UnitComponent {

  storesSec: any[] = [];
  unitForm: FormGroup;

  apiUrl = environment.apiUrl;
  imgApiUrl = environment.imgApiUrl;

  constructor(private unitService: UnitService, private fb: FormBuilder, private toast: ToastrService,
    private unitCat: StoresSectionService, private http: HttpClient, private renderer: Renderer2,
  ) {
    this.unitForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      note: [''],
      UnitCategoryId: [''],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([]),
      unitCategory: ['']
    })

  }

  ngOnInit(): void {

    this.getAllUnit();
    this.getAllUnitCategory();

  }

  getAllUnit() {
    this.unitService.getAllUnitsWithPaging(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.storesSec = response.units; // Assign the fetched Warehouses
        this.filteredUnits = this.storesSec;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        console.log('units :', this.storesSec);
      },
      (error) => {
        console.error('Error fetching units section:', error); // Handle errors
      }
    );
  }

  unitCategories: any[] = [];
  getAllUnitCategory() {
    this.unitCat.getAllUnitCategories().subscribe(
      (response) => {
        this.unitCategories = response.categories; // Assign the fetched Warehouses
        console.log('units :', this.unitCategories);
      },
      (error) => {
        console.error('Error fetching units section:', error); // Handle errors
      }
    );
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.unitForm.get('attachments') as FormArray;
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
              console.log(this.attachments)
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

  onFileChange(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.attachments.at(index).patchValue({ file });
    }
  }

  // Submission modal 
  // @ViewChild('myModal') modal: ElementRef | undefined;
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
    formData.append('name', this.unitForm.get('name')?.value);
    formData.append('localName', this.unitForm.get('localName')?.value);
    formData.append('note', this.unitForm.get('note')?.value);
    formData.append('UnitCategoryId', this.unitForm.get('UnitCategoryId')?.value);
    // Append each attachment file
    console.log(this.attachments)
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

    this.http.post(this.apiUrl + 'StoresSection/unit', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تمت الإضافة بنجاح');

          this.getAllUnit();
          // Close the modal programmatically
          const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
          if (modalInstance) {
            modalInstance.hide();
          }

          // Reset the form

          // Ensure proper cleanup after modal closure
          setTimeout(() => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
          }, 300);
          this.unitForm.reset({
            name: ['', Validators.required],
            localName: ['', Validators.required],
            note: [''],
            UnitCategoryId: [''],
            attachmentFiles: this.fb.array([]),
            attachments: this.fb.array([]),
            unitCategory: ['']
          });
          this.attachments.clear();

        },
        (error: any) => {
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
  }

  buttons = ['المعلومات الشخصية ', 'معلومات المستخدم', 'المرفقات', 'معلومات العمل', 'الاشعارات', 'المبيعات', 'الطلبات و المرفقات', 'الخطط و المهام', 'العهد المستلمه', 'الحساب البنكي']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
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

  selectedUnitCategoryName: any = null; // Declare this to hold the name of the selected unit category

  // Your existing methods and code
  openModalForSelected() {
    if (this.selectedCategory) {
      
      this.unitForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        note: this.selectedCategory.note,
        UnitCategoryId: this.selectedCategory.UnitCategoryId,
        unitCategory: this.selectedCategory.unitCategory,
      });
      this.selectedUnitCategoryName = this.selectedCategory.unitCategory;

      this.attachments.clear();
      if (this.selectedCategory.attachments?.length) {
        this.selectedCategory.attachments.forEach((attachment: any) => {
          const fileData = {
            fileTitle: attachment.fileTitle,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            fileUrl: attachment.fileUrl, // Placeholder for URL after upload
            file: attachment,
          };
          this.attachments.push(this.fb.control(fileData));
          // this.attachments.push(this.fb.group({ file: attachment })); // Existing attachment
          console.log(this.attachments.controls);
        });
      }
      this.isModalOpen = true;
    } else {
      alert('الرجاء تحديد العنصر');
    }
  }


  closeModal() {
    this.unitForm.reset();
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.resetAttachments();  }

  updateCategory() {
    const updatedCategory = { ...this.unitForm.value, id: this.selectedCategory.id };
    console.log(updatedCategory);
  
      // Call the update service method using the category's id
      this.unitService.updateUnit(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Unit updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح');
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }
  
          this.getAllUnit();
          this.closeModal();  // Close the modal after successful update
          this.attachments.clear();
          this.selectedCategory = null;
          this.selectedCount = 0;
        },
        (error) => {
          console.error('Error updating unit :', error);
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
        }
      );
  
  }
  

  showConfirmationModal = false;

  openConfirmationModal() {
    if (this.selectedCategory == null) {
      alert('الرجاء تحديد العنصر');

    } else

      this.showConfirmationModal = true;
  }
  resetAttachments(){
    this.attachments.clear();
  }
  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  deleteItemType() {
    const headers = new HttpHeaders().set('tenant', localStorage.getItem('tenant') || ''); // Replace 'your-tenant-id' with the actual tenant value

    const selectedItems = this.filteredUnits.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.unitService.deleteUnitById(item.id, headers).subscribe({
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
    this.filteredUnits = this.filteredUnits.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredUnits.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllUnit();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllUnit();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllUnit();
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
    this.storesSec.forEach(item => {
      item.checked = this.selectAll;
    });
    if (this.selectAll) {
      // Add all items to the selectedForDelete array and set selectedCount to total items
      this.selectedForDelete = [...this.storesSec];
      this.selectedCount = this.storesSec.length;
      // Select the first item for update if it's empty
      if (!this.selectedCategory && this.storesSec.length > 0) {
        this.selectedCategory = { ...this.storesSec[0] };
      }
    } else {
      // Clear selectedForDelete when unselecting all
      this.selectedForDelete = [];
      this.selectedCount = 0; // Reset selected count
      this.selectedCategory = null; // Clear the selected category for update
    }

  }

  updateSelectAll() {
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
      this.selectAll = false;
      this.getAllUnit();
    }
  }

  // Filter data based on search term
  filteredUnits: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getUnitWithoutPaging() {
    this.unitService.getAllUnits().subscribe(response => {
      this.storesSec = response.units;
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
      this.getUnitWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllUnit();
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
      this.filteredUnits = this.storesSec.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.note && item.note.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredUnits = this.storesSec;
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

  onSelectFocus() {
    if (this.selectedUnitCategoryName === null) {
      this.selectedUnitCategoryName = 'اختر فئة';  // Set default value when focused
    }
  }
  
  onSelectBlur() {
    // Keep the selected category name when blurred if not empty
    if (!this.unitForm.get('UnitCategoryId')?.value) {
      this.selectedUnitCategoryName = 'اختر فئة'; // Reset to default placeholder if no value selected
    }
  }

  selectedUnitCategoryId: number | null = null;  // Store the selected category ID

  onSelectChange() {
    const selectedCategory = this.unitCategories.find(category => category.id === this.selectedUnitCategoryId);
    this.selectedUnitCategoryName = selectedCategory ? selectedCategory.name : null;
  }
}
