import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ServiceDepartmentService } from 'src/app/services/getAllServices/ServiceDepartment/service-department.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-work-serveces-sections',
  templateUrl: './work-serveces-sections.component.html',
  styleUrls: ['./work-serveces-sections.component.css']
})
export class WorkServecesSectionsComponent implements OnInit {

  apiUrl = environment.apiUrl;
  serviceDepForm: FormGroup;
  constructor(private serDep: ServiceDepartmentService, private fb: FormBuilder, private http: HttpClient,
    private toast: ToastrService, private cdr: ChangeDetectorRef
  ) {
    this.serviceDepForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description: [''],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }
  ngOnInit(): void {
    this.getAllServiceDeps();
  }

  deps: any[] = [];
  getAllServiceDeps() {
    this.serDep.getServiceDepartmentPaging(this.pageNumber,this.pageSize).subscribe(
      (response) => {
        this.deps = response.categories; // Assign the fetched Warehouses
        this.filteredServiceDeps= this.deps;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        console.log('deps :', this.deps);
        this.applySearchFilter();
      },
      (error) => {
        console.error('Error fetching departments section:', error); // Handle errors
      }
    );
  }

   // handle array of attachments
   fileNames: string[] = []; // Array to store file names

   get attachments(): FormArray {
     return this.serviceDepForm.get('attachments') as FormArray;
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

   initializeDepForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description: [''],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    });
  }

  onSubmitAdd(): void {
    const nameControl = this.serviceDepForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.serviceDepForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();

    // Append simple fields like 'name' and 'description'
    formData.append('name', this.serviceDepForm.get('name')?.value || '');
    formData.append('localName', this.serviceDepForm.get('localName')?.value || '');
    formData.append('description', this.serviceDepForm.get('description')?.value || '');

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
    this.http.post(this.apiUrl + 'WorkServiceDepartment', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تم الإضافة بنجاح');
          this.getAllServiceDeps();
          this.serviceDepForm = this.initializeDepForm();
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
          console.log(this.serviceDepForm.value);
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
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
      this.serviceDepForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        description: this.selectedCategory.description
      });

      this.isModalOpen = true;
    } else {
      alert('الرجاء تحديد العنصر');
    }
  }

  closeModal() {
    this.serviceDepForm.reset();
    this.isModalOpen = false;
    this.selectedCategory =null;
  }

  updateCategory() {
      const updatedCategory = { ...this.serviceDepForm.value, id: this.selectedCategory.id };
      const nameControl = this.serviceDepForm.get('name');
  
      if (!nameControl || nameControl.invalid) {
        console.log('Form is invalid because the name field is invalid.');
        console.log('Name field errors:', nameControl?.errors);
        this.serviceDepForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      // Call the update service method using the category's id
      this.serDep.updateServiceDep(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Service department updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح');
          this.serviceDepForm = this.initializeDepForm();
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllServiceDeps();
          this.closeModal();  // Close the modal after successful update
          this.selectedCategory = null;
        },
        (error) => {
          console.error('Error updating department :', error);
          console.log('Updated department  Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
        }
      );
    
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
  filteredServiceDeps: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  fetchServiceType() {
    // Check if there's a search query that is not empty
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      // If there's a search query, fetch all data without pagination
      this.getAllServiceDeps();
    } else {
      this.getAllServiceDeps();
    }
  }
  // Method to trigger search when the user types or submits the search query
  onSearchInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.getAllServiceDeps();
  }

  // Method to apply search filter on the full data
  applySearchFilter() {
    if (this.searchQuery.trim()) {
      // Filter the data based on the search query
      this.filteredServiceDeps = this.deps.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        // (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredServiceDeps = this.deps;
    }
  }

  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllServiceDeps();
    }
  }
}
