import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DepartmentService } from 'src/app/services/getAllServices/Department/department.service';
import { EmployeeService } from 'src/app/services/getAllServices/Employee/employee.service';
import { LocationService } from 'src/app/services/getAllServices/Location/location.service';
import { ManagerService } from 'src/app/services/getAllServices/Managers/manager.service';
import { NationalityService } from 'src/app/services/getAllServices/Nationality/nationality.service';
import { SupervisorService } from 'src/app/services/getAllServices/Supervisors/supervisor.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent {



  tenp = environment.apiUrl
  private apiUrl = `${this.tenp}Employees/CreateEmployee`;


  buttons = ['المعلومات الشخصية ', 'معلومات المستخدم', 'المرفقات', 'معلومات العمل', 'الاشعارات', 'المبيعات', 'الطلبات و المرفقات', 'الخطط و المهام', 'العهد المستلمه', 'الحساب البنكي']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  pageNumber: number = 1;
  pageSize: number = 10;
  employees: any[] = [];
  departments: any[] = [];
  supervisors: any[] = [];
  managers: any[] = [];
  employeeForm: FormGroup;

  // for Update
  selectedCategory: any = null;
  isModalOpen = false;
  storesSec: any[] = [];


  dropdownSettings = {};

  constructor(private employeeService: EmployeeService, private fb: FormBuilder,
    private departmentService: DepartmentService, private supervisorService: SupervisorService,
    private managerService: ManagerService, private http: HttpClient, private toast: ToastrService,
    private nationality: NationalityService, private locationServ: LocationService
  ) {

    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      localName: ['', Validators.required],
      jobTitle: ['', Validators.required],
      departmentSupervisorId: ['', Validators.required],
      departmentManagerId: ['', Validators.required],
      departmentId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      passportNumber: [''],
      passportExpiryDate: [''],
      driverLicenseNumber: [''],
      driverLicenseExpiryDate: [''],
      nationality: [''],
      borderNumber: [''],
      homeLocationIds: this.fb.array([]),
      genderType: [''],
      attachmentFiles: this.fb.array([]),
      attachedFiles: this.fb.array([])

    });
  }
  ngOnInit(): void {
    this.getAllEmployees();
    this.getAllDepartmesnts();
    this.getAllManagers();
    this.getAllSupervisors();
    this.getAllNationalities();
    this.getAllLocations();


    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'locationName',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      allowSearchFilter: true,
      placeholder: 'قم باختيار السكن',
      closeDropDownOnSelection: false,
      enableCheckAll: true // Disables "Select All" option to match the standard <select> functionality
    };
  }

  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }


  getAllEmployees() {
    this.employeeService.getAllEmployees(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.employees = data.data;
        this.filteredEmployee= this.employees;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        // console.log(this.try)
        //console.log(this.employees);
      }, error => {
        console.error('Error fetching employees data:', error);
      });
  }

  locations: any[] = [];
  getAllLocations() {
    this.locationServ.getLocations()
      .subscribe(data => {
        this.locations = data.data;
        // console.log(this.try)
        //console.log(this.employees);
      }, error => {
        console.error('Error fetching locations data:', error);
      });
  }

  // get All Departments
  getAllDepartmesnts() {
    this.departmentService.getAllDepartments().subscribe(response => {
      this.departments = response.data;
      //console.log(this.departments);
    }, error => {
      console.error('Error fetching Department data:', error)
    })

  }
  // get all supervicors
  getAllSupervisors() {
    this.supervisorService.getAllSupervisors().subscribe(response => {
      this.supervisors = response;
      //console.log(this.supervisors);
    }, error => {
      console.error('Error fetching supervisors data:', error)
    })

  }
  // getall managers
  getAllManagers() {
    this.managerService.getAllManagers().subscribe(response => {
      this.managers = response;
      //console.log(this.managers);
    }, error => {
      console.error('Error fetching managers data:', error)
    })
  }


 // handle array of attachments
 fileNames: string[] = []; // Array to store file names

 get attachedFiles(): FormArray {
   return this.employeeForm.get('attachedFiles') as FormArray;
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
              this.attachedFiles.push(this.fb.control(fileData));
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
     const fileData = {
       fileTitle: [file.name],
       fileType: [file.type],
       fileSize: [file.size],
       fileUrl: [null],  // URL will be set after uploading
       file: [file]  
     };
     // Add the selected file to the FormArray as a FormControl
     this.attachedFiles.push(this.fb.control(file));

     // Reset the input value to allow selecting the same file again
     input.value = '';
   }
 }

 // Method to remove a file from the attachments FormArray
 removeAttachment(index: number): void {
   this.attachedFiles.removeAt(index);
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
    const formData = new FormData();
    const name = this.employeeForm.get('name')!.value;
    const localName = this.employeeForm.get('localName')!.value;
    const jobTitle = this.employeeForm.get('jobTitle')!.value;
    const departmentSupervisorId = this.employeeForm.get('departmentSupervisorId')!.value;
    const departmentManagerId = this.employeeForm.get('departmentManagerId')!.value;
    const departmentId = this.employeeForm.get('departmentId')!.value;
    const startDate = this.employeeForm.get('startDate')!.value;
    const endDate = this.employeeForm.get('endDate')!.value;
    const passportNumber = this.employeeForm.get('passportNumber')!.value;
    const passportExpiryDate = this.employeeForm.get('passportExpiryDate')!.value;
    const driverLicenseNumber = this.employeeForm.get('driverLicenseNumber')!.value;
    const driverLicenseExpiryDate = this.employeeForm.get('driverLicenseExpiryDate')!.value;
    const nationality = this.employeeForm.get('nationality')!.value;
    const borderNumber = this.employeeForm.get('borderNumber')!.value;
    const homeLocationIds = this.employeeForm.get('homeLocationIds')!.value; // Array of IDs
    const genderType = this.employeeForm.get('genderType')!.value;
   
    // Check for required fields
    // if (!name || !localName || !jobTitle || !departmentSupervisorId || !departmentManagerId || !departmentId) {
    //   console.error('One or more form fields are missing');
    //   return;
    // }
  
    // Adding values to FormData
    formData.append('name', name);
    formData.append('localName', localName);
    formData.append('jobTitle', jobTitle);
    formData.append('departmentSupervisorId', departmentSupervisorId);
    formData.append('departmentManagerId', departmentManagerId);
    formData.append('departmentId', departmentId);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('passportNumber', passportNumber);
    formData.append('passportExpiryDate', passportExpiryDate);
    formData.append('driverLicenseNumber', driverLicenseNumber);
    formData.append('driverLicenseExpiryDate', driverLicenseExpiryDate);
    formData.append('nationality', nationality);
    formData.append('borderNumber', borderNumber);
    formData.append('genderType', genderType);
    const attachedFiles = this.employeeForm.get('attachedFiles')?.value; // Assuming `attachedFiles` is a FormArray
  if (attachedFiles && attachedFiles.length > 0) {
    attachedFiles.forEach((file: File, index: number) => {
      formData.append(`AttachmentFiles`, file, file.name);
    });
  }
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || ''
    });
  
    // Construct the URL with `HomeLocationIds` as repeated query parameters
    let url = `${this.apiUrl}?Name=${encodeURIComponent(name)}&LocalName=${encodeURIComponent(localName)}&JobTitle=${encodeURIComponent(jobTitle)}&DepartmentManagerId=${encodeURIComponent(departmentManagerId)}&DepartmentSupervisorId=${encodeURIComponent(departmentSupervisorId)}&StartDate=${encodeURIComponent(startDate)}&EndDate=${encodeURIComponent(endDate)}&DepartmentId=${encodeURIComponent(departmentId)}&PassportNumber=${encodeURIComponent(passportNumber)}&PassportExpiryDate=${encodeURIComponent(passportExpiryDate)}&DriverLicenseNumber=${encodeURIComponent(driverLicenseNumber)}&DriverLicenseExpiryDate=${encodeURIComponent(driverLicenseExpiryDate)}&Nationality=${encodeURIComponent(nationality)}&BorderNumber=${encodeURIComponent(borderNumber)}&GenderType=${encodeURIComponent(genderType)}`;
  
    // Append each `homeLocationIds` as a separate `HomeLocationIds` parameter
    homeLocationIds.forEach((id: number) => {
      url += `&HomeLocationIds=${encodeURIComponent(id)}`;
    });
  
    // Make the HTTP POST request
    this.http.post<any>(url, formData, { headers }).subscribe(
      (response) => {
        console.log('Employee created successfully:', response);
        this.toast.success('تم الإضافة بنجاح');
        this.employeeForm.reset();
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
        this.attachedFiles.clear();
      },
      (error) => {
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
        console.log(this.employeeForm);
        console.log(error);
      }
    );
  }
  
  

  // Method for handling item selection
  selectedItems = [];
  // Getter for homeLocationIds FormArray
  get homeLocationIds(): FormArray {
    return this.employeeForm.get('homeLocationIds') as FormArray;
  }

  addHomeLocation(key: string): void {
    // Add only the key to the FormArray
    this.homeLocationIds.push(new FormControl(key));
  }

  removeHomeLocation(key: string): void {
    const index = this.homeLocationIds.controls.findIndex(
      (control) => control.value === key
    );
    if (index >= 0) {
      this.homeLocationIds.removeAt(index);
    }
  }

 // Add a selected item's ID to homeLocationIds
