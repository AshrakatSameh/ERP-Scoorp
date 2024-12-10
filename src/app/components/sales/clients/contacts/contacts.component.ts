import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ClientsService } from 'src/app/services/getAllServices/Clients/clients.service';
import { ContactsService } from 'src/app/services/getAllServices/Contacts/contacts.service';
import { ContractService } from 'src/app/services/getAllServices/Contracts/contract.service';
import { LocationService } from 'src/app/services/getAllServices/Location/location.service';
import { NationalityService } from 'src/app/services/getAllServices/Nationality/nationality.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  pageNumber: number = 1;
  pageSize: number = 10;
  contacts:any []=[];
  location:any[]=[];
  contactForm:FormGroup;

  isModalOpen = false;
  selectedCategory: any = null;

  apiUrl= environment.apiUrl +'Contact';
  imgApiUrl=environment.imgApiUrl;
  constructor(private contactService:ContactsService, private locationService:LocationService,
    private clientService:ClientsService, private fb:FormBuilder, private http:HttpClient,
    private toast: ToastrService, private nationality: NationalityService,private renderer : Renderer2
  ){
    
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
    });
  }

  ngOnInit(): void {
    this.getAllContacts();
    this.getLocations();
    this.getClients();
    this.getNationalities()
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
  

  getAllContacts() {
    this.contactService.getAllContacts(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.contacts = data.contacts;
        this.filteredContacts= this.contacts;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        //console.log(this.contacts);
      }, error => {
        console.error('Error fetching contacts data:', error);
      });
  }

  
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
      });
  }

  clients:any[]=[]
  getClients() {
    this.clientService.getCliensts()
      .subscribe(data => {
        this.clients = data.data;
        console.log(this.clients);
      }, error => {
        console.error('Error fetching clients data:', error);
      });
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.contactForm.get('attachments') as FormArray;
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
  onSubmit() {
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

  // Update
onCheckboxChange(category: any) {
  this.updateSelectAll();
  this.selectedCategory = category;  // Store the selected category data
}

openModalForSelected() {
  if (this.selectedCategory) {
    this.contactForm.patchValue({
      name: this.selectedCategory.name,
      localName: this.selectedCategory.localName,
      phoneNumber1: this.selectedCategory.phoneNumber1,
      phoneNumber2: this.selectedCategory.phoneNumber2,
      jobTitle: this.selectedCategory.jobTitle,
      email: this.selectedCategory.email,
      locationLinks: this.selectedCategory.locationLinks,
      nationality: this.selectedCategory.nationality,
      clientId: this.selectedCategory.clientId,
      supplier: this.selectedCategory.supplier,
      description: this.selectedCategory.description,
    });

    this.isModalOpen = true;
  } else {
    alert('Please select a row to update.');
  }
}

closeModal() {
  this.isModalOpen = false;
  this.selectedCategory =null;
}

storesSec:any[] =[];

updateCategory() {
  if (this.contactForm.valid) {
    const updatedCategory = { ...this.contactForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.contactService.updateItem(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Category updated successfully:', response);
        this.toast.success('تم تحديث البيانات بنجاح')
        // Update the local categories array if necessary
        const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.storesSec[index] = updatedCategory;
        }

        this.getAllContacts();
        this.closeModal();  // Close the modal after successful update
      },
      (error: HttpErrorResponse) => {
        console.error('Error updating category:', error);
        console.log('Updated Category Data:', updatedCategory);
        // alert('An error occurred while updating the item type .');
        this.toast.warning('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      }
    );
    }
    else{
      this.toast.warning('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
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
deleteItemType(){
  const selectedItems = this.filteredContacts.filter(item => item.checked);

  if (selectedItems.length === 0) {
    this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
    return;
  }

  const successfulDeletions: number[] = [];
  const failedDeletions: { id: number; error: any }[] = [];

  selectedItems.forEach((item, index) => {
    this.contactService.deleteById(item.id).subscribe({
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
  this.filteredContacts = this.filteredContacts.filter(item => !successfulDeletions.includes(item.id));

  // Update selected count
  this.selectedCount = this.filteredContacts.filter(item => item.checked).length;

  // Log results
  console.log('Deleted successfully:', successfulDeletions);
  console.log('Failed to delete:', failedDeletions);

  // Refresh the table or data if needed
  this.getAllContacts();

  // Show final message
  if (failedDeletions.length > 0) {
    this.toast.warning(
      `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

    );
    this.getAllContacts();
    this.closeConfirmationModal();
  } else {
    this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
    this.getAllContacts();
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
    this.getAllContacts();
  }
}

  
// select checkbox
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  // Set each item's checked status to match selectAll
  this.contacts.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.contacts.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.contacts.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.contacts.filter(item => item.checked).length;
}

 // Filter data based on search term
 filteredContacts: any[] = [];   // Holds the filtered results (used for search)
 searchQuery: string = '';          // Holds the search query
 totalRecords: number = 0;
 offers: any[] = [];
 getContactWithoutPaging() {
   this.contactService.getAllContactsWithoutPaging().subscribe(response => {
    this.contacts = response.contacts;
    this.applySearchFilter(); // Filter data based on search query
 
   }, error => {
     console.error('Error fetching contacts: ', error)
   }
   )
 }
 // Method to fetch and display data based on search condition
 fetchSaleOffers() {
   // Check if there's a search query that is not empty
   if (this.searchQuery && this.searchQuery.trim() !== '') {
     // If there's a search query, fetch all data without pagination
     this.getContactWithoutPaging();
   } else {
     // If no search query, fetch paginated data
     this.getAllContacts();
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
     this.filteredContacts = this.contacts.filter(item =>
      (item.email && item.email.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.phoneNumber1 && item.phoneNumber1.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
       (item.phoneNumber2 && item.phoneNumber2.toLowerCase().includes(this.searchQuery.toLowerCase()))
     )
 
   } else {
     // If no search query, reset to show all fetched data
     this.filteredContacts = this.contacts;
   }
 }

 
}
