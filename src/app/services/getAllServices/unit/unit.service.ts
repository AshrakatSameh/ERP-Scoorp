import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }

  // Method to fetch UserTags based on tenantId
  getUnits(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}StoresSection/units`, { headers, params });

  }


  getAllUnits(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}StoresSection/units`, { headers });

  }
  getAllUnitsWithPaging(pageNumber:number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}StoresSection/units`, { headers , params});

  }


  createUnits(unit: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    console.log(unit)
    return this.http.post(`${this.apiUrl}StoresSection/unit?`, unit, { headers });
  }

  updateUnit(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('name', updatedCategory.name || '');
    formData.append('localName', updatedCategory.localName || '');
    formData.append('note', updatedCategory.note || '');
    formData.append('UnitCategoryId', updatedCategory.UnitCategoryId || '');
    console.log('Full attachments:', updatedCategory.attachments);
    // Add new and existing attachments to the FormData
    updatedCategory.attachments.forEach((attachment: any) => {
      console.log(attachment)
      // Existing attachments (with fileUrl)
      if (attachment.fileUrl) {
        formData.append('existingAttachments', attachment.fileTitle);
        console.log('Appending existing attachment:', attachment.fileTitle);
      } 
      // New file uploads (with File object)
      if (attachment.file instanceof File) {
        formData.append('attachmentFiles', attachment.file, attachment.fileTitle);
        console.log('Appending new file:', attachment.fileTitle);
      }
    });
    
    for (const [key, value] of (formData as any).entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, value.name); // Log file name
      } else {
        console.log(`${key}:`, value); // Log value
      }
    }
    
    
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}StoresSection/unit/${id}`, formData, { headers });
  }
  
  
  // deleteUnitById(id: number): Observable<void> {
  //   const tenantId = localStorage.getItem('tenant'); 
  //   const headers = new HttpHeaders({
  //     tenant: tenantId || '',
  //     // 'Content-Type': 'application/json',
  //   });
  //   return this.http.delete<void>(`${this.apiUrl}StoresSection/unit/${id}`,{headers});
  // }

  deleteUnitById(id: number, headers: HttpHeaders): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}StoresSection/unit/${id}`, { headers });
  }
  
}
