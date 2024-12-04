import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandsService } from 'src/app/services/getAllServices/brands/brands.service';
import { CostCenterService } from 'src/app/services/getAllServices/CostCenter/cost-center.service';
import { ItemcategoryService } from 'src/app/services/getAllServices/itemcategory/itemcategory.service';
import { ItemgroupService } from 'src/app/services/getAllServices/itemgroup/itemgroup.service';
import { ItemsService } from 'src/app/services/getAllServices/Items/items.service';
import { ItemTypeService } from 'src/app/services/getAllServices/itemType/item-type.service';
import { UnitService } from 'src/app/services/getAllServices/unit/unit.service';
import { environment } from 'src/environments/environment.development';
import { ToastrService } from 'ngx-toastr';
import { WarehouseService } from 'src/app/services/getAllServices/Warehouse/warehouse.service';
import { ItemClassification } from 'src/app/enums/ItemClassification';
import * as bootstrap from 'bootstrap';
import { twoOutOfThreeValidator } from 'src/app/validators/items-custom-validators';
@Component({
  selector: 'app-cateogries',
  templateUrl: './cateogries.component.html',
  styleUrls: ['./cateogries.component.css'],
})
export class CateogriesComponent {
  storesSec: any[] = [];
  units: any[] = [];
  types: any[] = [];
  brands: any[] = [];
  itemCategory: any[] = [];
  costs: any[] = [];
  selectedCategory: any = null;

  isModalOpen = false;


  ItemsForm: FormGroup;

  selectedGender: string = '';
  selectedStatus: string = '';
  selectedSales: string = '';

  apiUrl = environment.apiUrl + 'Items';
  imgApiUrl = environment.imgApiUrl;


  buttons = [
    'المعلومات العامة ',
    'المبيعات ',
    'المرفقات',
    'المقاس',
    'المهام',
    'الحركات',
    'الانشطه',
    'الأرصدة الإفتتاحية'
  ];

  selectedButton: number | null = null; // To track which button is clicked

  // Method to handle button click and show content
  showContent(index: number): void {
    this.selectedButton = index;
  }

  itemClassification = ItemClassification;  // Access the PaymentType enum
  // Convert enum to an array for dropdown
  itemClassificationList: { key: string, value: string }[] = [];
  constructor(
    private itemServices: ItemsService,
    private fb: FormBuilder,
    private itemCat: ItemcategoryService,
    private itemType: ItemTypeService,
    private unit: UnitService,
    private brand: BrandsService,
    private http: HttpClient,
    private cost: CostCenterService,
    private toast: ToastrService,
    private wareService: WarehouseService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {
    this.ItemsForm = this.fb.group({
      name: ['', Validators.required],
      localName: [''],
      canBeSold: ['', Validators.required],
      canBePurchased: ['', Validators.required],
      canBeConsumed: ['', Validators.required],
      itemCategoryId: ['', Validators.required],
      barcode: [],
      code: [],
      itemTypeId: ['', Validators.required],
      unitId: ['', Validators.required],
      salesPrice: [0],
      salesTax: [0],
      costCenterId: [''],
      brandId: [''],
      note: [],
      localNote: [],
      totalSoldQuantity: [0],
      totalPurchasedQuantity: [0],
      totalCurrentStock: [0],
      width: [1],
      length: [1],
      height: [1],
      pallet: [1],
      palletHeight: [1],
      thickness: [1],
      weight: [1],
      customField: [],
      itemClassification: [0],
      itemWarehouses: this.fb.array([]),
      attachmentFiles: this.fb.array([]),
      attachments: this.fb.array([]),
    },
      { validators: twoOutOfThreeValidator() }
    );

    this.itemClassificationList = Object.keys(this.itemClassification).map(key => ({
      key: key,
      value: this.itemClassification[key as keyof typeof ItemClassification]
    }));
    // this.itemClassificationList = Object.keys(ItemClassification).map(key => ({
    //   key: key,
    //   value: ItemClassification[key as keyof typeof ItemClassification]
    // }));
  }

  ngOnInit(): void {
    this.getAllBrands();
    this.getAllCategories();
    this.getAllItemCategory();
    this.getAllItemType();
    this.getAllUnit();
    this.getAllcosts();
    this.getAllWarehouses();

  }
  mapIntToEnum(itemClassificationInt: number): string {
    switch(itemClassificationInt) {
      case 0:
        return ItemClassification.storable;
      case 1:
        return ItemClassification.Consumable;
      case 2:
        return ItemClassification.Service;
      default:
        return ''; // Default if value is not recognized
    }
  }
  get itemWarehouses(): FormArray {
    return this.ItemsForm.get('itemWarehouses') as FormArray;
  }

  removeItem(index: number) {
    this.itemWarehouses.removeAt(index);
  }
  addDeliveryNoteItem() {
    const item = this.fb.group({
      warehouseId: [null, Validators.required],
      openingBalance: [null, Validators.required],
      openingPrice: [null, Validators.required],
      unit: ['', Validators.required],
      unitPrice: [null, Validators.required]
    });
    this.itemWarehouses.push(item);
  }



  getAllCategories() {
    this.itemServices.getAllItemsWithoutPaging(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.storesSec = response.item1; // Assign the fetched Warehouses
        this.filteredItems = this.storesSec;
        this.totalCount = response.item2; // Assuming response contains totalCount
        this.totalPages = Math.ceil(this.totalCount / this.pageSize); // Calculate total pages
        console.log('items :', this.storesSec);
      },
      (error) => {
        console.error('Error fetching item types Items:', error); // Handle errors
      }
    );
  }

