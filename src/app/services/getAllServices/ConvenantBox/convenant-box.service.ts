import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConvenantBoxService {

  apiUrl= environment.apiUrl
  constructor(private http: HttpClient) { }
  
  getConvenantBoxes(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}CovenantBox`, { headers });

  }

  getAllConvenantBoxesWithPaging(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}CovenantBox`, { headers, params });

  }

  postConvenantBox(tenant: string, contactData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data',
      'tenant': tenant
    });

    return this.http.post(this.apiUrl, contactData, { headers });
  }

  update(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
    const formData = new FormData();
    formData.append('covenantBoxName', updatedCategory.covenantBoxName || '');
    formData.append('description', updatedCategory.description || '');
    formData.append('code', updatedCategory.code || '');
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}CovenantBox/${id}`, formData, { headers });
  }
  
  deleteById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}CovenantBox/${id}`,{headers});
  }

}
