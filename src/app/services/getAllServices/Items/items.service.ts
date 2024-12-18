import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  apiUrl= environment.apiUrl;
  constructor(private http: HttpClient) { }

  getAllItems(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Items`, { headers });

  }
  getAllStoredItems(): Observable<any> {
    // Get tenantId from localStorage
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });

    // Send the GET request with headers
    return this.http.get(`${this.apiUrl}Items/non-storable-items`, { headers });

  }
  getAllItemsWithoutPaging(pageNumber: number, pageSize: number): Observable<any> {
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
    return this.http.get(`${this.apiUrl}Items`, { headers, params });

  }
///get item by Id
  getItemDetails(itemId: number): Observable<any> {
    const tenantId = localStorage.getItem('tenant');

    // Set the custom header with the tenantId
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      // 'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}Items/${itemId}`,{headers});
  }


  creategetItems(job: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    const headers = new HttpHeaders({
      tenant: tenantId || '', // Set tenantId header if available
      'Content-Type': 'application/json',
    });
    console.log(job)
    return this.http.post(`${this.apiUrl}Items?`, job, { headers });
  }
  
  updateItems(id: number, updatedJobDes: any): Observable<any> {
    const tenantId = localStorage.getItem('tenant');
    
    // Create headers with tenant info
    const headers = new HttpHeaders({
      tenant: tenantId || ''  // Set tenantId header if available
    });
  
    // Prepare FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('name', updatedJobDes.name || '');

    formData.append('localName', updatedJobDes.localName || '');
    formData.append('canBeSold', updatedJobDes.canBeSold || '');
    formData.append('canBePurchased', updatedJobDes.canBePurchased || '');
    formData.append('canBeConsumed', updatedJobDes.canBeConsumed || '');
    formData.append('itemCategoryId', updatedJobDes.itemCategoryId || '');
    formData.append('barcode', updatedJobDes.barcode || '');
    formData.append('code', updatedJobDes.code || '');
    formData.append('itemTypeId', updatedJobDes.itemTypeId || '');
    formData.append('unitId', updatedJobDes.unitId || '' );
    formData.append('salesPrice', updatedJobDes.salesPrice || '' );
    formData.append('salesTax', updatedJobDes.salesTax || '');
    formData.append('costCenterId', updatedJobDes.costCenterId || '');
    formData.append('brandId', updatedJobDes.brandId || '');
    formData.append('note', updatedJobDes.note || '');
    formData.append('localNote', updatedJobDes.localNote || '');
    formData.append('totalSoldQuantity', updatedJobDes.totalSoldQuantity || '');
    formData.append('totalPurchasedQuantity', updatedJobDes.totalPurchasedQuantity || '');
    formData.append('totalCurrentStock', updatedJobDes.totalCurrentStock || '');
    formData.append('width', updatedJobDes.width || '');
    formData.append('length', updatedJobDes.length || '');
    formData.append('height', updatedJobDes.height || '');
    formData.append('pallet', updatedJobDes.pallet ||  '');
    formData.append('palletHeight', updatedJobDes.palletHeight || '');
    formData.append('thickness', updatedJobDes.thickness || '');
    formData.append('weight', updatedJobDes.weight || '');
    formData.append('customField', updatedJobDes.customField || '');
  
    // API call with PUT method using the FormData and headers
    return this.http.put(`${this.apiUrl}Items/${id}`, formData, { headers });
  }



  deleteItemById(id: number): Observable<any> {
    const headers = new HttpHeaders({
        'tenant': localStorage.getItem('tenant') || ''
    });
    const url = `${this.apiUrl}Items/${id}`;
    console.log('DELETE URL:', url); // Log the final URL
    return this.http.delete<void>(`${this.apiUrl}Items/${id}`, { headers });
}

getItemTypeById(itemTypeId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}Items/StoresSection/item-type/${itemTypeId}`);
}

// Fetch unit name by ID
getUnitById(unitId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}StoresSection/unit/${unitId}`);
}

// Fetch cost center name by ID
getCostCenterById(costCenterId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}CostCenter/${costCenterId}`);
}

// Fetch brand name by ID
getBrandById(brandId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}StoresSection/brands/${brandId}`);
}

getItemsActivities(modelId:number): Observable<any>{
  const tenantId = localStorage.getItem('tenant');
  
  // Create headers with tenant info
  const headers = new HttpHeaders({
    tenant: tenantId || '' // Set tenantId header if available
  });
  return this.http.get(`${this.apiUrl}Items/GetActivities/${modelId}`, { headers });
}
}
