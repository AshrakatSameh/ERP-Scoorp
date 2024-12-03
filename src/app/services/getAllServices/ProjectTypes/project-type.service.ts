import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProjectTypeService {

  // ProjectTypes/GetAllProjectTypes;
  private apiUrl = environment.apiUrl; 


  constructor(private http : HttpClient) { }

     // Method to fetch UserTags based on tenantId
     getAllProjectTypes(pageNumber: number, pageSize: number): Observable<any> {
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
      return this.http.get(`${this.apiUrl}ProjectTypes/GetAllProjectTypes`, { headers ,params});
    }
    getAllProjectTypesNoPaging(): Observable<any> {
      // Get tenantId from localStorage
      const tenantId = localStorage.getItem('tenant');
  
      // Set the custom header with the tenantId
      const headers = new HttpHeaders({
        tenant: tenantId || '', // Set tenantId header if available
        'Content-Type': 'application/json',
      });
  
      // Send the GET request with headers
      return this.http.get(`${this.apiUrl}ProjectTypes/GetAllProjectTypes`, { headers });
    }

    createProjectType(Data: any): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
      const headers = new HttpHeaders({
        tenant: tenantId || '', // Set tenantId header if available
        'Content-Type': 'application/json',
      });
      console.log(Data)
      return this.http.post(`${this.apiUrl}ProjectTypes/CreateProjectType`, Data, { headers });
    }



    
    updateProjectType(id: number, updatedCategory: any): Observable<any> {
      const tenantId = localStorage.getItem('tenant');
    
      // Create headers with tenant info
      const headers = new HttpHeaders({
        'Content-Type': 'application/json', // Set Content-Type for JSON
        tenant: tenantId || '' // Set tenantId header if available
      });
    
      // Prepare JSON payload
      const payload = {
        name: updatedCategory.name || '',
        localName: updatedCategory.localName || '',
        description: updatedCategory.description || ''
      };
    
      // API call with PUT method using JSON payload and headers
      return this.http.put(`${this.apiUrl}ProjectTypes/UpdateProjectType/${id}`, payload, { headers });
    }
    
    
    deleteProjectTypeById(id: number): Observable<void> {
      const tenantId = localStorage.getItem('tenant'); 
      const headers = new HttpHeaders({
        tenant: tenantId || '',
        // 'Content-Type': 'application/json',
      });
      return this.http.delete<void>(`${this.apiUrl}ProjectTypes/${id}`,{headers});
    }
}
