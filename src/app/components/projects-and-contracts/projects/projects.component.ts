import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ProjactService } from 'src/app/services/getAllServices/Projects/projact.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment.development';
import { Toast, ToastrService } from 'ngx-toastr';
import { LocationService } from 'src/app/services/getAllServices/Location/location.service';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { UserService } from 'src/app/services/getAllServices/Users/user.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import * as bootstrap from 'bootstrap';

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
  imgApiUrl= environment.imgApiUrl;
  commentForm:FormGroup;

  comments:any[] =[];


  constructor(private projectService: ProjactService, private http: HttpClient,
    private fb: FormBuilder, private toast: ToastrService, private locationServ: LocationService,
    private clientService: ClientsService, private userServ: UserService, private renderer: Renderer2,
    private teamServ: TeamsService
  ) {


    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      clientId: [''],
      assignedToId: [''],
      teamId: [''],
      userIds: this.fb.array([]),
      startDate: [null],
      endDate: [null],
      locations: [],

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

  ngOnInit(): void {
    this.toggleTableonClick();
    this.getAllProjects();
    this.getAllLocations();
    this.getAllClients();
    this.getAllTeams();
    this.getAllUsers();
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

  // isDropdownOpen = false;
  // isRowRemoved = false;

  // openDropdown() {
  //   this.isDropdownOpen = !this.isDropdownOpen;
  //   if (this.isDropdownOpen) {
  //     this.removeRow();
  //   }
  // }

  // removeRow() {
  //   this.isRowRemoved = true;
  // }

  buttons = ['التفاصيل', 'المهام', 'الاستبيانات', 'التعليقات', 'مالية المشروع']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
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
  users: any[] = [];
  getAllUsers() {
    this.userServ.getUsers().subscribe(
      (response) => {
        this.users = response;
      },
      (error) => {
        console.error('Error fetching users section:', error); // Handle errors
      }
    )
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
  onSubmit() {
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

    this.http.post(this.api, formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        this.toast.success("تم الإضافة بنجاح");
        this.getAllProjects();
        this.projectForm.reset();
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
      });

      this.isModalOpen = true;
    } else {
      alert('الرجاء تحديد العنصر');
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory =null;
  }

  updateCategory() {
    if (this.projectForm.valid) {
      const updatedCategory = { ...this.projectForm.value, id: this.selectedCategory.id };

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
}
