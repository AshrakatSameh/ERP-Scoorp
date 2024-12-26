import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpRequestTypeService {

  apiUrl= environment.apiUrl;

  constructor(private http: HttpClient) { }
  // Method to fetch UserTags based on tenantId
  getEmpRequestTypes(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}EmployeeRequestTypes/GetAll`, { headers});
    
  }
  getEmpRequestTypesPaging(pageNumber:number, pageSize:number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}EmployeeRequestTypes/GetAll`, { headers,params});
    
  }

  updateEmpRequestType(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('name', updatedCategory.name || '');
    formData.append('description', updatedCategory.description || '');
    formData.append('categoryId', updatedCategory.categoryId || '');
    
    console.log("Form Service", updatedCategory.attachments);
      updatedCategory.attachments.forEach((attachment: any) => {
        if (attachment.file) {
          // For new files, append the actual file object
          if (attachment.file instanceof File) {
            formData.append('attachments', attachment.file, attachment.fileTitle);
            console.log('Appending new file:', attachment.fileTitle);
          }
          if (attachment.file.fileUrl) {
            // For existing files, use a metadata representation (fileUrl or any reference)
            formData.append('attachments', new Blob([JSON.stringify({ fileUrl: attachment.file.fileUrl })], { type: 'application/json' }), attachment.file.fileTitle);
            console.log('Appending existing file reference:', attachment.file.fileTitle);
          }
        } 
      });
      updatedCategory.approvalLevels.forEach((levelControl: any, levelIndex: number) => {
        const level = levelControl.Level || levelControl.get('Level')?.value;
        formData.append(`approvalLevels[${levelIndex}].level`, level);
    
        const approverUserIds =
          levelControl.approverUserIds || levelControl.get('approverUserIds')?.value || [];
    
        approverUserIds.forEach((user: any, userIdIndex: number) => {
          // Append userId
          formData.append(
            `approvalLevels[${levelIndex}].userIds[${userIdIndex}]`,
            user.id
          );
    
          // Append userName if needed
          // if (user.userName) {
          //   formData.append(
          //     `approvalLevels[${levelIndex}].userNames[${userIdIndex}]`,
          //     user.userName
          //   );
          // }
        });
      });
      console.log(formData.get("attachments"))
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}EmployeeRequestTypes/${id}`, formData, { headers });
  }
  deleteEmpRequestTypeById(id: number): Observable<any> {
       const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}EmployeeRequestTypes/${id}`,{headers});
  }
}
