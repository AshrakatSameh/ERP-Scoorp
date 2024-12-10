import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { ContractService } from 'src/app/services/getAllServices/Contracts/contract.service';
import { LocationService } from 'src/app/services/getAllServices/Location/location.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { UserService } from 'src/app/services/getAllServices/Users/user.service';
import { environment } from 'src/environments/environment.development';
import * as L from 'leaflet';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css']
})
export class ContractsComponent implements OnInit {

  isFirstButtonClicked = false;
  isSecondButtonClicked = false;

  istableview = true;
  iscardsview = false;

  isMapView = false;
  pageNumber: number = 1;
  pageSize: number = 10;
  contracts: any[] = [];
  contractForm!: FormGroup;
  apiUrl = environment.apiUrl;
  clients: any[] = [];
  users: any[] = [];
  teams: any[] = [];
  locations: any[] = [];

  longitude!: number;
  latitude!: number;
  locationName!: string;
  locationAddress!: string;
  google: any;
  map: L.Map | undefined;
  locationLinks: string[] = []; // Initialize an array to hold location links

  storesSec:any[] =[];
  isModalOpen = false;
  selectedCategory: any = null;

  comments:any[] =[];
  imgApiUrl= environment.imgApiUrl;

  paymentForm:FormGroup;
  commentForm:FormGroup;

  constructor(private cnotractService: ContractService, private fb: FormBuilder, private http: HttpClient,
    private clientService: ClientsService, private userService: UserService, private teamService: TeamsService
    , private locarionService: LocationService, private toast:ToastrService, private renderer:Renderer2,
  ) {

     // Initialize the form with default values and validation
    this.paymentForm = this.fb.group({
      amount: [0, Validators.required],
      dueDate: [new Date().toISOString(), Validators.required],
      isPaid: ['', Validators.required],
      contractId: ['']
      // You can modify contractId as needed
    });


    this.contractForm = this.fb.group({
      name: ['', Validators.required],
      localName: ['', Validators.required],
      clientId: ['', Validators.required],
      assignedToId: ['', Validators.required],
      teamId: ['', Validators.required],
      userIds: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      code: ['', Validators.required],
      locationLinks: fb.array([]),
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
    this.getcontracts();
    this.getAllClients();
    this.getAllUsers();
    this.getAllTeams();
    this.getLocations();

    // this.initializeMap();

  }

  isCodeVisible = false;
  toggleCode(): void {
    this.isCodeVisible = !this.isCodeVisible;  // Toggle the visibility
  }

  getcontracts() {
    this.cnotractService.getPagingContracts(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.contracts = data.contracts;
        this.filteredContract = this.contracts;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        // console.log(this.contracts)
      }, error => {
        console.error('Error fetching employees data:', error);
      });
  }
  getLocations() {
    this.locarionService.getLocations().subscribe(response => {
      this.locations = response.data;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  locations:', error)
    })
  }

  getAllClients() {
    this.clientService.getCliensts().subscribe(response => {
      this.clients = response.data;
      //console.log(this.clients);
    }, error => {
      console.error('Error fetching  clients:', error)
    })
  }

  getAllUsers() {
    this.userService.getUsers().subscribe(response => {
      this.users = response;
      //console.log(this.users);
    }, error => {
      console.error('Error fetching  Users:', error)
    })
  }

  getAllTeams() {
    this.teamService.getTeams().subscribe(response => {
      this.teams = response.teams;
      console.log(this.teams);
    }, error => {
      console.error('Error fetching  teams:', error)
    })
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
    formData.append('name', this.contractForm.get('name')?.value);
    formData.append('localName', this.contractForm.get('localName')?.value);
    formData.append('clientId', this.contractForm.get('clientId')?.value);
    formData.append('assignedToId', this.contractForm.get('assignedToId')?.value);
    formData.append('teamId', this.contractForm.get('teamId')?.value);
    formData.append('userIds', this.contractForm.get('userIds')?.value);
    formData.append('startDate', this.contractForm.get('startDate')?.value);
    formData.append('endDate', this.contractForm.get('endDate')?.value);
    formData.append('code', this.contractForm.get('code')?.value);

    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant')||''  // Add your tenant value here
    });
  
