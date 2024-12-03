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
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}ServiceRequests/UpdateServiceRequest/${id}`, formData, { headers });
  }
}