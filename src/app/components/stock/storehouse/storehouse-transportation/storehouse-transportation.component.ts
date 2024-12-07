import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ItemsService } from 'src/app/services/getAllServices/Items/items.service';
import { RepresentativeService } from 'src/app/services/getAllServices/Representative/representative.service';
import { TeamsService } from 'src/app/services/getAllServices/Teams/teams.service';
import { WarehouseService } from 'src/app/services/getAllServices/Warehouse/warehouse.service';
import { WarehouseTransService } from 'src/app/services/getAllServices/WarehouseTransport/warehouse-trans.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-storehouse-transportation',
  templateUrl: './storehouse-transportation.component.html',
  styleUrls: ['./storehouse-transportation.component.css']
})
export class StorehouseTransportationComponent implements OnInit {
  waresTransport:any[]=[];
  pageNumber=1;
  pageSize= 10;
  transportForm:FormGroup;

  apiUrl= environment.apiUrl;
  imgApiUrl=environment.imgApiUrl;

  teams:any[]=[];
  representatives:any[]=[];
  warehouses:any[]=[];

  constructor(private wareTrans: WarehouseTransService, private fb: FormBuilder, private warehouse: WarehouseService,
    private team: TeamsService, private repres: RepresentativeService,private http:HttpClient, private toast:ToastrService
,private itemService : ItemsService, private renderer:Renderer2,private cdr: ChangeDetectorRef

  ){
    this.transportForm = this.fb.group({
      name:['', Validators.required],
      localName:[''],
      note:[''],
      fromWarehouseId:['', Validators.required],
      toWarehouseId:['', Validators.required],
      receivingRequestNumber:[''],
      teamId:[''],
      representativeId:[''],
      items: this.fb.array([], Validators.required),
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([]),


    })
  }
  ngOnInit(): void {
    this.getAllWarehouseTransport() ;
    this.getAllRepresentatives();
    this.getAllTeams();
    this.getAllWarehouses();
    this.getAllItems();
   }
  buttons=['الاصناف','التعليقات','المهام','المرفقات']

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }


  getAllWarehouseTransport(){
    this.wareTrans.getWarehouseTransport(this.pageNumber, this.pageSize)
        .subscribe(data => {
          this.waresTransport = data.transfers;
          this.filteredTransport =this.waresTransport;
          this.totalCount = data.totalCount; // Assuming response contains totalCount
          this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
          console.log(this.waresTransport);
        }, error => {
          console.error('Error fetching tenant storehouse:', error);
        });
  }

  getAllTeams(){
    this.team.getTeams().subscribe(response => {
      this.teams = response.teams;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  teams:', error)
    });
  }

  itemList:any[]=[];
  getAllItems(){
    this.itemService.getAllItems().subscribe(response => {
      this.itemList = response.item1;
      console.log(this.itemList);
    }, error => {
      console.error('Error fetching  items:', error)
    })
  }
  getAllRepresentatives() {
    this.repres.getAllRepresentative().subscribe(response => {
      this.representatives = response;
      //console.log(this.representatives);
    }, error => {
      console.error('Error fetching  representatives:', error)
    })
  }

  getAllWarehouses() {
    this.warehouse.getAllWarehouses().subscribe(response => {
      this.warehouses = response.data;
      //console.log(this.warehouses);
    }, error => {
      console.error('Error fetching  warehouses:', error)
    })
  }

   // handle array of attachments
   fileNames: string[] = []; // Array to store file names

   get attachments(): FormArray {
     return this.transportForm.get('attachments') as FormArray;
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
  onSubmit() {
    const nameControl = this.transportForm.get('name');

    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.transportForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();
    formData.append('name', this.transportForm.get('name')!.value);
    formData.append('localName', this.transportForm.get('localName')!.value);
    formData.append('fromWarehouseId', this.transportForm.get('fromWarehouseId')!.value);
    formData.append('toWarehouseId', this.transportForm.get('toWarehouseId')!.value);
    formData.append('receivingRequestNumber', this.transportForm.get('receivingRequestNumber')!.value);
    formData.append('teamId', this.transportForm.get('teamId')!.value);
    formData.append('representativeId', this.transportForm.get('representativeId')!.value);
    formData.append('note', this.transportForm.get('note')!.value);

    this.items.controls.forEach((item, index) => {
      const itemValue = item.value;
      formData.append(`Items[${index}].itemId`, itemValue.itemId);
      formData.append(`Items[${index}].transferredQuantity`, itemValue.transferredQuantity);
      formData.append(`Items[${index}].unit`, itemValue.unit);
  });
  this.attachments.controls.forEach((control) => {
    const file = control.value;
    if (file) {
      formData.append('AttachmentFiles', file); // Append each file under 'AttachmentFiles'
    }
  });
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });
  
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant') || ''  // Add your tenant value here
    });
  
    this.http.post(this.apiUrl + 'StoresSection/warehouse-transfer?', formData, { headers })
      .subscribe(
        (response: any) => {
          console.log('Response:', response);
          this.toast.success('تمت الإضافة بنجاح');
          this.getAllWarehouseTransport();
          const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
          if (modalInstance) {
            modalInstance.hide();
          }
          // Ensure proper cleanup after modal closure
          setTimeout(() => {
            document.body.classList.remove('modal-open');
            
            document.body.style.overflow = '';
          }, 300);

          this.transportForm.reset({
            name:[''],
            localName:[''],
            note:[''],
            fromWarehouseId:[''],
            toWarehouseId:[''],
            receivingRequestNumber:[''],
            teamId:[''],
            representativeId:[''],
            items: this.fb.array([]),
          });
          this.transportForm.reset();
          this.items.clear();
        },
        (error: any) => {
          console.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
        }
      );
  }

  
  // select checkbox
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  // Set each item's checked status to match selectAll
  this.waresTransport.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.waresTransport.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.waresTransport.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.waresTransport.filter(item => item.checked).length;
}

