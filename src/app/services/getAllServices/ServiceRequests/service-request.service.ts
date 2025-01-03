import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ServiceRequestService {
  apiUrl=environment.apiUrl;

  constructor(private http : HttpClient) { }

  getServiceRequests(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}ServiceRequests/GetAllServiceRequests`, { headers});
    
  }
  getServiceRequestsPaging(pageNumber:number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}ServiceRequests/GetAllServiceRequests`, { headers, params});
    
  }

  updateServiceRequest(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('serviceTypeId', updatedCategory.serviceTypeId || '');
    formData.append('requestedEmployeeId', updatedCategory.requestedEmployeeId || '');
    formData.append('workServiceCategoryId', updatedCategory.workServiceCategoryId || '');
    formData.append('workServiceDepartmentId', updatedCategory.workServiceDepartmentId || '');
    formData.append('executionTime', updatedCategory.executionTime || '');
    formData.append('completionDate', updatedCategory.completionDate || '');
    formData.append('reference', updatedCategory.reference || '');
    formData.append('description', updatedCategory.description || '');
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
    return this.http.put(`${this.apiUrl}ServiceRequests/UpdateServiceRequest/${id}`, formData, { headers });
  }


    // ServiceRequests Comments Endpoints
  // Get the Comments of Sales Invoice
  getServiceRequestsComments(modelId:number): Observable<any>{
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
    return this.http.get(`${this.apiUrl}ServiceRequests/GetComments/${modelId}`, { headers });
  }
  // Get the activities of Sales Invoice
  getServiceRequestsActivities(modelId:number): Observable<any>{
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });
    return this.http.get(`${this.apiUrl}ServiceRequests/GetActivities/${modelId}`, { headers });
  }
  // Add Comment to Sales Invoice
  postServiceRequestsComment(data: any): Observable<any> {
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
    return this.http.post(`${this.apiUrl}ServiceRequests/AddComment`, formData, { headers });
  }
  // Edit Comment of Sales Invoice
  updateServiceRequestsComment(commentId: number, payload:any): Observable<any> {
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
    return this.http.put(`${this.apiUrl}ServiceRequests/UpdateComment/${commentId}`, formData, { headers });
  }
  // Like Comment of Sales Invoice
  likeServiceRequestsComment(commentId: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || '' // Set tenantId header if available
    });  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}ServiceRequests/LikeComment/${commentId}`, { headers });
  }
}