    this.http.post(this.apiUrl+'Contract/CreateContract', formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        // alert('submit successfully');
        this.toast.success('تم الإضافة بنجاح');
        this.getcontracts();
        this.contractForm.reset();
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
        this.closeModal();
      }, error => {
        console.error('Error:', error);
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      });
  }


  onSubmitLocation(form: any) {
    if (form.valid) {
      const formData = {
        locationName: form.value.locationName,
        locationAddress: form.value.locationAddress,
        latitude: form.value.latitude,
        longitude: form.value.longitude,


      };

      this.locarionService.createLocation(formData).subscribe(response => {
        console.log('Data submitted successfully', response);
        alert('Data submitted successfully')
      }, error => {
        console.error('Error occurred while submitting data', error);
      });
    }

  }





  addLocationLink() {
    this.locationLinks.push(''); // Add an empty string to allow user to input a new location link
  }

  removeLocationLink(index: number) {
    this.locationLinks.splice(index, 1); // Remove the specified location link
  }

  toggleMap() {
    this.isMapView = true
  }
  toggleMapClose() {
    this.isMapView = false;
  }

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

  isDropdownOpen = false;
  isRowRemoved = false;

  openDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.removeRow();
    }
  }

  removeRow() {
    this.isRowRemoved = true;
  }

  buttons = ['التفاصيل', 'المهام', 'الاستبيانات', 'التعليقات', 'مالية العقد', 'اقساط العقد']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  // Update contract


onCheckboxChange(category: any) {
  this.updateSelectAll();
  this.selectedCategory = category;  // Store the selected category data
}

openModalForSelected() {
  if (this.selectedCategory) {
    this.contractForm.patchValue({
      name: this.selectedCategory.name,
      localName: this.selectedCategory.localName,
      clientId: this.selectedCategory.clientId,
      assignedToId: this.selectedCategory.assignedToId,
      teamId: this.selectedCategory.teamId,
      userIds: this.selectedCategory.userIds,
      startDate: this.selectedCategory.startDate,
      endDate: this.selectedCategory.endDate,
      code: this.selectedCategory.code,
    });
    // Retrive the Comments
    this.getComments();
    this.isModalOpen = true;
  } else {
    alert('Please select a category to update.');
  }
}

closeModal() {
  this.contractForm.reset();
  this.isModalOpen = false;
  this.selectedCategory =null;
}

