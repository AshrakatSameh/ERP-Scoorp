import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CollectionsService {

  apiUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }

  getAllCollections(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}Collections/GetAll`, { headers, params });

  }

  getAllCollectionsWithoutPaging(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Collections/GetAll`, { headers });

  }

  createCollection(data: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    console.log(data)
    return this.http.post(`${this.apiUrl}Collections/Create`, data, { headers });
  }

  updateItemType(id: number, updatedCategory: any): Observable<any> {
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
    formData.append('paymentMethodId', updatedCategory.paymentMethodId || '');
    formData.append('clientPhone', updatedCategory.clientPhone || '');
    formData.append('clientEmail', updatedCategory.clientEmail || '');
    formData.append('costCenterId', updatedCategory.costCenterId || '');
    formData.append('covenantBoxId', updatedCategory.covenantBoxId || '');
    formData.append('value', updatedCategory.value || '');
    
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
    return this.http.put(`${this.apiUrl}Collections/Update/${id}`, formData, { headers });
  }
 
  deleteItemById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}Collections/${id}`,{headers});
  }


    // Collections Comments Endpoints
  // Get the Comments of Sales Invoice
  getCollectionsComments(modelId:number): Observable<any>{
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
    return this.http.get(`${this.apiUrl}Collections/GetComments/${modelId}`, { headers });
  }
  // Get the activities of Sales Invoice
  getCollectionsActivities(modelId:number): Observable<any>{
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
    return this.http.put(`${this.apiUrl}Collections/GetActivities/${modelId}`, { headers });
  }
  // Add Comment to Sales Invoice
  postCollectionsComment(data: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
    });
    console.log(data)
    const formData = new FormData();
    formData.append('content', data.Content || '');
    formData.append('EntityId', data.EntityId || '');
    formData.append('ParentCommentId', data.ParentCommentId || '');
    if(data.attachments){
      data.attachments.forEach((attachment: any) => {
        formData.append('attachmentFiles', attachment.file, attachment.fileTitle);
        console.log('Appending new file:', attachment.fileTitle);
      });
    }
    console.log(formData.get("content"))
    return this.http.post(`${this.apiUrl}Collections/AddComment`, formData, { headers });
  }
  // Edit Comment of Sales Invoice
  updateCollectionsComment(commentId: number, payload:any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('Content', payload.content || '');
  
    console.log("Form Service", payload.attachments);
      payload.attachments.forEach((attachment: any) => {
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
    return this.http.put(`${this.apiUrl}Collections/UpdateComment/${commentId}`, formData, { headers });
  }
  // Like Comment of Sales Invoice
  likeCollectionsComment(commentId: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Collections/LikeComment/${commentId}`, { headers });
  }
}
