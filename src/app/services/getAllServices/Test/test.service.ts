import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../../auth.service';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  apiUrl= environment.apiUrl +'Tests/TestMethod1';
  constructor(private http:HttpClient, private authService:AuthService) { }

  getTest(): Observable<any> {
    const requiredPermission = "Permissions.Dashboard.Employee.View";
    console.log(this.authService.getDecodedToken())
    if (!this.authService.hasPermission(requiredPermission)) {
      console.error('User does not have the required permission');
      return throwError(() => new Error('Permission denied'));
    }    
    const tenantId = localStorage.getItem('tenant');
    const token = this.authService.getToken();

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      'Authorization': `Bearer ${token}`,
      // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(this.apiUrl, { headers, responseType: 'text' as 'json'  });
    
  }
}
