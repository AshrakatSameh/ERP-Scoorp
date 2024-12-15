import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StoresSectionService {

  private apiUrl = environment.apiUrl; 


  constructor(private http : HttpClient) { }

     // Method to fetch UserTags based on tenantId
     getUnitCategories(pageNumber:number, pageSize: number): Observable<any> {
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
      return this.http.get(`${this.apiUrl}StoresSection/unit-categories`, { headers, params });
      
    }


    getAllUnitCategories(): Observable<any> {
      // Get tenantId from localStorage
      const tenantId = localStorage.getItem('tenant');
  
      // Set the custom header with the tenantId
      const headers = new HttpHeaders({
        tenant: tenantId || '', // Set tenantId header if available
        'Content-Type': 'application/json',
      });
  
      // Send the GET request with headers
      return this.http.get(`${this.apiUrl}StoresSection/unit-categories`, { headers });
      
    }


    createUnitCategory(unitCatData: any): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
      const headers = new HttpHeaders({
        tenant: tenantId || '', // Set tenantId header if available
        'Content-Type': 'application/json',
      });
      console.log(unitCatData)
      return this.http.post(`${this.apiUrl}StoresSection/unit-category?`, unitCatData, { headers });
    }

    updateUnitCat(id: number, updatedCategory: any): Observable<any> {
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
      if (updatedCategory.attachments && updatedCategory.attachments.length > 0) {
        updatedCategory.attachments.forEach((attachment: any) => {
          if (attachment.fileUrl) {
            // For existing files, use a metadata representation (fileUrl or any reference)
            formData.append('attachmentFiles', new Blob([JSON.stringify({ fileUrl: attachment.fileUrl })], { type: 'application/json' }), attachment.fileTitle);
            console.log('Appending existing file reference:', attachment.fileTitle);
          }
          if (attachment.file instanceof File) {
            // For new files, append the actual file object
            formData.append('attachmentFiles', attachment.file, attachment.fileTitle);
            console.log('Appending new file:', attachment.fileTitle);
          }
        });
      }
      else{
        formData.append('attachmentFiles',new Blob(),'empty');
      }
      // API call with PUT method using the FormData and headers
      return this.http.put(`${this.apiUrl}StoresSection/unit-category/${id}`, formData, { headers });
    }
    
    deleteUnitCatById(id: number): Observable<void> {
      const tenantId = localStorage.getItem('tenant'); 
      const headers = new HttpHeaders({
        tenant: tenantId || '',
        // 'Content-Type': 'application/json',
      });
      return this.http.delete<void>(`${this.apiUrl}StoresSection/unit-category/${id}`,{headers});
    }
    deleteMultipleUnitCats(ids: number[]): Observable<void[]> {
      const deleteObservables = ids.map((id) => this.deleteUnitCatById(id));
      return forkJoin(deleteObservables);
    }
    getUnitCategoryById(id: number) {
      return this.http.get<{ UnitCategoryName: string }>(`${this.apiUrl}/${id}`);
    }
}
