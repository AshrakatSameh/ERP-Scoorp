import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  apiUrl = environment.apiUrl;  
  api = 'https://lawersys-001-site1.etempurl.com/api/Employees/CreateEmployee'

  constructor(private http: HttpClient) { }


  createEmployee(employeeData: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    console.log(employeeData.value)
    // Construct the URL with query parameters from the form data
    const url = `${this.api}?Name=${employeeData.name}&LocalName=${employeeData.localName}&JobTitle=${employeeData.jobTitle}&DepartmentManagerId=${employeeData.departmentManagerId}&DepartmentSupervisorId=${employeeData.departmentSupervisorId}&StartDate=${employeeData.startDate}&EndDate=${employeeData.endDate}&DepartmentId=${employeeData.departmentId}`;

    // Make the POST request
    return this.http.post(url, {}, { headers });
  }




  getAllEmployees(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}Employees/GetAllEmployees`, { headers, params });

  }

  // Called when the user changes the page number (e.g. via pagination controls)

  getAllEmployeesWithoutPaging(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Employees/GetAllEmployees`, { headers });

  }

  updateEmployee(id: number, updatedCategory: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('name', updatedCategory.name || '');
    formData.append('localName', updatedCategory.localName || '');
    formData.append('jobTitle', updatedCategory.jobTitle || '');
    formData.append('departmentSupervisorId', updatedCategory.departmentSupervisorId || '');
    formData.append('departmentManagerId', updatedCategory.departmentManagerId || '');
    formData.append('departmentId', updatedCategory.departmentId || '');
    formData.append('startDate', updatedCategory.startDate || '');
    formData.append('startDate', updatedCategory.startDate || '');
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Employees/UpdateEmployee/${id}`, formData, { headers });
  }

  deleteEmployeeById(id: number): Observable<void> {
    const tenantId = localStorage.getItem('tenant'); 
    const headers = new HttpHeaders({
      tenant: tenantId || '',
      // 'Content-Type': 'application/json',
    });
    return this.http.delete<void>(`${this.apiUrl}Employees/${id}`,{headers});
  }
}
