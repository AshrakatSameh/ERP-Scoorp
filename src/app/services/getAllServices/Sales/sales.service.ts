import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryStatus } from 'src/app/enums/DeliveryStatus ';
import { InvoiceStatus } from 'src/app/enums/InvoiceStatus';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  apiUrl= environment.apiUrl;
  constructor(private http:HttpClient) { }

  getSalesOffers(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}SaleOffer`, { headers, params });

  }
  // delete sales offer
  deleteSaleOfferById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}SaleOffer/DeleteSaleOffer${id}`,{headers});
  }
  getSalesOfferWithoutPaging(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}SaleOffer`, { headers });

  }

  updateSaleOffer(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    const formData = new FormData();
    formData.append('clientId', updatedCategory.clientId || '');
    formData.append('representativeId', updatedCategory.representativeId || '');
    formData.append('teamId', updatedCategory.teamId || '');
    formData.append('code', updatedCategory.code || '');
    formData.append('purchaseOrderNumber', updatedCategory.purchaseOrderNumber || '');
    formData.append('costCenterId', updatedCategory.costCenterId || '');
    formData.append('warehouseId', updatedCategory.warehouseId || '');
    formData.append('offerExpiryDate', updatedCategory.offerExpiryDate || '');
    formData.append('paymentPeriod', updatedCategory.paymentPeriod || '');
    formData.append('paymentType', updatedCategory.paymentType || '');
    
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
    return this.http.put(`${this.apiUrl}SaleOffer/${id}`, formData, { headers });
  }
// status saleOffer
updateStatusSaleOffer( requestId: number, requestStage: number): Observable<any> {
  const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });

  const body = {
    requestId: requestId,
    requestStage: requestStage
  };

  return this.http.put(this.apiUrl+'SaleOffer/updatestatus', body, { headers });
}
  getDeliveryVoucher(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}DeliveryNotes/GetAll`, { headers,params });

  }
  getDeliveryVoucherWithoutPaging(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    })
    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}DeliveryNotes/GetAll`, { headers });

  }

  // Sales Invioces

  getSalesInvoices(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}SalesInvoice`, { headers, params });

  }
  getSalesInvoicesWithoutPaging(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}SalesInvoice`, { headers });

  }

  updateSalesInvoice(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('code', updatedCategory.code || '');
    formData.append('clientId', updatedCategory.clientId || '');
    formData.append('representativeId', updatedCategory.representativeId || '');
    formData.append('teamId', updatedCategory.teamId || '');
    formData.append('priceListId', updatedCategory.priceListId || '');
    formData.append('paymentPeriodId', updatedCategory.paymentPeriodId || '');
    formData.append('invoiceNumber', updatedCategory.invoiceNumber || '');
    formData.append('invoiceType', updatedCategory.invoiceType || '');
    formData.append('costCenterId', updatedCategory.costCenterId || '');
    formData.append('driver', updatedCategory.driver || '');
    
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
    return this.http.put(`${this.apiUrl}SalesInvoice/${id}`, formData, { headers });
  }

  // Update status SalesInvoice
  updateStatusSalesInvoice( invoiceId: number, invoiceStatus: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
      
      // Create headers with tenant info
      const headers = new HttpHeaders({
        tenant: tenantId || '' // Set tenantId header if available
      });
  
    const body = {
      invoiceId: invoiceId,
      invoiceStatus: invoiceStatus
    };
  
    return this.http.put(this.apiUrl+'SalesInvoice/status', body, { headers });
  }

  // Update delivery note/ goods voucher status
  updateStatus(id: number, payload: { newStatus: string; items: string[] }): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('newStatus', payload.newStatus || ''); // Appending new status
  
    // Append items as an array of strings
    payload.items.forEach((item, index) => {
      formData.append(`items[${index}]`, item || '');
    });
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}DeliveryNotes/UpdateDeliveryNoteStatus/${id}`, formData, { headers });
  }
    // API call with PUT method using the FormData and headers
    // return this.http.put(`${this.apiUrl}DeliveryNotes/UpdateDeliveryNoteStatus/${id}`, formData, { headers });
    updateDeliveryNoteStatus(noteId: number, formData: FormData): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
      
      return this.http.put<any>(`${this.apiUrl}DeliveryNotes/UpdateDeliveryNoteStatus/${noteId}`, formData, {headers});
    }

  deleteSalesInvoiceById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}SalesInvoice/${id}`,{headers});
  }

  postDeliveryNote(data: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}DeliveryNotes/Create`, data, { headers });
  }
  
  postSaleOffer(data: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}SaleOffer`, data, { headers });
  }

  postSalesInvoice(data: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}SalesInvoice`, data, { headers });
  }
 
  createSalesInvoice(data: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    console.log(data)
    return this.http.post(`${this.apiUrl}SalesInvoice`, data, { headers });
  }

  // Update And Delete Delivery Notes
  update(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    const formData = new FormData();
    formData.append('clientId', updatedCategory.clientId || '');
    formData.append('representativeId', updatedCategory.representativeId || '');
    formData.append('teamId', updatedCategory.teamId || '');
    formData.append('purchaseOrderNumber', updatedCategory.purchaseOrderNumber || '');
    formData.append('costCenterId', updatedCategory.costCenterId || '');
    formData.append('warehouseId', updatedCategory.warehouseId || '');
    (updatedCategory.locationLinkIds || []).forEach((id: string) => {
      formData.append('locationLinkIds', id);
    }); 
    const deliveryNoteItems = updatedCategory.deliveryNoteItems || [];
    deliveryNoteItems.forEach((item: any, index: number) => {
      formData.append(`Items[${index}].itemId`, item.itemId || '');
      formData.append(`Items[${index}].itemName`, item.itemName || '');
      formData.append(`Items[${index}].requestedQuantity`, item.requestedQuantity || '');
      formData.append(`Items[${index}].unitPrice`, item.unitPrice || '');
      formData.append(`Items[${index}].salesTax`, item.salesTax || '');
      formData.append(`Items[${index}].discount`, item.discount || '');
      formData.append(`Items[${index}].unit`, item.unit || '');
      formData.append(`Items[${index}].notes`, item.notes || '');
    });

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
    return this.http.put(`${this.apiUrl}DeliveryNotes/Update/${id}`, formData, { headers });
  }
  
  deleteById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}DeliveryNotes/${id}`,{headers});
  }


  // Return invoice
  getReturnInvoices(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}ReturnInvoice`, { headers, params });

  }
  getReturnInvoicesWithoutPaging(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}ReturnInvoice`, { headers });

  }
  updateReturnInvoiceStatus( id: number, value: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
  
  // Create headers with tenant info
  const headers = new HttpHeaders({
    tenant: tenantId || '' // Set the tenant in the header
    });

    const body = { number: value }; // Adjust the key as necessary

    return this.http.put<any>(`${this.apiUrl}ReturnInvoice/${id}/status`, body, { headers });
  }
  updateInvoiceStatus(id: number, status: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '' 
      });    
      const payload = status; // Directly pass the number as the payload
      return this.http.put(`${this.apiUrl}ReturnInvoice/${id}/status`, payload, {
      headers,
      responseType: 'json'
    });
  }
  updateReturnInvoice(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
    const formData = new FormData();
    formData.append('clientId', updatedCategory.clientId || '');
    formData.append('representativeId', updatedCategory.representativeId || '');
    formData.append('teamId', updatedCategory.teamId || '');
    formData.append('returnInvoiceNumber', updatedCategory.returnInvoiceNumber || '');
    formData.append('costCenterId', updatedCategory.costCenterId || '');
    formData.append('clientReturnReference', updatedCategory.clientReturnReference || '');
    formData.append('projectId', updatedCategory.projectId || '');
    formData.append('priceListId', updatedCategory.priceListId || '');
    formData.append('paymentPeriodId', updatedCategory.paymentPeriodId || '');
    formData.append('driver', updatedCategory.driver || '');
    // (updatedCategory.locationLinkIds || []).forEach((id: string) => {
    //   formData.append('locationLinkIds', id);
    // });  
    const items = updatedCategory.items || [];
    items.forEach((item: any, index: number) => {
      formData.append(`Items[${index}].itemId`, item.itemId || '');
      formData.append(`Items[${index}].quantity`, item.quantity || '');
      formData.append(`Items[${index}].unitPrice`, item.unitPrice || '');
      formData.append(`Items[${index}].tax`, item.tax || '');
      formData.append(`Items[${index}].discount`, item.discount || '');
      formData.append(`Items[${index}].unit`, item.unit || '');
      formData.append(`Items[${index}].notes`, item.notes || '');
    });

    console.log("Form Service", updatedCategory.attachmentFiles);
      updatedCategory.attachmentFiles.forEach((attachment: any) => {
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
    return this.http.put(`${this.apiUrl}ReturnInvoice/${id}`, formData, { headers });
  }
  deleteReturnInvoiceById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}ReturnInvoice/${id}`,{headers});
  }

  // receive vouche or goods receipt
  getGoodsReceipt(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}GoodsReceipt/GetAllGoodsReceipts`, { headers, params });

  }
  // receive vouche or goods receipt
  getGoodsReceiptWithoutPaging(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}GoodsReceipt/GetAllGoodsReceipts`, { headers });

  }
  postGoodsVoucher(data: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}GoodsReceipt`, data, { headers });
  }

  updateGoodsReceiptStatus(noteId: number, formData: FormData): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
  
  // Create headers with tenant info
  const headers = new HttpHeaders({
    tenant: tenantId || '' // Set tenantId header if available
  });
    
    return this.http.put<any>(`${this.apiUrl}GoodsReceipt/UpdateGoodsReceiptStatus/${noteId}`, formData, {headers});
  }

  updateGoodsReceipt(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    const formData = new FormData();
    formData.append('clientId', updatedCategory.clientId || '');
    formData.append('representativeId', updatedCategory.representativeId || '');
    formData.append('teamId', updatedCategory.teamId || '');
    formData.append('purchaseOrderNumber', updatedCategory.purchaseOrderNumber || '');
    formData.append('costCenterId', updatedCategory.costCenterId || '');
    formData.append('warehouseId', updatedCategory.warehouseId || '');
    formData.append('supplier', updatedCategory.supplier || '');
    (updatedCategory.locationLinkIds || []).forEach((id: string) => {
      formData.append('locationLinkIds', id);
    });
    
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
    return this.http.put(`${this.apiUrl}GoodsReceipt/${id}`, formData, { headers });
  }
  
  deleteGoodsReceiptById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}GoodsReceipt/${id}`,{headers});
  }

}
