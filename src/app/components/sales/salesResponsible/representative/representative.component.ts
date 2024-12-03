import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { JobType } from 'src/app/enums/JobType';
import { UserAccessType } from 'src/app/enums/UserAccessType';
import { EmployeeService } from 'src/app/services/getAllServices/Employee/employee.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { TestService } from 'src/app/services/getAllServices/Test/test.service';
import { UserTypesService } from 'src/app/services/getAllServices/UserTypes/user-types.service';
import { environment } from 'src/environments/environment.development';
import { IDropdownSettings } from 'ng-multiselect-dropdown';


@Component({
  selector: 'app-representative',
  templateUrl: './representative.component.html',
  styleUrls: ['./representative.component.css']
})
export class RepresentativeComponent implements OnInit {

  representativeForm: FormGroup;
  representative: any[] = [];
  teams: any[] = [];
  userTypes: any[] = [];
  employees: any[] = [];

  jobType = JobType;
  // Convert enum to an array for dropdown
  jobTypeList: { key: number, value: string }[] = [];

  userAccessType = UserAccessType;
  // Convert enum to an array for dropdown
  userAccessTypeList: { key: number, value: string }[] = [];


  dropdownSettings = {};



  constructor(private representService: RepresentativeService, private teamService: TeamsService,
    private userTypeService: UserTypesService,
    private http: HttpClient, private fb: FormBuilder, private testService: TestService,
    private empService: EmployeeService, private toast: ToastrService) {
    this.representativeForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      // userTypeId: ['', Validators.required],
      description: [],
      jobType: [],
      accessTypes: this.fb.array([]),
      employeeId: [''] // Initialize accessTypes as a FormArray

    });


  }
  userData: any;
  ngOnInit(): void {
    this.getAllRepresentatives();
    this.getAllTeams();
    this.getAllUserTypes();
    this.getAllEmpoyees();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'key',
      textField: 'value',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      placeholder: 'قم باختيار نوع الوصول',
      closeDropDownOnSelection: false,
      enableCheckAll: true // Disables "Select All" option to match the standard <select> functionality
    };

    this.userAccessTypeList = [
      { key: 0, value: 'Dashboard' },
      { key: 1, value: 'MobileScreen1' },
      { key: 2, value: 'MobileScreen2' }
    ];

    this.jobTypeList = [
      { key: 0, value: 'SalesRepresentative' },
      { key: 1, value: 'Technician' },
      { key: 2, value: 'Merchandiser' },
      { key: 3, value: 'SalesSupervisor' },
      { key: 4, value: 'SalesManager' },
      { key: 5, value: 'Accountant' }
    ];

    this.testService.getTest().subscribe({
      next: (data) => {
        this.userData = data;
        console.log('User Data:', this.userData);
      },
      error: (error) => {
        console.error('Error fetching user data or permission denied', error);
      }
    });
  }
  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
  apiUrl = environment.apiUrl;

  getAllTeams() {
    this.teamService.getTeams().subscribe(response => {
      this.teams = response.teams;

    }, error => {
      console.log('Error in fetch data : ', error)
    }
    )
  }

  getAllUserTypes() {
    this.userTypeService.getUserTypes().subscribe(response => {
      this.userTypes = response.data;

    }, error => {
      console.log('Error in fetch data : ', error)
    }
    )
  }

  getAllRepresentatives() {
    this.representService.getAllRepresentative().subscribe(response => {
      this.representative = response;
      this.applySearchFilter();
      //console.log(this.salesOffers);
    }, error => {
      console.error('Error fetching representative data:', error)
    })
  }

  getAllEmpoyees() {
    this.empService.getAllEmployeesWithoutPaging().subscribe(response => {
      this.employees = response.data;
      //console.log(this.salesOffers);
    }, error => {
      console.error('Error fetching representative data:', error)
    })
  }

  // Getter for easy access to the FormArray
  get accessTypes(): FormArray {
    return this.representativeForm.get('accessTypes') as FormArray;
  }

  // Method to add an item to the FormArray by key
  addAccessType(key: string): void {
    this.accessTypes.push(this.fb.control(key)); // Only store the key
  }

  // Method to remove an item from the FormArray by key
  removeAccessType(key: string): void {
    const index = this.accessTypes.controls.findIndex(
      (control) => control.value === key // Compare with the key
    );
    if (index >= 0) {
      this.accessTypes.removeAt(index);
    }
  }

 

  // Handle item deselection in dropdown
  onItemDeselect(item: any): void {
    this.removeAccessType(item.key); // Remove by the key
  }

  // Handle "Select All" action in dropdown
  onSelectAll(items: any[]): void {
    this.accessTypes.clear(); // Clear the FormArray before adding all items
    items.forEach((item) => this.addAccessType(item.key)); // Add only keys
  }

  // Handle "Deselect All" action in dropdown
  onDeselectAll(): void {
    this.accessTypes.clear(); // Clear all items from the FormArray
  }

  // select checkbox
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  // Set each item's checked status to match selectAll
  this.representative.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.representative.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.representative.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.representative.filter(item => item.checked).length;
}

selectedCategory: any = null;

onCheckboxChange(category: any) {
  // this.updateSelectAll();
  // this.selectedCategory = category;  
  //--------------------------------------------------------------------------
  this.updateSelectAll();

  if (category.checked) {
    // If the checkbox is checked, set the selected category
    this.selectedCategory = category;
  } else {
    // If the checkbox is unchecked, clear the selected category
    this.selectedCategory = null;
  }
}
  onSubmitAdd(): void {
    if (this.representativeForm.valid) {
      const formData = this.representativeForm.value; // Get the form data

      console.log("Form Data before submission:", formData); // Debug log

      this.representService.createRepresentative(formData).subscribe(
        response => {
          console.log('Representative created successfully!', response);
          this.toast.success("Representative created successfully!", 'Success');
        },
        (error) => {
          console.error('Error creating Representative:', error);
          const errorMessage = error.error?.message || 'An unexpected error occurred.';
          this.toast.error(errorMessage, 'Error');
        }
      );
    } else {
      console.log("Form validation failed:", this.representativeForm);
      this.toast.error('Form is not valid');
    }
  }

  // Method for handling item selection
  selectedItems = [];

  onItemSelect(item: any): void {
    console.log('Selected item:', item);
  }


   // Filter data based on search term
   filteredRepresentative: any[] = [];   // Holds the filtered results (used for search)
   searchQuery: string = '';          // Holds the search query
   totalRecords: number = 0;
   offers: any[] = [];

   // Method to fetch and display data based on search condition
   fetchSaleOffers() {
     // Check if there's a search query that is not empty
     if (this.searchQuery && this.searchQuery.trim() !== '') {
       // If there's a search query, fetch all data without pagination
       this.getAllRepresentatives();
     } else {
       // If no search query, fetch paginated data
       this.getAllRepresentatives();
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
       this.filteredRepresentative = this.representative.filter(item =>
         (item.userName && item.userName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
         (item.email && item.email.toUpperCase().includes(this.searchQuery.toUpperCase()))
       )
 
     } else {
       // If no search query, reset to show all fetched data
       this.filteredRepresentative = this.representative;
     }
   }

   

}