  getAllcosts() {
    this.cost.getAllCostCaners().subscribe(
      (response) => {
        this.costs = response.costCenters; // Assign the fetched Warehouses
        console.log('costs :', this.costs);
      },
      (error) => {
        console.error('Error fetching item costs:', error); // Handle errors
      }
    );
  }

  getAllItemCategory() {
    this.itemCat.getAllitemCat().subscribe(data => {
      this.itemCategory = data.categories;
      console.log(this.itemCategory);
    }, error => {
      console.error('Error fetching itemCategory data:', error);
    })
  }

  getAllItemType() {
    this.itemType.getAllitemType().subscribe(data => {
      this.types = data.types;
      console.log(this.types);
    }, error => {
      console.error('Error fetching itemType data:', error);
    })
  }

  getAllUnit() {
    this.unit.getAllUnits().subscribe(data => {
      this.units = data.units;
      console.log(this.unit);
    }, error => {
      console.error('Error fetching unit data:', error);
    })
  }

  getAllBrands() {
    this.brand.getAllbrands().subscribe(data => {
      this.brands = data.brands;
      console.log(this.brands);
    }, error => {
      console.error('Error fetching brand data:', error);
    })
  }
  warehouses: any[] = [];
  getAllWarehouses() {
    this.wareService.getAllWarehouses().subscribe(data => {
      this.warehouses = data.data;
      console.log(this.warehouses);
    }, error => {
      console.error('Error fetching warehouse data:', error);
    })
  }

  // handle array of attachments
  fileNames: string[] = []; // Array to store file names

