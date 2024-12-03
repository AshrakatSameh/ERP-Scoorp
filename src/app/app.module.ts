import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

// Translation imports

import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { StaffComponent } from './components/staff/staff.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { ReceivedCovenantComponent } from './components/staff/received-covenant/received-covenant.component'
import { RouterModule } from '@angular/router';
import { SectionsComponent } from './components/staff/sections/sections.component';
import { SalesComponent } from './components/sales/sales.component';
import { DescriptionsComponent } from './components/staff/descriptions/descriptions.component';
import { GoodsVoucherComponent } from './components/sales/goods-voucher/goods-voucher.component';
import { EmployeeRequestsComponent } from './components/approval-requests/employee-requests/employee-requests.component';
import { TypeEmployeeRequestsComponent } from './components/approval-requests/type-employee-requests/type-employee-requests.component';
import { CategoryEmployeeRequestsComponent } from './components/approval-requests/category-employee-requests/category-employee-requests.component';
import { SalesInvoicesComponent } from './components/sales/sales-invoices/sales-invoices.component';
import { CollectionsComponent } from './components/sales/collections/collections.component';
import { ReceiveVoucherComponent } from './components/sales/receive-voucher/receive-voucher.component';
import { ReturnInvoicesComponent } from './components/sales/return-invoices/return-invoices.component';
import { TagComponent } from './components/sales/clients/tag/tag.component';
import { ProjectsComponent } from './components/projects-and-contracts/projects/projects.component';
import { TypeOfProjectsComponent } from './components/projects-and-contracts/type-of-projects/type-of-projects.component';
import { ContractsComponent } from './components/projects-and-contracts/contracts/contracts.component';
import { TypeOfContractsComponent } from './components/projects-and-contracts/type-of-contracts/type-of-contracts.component';
import { RepaymentPeriodComponent } from './components/sales/clients/repayment-period/repayment-period.component';
import { RepaymentWayComponent } from './components/sales/clients/repayment-way/repayment-way.component';
import { BoxAndCommitmentComponent } from './components/sales/salesResponsible/box-and-commitment/box-and-commitment.component';
import { ContactsComponent } from './components/sales/clients/contacts/contacts.component';
import { BranchesAndLocationsComponent } from './components/sales/clients/branches-and-locations/branches-and-locations.component';
import { ClientsComponent } from './components/sales/clients/clients/clients.component';
import { UnitCategoryComponent } from './components/stock/stock/unit-category/unit-category.component';
import { WorkServecesReqsComponent } from './components/workServeces/work-service-Reqs/work-serveces-reqs/work-serveces-reqs.component';
import { WorkServecesSectionsComponent } from './components/workServeces/work-services-sections/work-serveces-sections/work-serveces-sections.component';
import { WorkServecesTypeComponent } from './components/workServeces/Work-services-type/work-serveces-type/work-serveces-type.component';
import { WorkServecesCategoryComponent } from './components/workServeces/work-serveces-category/work-serveces-category.component';
import { CommonModule } from '@angular/common';
import { DocumentOperationsComponent } from './components/workServeces/DocumentOperations/document-operations/document-operations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';

import { UnitComponent } from './components/stock/stock/unit/unit.component';
import { TypeCategoryComponent } from './components/stock/categories/type-category/type-category.component';
import { BrandsComponent } from './components/stock/categories/brands/brands.component';
import { CategoryGroupComponent } from './components/stock/categories/category-group/category-group.component';
import { ItemTypeComponent } from './components/stock/categories/item-type/item-type.component';
import { StorehouseCategoryComponent } from './components/stock/storehouse/storehouse-category/storehouse-category.component';
import { StorehouseComponent } from './components/stock/storehouse/storehouse/storehouse.component';
import { StorageComponent } from './components/stock/storehouse/storage/storage.component';
import { StorehouseTransportationComponent } from './components/stock/storehouse/storehouse-transportation/storehouse-transportation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CateogriesComponent } from './components/stock/categories/cateogries/cateogries.component';
import { RepresentativeComponent } from './components/sales/salesResponsible/representative/representative.component';
import { JWT_OPTIONS, JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { ToastrModule } from 'ngx-toastr';
import { PriceListComponent } from './components/sales/clients/price-list/price-list.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BodyComponent } from './components/body/body.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    StaffComponent,
    JobsComponent,
    ReceivedCovenantComponent,
    SectionsComponent,
    SalesComponent,
    DescriptionsComponent,
    GoodsVoucherComponent,
    EmployeeRequestsComponent,
    TypeEmployeeRequestsComponent,
    CategoryEmployeeRequestsComponent,
    ProjectsComponent,
    TypeOfProjectsComponent,
    ContractsComponent,
    TypeOfContractsComponent,
    SalesInvoicesComponent,
    CollectionsComponent,
    ReceiveVoucherComponent,
    ReturnInvoicesComponent,
    TagComponent,
    CategoryEmployeeRequestsComponent,
   
    RepaymentPeriodComponent,
    RepaymentWayComponent,
    BoxAndCommitmentComponent,
    ContactsComponent,
    BranchesAndLocationsComponent,
    ClientsComponent,
    UnitCategoryComponent,
    WorkServecesReqsComponent,
    WorkServecesSectionsComponent,
    WorkServecesTypeComponent,
    WorkServecesCategoryComponent,
    DocumentOperationsComponent,
    UnitComponent,
    TypeCategoryComponent,
    BrandsComponent,
    CategoryGroupComponent,
    ItemTypeComponent,
    StorehouseCategoryComponent,
    StorehouseComponent,
    StorageComponent,
    StorehouseTransportationComponent,
    DocumentOperationsComponent,
    LoginComponent,
    CateogriesComponent,
    RepresentativeComponent,
    PriceListComponent,
    BodyComponent,
    DashboardComponent,
    
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    NgSelectModule, 
    NgMultiSelectDropDownModule.forRoot() ,
    // JwtModule
    ToastrModule.forRoot({ // Initialize Toastr with configuration
      positionClass: 'toast-top-right', // Position of the toast
      timeOut: 5000, // Duration in milliseconds
      preventDuplicates: true, // Prevent duplicate toasts
    }),
    NgbModule
    // NgToastModule, 
    // TranslateModule.forRoot({
    //   defaultLanguage: 'ar',

    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: HttpLoaderFactory,
    //     deps: [HttpClient]
    //   },
    // })
  ],
  providers: [
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },  // Provide JWT options
    JwtHelperService,
    NgbActiveModal  // Add JwtHelperService to the providers array
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }