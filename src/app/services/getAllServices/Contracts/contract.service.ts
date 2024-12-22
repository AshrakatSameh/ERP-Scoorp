import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  apiUrl= environment.apiUrl;
  constructor(private http:HttpClient) { }

  getAllContracts(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Contract/GetContracts`, { headers });

  }

  //With paging
  getPagingContracts(pageNumber:number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}Contract/GetContracts?`, { headers, params });
    
  }

  createContract(formData: FormData): Observable<any> {
    const tenantId = localStorage.getItem('tenant') || '';
    const headers = new HttpHeaders({
      tenant: tenantId, // Add tenant header if needed
    });

    return this.http.post<any>(`${this.apiUrl}Contract/CreateContract`, formData, { headers });
  }

  api= environment.apiUrl+'Contract/CreateContract' ;

    createData(data: any): Observable<any> {
      const tenant = localStorage.getItem('tenant')||'';

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenant , // Set tenantId header if available
      'Content-Type': 'application/json',
    });
  
      const formData = new FormData();
      formData.append('Name', data.name);
      formData.append('LocalName', data.localName || '');
      formData.append('clientId', data.clientId || '');
      formData.append('userIds', data.userIds || '');
      formData.append('assignedToId', data.assignedToId || '');
      formData.append('teamId', data.teamId || '');
      formData.append('startDate', data.startDate || '');
      formData.append('endDate', data.endDate || '');
      formData.append('code', data.code || '');

      return this.http.post(this.api, formData, { headers });
    }

    updateItem(id: number, updatedCategory: any): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
      
      // Create headers with tenant info
      const headers = new HttpHeaders({
        tenant: tenantId || ''  // Set tenantId header if available
      });
      // Prepare FormData for multipart/form-data request
      const formData = new FormData();
      formData.append('name', updatedCategory.name || '');
      formData.append('localName', updatedCategory.localName || '');
      formData.append('clientId', updatedCategory.clientId || '');
      formData.append('assignedToId', updatedCategory.assignedToId || '');
      formData.append('teamId', updatedCategory.teamId || '');
      formData.append('userIds', updatedCategory.userIds || '');
      formData.append('startDate', updatedCategory.startDate || '');
      formData.append('endDate', updatedCategory.endDate || '');
      formData.append('code', updatedCategory.code || '');
      console.log("Form Service", updatedCategory.attachments);
      updatedCategory.attachments.forEach((attachment: any) => {
        if (attachment.file) {
          // For new files, append the actual file object
          if (attachment.file instanceof File) {
            formData.append('attachmentFiles', attachment.file, attachment.fileTitle);
            console.log('Appending new file:', attachment.fileTitle);
          }
        } 
        if (attachment.fileUrl) {
          // For existing files, use a metadata representation (fileUrl or any reference)
          formData.append('attachmentFiles', new Blob([JSON.stringify({ fileUrl: attachment.fileUrl })], { type: 'application/json' }), attachment.fileTitle);
          console.log('Appending existing file reference:', attachment.fileTitle);
        }
      });
      console.log(formData.get("attachmentFiles"))
      // API call with PUT method using the FormData and headers
      return this.http.put(`${this.apiUrl}Contract/UpdateContract/${id}`, formData, { headers });
    }
    
    deleteItemById(id: number): Observable<void> {
      const tenantId = localStorage.getItem('tenant'); 
      const headers = new HttpHeaders({
        tenant: tenantId || '',
        // 'Content-Type': 'application/json',
      });
      return this.http.delete<void>(`${this.apiUrl}Contract/${id}`,{headers});
    }



    
  // Contract Comments Endpoints
  // Get the Comments of Sales Invoice
  getContractComments(modelId:number): Observable<any>{
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
    return this.http.get(`${this.apiUrl}Contract/GetComments/${modelId}`, { headers });
  }
  // Get the activities of Sales Invoice
  getContractActivities(modelId:number): Observable<any>{
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
    return this.http.get(`${this.apiUrl}Contract/GetActivities/${modelId}`, { headers });
  }
  // Add Comment to Sales Invoice
  postContractComment(data: any): Observable<any> {
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
    return this.http.post(`${this.apiUrl}Contract/AddComment`, formData, { headers });
  }
  // Edit Comment of Sales Invoice
  updateContractComment(commentId: number, payload:any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('Content', payload.content || '');
  
    console.log("Form Service", payload.attachments);
    if(payload.attachments){
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
    }
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Contract/UpdateComment/${commentId}`, formData, { headers });
  }
  // Like Comment of Sales Invoice
  likeContractComment(commentId: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Contract/LikeComment/${commentId}`, { headers });
  }

}
