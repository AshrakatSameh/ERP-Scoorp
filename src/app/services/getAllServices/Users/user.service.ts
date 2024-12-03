import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl= environment.apiUrl;
  constructor(private http:HttpClient) { }

  getUsers(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');
  
    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
  
    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Auth/GetAllUsers`, { headers });
  }
}
