import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PaymentPeriodsService } from 'src/app/services/getAllServices/PaymentPeriods/payment-periods.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-repayment-period',
  templateUrl: './repayment-period.component.html',
  styleUrls: ['./repayment-period.component.css']
})
export class RepaymentPeriodComponent  implements OnInit{

  apiUrl = environment.apiUrl;
  paymentForm:FormGroup;
  constructor(private payment:PaymentPeriodsService, private http:HttpClient, private fb: FormBuilder,
    private toast:ToastrService, private renderer: Renderer2
  ){
    this.paymentForm = this.fb.group({
      name: ['', Validators.required],
      invoicePaymentPeriodDays: [0],
      description: [''],
      attachments: this.fb.array([]),

     
    });
  }
  ngOnInit(): void {
    this.getPaymentPeriods();
  }
   
    periods:any[]=[];
  getPaymentPeriods() {
    this.payment.getAllPaymentPeriodsPaging(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.periods = data.paymentPeriods;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        console.log(this.periods);
      }, error => {
        console.error('Error fetching periods data:', error);
      });
  }


  // handle array of attachments
fileNames: string[] = []; // Array to store file names

get attachments(): FormArray {
  return this.paymentForm.get('attachments') as FormArray;
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
      this.attachments.push(this.fb.control(file));

      // Reset the input value to allow selecting the same file again
      input.value = '';
    }
  }

  // Method to remove a file from the attachments FormArray
  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
  }

  
// Submission modal 
// @ViewChild('myModal') modal: ElementRef | undefined;
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
    formData.append('name', this.paymentForm.get('name')?.value);
    formData.append('invoicePaymentPeriodDays', this.paymentForm.get('invoicePaymentPeriodDays')?.value);
    formData.append('description', this.paymentForm.get('description')?.value)
    this.attachments.controls.forEach((control) => {
      const file = control.value;
      if (file) {
        formData.append('AttachmentFiles', file); // Append each file under 'AttachmentFiles'
      }
    });
  
    const headers = new HttpHeaders({
      'tenant': localStorage.getItem('tenant')||''  // Add your tenant value here
    });
  
    this.http.post(this.apiUrl+'PaymentPeriods', formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        // alert('submit successfully');
        this.toast.success('تمت الإضافة بنجاح');
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
   
        // Reset the form
   
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
        }, 300);
   
        this.getPaymentPeriods();
        this.paymentForm.reset();
      }, error => {
        console.error('Error:', error);
        console.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');

      });
  }


    // Update
isModalOpen = false;
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

selectedUnitCategory: string = ''; // Declare this to hold the name of the selected unit category

// Your existing methods and code
openModalForSelected() {
  if (this.selectedCategory) {
    this.paymentForm.patchValue({
        // name: ['', Validators.required],
      // invoicePaymentPeriodDays: [0],
      // description: [''],
      name: this.selectedCategory.name,
      invoicePaymentPeriodDays: this.selectedCategory.invoicePaymentPeriodDays,
      description: this.selectedCategory.description,
    
    });

    // Set the selectedUnitCategory for the placeholder
    this.selectedUnitCategory = this.selectedCategory.unitCategory || ''; // Ensure it is not undefined

    this.isModalOpen = true;
  } else {
    alert('الرجاء تحديد العنصر');
  }
}


closeModal() {
  this.paymentForm.reset();
  this.isModalOpen = false;
}

updateCategory() {
  if (this.paymentForm.valid) {
    const updatedCategory = { ...this.paymentForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.payment.updatePaymentPeriod(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Unit updated successfully:', response);
        this.toast.success('تم تحديث البيانات بنجاح')
        // Update the local categories array if necessary
        const index = this.periods.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.periods[index] = updatedCategory;
        }

        this.getPaymentPeriods();
        this.closeModal();  // Close the modal after successful update
        this.selectedCategory= null;
        this.selectedCount=0;
      },
      (error) => {
        console.error('Error updating unit :', error);
        console.log('Updated unit  Data:', updatedCategory);
        // alert('An error occurred while updating the item type .');
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى"); 
            }
    );
    }else{
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
    const headers = new HttpHeaders().set('tenant', localStorage.getItem('tenant') || ''); // Replace 'your-tenant-id' with the actual tenant value

    const selectedItems = this.periods.filter(item => item.checked);

  if (selectedItems.length === 0) {
    this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
    return;
  }

  const successfulDeletions: number[] = [];
  const failedDeletions: { id: number; error: any }[] = [];

  selectedItems.forEach((item, index) => {
    this.payment.deletePaymentPeriodById(item.id).subscribe({
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
  this.periods = this.periods.filter(item => !successfulDeletions.includes(item.id));

  // Update selected count
  this.selectedCount = this.periods.filter(item => item.checked).length;

  // Log results
  console.log('Deleted successfully:', successfulDeletions);
  console.log('Failed to delete:', failedDeletions);

  // Refresh the table or data if needed
  this.getPaymentPeriods();

  // Show final message
  if (failedDeletions.length > 0) {
    this.toast.warning(
      `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,
    
    );
    this.getPaymentPeriods();
    this.closeConfirmationModal();
  } else {
    this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
    this.getPaymentPeriods();
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


// select checkbox
selectAll = false;

selectedCount = 0;

toggleAllCheckboxes() {
  this.periods.forEach(item => {
    item.checked = this.selectAll;
  });
  if (this.selectAll) {
    // Add all items to the selectedForDelete array and set selectedCount to total items
    this.selectedForDelete = [...this.periods];
    this.selectedCount = this.periods.length;
    // Select the first item for update if it's empty
    if (!this.selectedCategory && this.periods.length > 0) {
      this.selectedCategory = { ...this.periods[0] };
    }
  } else {
    // Clear selectedForDelete when unselecting all
    this.selectedForDelete = [];
    this.selectedCount = 0; // Reset selected count
    this.selectedCategory = null; // Clear the selected category for update
  }

}

updateSelectAll() {
  this.selectAll = this.periods.every(item => item.checked);
    
    // Calculate the number of selected items
    this.selectedCount = this.periods.filter(item => item.checked).length;

}


totalCount: number = 0; // Total count of items from the API
pageNumber: number = 1; // Current page
pageSize: number = 10; // Items per page
totalPages: number = 0; // Total number of pages
changePage(newPageNumber: number): void {
  if (newPageNumber >= 1 && newPageNumber <= this.totalPages) {
    this.pageNumber = newPageNumber;
    this.selectedForDelete = []; 
    this.selectedCategory = null; 
    this.selectedCount = 0; 
    this.selectAll= false; 
    this.getPaymentPeriods();
  }
}

}
