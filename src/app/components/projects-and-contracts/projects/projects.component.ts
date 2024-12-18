import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ProjactService } from 'src/app/services/getAllServices/Projects/projact.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment.development';
import { Toast, ToastrService } from 'ngx-toastr';
import { LocationService } from 'src/app/services/getAllServices/Location/location.service';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { UserService } from 'src/app/services/getAllServices/Users/user.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import * as bootstrap from 'bootstrap';
import { ContractService } from 'src/app/services/getAllServices/Contracts/contract.service';
import { EquipmentService } from 'src/app/services/getAllServices/Equipment/equipment.service';
import { ContactsService } from 'src/app/services/getAllServices/Contacts/contacts.service';
import { NationalityService } from 'src/app/services/getAllServices/Nationality/nationality.service';
import { ProjectTypeService } from 'src/app/services/getAllServices/ProjectTypes/project-type.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  pageNumber: number = 1;
  pageSize: number = 10;
  projects: any[] = [];
  try: any[] = [];
  names: any[] = [];
  projectForm: FormGroup;
  apiUrl = environment.apiUrl;
  dropdownSettings = {};
  ContactdropdownSettings: any;
  ContractsdropdownSettings: any;
  EquipdropdownSettings: any;
  contactForm:FormGroup;
  imgApiUrl= environment.imgApiUrl;
  commentForm:FormGroup;

  comments:any[] =[];

  userId:any;
  constructor(private projectService: ProjactService, private http: HttpClient,
    private fb: FormBuilder, private toast: ToastrService, private locationServ: LocationService,
    private clientService: ClientsService, private userServ: UserService, private renderer: Renderer2,
    private teamServ: TeamsService, private contractService: ContractService, private equipService: EquipmentService,
    private cdr: ChangeDetectorRef, private contactS: ContactsService, private locationService: LocationService,
    private nationality: NationalityService, private projectTypeService: ProjectTypeService,
    private costCenter: CostCenterService, private ngZone: NgZone
  ) {
    this.userId = JSON.parse(localStorage.getItem("userData")!).user_id;
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description:[''],
      clientId: ['', null],
      assignedToId: ['', Validators.required],
      teamId: [''],
      userIds: this.fb.array([], Validators.required),
      startDate: [''],
      endDate: [''],
      projectTypeId:[''], 
      costCenterId:[''],
      contractIds:this.fb.array([]),
      equipmentIds:this.fb.array([]),
      contactIds:this.fb.array([]),
      attachments:this.fb.array([]),
      locationsIds: [],
      priority: [0],
      size: [0]
    });

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      phoneNumber1: [''],
      phoneNumber2: [''],
      jobTitle: [''],
      email: [''],
      locationLinks: [''],
      nationality: [''],
      clientId: [''],
      supplier: [''],
      description:[''],
      attachments: this.fb.array([]),
      userIds: this.fb.array([]),
      startDate: [null],
      endDate: [null],
      locations: [],
      attachmentFiles: this.fb.array([]),
      // status: [null, Validators.required],
      priority: [0],
      size: [0],
    });

        // Initializing Comment Form
        this.commentForm = this.fb.group({
          content:['', Validators.required],
          entityId:['', Validators.required],
          parentCommentId:[''],
          attachmentFiles: this.fb.array([])
        })
  }
  ngOnDestroy(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }  
  ngOnInit(): void {
    this.toggleTableonClick();
    this.getAllProjects();
    this.getAllLocations();
    this.getAllClients();
    this.getAllTeams();
    this.getAllUsers();
    this.getAllEquipments();
    this.getAllContracts();
    this. getAllContacts();
    this.initializeDropdownSettings();
    this.initializeEquipDropdownSettings();
    this.initializeContactDropdownSettings();
    this.getLocations();
    this.getNationalities();
    this.getAllCostCenters();
    this.getAllProjectType();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id', // Replace 'id' with the key from your user object
      textField: 'userName', // Replace 'name' with the key for user name
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      allowSearchFilter: true, // Enable search
    };
  }

  // Handle item selection
  onItemSelect(item: any) {
    const userIds = this.projectForm.get('userIds') as FormArray;
    userIds.push(this.fb.control(item.id)); // Push selected ID into FormArray
  }

  // Handle item deselection
  onItemDeselect(item: any) {
    const userIds = this.projectForm.get('userIds') as FormArray;
    const index = userIds.controls.findIndex((control) => control.value === item.id);
    if (index !== -1) {
      userIds.removeAt(index); // Remove deselected ID from FormArray
    }
  }

  // Handle "Select All"
  onSelectAll(items: any[]) {
    const userIds = this.projectForm.get('userIds') as FormArray;
    items.forEach((item) => {
      if (!userIds.controls.some((control) => control.value === item.id)) {
        userIds.push(this.fb.control(item.id)); // Add all IDs to FormArray
      }
    });
  }

  // Handle "Deselect All"
  onDeselectAll() {
    const userIds = this.projectForm.get('userIds') as FormArray;
    while (userIds.length) {
      userIds.removeAt(0); // Clear all IDs from FormArray
    }
  }
  isMapView = false;

  toggleMap() {
    this.isMapView = true
  }
  closeMap() {
    this.isMapView = false;
  }


  isFirstButtonClicked = false;
  isSecondButtonClicked = false;

  istableview = true;
  iscardsview = false;

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

  toggleTableonClick() {
    this.istableview = true;  // Set table view to true
    this.iscardsview = false; // Set cards view to false
  }

  toggleCardsonClick() {
    this.istableview = false;
    this.iscardsview = true;
  }



  buttons = ['التفاصيل', 'المهام', 'الاستبيانات', 'التعليقات', 'مالية المشروع']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

