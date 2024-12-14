import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ItemsService } from 'src/app/services/getAllServices/Items/items.service';
import { ItemTypeService } from 'src/app/services/getAllServices/itemType/item-type.service';
import { PriceListService } from 'src/app/services/getAllServices/PriceList/price-list.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.css']
})
export class PriceListComponent implements OnInit {

  priceListForm!:FormGroup;
  pageNumber: number = 1;
  pageSize: number = 10;
  lists:any[]=[];
  apiUrl= environment.apiUrl+'PriceList/Create'
  imgApiUrl=environment.imgApiUrl;
  constructor(private fb:FormBuilder, private priceService:PriceListService, private http:HttpClient,
    private toast: ToastrService, private itemService:ItemsService, private renderer:Renderer2,
    private ngZone:NgZone
  ){
    this.priceListForm = this.fb.group({
      name:['', Validators.required],
      localName:['', Validators.required],
      description:['', Validators.required],
      code:['', Validators.required],
      priceListItems:this.fb.array([]),
      attachments: this.fb.array([])
      
    })
  }

  ngOnInit(): void {
    this.getAllPriceLists();
    this.getAllItems();
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


  buttons = ['الأصناف', 'الملاحظات', 'المهام', 'مرفقات']
  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  getAllPriceLists() {
    this.priceService.getPriceListsWithPaging(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.lists = data.data;
        this.filteredLists = this.lists;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        //console.log(this.contacts);
      }, error => {
        console.error('Error fetching price lists data:', error);
      });
  } 


   // handle array of attachments
   fileNames: string[] = []; // Array to store file names

   get attachments(): FormArray {
     return this.priceListForm.get('attachments') as FormArray;
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
    this.toggleDragDrop();
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
     if(this.attachments.length==0) this.toggleDragDrop();
   }
 
   @ViewChild('myModal', { static: false }) modal!: ElementRef;
   ngAfterViewInit(): void {
     this.modal.nativeElement.addEventListener('hidden.bs.modal', () => {
       // Fallback cleanup in case Bootstrap doesn't properly clean up
       document.body.classList.remove('modal-open');
       document.body.style.overflow = '';
     });
   }
  // onSubmitAdd(){

  //   const formData = new FormData();
  //   const name = this.priceListForm.get('name')!.value;
  //   const localName = this.priceListForm.get('localName')!.value;
  //   const code = this.priceListForm.get('code')!.value;
  //   const description = this.priceListForm.get('description')!.value;

   
  //     formData.append('name', name);
  //     formData.append('localName', localName);
  //     formData.append('code', code);
  //     formData.append('description', description);
  //     this.attachments.controls.forEach((control) => {
  //       const file = control.value;
  //       if (file) {
  //         formData.append('AttachmentFiles', file); // Append each file under 'AttachmentFiles'
  //       }
  //     });
  
      
  
  //    // Append PriceListItems array
  // const priceListItems = this.priceListForm.get('priceListItems') as FormArray;
  // priceListItems.controls.forEach((item, index) => {
  //   formData.append(`PriceListItems[${index}].itemId`, item.get('itemId')?.value);
  //   formData.append(`PriceListItems[${index}].description`, item.get('description')?.value);
  //   formData.append(`PriceListItems[${index}].unitPrice`, item.get('unitPrice')?.value);
  //   formData.append(`PriceListItems[${index}].unit`, item.get('unit')?.value);
  //   formData.append(`PriceListItems[${index}].tax`, item.get('tax')?.value);
  //   formData.append(`PriceListItems[${index}].discount`, item.get('discount')?.value);
  // });

  //   const tenantId = localStorage.getItem('tenant');
  //   const headers = new HttpHeaders({
  //     tenant: tenantId || '', // Set tenantId header if available
  //     'Content-Type': 'application/json',
  //   });
  //   const url = `${this.apiUrl}?Name=${encodeURIComponent(name)}&LocalName=${encodeURIComponent(localName)}&Code=${encodeURIComponent(code)}&Description=${encodeURIComponent(description)}`;
  //   this.http.post<any>(url, formData,{headers}).subscribe(
  //     (response) => {
  //       console.log('Price list created successfully:', response);
  //       // Reset form after successful submission
  //       this.priceListForm.reset();
  //       this.getAllPriceLists();
  //       this.toast.success('تمت الإضافة بنجاح');
         
  //         // Close the modal programmatically
  //         const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
  //         if (modalInstance) {
  //           modalInstance.hide();
  //         }
  //         // Ensure proper cleanup after modal closure
  //         setTimeout(() => {
  //           document.body.classList.remove('modal-open');
            
