import { HttpClient, HttpErrorResponse, HttpEvent, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgZone} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConvenantService } from 'src/app/services/getAllServices/Convenants/convenant.service';
import { EmployeeService } from 'src/app/services/getAllServices/Employee/employee.service';
import { EquipmentService } from 'src/app/services/getAllServices/Equipment/equipment.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-received-covenant',
  templateUrl: './received-covenant.component.html',
  styleUrls: ['./received-covenant.component.css']
})
export class ReceivedCovenantComponent implements OnInit {

  pageNumber: number = 1;
  pageSize: number = 10;
  convenants: any[] = [];
  convenantForm!: FormGroup;
  employees: any[] = [];
  equips: any[] = [];
  api = environment.apiUrl + 'Covenants/CreateCovenant'
  constructor(private ConvenantService: ConvenantService, private fb: FormBuilder,
    private employeeService: EmployeeService, private equipService: EquipmentService,
    private http: HttpClient, private toast: ToastrService, private renderer: Renderer2, private ngZone: NgZone,
    private cdr: ChangeDetectorRef) {
    this.convenantForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      receivingStartDate: ['', Validators.required],
      receivingEndDate: [''],
      employeeId: ['', Validators.required],
      equipmentId: [''],
      description: [],
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([])
    })
  }
  ngOnInit(): void {
    this.getAllConvenants();
    this.getAllEmployees();
    this.getAllEquipmqnts();


  }

 

  getAllConvenants() {
    this.ConvenantService.getAllConvenants(this.pageNumber, this.pageSize)
      .subscribe(data => {
        this.convenants = data.data;
        this.filteredConvenant = this.convenants;
        this.totalCount = data.totalCount; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); 
        // console.log(this.try)
        console.log(this.convenants);
      }, error => {
        console.error('Error fetching convenants data:', error);
      });
  }

  getAllEmployees() {
    this.employeeService.getAllEmployeesWithoutPaging().subscribe(response => {
      this.employees = response.data;
      //console.log(this.managers);
    }, error => {
      console.error('Error fetching employees data:', error)
    })
  }


  getAllEquipmqnts() {
    this.equipService.getEquipments().subscribe(response => {
      this.equips = response.data;
      //console.log(this.managers);
    }, error => {
      console.error('Error fetching employees data:', error)
    })
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
      this.getAllConvenants();
    }
  }

   // handle array of attachments
   fileNames: string[] = []; // Array to store file names

    get attachments(): FormArray {
      return this.convenantForm.get('attachments') as FormArray;
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
   onSubmit(): void {
    const nameControl = this.convenantForm.get('name');
  
    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.convenantForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const EmpControl = this.convenantForm.get('employeeId');

    if (!EmpControl || EmpControl.invalid) {
      console.log('Form is invalid because the employee field is invalid.');
      console.log('employee field errors:', EmpControl?.errors);
      this.convenantForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const dateControl = this.convenantForm.get('receivingStartDate');

    if (!dateControl || dateControl.invalid) {
      console.log('Form is invalid because the receivingStartDate field is invalid.');
      console.log('receivingStartDate field errors:', dateControl?.errors);
      this.convenantForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }
    const formData = new FormData();
    formData.append('name', this.convenantForm.get('name')!.value);
    formData.append('localName', this.convenantForm.get('localName')!.value);
    formData.append('employeeId', this.convenantForm.get('employeeId')!.value);
    formData.append('receivingStartDate', this.convenantForm.get('receivingStartDate')!.value);
    formData.append('receivingEndDate', this.convenantForm.get('receivingEndDate')!.value);
    formData.append('description', this.convenantForm.get('description')!.value);
    formData.append('equipmentId', this.convenantForm.get('equipmentId')!.value);
  
    this.attachments.controls.forEach((control: AbstractControl) => {
      const fileData = control.value.file; // Access the actual file
      if (fileData) {
        formData.append('attachmentFiles', fileData);
      }
    });
  
    console.log('Attachments:', this.attachments.value); // Debugging
    console.log('FormData:', formData);
  
    const headers = new HttpHeaders({
      tenant: localStorage.getItem('tenant') || ''
    });
  
    this.http.post(this.api, formData, { headers }).subscribe(
      response => {
        console.log('Convenant created successfully:', response);
        this.toast.success('تمت الإضافة بنجاح');
        this.convenantForm.reset();
        this.attachments.clear();
        const modalInstance = bootstrap.Modal.getInstance(this.modal.nativeElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        // Ensure proper cleanup after modal closure
        setTimeout(() => {
          document.body.classList.remove('modal-open');
          
          document.body.style.overflow = '';
        }, 300);
        this.getAllConvenants();
      },
      error => {
        console.error('Error creating Convenant:', error);
        this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
      }
    );
  }
  // select checkbox

  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.convenants.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.convenants.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.convenants.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.convenants.filter(item => item.checked).length;
  }
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
   
  


  // Filter data based on search term
  filteredConvenant: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  getCovenantsWithoutPaging() {
    this.ConvenantService.getAllConvenant2().subscribe(response => {
      this.convenants = response.data;
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
      this.getCovenantsWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllConvenants();
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
      this.filteredConvenant = this.employees.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toUpperCase().includes(this.searchQuery.toUpperCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredConvenant = this.employees;
    }
  }

   // Update
   isModalOpen = false;
  
   openModalForSelected() {
     if (this.selectedCategory) {
       this.convenantForm.patchValue({
         name: this.selectedCategory.name,
         localName: this.selectedCategory.localName,
         receivingStartDate: this.selectedCategory.receivingStartDate,
         receivingEndDate: this.selectedCategory.receivingEndDate,
         employeeId: this.selectedCategory.employeeId,
         equipmentId: this.selectedCategory.equipmentId,
         description: this.selectedCategory.description,
       });
       this.attachments.clear();
 
       if (this.selectedCategory.attachments) {
         this.selectedCategory.attachments.forEach((attachment: any) => {
           this.addAttachmentToForm(attachment);
         });
       }
       this.isModalOpen = true;
     } else {
       alert("الرجاء تحديد عنصر");
     }
   }
   addAttachmentToForm(attachment: any) {
     const attachmentExists = this.attachments.controls.some((control: any) => 
       control.value.fileUrl === attachment.fileUrl || control.value.fileTitle === attachment.fileTitle
     );
   
     if (!attachmentExists) {
       this.attachments.push(this.fb.group({
         fileTitle: [attachment.fileTitle || 'Unnamed File'],
         fileType: [attachment.fileType],
         fileSize: [attachment.fileSize],
         fileUrl: [attachment.fileUrl],
       }));
     }
   }
   closeModal() {
     this.isModalOpen = false;
     this.selectedCategory =null;
     this.convenantForm.reset();
     this.attachments.clear();
     this.toggleDragDrop();
   }
 
   updateCategory() {
       const updatedCategory = { ...this.convenantForm.value, id: this.selectedCategory.id };
       const nameControl = this.convenantForm.get('name');
  
       if (!nameControl || nameControl.invalid) {
         console.log('Form is invalid because the name field is invalid.');
         console.log('Name field errors:', nameControl?.errors);
         this.convenantForm.markAllAsTouched();
         this.cdr.detectChanges();
         return; // Stop submission if the name field is invalid
       }
       const EmpControl = this.convenantForm.get('employeeId');
  
       if (!EmpControl || EmpControl.invalid) {
         console.log('Form is invalid because the employee field is invalid.');
         console.log('employee field errors:', EmpControl?.errors);
         this.convenantForm.markAllAsTouched();
         this.cdr.detectChanges();
         return; // Stop submission if the name field is invalid
       }
       const dateControl = this.convenantForm.get('receivingStartDate');
  
       if (!dateControl || dateControl.invalid) {
         console.log('Form is invalid because the receivingStartDate field is invalid.');
         console.log('receivingStartDate field errors:', dateControl?.errors);
         this.convenantForm.markAllAsTouched();
         this.cdr.detectChanges();
         return; // Stop submission if the name field is invalid
       }
       // Call the update service method using the category's id
       this.ConvenantService.updateCoveant(this.selectedCategory.id, updatedCategory).subscribe(
         (response) => {
           console.log('Unit category updated successfully:', response);
           this.toast.success('تم تحديث البيانات بنجاح')
           // Update the local categories array if necessary
           const index = this.convenants.findIndex(cat => cat.id === updatedCategory.id);
           if (index !== -1) {
             this.convenants[index] = updatedCategory;
           }
 
           this.getAllConvenants();
           this.closeModal();  // Close the modal after successful update
         },
         (error) => {
           console.error('Error updating unit category:', error);
           console.log('Updated unit category Data:', updatedCategory);
           // alert('An error occurred while updating the item type .');
           const errorMessage = error.error?.message || 'An unexpected error occurred.';
           this.toast.error('حدث خطأ ، تأكد من البيانات و حاول مرة أخرى');
         }
       );
 
   }
 
   showConfirmationModal = false;

   openConfirmationModal() {
     this.showConfirmationModal = true;
   }
 
   closeConfirmationModal() {
     this.showConfirmationModal = false;
   }
   selectedCategories: any[] = []; // Array to hold selected categories
   isLoading: boolean = false; // Loading indicator
   deleteItemType() {
  
     const selectedItems = this.convenants.filter(item => item.checked);
 
     if (selectedItems.length === 0) {
       this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
       return;
     }
 
     const successfulDeletions: number[] = [];
     const failedDeletions: { id: number; error: any }[] = [];
 
     selectedItems.forEach((item, index) => {
       this.ConvenantService.deleteCovenantById(item.id).subscribe({
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
     this.convenants = this.convenants.filter(item => !successfulDeletions.includes(item.id));
 
     // Update selected count
     this.selectedCount = this.convenants.filter(item => item.checked).length;
 
     // Log results
     console.log('Deleted successfully:', successfulDeletions);
     console.log('Failed to delete:', failedDeletions);
 
     // Refresh the table or data if needed
     this.getAllConvenants();
 
     // Show final message
     if (failedDeletions.length > 0) {
       this.toast.warning(
         `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,
 
       );
       this.getAllConvenants();
       this.closeConfirmationModal();
     } else {
       this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
       this.getAllConvenants();
       this.closeConfirmationModal();
       if (this.filteredConvenant.length === 0 && this.pageNumber > 1) {
        // Move to the previous page if the current page is empty
        this.pageNumber -= 1;  // Adjust the page number to the previous one
        this.changePage(this.pageNumber)
        this.getAllConvenants(); 
      } else {
        this.getAllConvenants();
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
