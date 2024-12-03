import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class EmpRequestsService {

  apiUrl=environment.apiUrl;

  constructor(private http : HttpClient) { }

  getEmployeeRequests(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}EmployeeRequests/GetAll`, { headers});
    
  }
  getEmployeeRequestspaging(pageNumber: number, pageSize:number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}EmployeeRequests/GetAll`, { headers, params});
    
  }

  updateEmployeeRequest(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('requestTypeId', updatedCategory.requestTypeId || '');
    formData.append('name', updatedCategory.name || '');
    formData.append('description', updatedCategory.description || '');
    formData.append('StartDate', updatedCategory.StartDate || '');
    formData.append('EndDate', updatedCategory.EndDate || '');
    formData.append('RequestValue', updatedCategory.RequestValue || '');
    formData.append('Quantity', updatedCategory.Quantity || '');
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}EmployeeRequests/${id}`, formData, { headers });
  }

  deleteEmpRequestById(id: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant'); 
 const headers = new HttpHeaders({
   tenant: tenantId || '',
   // 'Content-Type': 'application/json',
 });
 return this.http.delete<void>(`${this.apiUrl}EmployeeRequests/${id}`,{headers});
}
}
