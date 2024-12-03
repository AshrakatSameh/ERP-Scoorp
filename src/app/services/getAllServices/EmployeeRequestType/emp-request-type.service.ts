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
