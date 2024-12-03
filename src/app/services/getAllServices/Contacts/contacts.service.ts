import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { LocationService } from '../Location/location.service';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  apiUrl= environment.apiUrl;
  constructor(private http:HttpClient) { }

  getAllContacts(pageNumber: number, pageSize: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      'Content-Type': 'application/json',
    });
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Contact`, { headers, params });

  }
  getAllContactsWithoutPaging(): Observable<any> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Contact`, { headers });

  }

  
api = this.apiUrl+'Contact';
  createData(data: any): Observable<any> {
    const tenant = localStorage.getItem('tenant')||'';

  // Set the custom header with the tenantId
  const headers = new HttpHeaders({
    'tenant': tenant , // Set tenantId header if available
    'Content-Type': 'application/json',
  });

    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('LocalName', data.localName || '');
    formData.append('jobTitle', data.jobTitle || '');
    formData.append('phoneNumber1', data.phoneNumber1 || '');
    formData.append('phoneNumber2', data.phoneNumber2 || '');
    formData.append('email', data.email || '');
    formData.append('locationLiknks', data.locationLiknks || '');
    formData.append('nationality', data.nationality || '');
    formData.append('clientId', data.clientId || '');
    formData.append('supplier', data.supplier || '');
    formData.append('description', data.description || '');

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
    // formData.append('name', updatedCategory.name || '');
    formData.append('name', updatedCategory.name ||'');
    formData.append('localName', updatedCategory.localName || '');
    formData.append('jobTitle', updatedCategory.jobTitle || '');
    formData.append('phoneNumber1', updatedCategory.phoneNumber1 || '');
    formData.append('phoneNumber2', updatedCategory.phoneNumber2 || '');
    formData.append('email', updatedCategory.email || '');
    formData.append('locationLiknks', updatedCategory.locationLiknks || '');
    formData.append('nationality', updatedCategory.nationality || '');
    formData.append('clientId', updatedCategory.clientId || '');
    formData.append('supplier', updatedCategory.supplier || '');
    formData.append('description', updatedCategory.description || '');
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Contact/${id}`, formData, { headers });
  }

  deleteById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}Contact/${id}`,{headers});
  }
}
