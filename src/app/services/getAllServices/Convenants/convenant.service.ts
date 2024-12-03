import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConvenantService {

  apiUrl = environment.apiUrl;
  constructor(private http:HttpClient) { }

  getAllConvenants(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}Covenants/GetAllCovenants`, { headers, params });

  }

  getAllConvenant2(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Covenants/GetAllCovenants`, { headers });

  }

  updateCoveant(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();

    formData.append('name', updatedCategory.name || '');
    formData.append('localName', updatedCategory.localName || '');
    formData.append('receivingStartDate', updatedCategory.receivingStartDate || '');
    formData.append('receivingEndDate', updatedCategory.receivingEndDate || '');
    formData.append('employeeId', updatedCategory.employeeId || '');
    formData.append('equipmentId', updatedCategory.equipmentId || '');
    formData.append('description', updatedCategory.description || '');
    if (updatedCategory.attachments && updatedCategory.attachments.length > 0) {
      updatedCategory.attachments.forEach((attachment: any) => {
        // If the attachment has a file (i.e., it's a new file or updated file)
        if (attachment.file) {
          formData.append('attachments[]', attachment.file, attachment.file.name);
        } else if (attachment.fileUrl) {
          // If it's an existing file (no new file uploaded), include the URL if needed
          formData.append('existingAttachments[]', attachment.fileUrl);
        }
      });
    }
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Covenants/UpdateCovenant/${id}`, formData, { headers });
  }
  
  deleteCovenantById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}Covenants/${id}`,{headers});
  }
}
