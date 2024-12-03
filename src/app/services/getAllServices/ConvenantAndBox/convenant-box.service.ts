import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConvenantBoxService {

  apiUrl= environment.apiUrl+'CovenantBox';

  constructor(private http: HttpClient) { }
  postConvenantBox(tenant: string, contactData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'multipart/form-data',
      'tenant': tenant
    });

    return this.http.post(this.apiUrl, contactData, { headers });
  }
}
