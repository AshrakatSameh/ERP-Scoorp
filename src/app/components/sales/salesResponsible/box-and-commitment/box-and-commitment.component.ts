import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConvenantBoxService } from 'src/app/services/getAllServices/ConvenantBox/convenant-box.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-box-and-commitment',
  templateUrl: './box-and-commitment.component.html',
  styleUrls: ['./box-and-commitment.component.css']
})
export class BoxAndCommitmentComponent implements OnInit{
  pageNumber: number = 1;
  pageSize: number = 10;
  
  storesSec:any[] =[];
  isModalOpen = false;
  selectedCategory: any = null;
  // conBoxForm={
  //   CovenantBoxName:'',
  //   Code:'',
  //   Description:''
  // }
  convBoxForm:FormGroup;
  constructor(private convenantBox:ConvenantBoxService,private http:HttpClient,
     private fb:FormBuilder, private toast:ToastrService){
    this.convBoxForm= this.fb.group({
      covenantBoxName: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', Validators.required],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
  });


// this.getAllConvenantBoxes();

}
  ngOnInit(): void {
    this.getAllConvenantBoxesWithpaging() 
  }
 
apiUrl=environment.apiUrl;

isDropdownOpen: boolean = false;

toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
}

closeDropdown() {
  this.isDropdownOpen = false;
}

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.convBoxForm.get('attachments') as FormArray;
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
  const formData = new FormData();
  formData.append('covenantBoxName', this.convBoxForm.get('covenantBoxName')?.value);
  formData.append('code', this.convBoxForm.get('code')?.value);
  formData.append('description', this.convBoxForm.get('description')?.value);
    // Append each attachment file
    this.attachments.controls.forEach((control) => {
      const file = control.value;
      if (file) {
        formData.append('AttachmentFiles', file); // Append each file under 'AttachmentFiles'
      }
    });

  const headers = new HttpHeaders({
    'tenant': localStorage.getItem('tenant')||''  // Add your tenant value here
  });

  this.http.post(this.apiUrl+'CovenantBox', formData, { headers })
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
      this.convBoxForm.reset();
      this.getAllConvenantBoxes();
    }, error => {
      console.error('Error:', error);
      this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
    });
}
convenantAndBox:any[]=[];
getAllConvenantBoxes() {
  this.convenantBox.getConvenantBoxes().subscribe(response => {
    this.convenantAndBox = response.covenantBoxes;
    this.applySearchFilter();
    //console.log(this.salesOffers);
  }, error => {
    console.error('Error fetching covenant data:', error)
  })
}
getAllConvenantBoxesWithpaging() {
  this.convenantBox.getAllConvenantBoxesWithPaging(this.pageNumber, this.pageSize).subscribe(response => {
    this.convenantAndBox = response.covenantBoxes;
  
    this.filteredConvenentBoxes= this.convenantAndBox;
    this.totalCount = response.totalCount; // Assuming response contains totalCount
    this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
    //console.log(this.covenantOffers);
  }, error => {
    console.error('Error fetching covenant data:', error)
  })
}

selectedForDelete: any[] = [];
// Update Convenant boxes
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
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  // Set each item's checked status to match selectAll
  this.convenantAndBox.forEach(item => (item.checked = this.selectAll));
  // Update the selected count
  this.selectedCount = this.selectAll ? this.convenantAndBox.length : 0;
}

updateSelectAll() {
  // Update selectAll if all items are checked
  this.selectAll = this.convenantAndBox.every(item => item.checked);
  // Calculate the number of selected items
  this.selectedCount = this.convenantAndBox.filter(item => item.checked).length;
}

openModalForSelected() {
  if (this.selectedCategory) {
    this.convBoxForm.patchValue({
      covenantBoxName: this.selectedCategory.covenantBoxName,
      code: this.selectedCategory.code,
      description: this.selectedCategory.description,
    });

    this.isModalOpen = true;
  } else {
    alert('Please select a category to update.');
  }
}

closeModal() {
  this.isModalOpen = false;
}

updateCategory() {
  if (this.convBoxForm.valid) {
    const updatedCategory = { ...this.convBoxForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.convenantBox.update(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('COnvenant and boxes updated successfully:', response);
        this.toast.success('Convenant and boxes updated successfully')
        // Update the local categories array if necessary
        const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.storesSec[index] = updatedCategory;
        }

        this.getAllConvenantBoxes();
        this.closeModal();  // Close the modal after successful update
      },
      (error: HttpErrorResponse) => {
        console.error('Error updating convenant boxes:', error);
        console.log('Updated convenant boxes Data:', updatedCategory);
        // alert('An error occurred while updating the item type .');
        this.toast.error('An error occurred while updating the item type .')
      }
    );
    }
  }

deleteItemType(){
  const selectedItems = this.filteredConvenentBoxes.filter(item => item.checked);

  if (selectedItems.length === 0) {
    this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
    return;
  }

  const successfulDeletions: number[] = [];
  const failedDeletions: { id: number; error: any }[] = [];

  selectedItems.forEach((item, index) => {
    this.convenantBox.deleteById(item.id).subscribe({
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
  this.filteredConvenentBoxes = this.filteredConvenentBoxes.filter(item => !successfulDeletions.includes(item.id));

  // Update selected count
  this.selectedCount = this.filteredConvenentBoxes.filter(item => item.checked).length;

  // Log results
  console.log('Deleted successfully:', successfulDeletions);
  console.log('Failed to delete:', failedDeletions);

  // Refresh the table or data if needed
  this.getAllConvenantBoxesWithpaging();

  // Show final message
  if (failedDeletions.length > 0) {
    this.toast.warning(
      `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

    );
    this.getAllConvenantBoxesWithpaging();
    this.closeConfirmationModal();
  } else {
    this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
    this.getAllConvenantBoxesWithpaging();
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
    this.selectedForDelete = []; 
    this.selectedCategory = null; 
    this.selectedCount = 0; 
    this.selectAll= false; 
    this.getAllConvenantBoxesWithpaging();
  }
}


// Filter data based on search term
filteredConvenentBoxes: any[] = [];   // Holds the filtered results (used for search)
searchQuery: string = '';          // Holds the search query
totalRecords: number = 0;
offers: any[] = [];
// Method to fetch and display data based on search condition
fetchSaleOffers() {
  // Check if there's a search query that is not empty
  if (this.searchQuery && this.searchQuery.trim() !== '') {
    // If there's a search query, fetch all data without pagination
    this.getAllConvenantBoxes();
  } else {
    // If no search query, fetch paginated data
    this.getAllConvenantBoxesWithpaging();
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
    this.filteredConvenentBoxes = this.convenantAndBox.filter(item =>
      (item.covenantBoxName && item.covenantBoxName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
      (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
    )

  } else {
    // If no search query, reset to show all fetched data
    this.filteredConvenentBoxes = this.convenantAndBox;
  }
}
}