  get attachments(): FormArray {
    return this.ItemsForm.get('attachments') as FormArray;
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



  @ViewChild('myModal', { static: false }) modal!: ElementRef;
  ngAfterViewInit(): void {
    this.modal.nativeElement.addEventListener('hidden.bs.modal', () => {
      // Fallback cleanup in case Bootstrap doesn't properly clean up
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    });
  }
  onSubmitAdd(): void {
    const nameControl = this.ItemsForm.get('name');

    if (!nameControl || nameControl.invalid) {
      console.log('Form is invalid because the name field is invalid.');
      console.log('Name field errors:', nameControl?.errors);
      this.ItemsForm.markAllAsTouched();
      this.cdr.detectChanges();
      return; // Stop submission if the name field is invalid
    }

    const formData = new FormData();
    formData.append('name', this.ItemsForm.get('name')?.value);
    formData.append('localName', this.ItemsForm.get('localName')?.value);
    formData.append('canBeSold', this.ItemsForm.get('canBeSold')?.value || false);
    formData.append('canBePurchased', this.ItemsForm.get('canBePurchased')?.value || false);
    formData.append('canBeConsumed', this.ItemsForm.get('canBeConsumed')?.value || false);
    formData.append('itemCategoryId', this.ItemsForm.get('itemCategoryId')?.value || '');
    formData.append('barcode', this.ItemsForm.get('barcode')?.value);
    formData.append('code', this.ItemsForm.get('code')?.value);
    formData.append('itemTypeId', this.ItemsForm.get('itemTypeId')?.value || '');
    formData.append('unitId', this.ItemsForm.get('unitId')?.value || '');

    formData.append('salesPrice', this.ItemsForm.get('salesPrice')?.value || 0);
    formData.append('salesTax', this.ItemsForm.get('salesTax')?.value || 0);
    formData.append('costCenterId', this.ItemsForm.get('costCenterId')?.value || '');
    formData.append('brandId', this.ItemsForm.get('brandId')?.value || '');
    formData.append('note', this.ItemsForm.get('note')?.value);
    formData.append('localNote', this.ItemsForm.get('localNote')?.value);
    formData.append('totalSoldQuantity', this.ItemsForm.get('totalSoldQuantity')?.value);
    formData.append('totalPurchasedQuantity', this.ItemsForm.get('totalPurchasedQuantity')?.value);
    formData.append('totalCurrentStock', this.ItemsForm.get('totalCurrentStock')?.value);
    formData.append('width', this.ItemsForm.get('width')?.value || 0);
    formData.append('length', this.ItemsForm.get('length')?.value || 0);
    formData.append('height', this.ItemsForm.get('height')?.value || 0);
    formData.append('pallet', this.ItemsForm.get('pallet')?.value || 0);
    formData.append('palletHeight', this.ItemsForm.get('palletHeight')?.value || 0);
    formData.append('thickness', this.ItemsForm.get('thickness')?.value || 0);
    formData.append('weight', this.ItemsForm.get('weight')?.value || 0);
    formData.append('customField', this.ItemsForm.get('customField')?.value || '');
    formData.append('itemClassification', this.ItemsForm.get('itemClassification')?.value || 0);
    this.itemWarehouses.controls.forEach((control, index) => {
      formData.append(`ItemWarehouses[${index}].warehouseId`, control.value.warehouseId);
      formData.append(`ItemWarehouses[${index}].openingBalance`, control.value.openingBalance);
      formData.append(`ItemWarehouses[${index}].openingPrice`, control.value.openingPrice);
      formData.append(`ItemWarehouses[${index}].unit`, control.value.unit);
      formData.append(`ItemWarehouses[${index}].unitPrice`, control.value.unitPrice);
    });

    // Append each attachment file
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

    this.http.post(this.apiUrl, formData, { headers })
      .subscribe(response => {
        console.log('Response:', response);
        // alert('submit successfully');
        this.toast.success('تمت الإضافة بنجاح');
        this.getAllCategories();
        this.ItemsForm.reset({
          name: [''],
          localName: [''],
          canBeSold: [false],
          canBePurchased: [false],
          canBeConsumed: [false],
          itemCategoryId: [''],
          barcode: [],
          code: [],
          itemTypeId: [''],
          unitId: [''],
          salesPrice: [0],
          salesTax: [0],
          costCenterId: [''],
          brandId: [''],
          note: [],
          localNote: [],
          totalSoldQuantity: [0],
          totalPurchasedQuantity: [0],
          totalCurrentStock: [0],
          width: [1],
          length: [1],
          height: [1],
          pallet: [1],
          palletHeight: [1],
          thickness: [1],
          weight: [1],
          customField: [],
          itemClassification: [0],
          itemWarehouses: this.fb.array([]),
          attachmentFiles: this.fb.array([]),
          attachments: this.fb.array([])
        },
        { emitEvent: false } 
      );
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
        console.error('Error:', error);
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
        console.log(this.ItemsForm)
      });

  }

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

  mapItemClassificationToString(): { key: string, value: string }[] {
    return [
      { key: ItemClassification.storable, value: 'مخزني' },
      { key: ItemClassification.Consumable, value: 'استهلاكي' },
      { key: ItemClassification.Service, value: 'خدمي' }
    ];
  }
  getItemClassificationName(itemClassification: string): string {
    const item = this.itemClassificationList.find(i => i.key === itemClassification);
    return item ? item.value : '';
  }
  openModalForSelected() {
    if (this.selectedCategory) {
      this.ItemsForm.patchValue({
        name: this.selectedCategory.name,
        localName: this.selectedCategory.localName,
        canBeSold: this.selectedCategory.canBeSold.toString(),
        canBePurchased: this.selectedCategory.canBePurchased.toString(),
        canBeConsumed: this.selectedCategory.canBeConsumed.toString(),
        itemCategoryId: this.selectedCategory.itemCategoryId,
        barcode: this.selectedCategory.barcode,
        code: this.selectedCategory.code,
        itemTypeId: this.selectedCategory.itemTypeId,
        unitId: this.selectedCategory.unitId,
        salesPrice: this.selectedCategory.salesPrice,
        salesTax: this.selectedCategory.salesTax,
        costCenterId: this.selectedCategory.costCenterId,
        brandId: this.selectedCategory.brandId,
        note: this.selectedCategory.note,
        localNote: this.selectedCategory.localNote,
        totalSoldQuantity: this.selectedCategory.totalSoldQuantity,
        totalPurchasedQuantity: this.selectedCategory.totalPurchasedQuantity,
        totalCurrentStock: this.selectedCategory.totalCurrentStock,
        width: this.selectedCategory.width,
        length: this.selectedCategory.length,
        height: this.selectedCategory.height,
        pallet: this.selectedCategory.pallet,
        palletHeight: this.selectedCategory.palletHeight,
        thickness: this.selectedCategory.thickness,
        weight: this.selectedCategory.weight,
        customField: this.selectedCategory.customField,
        itemClassification: this.mapIntToEnum(this.selectedCategory.itemClassification)

      });
      console.log('Selected itemClassification:', this.selectedCategory.itemClassification);

         // Optionally, set the selected item in the dropdown to match the itemClassification value
         const selectedItemClassification = this.itemClassificationList.find(
          item => item.key === this.selectedCategory.itemClassification
        );
        if (selectedItemClassification) {
          this.ItemsForm.get('itemClassification')?.setValue(selectedItemClassification.key);
        }
      // الأرصدة الإفتتاحية لكل عنصر

      // Populate ItemWarehouses array
      this.selectedCategory.itemWarehouses.forEach((warehouse: any) => {
        const warehouseGroup = this.fb.group({
          warehouseId: [warehouse.warehouseId],
          openingBalance: [warehouse.openingBalance],
          openingPrice: [warehouse.openingPrice],
          unit: [warehouse.unit],
          unitPrice: [warehouse.unitPrice]
        });
        this.itemWarehouses.push(warehouseGroup);
      });

      this.isModalOpen = true;
    } else {
      alert('الرجاء تحديد العنصر');
    }
  }
  // Method to add a new delivery note item
  updateItemWarehouses() {
    const newItemWarehouse = this.fb.group({
      warehouseId: [null],               // Default value, can be selected later
      openingBalance: [0],               // To be filled based on selection
      openingPrice: [0],       // Default quantity
      unitPrice: [0],               // Default price
      unit: [0]               // Default notes
    });

    this.itemWarehouses.push(newItemWarehouse);
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
  closeModal() {
    this.ItemsForm.reset();
    this.isModalOpen = false;
  }

  updateCategory() {
    const updatedCategory = { ...this.ItemsForm.value, id: this.selectedCategory.id };

    // Call the update service method using the category's id
    this.itemCat.updateItemType(this.selectedCategory.id, updatedCategory).subscribe(
      (response) => {
        console.log('Category updated successfully:', response);
        this.toast.success('تم تحديث البيانات بنجاح')
        // Update the local categories array if necessary
        const index = this.storesSec.findIndex(cat => cat.id === updatedCategory.id);
        if (index !== -1) {
          this.storesSec[index] = updatedCategory;
        }
        this.getAllCategories();
        this.closeModal();  // Close the modal after successful update
      },
      (error) => {
        console.error('Error updating category:', error);
        console.log('Updated Category Data:', updatedCategory);
        const errorMessage = error.error?.message || 'An unexpected error occurred.';
        this.toast.error("حدث خطأ ، تأكد من البيانات و حاول مرة أخرى");
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
  deleteCategory() {
    const selectedItems = this.filteredItems.filter(item => item.checked);

    if (selectedItems.length === 0) {
      this.toast.warning('لم يتم تحديد أي عناصر للحذف.');
      return;
    }

    const successfulDeletions: number[] = [];
    const failedDeletions: { id: number; error: any }[] = [];

    selectedItems.forEach((item, index) => {
      this.itemServices.deleteItemById(item.id).subscribe({
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
    this.filteredItems = this.filteredItems.filter(item => !successfulDeletions.includes(item.id));

    // Update selected count
    this.selectedCount = this.filteredItems.filter(item => item.checked).length;

    // Log results
    console.log('Deleted successfully:', successfulDeletions);
    console.log('Failed to delete:', failedDeletions);

    // Refresh the table or data if needed
    this.getAllCategories();

    // Show final message
    if (failedDeletions.length > 0) {
      this.toast.warning(
        `${failedDeletions.length} عناصر تعذر حذفها من بين ${successfulDeletions.length + failedDeletions.length}.`,

      );
      this.getAllCategories();
      this.closeConfirmationModal();

    } else {
      this.toast.success('تم حذف جميع العناصر المحددة بنجاح.');
      this.closeConfirmationModal();
      if (this.filteredItems.length === 0 && this.pageNumber > 1) {
        // Move to the previous page if the current page is empty
        this.pageNumber -= 1;  // Adjust the page number to the previous one
        this.changePage(this.pageNumber)
        this.getAllCategories(); // Re-fetch items for the updated page
      } else {
        // If the page is not empty, just re-fetch the data
        this.getAllCategories();
      }
    }
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
      this.selectAll = false;
      this.getAllCategories();
    }
  }

  // select checkbox
  selectAll = false;

  selectedCount = 0;

  toggleAllCheckboxes() {
    // Set each item's checked status to match selectAll
    this.storesSec.forEach(item => (item.checked = this.selectAll));
    // Update the selected count
    this.selectedCount = this.selectAll ? this.storesSec.length : 0;
  }

  updateSelectAll() {
    // Update selectAll if all items are checked
    this.selectAll = this.storesSec.every(item => item.checked);
    // Calculate the number of selected items
    this.selectedCount = this.storesSec.filter(item => item.checked).length;
  }


  // dropdown table columns
  columns = [
    // { name: 'id', displayName: 'المسلسل', visible: true },
    { name: 'name', displayName: 'الإسم', visible: true },
    { name: 'localName', displayName: 'اسم الصنف باللغة المحلية', visible: true },
    { name: 'code', displayName: 'كود ', visible: true },
    { name: 'costCenter', displayName: 'مركز التكلفة', visible: true },
    { name: 'itemGroup', displayName: 'مجموعة الصنف', visible: false },
    { name: 'itemType', displayName: 'نوع الصنف', visible: false },
    { name: 'itemCategory', displayName: 'فئة الصنف', visible: false },
    { name: 'unit', displayName: 'الوحدة', visible: false },
    { name: 'salesPrice', displayName: 'سعر البيع', visible: false },
    { name: 'salesTax', displayName: 'الضريبة', visible: false },
    { name: 'purchaseTax', displayName: 'ضريبة الشراء', visible: false },
    { name: 'attachments', displayName: 'المرفقات', visible: true },


  ];
  showDropdownCol = false;
  toggleDropdownCol() {
    this.showDropdownCol = !this.showDropdownCol; // Toggle the dropdown visibility
    console.log('Dropdown visibility:', this.showDropdownCol); // Check if it’s toggling
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

  // Filter data based on search term
  filteredItems: any[] = [];   // Holds the filtered results (used for search)
  searchQuery: string = '';          // Holds the search query
  totalRecords: number = 0;
  offers: any[] = [];
  getItemsWithoutPaging() {
    this.itemServices.getAllItems().subscribe(response => {
      this.storesSec = response.item1;
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
      this.getItemsWithoutPaging();
    } else {
      // If no search query, fetch paginated data
      this.getAllCategories();
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
      this.filteredItems = this.storesSec.filter(item =>
        (item.name && item.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.localName && item.localName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.itemCategory && item.itemCategory.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.itemType && item.itemType.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.itemGroup && item.itemGroup.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.costCenter && item.costCenter.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.unit && item.unit.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.code && item.code.toUpperCase().includes(this.searchQuery.toUpperCase()))
      )

    } else {
      // If no search query, reset to show all fetched data
      this.filteredItems = this.storesSec;
    }
  }
}