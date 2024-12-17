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
    const formData = new FormData();

    // Append fields to FormData
    formData.append('Name', clientData.name);
    formData.append('LocalName', clientData.localName || ''); // Optional field
    formData.append('Phone', clientData.phone);
    formData.append('Email', clientData.email);
    formData.append('Code', clientData.code || ''); 
    formData.append('tagId', clientData.tagId || '');
    formData.append('priceListId', clientData.priceListId || '');
    formData.append('paymentPeriodId', clientData.paymentPeriodId || '');
    formData.append('paymentMethodId', clientData.paymentMethodId || '');
    formData.append('deliveryMethod', clientData.deliveryMethod || '');
    formData.append('representativeId', clientData.representativeId || '');
    formData.append('teamId', clientData.teamId || '');
    formData.append('costCenterId', clientData.costCenterId || '');
    formData.append('creditLimit', clientData.creditLimit || '');

    // Headers: Add 'tenant' from localStorage or any logic
    const headers = new HttpHeaders({
      tenant: localStorage.getItem('tenant') || '', // Retrieve tenant value
    });

    
    return this.http.post<any>(this.api, formData, { headers });
  }

  getCliensts(): Observable<any> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`https://platformproject-001-site1.anytempurl.com/api/Clients/CreateClient`, { headers });

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
      'Content-Type': 'multipart/form-data',
      'tenant': tenantId || ''  // Set tenantId header if available
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
    
    console.log("Form Service", updatedCategory.attachments);
      updatedCategory.attachments.forEach((attachment: any) => {
        if (attachment.file) {
          // For new files, append the actual file object
          if (attachment.file instanceof File) {
            formData.append('attachmentFiles', attachment.file, attachment.fileTitle);
            console.log('Appending new file:', attachment.fileTitle);
          }
          if (attachment.file.fileUrl) {
            // For existing files, use a metadata representation (fileUrl or any reference)
            formData.append('attachmentFiles', new Blob([JSON.stringify({ fileUrl: attachment.file.fileUrl })], { type: 'application/json' }), attachment.file.fileTitle);
            console.log('Appending existing file reference:', attachment.file.fileTitle);
          }
        } 
      });
      console.log(formData.get("attachmentFiles"))
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