updateCategory() {
  if (this.contractForm.valid) {
    const updatedCategory = { ...this.contractForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.cnotractService.updateItem(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Contract updated successfully:', response);
        this.toast.success('تم التحديث بينجاح')
        // Update the local categories array if necessary
        const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.storesSec[index] = updatedCategory;
        }

        this.getcontracts();
        this.contractForm.reset();
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
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



  showConfirmationModal = false;

  openConfirmationModal() {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
  }
deleteItemType(){
  const selectedItems = this.filteredContract.filter(item => item.checked);

  if (selectedItems.length === 0) {
    this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
    return;
  }

  const successfulDeletions: number[] = [];
  const failedDeletions: { id: number; error: any }[] = [];

  selectedItems.forEach((item, index) => {
    this.cnotractService.deleteItemById(item.id).subscribe({
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
  this.filteredContract = this.filteredContract.filter(item => !successfulDeletions.includes(item.id));

  // Update selected count
  this.selectedCount = this.filteredContract.filter(item => item.checked).length;

  // Log results
  console.log('Deleted successfully:', successfulDeletions);
  console.log('Failed to delete:', failedDeletions);

  // Refresh the table or data if needed
  this.getcontracts();

  // Show final message
  if (failedDeletions.length > 0) {
    this.toast.warning(
      `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

    );
    this.getcontracts();
    this.closeConfirmationModal();
  } else {
    this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
    this.getcontracts();
    this.closeConfirmationModal();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
}


totalCount: number = 0; // Total count of items from the API

totalPages: number = 0; // Total number of pages
changePage(newPageNumber: number): void {
  if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
    this.pageNumber = newPageNumber;
    this.getcontracts();
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
  { name: 'endDate', displayName: 'تاريخ الإنتهاء', visible: false },
  { name: 'teamName', displayName: 'الفريق', visible: false },
  { name: 'assignedToName', displayName: 'موقع العقد', visible: false },

];


showDropdownCols= false;
toggleDropdownCols() {
  this.showDropdownCols = !this.showDropdownCols; // Toggle the dropdown visibility
  console.log('Dropdown visibility:', this.showDropdownCols); // Check if it’s toggling
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

  // select checkbox
  selectAll = false;

  selectedCount = 0;
  
  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.contracts.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.contracts.length : 0;
  }
  
  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.contracts.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.contracts.filter(item => item.checked).length;
  }
  


   // ازرار الاجراءات
   isDropdownOpen2: boolean = false;
   private documentClickListener: any; // Listener reference for cleanup
 
   toggleDropdownOptions(): void {
     this.isDropdownOpen2 = !this.isDropdownOpen2;
 
     // Add document click listener when the dropdown is open
     if (this.isDropdownOpen2) {
       this.documentClickListener = this.renderer.listen('document', 'click', (event: Event) => {
         const targetElement = event.target as HTMLElement;
         const clickedInsideDropdown = targetElement.closest('.dropdown'); // Check if click is inside dropdown
         if (!clickedInsideDropdown) {
           this.isDropdownOpen2 = false; // Close the dropdown
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
 
 
 
 


//  Post single installment
// Method to submit the payment data from the form
submitInstallment() {
 
  const paymentData = {
    ...this.paymentForm.value,
    contractId: this.selectedCategory?.id || '' // Use the selected row's id if available
  };


  // Prepare headers
  const headers = new HttpHeaders({
    'tenant': localStorage.getItem('tenant')||''  // Add your tenant value here
  });

  // Send the POST request directly within the method
  this.http.post(this.apiUrl+'Contract/AddSingleInstallment', paymentData, { headers })
    .subscribe(
      response => {
        console.log('Payment submitted successfully:', response);
        // Handle success (e.g., show a success message)
      },
      error => {
        console.error('Error submitting payment:', error);
        // Handle error (e.g., show an error message)
      }
    );
}

// Filter data based on search term
filteredContract: any[] = [];   // Holds the filtered results (used for search)
searchQuery: string = '';          // Holds the search query
totalRecords: number = 0;
offers: any[] = [];
getContractWithoutPaging() {
  this.cnotractService.getAllContracts().subscribe(response => {
    this.storesSec = response.contracts;
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
    this.getContractWithoutPaging();
  } else {
    // If no search query, fetch paginated data
    this.getcontracts();
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
    this.filteredContract = this.contracts.filter(item =>
      (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.note && item.note.toUpperCase().includes(this.searchQuery.toUpperCase()))
    )

  } else {
    // If no search query, reset to show all fetched data
    this.filteredContract = this.contracts;
  }
}

  // Add Comment Logic
  addComment(parent:any =''){
    this.cnotractService.postContractComment({
      Content:this.commentForm.controls['content'].value,
      EntityId:this.selectedCategory.id,
      ParentCommentId:parent
    }).subscribe((res)=> console.log(res));
    this.getComments();
    this.commentForm.reset();
    if(parent) this.replayId = '';
  }

  getComments(){
    this.cnotractService.getContractComments(this.selectedCategory.id).subscribe((res)=>{
      this.comments = res;
    })
  }
  replayId:any;
  toggleReplay(commentId:any){
    this.replayId = commentId;
  }
}
