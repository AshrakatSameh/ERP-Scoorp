import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { data } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from 'src/app/services/getAllServices/Employee/employee.service';
import { ServiceCategoryService } from 'src/app/services/getAllServices/ServiceCategory/service-category.service';
import { ServiceDepartmentService } from 'src/app/services/getAllServices/ServiceDepartment/service-department.service';
import { ServiceRequestService } from 'src/app/services/getAllServices/ServiceRequests/service-request.service';
import { ServiceTypesService } from 'src/app/services/getAllServices/ServiceTypes/service-types.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-work-serveces-reqs',
  templateUrl: './work-serveces-reqs.component.html',
  styleUrls: ['./work-serveces-reqs.component.css']
})
export class WorkServecesReqsComponent implements OnInit {

  apiUrl = environment.apiUrl;
  serviceRequestForm: FormGroup;

  constructor(private reqService: ServiceRequestService, private servType: ServiceTypesService,
    private type: ServiceTypesService, private dep: ServiceDepartmentService, private cat: ServiceCategoryService,
    private fb: FormBuilder, private employeeServ: EmployeeService, private toast: ToastrService,
    private http: HttpClient
  ) {
    this.serviceRequestForm = this.fb.group({
      serviceTypeId: ['', Validators.required],
      requestedEmployeeId: ['', Validators.required],
      workServiceCategoryId: ['', Validators.required],
      workServiceDepartmentId: ['', Validators.required],
      executionTime: ['', Validators.required],
      completionDate: ['', Validators.required],
      reference: ['', Validators.required],
      description: ['', Validators.required],

      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }
  ngOnInit(): void {
    this.getAllServiceRequests();
    this.getAllServiceTypes();
    this.getAllServiceCats();
    this.getAllServiceDeps();
    this.getAllEmployees();
  }
  buttons = ['التعليقات', 'المرفقات', 'وصف العمل']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  requests: any[] = [];
  getAllServiceRequests() {
  //   this.servType.getServiceTypes().subscribe((res)=>{
  //     this.requests= res.serviceRequests
  //   }(error)=>{
  //     console.log(error)
  //   }
  // )
    this.reqService.getServiceRequestsPaging(this.pageNumber,this.pageSize).subscribe(
      (response) => {
        this.requests = response.serviceRequests; // Assign the fetched Warehouses
        this.filteredServiceRequest=this.requests;
        this.totalCount = response.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); 
        console.log('requests :', this.requests);
        this.applySearchFilter();
      },
      (error) => {
        console.error(' Error fetching types section:', error); // Handle errors
      }
    );
  }

  deps: any[] = [];
  getAllServiceDeps() {
    this.dep.getServiceDepartment().subscribe(
      (response) => {
        this.deps = response.categories; // Assign the fetched Warehouses
        // console.log('deps :', this.deps);
        // this.applySearchFilter();
      },
      (error) => {
        console.error(' Error fetching depaertments section:', error); // Handle errors
      }
    );
  }

  types: any[] = [];
  getAllServiceTypes() {
    this.type.getServiceTypes().subscribe(
      (response) => {
        this.types = response.serviceRequests; // Assign the fetched Warehouses
        console.log('types :', this.types);
        // this.applySearchFilter();
      },
      (error) => {
        console.error(' Error fetching types section:', error); // Handle errors
      }
    );
  }


  cats: any[] = [];
  getAllServiceCats() {
    this.cat.getServiceCategories().subscribe(
      (response) => {
        this.cats = response.categories; // Assign the fetched Warehouses
        console.log('cats :', this.cats);
        // this.applySearchFilter();
      },
      (error) => {
        console.error(' Error fetching categories section:', error); // Handle errors
      }
    );
  }

  employees: any[] = [];
  getAllEmployees() {
    this.employeeServ.getAllEmployeesWithoutPaging().subscribe(
      (response) => {
        this.employees = response.data; // Assign the fetched Warehouses
        // console.log('employees :', this.employees);
        // this.applySearchFilter();
      },
      (error) => {
        console.error(' Error fetching employees section:', error); // Handle errors
      }
    );
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.serviceRequestForm.get('attachments') as FormArray;
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
    formData.append('serviceTypeId', this.serviceRequestForm.get('serviceTypeId')?.value || '');
    formData.append('requestedEmployeeId', this.serviceRequestForm.get('requestedEmployeeId')?.value || '');
    formData.append('workServiceCategoryId', this.serviceRequestForm.get('workServiceCategoryId')?.value || '');
    formData.append('workServiceDepartmentId', this.serviceRequestForm.get('workServiceDepartmentId')?.value || '');
    formData.append('executionTime', this.serviceRequestForm.get('executionTime')?.value || '');
    formData.append('completionDate', this.serviceRequestForm.get('completionDate')?.value || '');
    formData.append('reference', this.serviceRequestForm.get('reference')?.value || '');
    formData.append('description', this.serviceRequestForm.get('description')?.value || '');

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
    this.http.post(this.apiUrl + 'ServiceRequests/create', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تمت الإضافة بنجاح');
          this.getAllServiceRequests();
          this.serviceRequestForm.reset();
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
          console.log(this.serviceRequestForm.value);
          this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى")
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
      this.serviceRequestForm.patchValue({
        serviceTypeId: this.selectedCategory.serviceTypeId,
        requestedEmployeeId: this.selectedCategory.requestedEmployeeId,
        workServiceCategoryId: this.selectedCategory.workServiceCategoryId,
        workServiceDepartmentId: this.selectedCategory.workServiceDepartmentId,
        executionTime: this.selectedCategory.executionTime,
        completionDate: this.selectedCategory.completionDate,
        reference: this.selectedCategory.reference,
        description: this.selectedCategory.description
      });

      this.isModalOpen = true;
    } else {
      alert('Please select a type to update.');
    }
  }

  closeModal() {
    this.serviceRequestForm.reset();
    this.isModalOpen = false;
  }

  // edit and delete toggle
  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
  updateCategory() {
      const updatedCategory = { ...this.serviceRequestForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.reqService.updateServiceRequest(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Service type updated successfully:', response);
          this.toast.success('تم التحديث بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllServiceRequests();
          this.closeModal();  // Close the modal after successful update
        },
        (error) => {
          console.error('Error updating type :', error);
          console.log('Updated type  Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
   
  }


  // select checkbox

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.types.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.types.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.types.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.types.filter(item => item.checked).length;
  }


  // Method to fetch and display data based on search condition
  // Filter data based on search term
  filteredServiceRequest: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  getReqsWithoutPaging() {
    this.reqService.getServiceRequests().subscribe(response => {
      this.requests = response.serviceRequests;
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
      this.getReqsWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllServiceRequests();
    }
  }
  // Method to trigger search when the user types or submits the search query
  onSearchInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.getAllServiceRequests();
  }

  // Method to apply search filter on the full data
  applySearchFilter() {
    if (this.searchQuery.trim()) {
      // Filter the data based on the search query
      this.filteredServiceRequest = this.requests.filter(item =>
        (item.serviceTypeName && item.serviceTypeName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase())) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredServiceRequest = this.requests;
    }
  }

  totalCount: number = 0; // Total count of items from the API
  pageNumber: number = 1; // Current page
  pageSize: number = 10; // Items per page
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllServiceRequests();
    }
  }
}