onItemSelect(item: any): void {
  console.log('Selected item:', item);
  this.addHomeLocation(item.id); // Use item.id instead of item.key
}

// Remove a selected item's ID from homeLocationIds
onItemDeselect(item: any): void {
  console.log('Deselected item:', item);
  this.removeHomeLocation(item.id); // Use item.id instead of item.key
}

// Add all selected items' IDs to homeLocationIds
onSelectAll(items: any[]): void {
  this.homeLocationIds.clear();
  items.forEach((item) => this.addHomeLocation(item.id)); // Use item.id instead of item.key
}

// Clear all selected items from homeLocationIds
onDeselectAll(): void {
  this.homeLocationIds.clear();
}

  nationalities: any[] = [];
  getAllNationalities() {
    this.nationality.getAllNationalities().subscribe(response => {
      this.nationalities = response;
      //console.log(this.departments);
    }, error => {
      console.error('Error fetching nationalites data:', error)
    })
  }
  // Update
  onCheckboxChange(category: any) {
    this.updateSelectAll();
    this.selectedCategory = category;  // Store the selected category data
  }
  openModalForSelected() {
    if (this.selectedCategory) {
      this.employeeForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        jobTitle: this.selectedCategory.jobTitle,
        departmentSupervisorId: this.selectedCategory.departmentSupervisorId,
        departmentManagerId: this.selectedCategory.departmentManagerId,
        departmentId: this.selectedCategory.departmentId,
        startDate: this.selectedCategory.startDate,
        endDate: this.selectedCategory.endDate,
      });

      this.isModalOpen = true;
    } else {
      alert('Please select a category to update.');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.employeeForm.reset();
  }

  updateCategory() {
      const updatedCategory = { ...this.employeeForm.value, id: this.selectedCategory.id };

      // Call the update service method using the category's id
      this.employeeService.updateEmployee(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Employee updated successfully:', response);
          this.toast.success('تم تحديث البيانات بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllEmployees();
          this.closeModal();  // Close the modal after successful update
          this.employeeForm.reset();
        },
        (error) => {
          console.error('Error updating category:', error);
          console.log('Updated Category Data:', updatedCategory);
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error(errorMessage, 'Error');
          // alert('An error occurred while updating the item type .');
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
  
  }

  deleteItemType() {
    const selectedItems = this.filteredEmployee.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.employeeService.deleteEmployeeById(item.id).subscribe({
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
    this.filteredEmployee = this.filteredEmployee.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredEmployee.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllEmployees();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllEmployees();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllEmployees();
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
  totalCount: number = 0; // Total count of items from the API

  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllEmployees();
    }
  }

// select checkbox
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  // Set each item's checked status to match selectAll
  this.employees.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.employees.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.employees.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.employees.filter(item => item.checked).length;
}

   // Filter data based on search term
   filteredEmployee: any[] = [];   // Holds the filtered results (used for search)
   searchQuery: string = '';          // Holds the search query
   totalRecords: number = 0;
   offers: any[] = [];
   getEmployeesWithoutPaging() {
     this.employeeService.getAllEmployeesWithoutPaging().subscribe(response => {
       this.employees = response.data;
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
       this.getEmployeesWithoutPaging();
     } else {
       // If no search query, fetch paginated data
       this.getAllEmployees();
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
       this.filteredEmployee = this.employees.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.jobTitle && item.jobTitle.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.departmentSupervisorName && item.departmentSupervisorName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.departmentManagerName && item.departmentManagerName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
       )
 
     } else {
       // If no search query, reset to show all fetched data
       this.filteredEmployee = this.employees;
     }
   }

   
}
