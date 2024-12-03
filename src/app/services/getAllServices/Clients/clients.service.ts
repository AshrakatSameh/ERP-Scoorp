import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  apiUrl = environment.apiUrl;
  api = `${this.apiUrl}Clients/CreateClient`
  constructor(private http:HttpClient) { }

  getAllCliensts(pageNumber: number, pageSize: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      'Content-Type': 'application/json',
    });
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Clients/GetAllClients`, { headers, params });

  }

  getClietById(id:number){
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}Clients/GetClientById/${id}`,{headers});
  }


  createClient(clientData: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    console.log(clientData)
    // Construct the URL with query parameters from the form data
    const url = `${this.api}?Name=${encodeURIComponent(clientData.name)}&LocalName=${encodeURIComponent(clientData.localName)}&Phone=${encodeURIComponent(clientData.phone)}&Email=${encodeURIComponent(clientData.email)}&Code=${encodeURIComponent(clientData.code)}&TagId=${encodeURIComponent(clientData.tagId)}`;

    // Make the POST request
    return this.http.post(url, clientData, {headers});
    

  }

  getCliensts(): Observable<any> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Clients/GetAllClients`, { headers });

  }

  // deleteClientById(id: number): Observable<void> {
  //   const tenantId = localStorage.getItem('tenant'); 
  //   const headers = new HttpHeaders({
  //     tenant: tenantId || '',
  //     'Content-Type': 'application/json',
  //   });
  //   return this.http.delete<void>(`${this.apiUrl}Clients/DeleteClient/${id}`,{headers});
  // }


  updateClient(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
    const formData = new FormData();
    formData.append('name', updatedCategory.name || '');
    formData.append('localName', updatedCategory.localName || '');
    formData.append('phone', updatedCategory.phone || '');
    formData.append('email', updatedCategory.email || '');
    formData.append('code', updatedCategory.code || '');
    formData.append('priceListId', updatedCategory.priceListId || '');
    formData.append('tagId', updatedCategory.tagId || '');
    formData.append('paymentPeriodId', updatedCategory.paymentPeriodId || '');
    formData.append('paymentMethodId', updatedCategory.paymentMethodId || '');
    formData.append('deliveryMethod', updatedCategory.deliveryMethod || '');
    formData.append('representativeId', updatedCategory.representativeId || '');
    formData.append('teamId', updatedCategory.teamId || '');
    formData.append('costCenterId', updatedCategory.costCenterId || '');
    formData.append('creditLimit', updatedCategory.creditLimit || '');
      
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Clients/UpdateClient/${id}`, formData, { headers });
  }
  

  deleteClientById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}Clients/DeleteClient/${id}`,{headers});
  }
}