  //           document.body.style.overflow = '';
  //         }, 300);
  //         this.attachments.clear();
  //     },
  //     (error: HttpErrorResponse) => {
  //       console.error('Error creating Client:', error.error);
  //       this.toast.error(error.error)
  //       // Handle error
  //     }
  //   );
  // }
  onSubmit() { 
    const formData = new FormData();
  
    // Basic fields
    const name = this.priceListForm.get('name')?.value;
    const localName = this.priceListForm.get('localName')?.value;
    const code = this.priceListForm.get('code')?.value;
    const description = this.priceListForm.get('description')?.value;
  
      formData.append('name', name);
      formData.append('localName', localName);
      formData.append('code', code);
      formData.append('description', description);
      this.attachments.controls.forEach((control) => {
        const fileData = control.value;
        if (fileData && fileData.file instanceof File) {
          // Append the actual file object
          formData.append('attachmentFiles', fileData.file, fileData.fileTitle);
        }
      });
  
    // Append PriceListItems array
    const priceListItems = this.priceListForm.get('priceListItems') as FormArray;
    priceListItems.controls.forEach((item, index) => {
      formData.append(`PriceListItems[${index}].itemId`, item.get('itemId')?.value);
      formData.append(`PriceListItems[${index}].description`, item.get('description')?.value);
      formData.append(`PriceListItems[${index}].unitPrice`, item.get('unitPrice')?.value);
      formData.append(`PriceListItems[${index}].unit`, item.get('unit')?.value);
      formData.append(`PriceListItems[${index}].tax`, item.get('tax')?.value);
      formData.append(`PriceListItems[${index}].discount`, item.get('discount')?.value);
    });
  
    // Set headers without Content-Type to let Angular set it automatically for FormData
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenant header if available
    });
  
    const url = `${this.apiUrl}`; // Replace with actual API endpoint
  
    // POST request
    this.http.post<any>(url, formData, { headers }).subscribe(
      (response) => {
        // alert('Done');
        console.log('Price list created successfully:', response);
        this.getAllPriceLists();
        this.toast.success('تمت الإضافة بنجاح');
         
          // Close the modal programmatically
          const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
          if (modalInstance) {
            modalInstance.hide();
          }
          // Ensure proper cleanup after modal closure
          setTimeout(() => {
            document.body.classList.remove('modal-open');
            
            document.body.style.overflow = '';
          }, 300);
          this.priceListForm.reset();
          this.attachments.clear();
      },
      (error: HttpErrorResponse) => {
        console.error('Error creating PriceList:', error.error);
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      }
    );
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

// Method to remove an item from the FormArray
get priceListItems(): FormArray {
  return this.priceListForm.get('priceListItems') as FormArray;
}
tableData = [
  {
    selectedItemId: null,
    quantity: '',
    unit: '',
    unitPrice: 0,
    tax: 0,
    discount: 0,
    note: '',
  },
];
removeItem(index: number) {
  this.priceListItems.removeAt(index);
}
addDeliveryNoteItem() {
  const item = this.fb.group({
    itemId: [0],
    description: [''],
    unitPrice: [0],
    unit: [''],
    tax: [0],
    discount: [0]
  });
  this.priceListItems.push(item);
}


// Update

storesSec:any[] =[];
  isModalOpen = false;
  selectedCategory: any = null;
onCheckboxChange(category: any) {
  this.updateSelectAll();
  this.selectedCategory = category;  // Store the selected category data
}

openModalForSelected() {
  if (this.selectedCategory) {
    this.priceListForm.patchValue({
      name: this.selectedCategory.name,
      localName: this.selectedCategory.localName,
      note: this.selectedCategory.note,
      description: this.selectedCategory.code,
    });

    this.isModalOpen = true;
  } else {
    alert('Please select a category to update.');
  }
}

closeModal() {
  this.isModalOpen = false;
  this.selectedCategory =null;
}

updateCategory() {
  if (this.priceListForm.valid) {
    const updatedCategory = { ...this.priceListForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.priceService.updatePriceList(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Category updated successfully:', response);
        this.toast.success('Item type updated successfully')
        // Update the local categories array if necessary
        const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.storesSec[index] = updatedCategory;
        }

        this.getAllPriceLists();
        this.closeModal();  // Close the modal after successful update
      },
      (error) => {
        console.error('Error updating category:', error);
        console.log('Updated Category Data:', updatedCategory);
        // alert('An error occurred while updating the item type .');
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error(errorMessage, 'Error'); 
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
  const selectedItems = this.filteredLists.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.priceService.deletePriceById(item.id).subscribe({
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
    this.filteredLists = this.filteredLists.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredLists.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllPriceLists();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllPriceLists();
      this.closeConfirmationModal();
    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.getAllPriceLists();
      this.closeConfirmationModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
 // select checkbox

 selectAll = false;

 selectedCount = 0;
 
 toggleAllCheckboxes() {
   // Set each item's checked status to match selectAll
   this.lists.forEach(item => (item.checked = this.selectAll));
   // Update the selected count
   this.selectedCount = this.selectAll ? this.lists.length : 0;
 }
 
 updateSelectAll() {
   // Update selectAll if all items are checked
   this.selectAll = this.lists.every(item => item.checked);
   // Calculate the number of selected items
   this.selectedCount = this.lists.filter(item => item.checked).length;
 }

 totalCount: number = 0; // Total count of items from the API

 totalPages: number = 0; // Total number of pages
 changePage(newPageNumber: number): void {
   if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
     this.pageNumber = newPageNumber;
     this.getAllPriceLists();
   }
 }
  // Filter data based on search term
  filteredLists: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getListsWithoutPaging() {
    this.priceService.getAllPriceLists().subscribe(response => {
      this.lists = response.data;
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
      this.getListsWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllPriceLists();
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
      this.filteredLists = this.lists.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )
  
    } else {
      // If no search query, reset to show all fetched data
      this.filteredLists = this.lists;
    }
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
}