//Attachments
get attachments(): FormArray {
   return this.projectForm.get('attachments') as FormArray;
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



  // get all
  getAllProjects() {
    this.projectService.getProjacts(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.try = data.projects;
        this.filteredProjects = this.try;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); 
        // console.log(this.try)
      }, error => {
        console.error('Error fetching projects data:', error);
      });
  }

  locations: any[] = [];
  getAllLocations() {
    this.locationServ.getLocations().subscribe(
      (response) => {
        this.locations = response.data; // Assign the fetched Warehouses
        console.log('item types :', this.locations);
      },
      (error) => {
        console.error('Error fetching locations section:', error); // Handle errors
      }
    );
  }
  contracts: any[] = [];
  getAllContracts() {
    this.contractService.getAllContracts().subscribe(
      (response) => {
        this.contracts = response.contracts; // Assign the fetched Warehouses
        // console.log('contracts :', this.locations);
      },
      (error) => {
        console.error('Error fetching contracts:', error); // Handle errors
      }
    );
  }
  initializeDropdownSettings() {
    this.ContractsdropdownSettings = {
      singleSelection: false,
      idField: 'id', // Adjust according to your API response field
      textField: 'name', // Adjust according to your API response field
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
  }
  onContractSelect(item: any) {
    const contractIds = this.projectForm.get('contractIds') as FormArray;
    contractIds.push(this.fb.control(item.id));
  }

  // Remove deselected contract from the form array
  onContractDeselect(item: any) {
    const contractIds = this.projectForm.get('contractIds') as FormArray;
    const index = contractIds.controls.findIndex((control) => control.value === item.id);
    if (index >= 0) {
      contractIds.removeAt(index);
    }
  }

  // Select all contracts
  onContractSelectAll(items: any[]) {
    const contractIds = this.projectForm.get('contractIds') as FormArray;
    contractIds.clear(); // Clear previous selections
    items.forEach((item) => {
      contractIds.push(this.fb.control(item.id));
    });
  }

  // Deselect all contracts
  onContractDeselectAll() {
    const contractIds = this.projectForm.get('contractIds') as FormArray;
    contractIds.clear();
  }
  teamss: any[] = [];
  getAllTeams() {
    this.teamServ.getTeams().subscribe(
      (response) => {
        this.teamss = response.teams; // Assign the fetched Warehouses
        console.log('teams:', this.locations);
      },
      (error) => {
        console.error('Error fetching teams section:', error); // Handle errors
      }
    );
  }
  clients: any[] = [];
  getAllClients() {
    this.clientService.getCliensts().subscribe(
      (response) => {
        this.clients = response.data; // Assign the fetched Warehouses
        console.log('clients:', this.locations);
      },
      (error) => {
        console.error('Error fetching clients section:', error); // Handle errors
      }
    );
  }
  costCenters: any[] = [];
  getAllCostCenters() {
    this.costCenter.getAllCostCaners().subscribe(
      (response) => {
        this.costCenters = response.costCenters;
        
      },
      (error) => {
        console.error('Error fetching users section:', error); // Handle errors
      }
    )
  }
  projectTypes: any[] = [];
  getAllProjectType() {
    this.projectTypeService.getAllProjectTypesNoPaging().subscribe(
      (response) => {
        this.projectTypes = response.data;
        
      },
      (error) => {
        console.error('Error fetching users section:', error); // Handle errors
      }
    )
  }
  users: any[] = [];
  getAllUsers() {
    this.userServ.getUsers().subscribe(
      (response) => {
        this.users = response;
        console.log('users:' , this.users)
      },
      (error) => {
        console.error('Error fetching users section:', error); // Handle errors
      }
    )
  }
  equips: any[] = [];
  getAllEquipments() {
    this.equipService.getEquipments().subscribe(
      (response) => {
        this.equips = response.data;
        console.log('equipments:' , this.users)
      },
      (error) => {
        console.error('Error fetching equipments:', error); // Handle errors
      }
    )
  }
    initializeEquipDropdownSettings() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id', // Adjust according to your API response field
      textField: 'name', // Adjust according to your API response field
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
  }
  onEquipmentSelect(item: any) {
    const equipmentIds = this.projectForm.get('equipmentIds') as FormArray;
    equipmentIds.push(this.fb.control(item.id));
  }

  // Remove deselected equipment from the form array
  onEquipmentDeselect(item: any) {
    const equipmentIds = this.projectForm.get('equipmentIds') as FormArray;
    const index = equipmentIds.controls.findIndex((control) => control.value === item.id);
    if (index >= 0) {
      equipmentIds.removeAt(index);
    }
  }

  // Select all equipment
  onEquipmentSelectAll(items: any[]) {
    const equipmentIds = this.projectForm.get('equipmentIds') as FormArray;
    equipmentIds.clear(); // Clear previous selections
    items.forEach((item) => {
      equipmentIds.push(this.fb.control(item.id));
    });
  }

  // Deselect all equipment
  onEquipmentDeselectAll() {
    const equipmentIds = this.projectForm.get('equipmentIds') as FormArray;
    equipmentIds.clear();
  }

  contacts: any[] = [];
  getAllContacts() {
    this.contactS.getAllContactsWithoutPaging().subscribe(
      (response) => {
        this.contacts = response.contacts; // Assign the fetched Warehouses
        // console.log('contacts :', this.locations);
      },
      (error) => {
        console.error('Error fetching contacts:', error); // Handle errors
      }
    );
  }
  initializeContactDropdownSettings() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id', // Adjust according to your API response field
      textField: 'name', // Adjust according to your API response field
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,
      allowSearchFilter: true,
    };
  }
  onContactSelect(item: any) {
    const contactIds = this.projectForm.get('contactIds') as FormArray;
    contactIds.push(this.fb.control(item.id));
  }

  // Remove deselected contact from the form array
  onContactDeselect(item: any) {
    const contactIds = this.projectForm.get('contactIds') as FormArray;
    const index = contactIds.controls.findIndex((control) => control.value === item.id);
    if (index >= 0) {
      contactIds.removeAt(index);
    }
  }

  // Select all contacts
  onContactSelectAll(items: any[]) {
    const contactIds = this.projectForm.get('contactIds') as FormArray;
    contactIds.clear(); // Clear previous selections
    items.forEach((item) => {
      contactIds.push(this.fb.control(item.id));
    });
  }

  // Deselect all contacts
  onContactDeselectAll() {
    const contactIds = this.projectForm.get('contactIds') as FormArray;
    contactIds.clear();
  }

  @ViewChild('myModal', { static: false }) modal!: ElementRef;
  ngAfterViewInit(): void {
    this.modal.nativeElement.addEventListener('hidden.bs.modal', () => {
      // Fallback cleanup in case Bootstrap doesn't properly clean up
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    });
  }
  api = environment.apiUrl + 'Project/CreateProject';
  initializeProjectForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      description:[''],
      clientId: ['', null],
      assignedToId: ['', Validators.required],
      teamId: [''],
      userIds: this.fb.array([], Validators.required),
      startDate: [''],
      endDate: [''],
      projectTypeId:[''], 
      costCenterId:[''],
      contractIds:this.fb.array([]),
      equipmentIds:this.fb.array([]),
      contactIds:[''],
      locationsIds: [],
      priority: [0],
      size: [0],
    });
  }
  onSubmit() {
    const nameControl = this.projectForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.projectForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const assignControl = this.projectForm.get('assignedToId');
  
    if (!assignControl || assignControl.invalid) {
      console.log('Form is invalid because the assignedToId field is invalid.');
      console.log('assignedToId field errors:', assignControl?.errors);
      this.projectForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const userControl = this.projectForm.get('userIds');
  
    if (!userControl || userControl.invalid) {
      console.log('Form is invalid because the userIds field is invalid.');
      console.log('userIds field errors:', userControl?.errors);
      this.projectForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();

    formData.append('name', this.projectForm.get('name')?.value);
    formData.append('localName', this.projectForm.get('localName')?.value);
    formData.append('clientId', this.projectForm.get('clientId')?.value);
    formData.append('assignedToId', this.projectForm.get('assignedToId')?.value);
    formData.append('teamId', this.projectForm.get('teamId')?.value);

    const userIds = this.projectForm.get('userIds')?.value;
    if (Array.isArray(userIds)) {
      userIds.forEach(id => formData.append('userIds', id));
    }

    formData.append('startDate', this.projectForm.get('startDate')?.value);
    formData.append('endDate', this.projectForm.get('endDate')?.value);
    formData.append('locations', this.projectForm.get('locations')?.value);
    formData.append('priority', this.projectForm.get('priority')?.value);
    formData.append('size', this.projectForm.get('size')?.value);

    const headers = new HttpHeaders({
      tenant: localStorage.getItem('tenant') || ''  // Add your tenant value here
    });
    this.attachments.controls.forEach((control) => {
      const fileData = control.value;
      if (fileData && fileData.file instanceof File) {
        // Append the actual file object
        formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
      }
    });

    this.http.post(this.api, formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        this.toast.success("تم الإضافة بنجاح");
        this.getAllProjects();
        this.projectForm= this.initializeProjectForm();
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
      }, error => {
        console.error('Error details:', error);
        if (error.error instanceof ErrorEvent) {
          console.error('Client-side error:', error.error.message);
        } else {
          console.error(`Backend returned code ${error.status}, body was: `, error.error);
        }
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
      });
  }


  totalCount: number = 0; // Total count of items from the API
  totalPages: number = 0; // Total number of pages
  changePage(newPageNumber: number): void {
    if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
      this.pageNumber = newPageNumber;
      this.getAllProjects();
    }
  }


  // dropdown table columns
  columns = [
    // { name: 'id', displayName: 'المسلسل', visible: true },
    { name: 'name', displayName: 'اسم القسم', visible: true },
    { name: 'localName', displayName: 'اسم القسم باللغه المحليه', visible: true },
    { name: 'code', displayName: 'كود المشروع', visible: true },
    { name: 'clientName', displayName: 'اسم العميل', visible: true },
    { name: 'startDate', displayName: 'تاريخ البدء', visible: false },
    { name: 'endDate', displayName: 'تاريخ الإنتهاء', visible: false }

  ];
  showDropdown = false;
  toggleDropdown() {
    this.showDropdown = !this.showDropdown; // Toggle the dropdown visibility
    console.log('Dropdown visibility:', this.showDropdown); // Check if it’s toggling
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

  // select checkbox
  // onCheckboxChange(category: any) {
  //   this.updateSelectAll();
  //   // this.selectedCategory = category;  // Store the selected category data
  // }
  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.try.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.try.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.try.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.try.filter(item => item.checked).length;
  }

  selectedCategory: any = null;
  storesSec: any[] = [];
  isModalOpen = false;
  onCheckboxChange(category: any) {
    this.updateSelectAll();
    this.selectedCategory = category;  // Store the selected category data
  }

  openModalForSelected() {
    console.log(this.selectedCategory);
    if (this.selectedCategory) {
      this.projectForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        clientId: this.selectedCategory.clientId,
        assignedToId: this.selectedCategory.assignedToId,
        teamId: this.selectedCategory.teamId,
        userIds: this.selectedCategory.userIds,
        startDate: this.selectedCategory.startDate,
        endDate: this.selectedCategory.endDate,
        priority: this.selectedCategory.priority,
        size: this.selectedCategory.size,
        locationsIds: this.selectedCategory.locationsIds,
      });
      this.patchArrayValues('contractIds', this.selectedCategory.contractIds);
      this.patchArrayValues('equipmentIds', this.selectedCategory.equipmentIds);
      this.patchArrayValues('contactIds', this.selectedCategory.contactIds);
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
      console.log(this.isModalOpen);
    } else {
      alert('الرجاء تحديد العنصر');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
    this.projectForm.reset();
    this.attachments.clear();
  }
  patchArrayValues(arrayName: string, values: any[]) {
    const formArray = this.projectForm.get(arrayName) as FormArray;
    formArray.clear(); // Clear existing values in the array
  
    if (values && Array.isArray(values)) {
      values.forEach((value) => {
        formArray.push(this.fb.control(value)); // Add each value as a form control
      });
    }
  }

  updateCategory() {
      const updatedCategory = { ...this.projectForm.value, id: this.selectedCategory.id };
      const nameControl = this.projectForm.get('name');
  
      if (!nameControl || nameControl.invalid) {
        console.log('Form is invalid because the name field is invalid.');
        console.log('Name field errors:', nameControl?.errors);
        this.projectForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      const assignControl = this.projectForm.get('assignedToId');
    
      if (!assignControl || assignControl.invalid) {
        console.log('Form is invalid because the assignedToId field is invalid.');
        console.log('assignedToId field errors:', assignControl?.errors);
        this.projectForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      const userControl = this.projectForm.get('userIds');
    
      if (!userControl || userControl.invalid) {
        console.log('Form is invalid because the userIds field is invalid.');
        console.log('userIds field errors:', userControl?.errors);
        this.projectForm.markAllAsTouched();
        this.cdr.detectChanges();
        return; // Stop submission if the name field is invalid
      }
      // Call the update service method using the category's id
      this.projectService.updateProject(this.selectedCategory.id, updatedCategory).subscribe(
        (response) => {
          console.log('Contract updated successfully:', response);
          this.toast.success('تم التحديث بنجاح')
          // Update the local categories array if necessary
          const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
          if (index !== -1) {
            this.storesSec[index] = updatedCategory;
          }

          this.getAllProjects();
          this.projectForm.reset();
          this.closeModal();  // Close the modal after successful update
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating contract:', error);
          console.log('Updated contract Data:', updatedCategory);
          // alert('An error occurred while updating the item type .');
          this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
        }
      );
    
  }


   // ازرار الاجراءات
   isDropdownOpen2: boolean = false;

   toggleDropdown2() {
    this.isDropdownOpen2 = !this.isDropdownOpen2;
  }
  
   closeDropdown() {
     this.isDropdownOpen2 = false;
   }
   
  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
  deleteItemType() {
    const selectedItems = this.filteredProjects.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.projectService.deleteProjectById(item.id).subscribe({
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
    this.filteredProjects = this.filteredProjects.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredProjects.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllProjects();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllProjects();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllProjects();
      this.closeConfirmationModal();
      if (this.filteredProjects.length === 0 && this.pageNumber > 1) {
        // Move to the previous page if the current page is empty
        this.pageNumber -= 1;  // Adjust the page number to the previous one
        this.changePage(this.pageNumber)
        this.getAllProjects(); 
      } else {
        this.getAllProjects();
      }
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

  // Filter data based on search term
filteredProjects: any[] = [];   // Holds the filtered results (used for search)
searchQuery: string = '';          // Holds the search query
totalRecords: number = 0;
offers: any[] = [];
getProjectsWithoutPaging() {
  this.projectService.getProjactsWithoutPag().subscribe(response => {
    this.try = response.projects;
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
    this.getProjectsWithoutPaging();
  } else {
    // If no search query, fetch paginated data
    this.getAllProjects();
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
    this.filteredProjects = this.try.filter(item =>
      (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase())) ||
      (item.clientName && item.clientName.toUpperCase().includes(this.searchQuery.toUpperCase()))
    )

  } else {
    // If no search query, reset to show all fetched data
    this.filteredProjects = this.try;
  }
}
  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  // get attachments(): FormArray {
  //   return this.contactForm.get('attachments') as FormArray;
  // }

  // // Method to handle file selection
  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     const file = input.files[0];
  //     const fileData = {
  //       fileTitle: [file.name],
  //       fileType: [file.type],
  //       fileSize: [file.size],
  //       fileUrl: [null],  // URL will be set after uploading
  //       file: [file]  
  //     };
  //     // Add the selected file to the FormArray as a FormControl
  //     this.attachments.push(this.fb.control(file));

  //     // Reset the input value to allow selecting the same file again
  //     input.value = '';
  //   }
  // }

  // // Method to remove a file from the attachments FormArray
  // removeAttachment(index: number): void {
  //   this.attachments.removeAt(index);
  // }
onSubmitContact() {
    const formData = new FormData();
    formData.append('name', this.contactForm.get('name')?.value);
    formData.append('localName', this.contactForm.get('localName')?.value);
    formData.append('phoneNumber1', this.contactForm.get('phoneNumber1')?.value);
    formData.append('phoneNumber2', this.contactForm.get('phoneNumber2')?.value);
    formData.append('jobTitle', this.contactForm.get('jobTitle')?.value);
    formData.append('email', this.contactForm.get('email')?.value);
    formData.append('locationLinks', this.contactForm.get('locationLinks')?.value);
    formData.append('nationality', this.contactForm.get('nationality')?.value);
    formData.append('clientId', this.contactForm.get('clientId')?.value);
    formData.append('supplier', this.contactForm.get('supplier')?.value);
    formData.append('description', this.contactForm.get('description')?.value);
    this.attachments.controls.forEach((control) => {
      const file = control.value;
      if (file) {
        formData.append('AttachmentFiles', file); // Append each file under 'AttachmentFiles'
      }
    });

  
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant')||''  // Add your tenant value here
    });
  
    this.http.post(this.apiUrl, formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        // alert('submit successfully');
        this.toast.success('تم الإضافة بنجاح');
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
        this.getAllContacts();
        this.contactForm.reset();
        this.attachments.clear();
      }, error => {
        console.error('Error:', error);
        this.toast.warning('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');

      });
  }
  location:any[]=[];
  getLocations() {
    this.locationService.getLocations()
      .subscribe(data => {
        this.location = data.data;
        console.log(this.location);
      }, error => {
        console.error('Error fetching location data:', error);
      });
  }
nationalities:any[]=[];
  getNationalities() {
    this.nationality.getAllNationalities()
      .subscribe(data => {
        this.nationalities = data;
        // console.log(this.nationalities);
      }, error => {
        console.error('Error fetching nationalities data:', error);
      });}
  // Add Comment Logic
  addComment(parent:any =''){
    this.projectService.postProjectComment({
      Content:this.commentForm.controls['content'].value,
      EntityId:this.selectedCategory.id,
      ParentCommentId:parent
    }).subscribe((res)=> console.log(res));
    this.getComments();
    this.commentForm.reset();
    if(parent) this.replayId = '';
  }

  getComments(){
    this.projectService.getProjectComments(this.selectedCategory.id).subscribe((res)=>{
      this.comments = res;
    })
  }
  replayId:any;
  toggleReplay(commentId:any){
    this.replayId = commentId;
  }

  editedText:string ='';
  editId:any;
  //Edit Comment
  editComment(commentId:any,content:any){
    this.projectService.updateProjectComment(commentId,{
      content:this.editedText,
    }).subscribe((res)=> console.log(res));
    this.getComments();
    if(this.editedText) this.editedText ='';this.editId='';
  }
  toggleEdit(commentId:any,text:any){
    this.editId==commentId? this.editId='': this.editId= commentId;
    this.editedText = text;
  }

// Toggle Drag and Drop
showDragDrop =true;
  toggleDragDrop(){
    this.showDragDrop = !this.showDragDrop;
  }

  //Audio
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording = false;
  recCount =-1;
  startRecording() {
    this.isRecording = true;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
    }).catch((error) => {
      console.error("Error accessing microphone:", error);
    });
    this.recCount++;
  }
  isSaving = false;

  stopRecording() {
    this.isRecording = false;
    if (this.mediaRecorder) {
      this.isSaving = true;
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        this.ngZone.run(() => {
          this.uploadAudio(audioBlob);
          this.isSaving = false; // Angular will detect this change
          this.toggleDragDrop();
        });
      };
    }
  }
  
  async uploadAudio(audioBlob: Blob) {
    const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
    const fileData = {
      fileTitle: this.recCount > 0 ? `${audioFile.name.slice(0, 9)}(${this.recCount})${audioFile.name.slice(9)}` : audioFile.name,
      fileType: audioFile.type,
      fileName: audioFile.name,
      fileSize: audioFile.size,
      file: audioFile,
    };
  
    // Create a URL for the audio Blob
    const audioUrl = URL.createObjectURL(audioBlob);
  
    // Update the attachment with audio URL
    this.attachments.push(this.fb.control({ ...fileData, audioUrl }));
  
    // Trigger change detection
    // this.changeDetectorRef.detectChanges();
  }

  activities: any[] = [];
  getActivities(){
    this.projectService.getProjectActivities(this.selectedCategory.id).subscribe((res)=>{
      this.activities = res;
      console.log(res)
    })
  }
}