import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ItemcategoryService {

  private apiUrl = environment.apiUrl; 

  constructor(private http : HttpClient) { }

     // Method to fetch UserTags based on tenantId
     getitemCat(pageNumber:number, pageSize: number): Observable<any> {
      // Get tenantId from localStorage
      const tenantId = localStorage.getItem('tenant');
  
      // Set the custom header with the tenantId
      const headers = new HttpHeaders({
        tenant: tenantId || '', // Set tenantId header if available
        'Content-Type': 'application/json',
      });
      let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
  
      // Send the GET request with headers
      return this.http.get(`${this.apiUrl}StoresSection/item-categories`, { headers, params });
      
    }


    getAllitemCat(): Observable<any> {
      // Get tenantId from localStorage
      const tenantId = localStorage.getItem('tenant');
  
      // Set the custom header with the tenantId
      const headers = new HttpHeaders({
        tenant: tenantId || '', // Set tenantId header if available
        'Content-Type': 'application/json',
      });
  
      // Send the GET request with headers
      return this.http.get(`${this.apiUrl}StoresSection/item-categories`, { headers });
      
    }


    createItemCat(brand: any): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
      const headers = new HttpHeaders({
        tenant: tenantId || '', // Set tenantId header if available
        'Content-Type': 'application/json',
      });
      console.log(brand)
      return this.http.post(`${this.apiUrl}StoresSection/item-category?`, brand, { headers });
    }

    updateItemType(id: number, updatedCategory: any): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
      
      // Create headers with tenant info
      const headers = new HttpHeaders({
        tenant: tenantId || ''  // Set tenantId header if available
      });
    
      // Prepare FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('name', updatedCategory.name || '');
      formData.append('localName', updatedCategory.localName || '');
      formData.append('canBeSold', updatedCategory.canBeSold || '');
      formData.append('canBePurchased', updatedCategory.canBePurchased || '');

      formData.append('canBeConsumed', updatedCategory.canBeConsumed || '');
      formData.append('itemCategoryId', updatedCategory.itemCategoryId || '');
      formData.append('barcode', updatedCategory.barcode || '');
      formData.append('code', updatedCategory.code || '');

      formData.append('itemTypeId', updatedCategory.itemTypeId || '');
      formData.append('itemTypeId', updatedCategory.itemTypeId || '');
      formData.append('salesPrice', updatedCategory.salesPrice || '');
      formData.append('salesTax', updatedCategory.salesTax || '');

      formData.append('costCenterId', updatedCategory.costCenterId || '');
      formData.append('brandId', updatedCategory.brandId || '');
      formData.append('note', updatedCategory.note || '');
      formData.append('localNote', updatedCategory.localNote || '');

      formData.append('totalSoldQuantity', updatedCategory.totalSoldQuantity || '');
      formData.append('totalPurchasedQuantity', updatedCategory.totalPurchasedQuantity || '');
      formData.append('totalCurrentStock', updatedCategory.totalCurrentStock || '');
      formData.append('width', updatedCategory.width || '');

      formData.append('length', updatedCategory.length || '');
      formData.append('height', updatedCategory.height || '');
      formData.append('pallet', updatedCategory.pallet || '');
      formData.append('palletHeight', updatedCategory.palletHeight || '');

      formData.append('thickness', updatedCategory.thickness || '');
      formData.append('weight', updatedCategory.weight || '');
      formData.append('customField', updatedCategory.customField || '');
      formData.append('itemClassification', updatedCategory.itemClassification || '');
      
      const newItemWarehouse = updatedCategory.itemWarehouses || [];
      newItemWarehouse.forEach((item: any, index: number) => {
        formData.append(`itemWarehouses[${index}].warehouseId`, item.warehouseId || '');
        formData.append(`itemWarehouses[${index}].openingBalance`, item.openingBalance || '');
        formData.append(`itemWarehouses[${index}].openingPrice`, item.openingPrice || '');
        formData.append(`itemWarehouses[${index}].unitPrice`, item.unitPrice || '');
        formData.append(`itemWarehouses[${index}].unit`, item.unit || '');
      // API call with PUT method using the FormData and headers
    });
    console.log('Full attachments:', updatedCategory.attachments);
    updatedCategory.attachments.forEach((attachment: any) => {
      if (attachment.fileUrl) {
        // For existing files, use a metadata representation (fileUrl or any reference)
        formData.append('attachmentFiles', new Blob([JSON.stringify({ fileUrl: attachment.fileUrl })], { type: 'application/json' }), attachment.fileTitle);
        console.log('Appending existing file reference:', attachment.fileTitle);
      }
      if (attachment.file instanceof File) {
        // For new files, append the actual file object
        formData.append('attachmentFiles', attachment.file, attachment.fileTitle);
        console.log('Appending new file:', attachment.fileTitle);
      }
    });

    return this.http.put(`${this.apiUrl}Items/${id}`, formData, { headers });

  }
    // deleteCategoryById(id: number): Observable<void> {
    //   const tenantId = localStorage.getItem('tenant'); 
    //   const headers = new HttpHeaders({
    //     tenant: tenantId || '',
    //     // 'Content-Type': 'application/json',
    //   });
    //   return this.http.delete<void>(`${this.apiUrl}Items/${id}`,{headers});
    // }

    deleteCategoryById(id: number, headers: HttpHeaders): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}Items/${id}`, { headers });
    }

    updateItemCat(id: number, updatedCategory: any): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
      
      // Create headers with tenant info
      const headers = new HttpHeaders({
        tenant: tenantId || ''  // Set tenantId header if available
      });
    
      // Prepare FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('name', updatedCategory.name || '');
      formData.append('localName', updatedCategory.localName || '');
      formData.append('note', updatedCategory.note || '');
      console.log("Form Service", updatedCategory.attachments);
      updatedCategory.attachments.forEach((attachment: any) => {
        if (attachment.file) {
          // For new files, append the actual file object
          if (attachment.file instanceof File) {
            formData.append('attachmentFiles', attachment.file, attachment.fileTitle);
            console.log('Appending new file:', attachment.fileTitle);
          }
          if (attachment.file.fileUrl) {
            // For existing files, use a metadata representation (fileUrl or any reference)
            formData.append('attachmentFiles', new Blob([JSON.stringify({ fileUrl: attachment.file.fileUrl })], { type: 'application/json' }), attachment.file.fileTitle);
            console.log('Appending existing file reference:', attachment.file.fileTitle);
          }
        } 
      });
      console.log(formData.get("attachmentFiles"))

      // API call with PUT method using the FormData and headers
      return this.http.put(`${this.apiUrl}StoresSection/item-category/${id}`, formData, { headers });
    }
    
    deleteItemTypeById(id: number): Observable<void> {
      const tenantId = localStorage.getItem('tenant'); 
      const headers = new HttpHeaders({
        tenant: tenantId || '',
        // 'Content-Type': 'application/json',
      });
      return this.http.delete<void>(`${this.apiUrl}StoresSection/item-category/${id}`,{headers});
    }
}