// Update
isModalOpen = false;
storesSec:any[] =[];
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
    this.transportForm.patchValue({
      name: this.selectedCategory.name,
      localName: this.selectedCategory.localName,
      note: this.selectedCategory.note,
      fromWarehouseId: this.selectedCategory.fromWarehouseId,
      toWarehouseId: this.selectedCategory.toWarehouseId,
      receivingRequestNumber: this.selectedCategory.receivingRequestNumber,
      teamId: this.selectedCategory.teamId,
      representativeId: this.selectedCategory.representativeId,
    });
    this.attachments.clear();
      if (this.selectedCategory.attachments?.length) {
        this.selectedCategory.attachments.forEach((attachment: any) => {
          this.attachments.push(this.fb.group({ file: attachment })); // Existing attachment
          console.log(this.attachments.controls);
        });
      }
    this.isModalOpen = true;
  } else {
    alert('Please select a type category to update.');
  }
}

closeModal() {
  this.isModalOpen = false;
  this.resetAttachments();
}
resetAttachments(){
  this.attachments.clear();
}

updateCategory() {
  if (this.transportForm.valid) {
    const updatedCategory = { ...this.transportForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.wareTrans.updateTransport(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Unit category updated successfully:', response);
        this.toast.success('تم تحديث البيانات بنجاح')
        // Update the local categories array if necessary
        const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.storesSec[index] = updatedCategory;
        }

        this.getAllWarehouseTransport();
        this.closeModal();  // Close the modal after successful update
      },
      (error) => {
        console.error('Error updating unit category:', error);
        console.log('Updated unit category Data:', updatedCategory);
        // alert('An error occurred while updating the item type .');
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
      }
    );
  }else{
    this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى")
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
  const selectedItems = this.waresTransport.filter(item => item.checked);

  if (selectedItems.length === 0) {
    this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
    return;
  }

  const successfulDeletions: number[] = [];
  const failedDeletions: { id: number; error: any }[] = [];

  selectedItems.forEach((item, index) => {
    this.wareTrans.deleteTransportById(item.id).subscribe({
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
  this.waresTransport = this.waresTransport.filter(item => !successfulDeletions.includes(item.id));

  // Update selected count
  this.selectedCount = this.waresTransport.filter(item => item.checked).length;

  // Log results
  console.log('Deleted successfully:', successfulDeletions);
  console.log('Failed to delete:', failedDeletions);

  // Refresh the table or data if needed
  this.getAllWarehouseTransport();

  // Show final message
  if (failedDeletions.length > 0) {
    this.toast.warning(
      `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,
    
    );
    this.getAllWarehouseTransport();
    this.closeConfirmationModal();
  } else {
    this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
    this.getAllWarehouseTransport();
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


// Add items table
get items(): FormArray {
  return this.transportForm.get('items') as FormArray;
}
tableData = [
  {
    selectedItemId: null,
    receivedQuantity: '',
    unit: '',
    unitPrice: 0,
    tax: 0,
    discount: 0,
    note: '',
  },
];
removeItem(index: number) {
  this.items.removeAt(index);
}
addItem() {
  const item = this.fb.group({
    itemId: [0],
    transferredQuantity: [0],
    unit: ['']
  });
  this.items.push(item);
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
    this.getAllWarehouseTransport();
  }
}

 // Filter data based on search term
 filteredTransport: any[] = [];   // Holds the filtered results (used for search)
 searchQuery: string = '';          // Holds the search query
 totalRecords: number = 0;
 offers: any[] = [];
 getWarehousesTransWithoutPaging() {
   this.wareTrans.getAllWarehouseTransport().subscribe(response => {
     this.storesSec = response.transfers;
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
     this.getWarehousesTransWithoutPaging();
   } else {
     // If no search query, fetch paginated data
     this.getAllWarehouseTransport();
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
     this.filteredTransport = this.waresTransport.filter(item =>
       (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
       (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
       (item.toWarehouse && item.toWarehouse.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
       (item.fromWarehouse && item.fromWarehouse.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
       (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase())) ||
       (item.note && item.note.toLowerCase().includes(this.searchQuery.toLowerCase()))
     )
 
   } else {
     // If no search query, reset to show all fetched data
     this.waresTransport = this.waresTransport;
   }
 }
}
