import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './components/staff/staff.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { ReceivedCovenantComponent } from './components/staff/received-covenant/received-covenant.component';
import { SectionsComponent } from './components/staff/sections/sections.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { SalesComponent } from './components/sales/sales.component';
import { DescriptionsComponent } from './components/staff/descriptions/descriptions.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { EmployeeRequestsComponent } from './components/approval-requests/employee-requests/employee-requests.component';
import { TypeEmployeeRequestsComponent } from './components/approval-requests/type-employee-requests/type-employee-requests.component';
import { CategoryEmployeeRequestsComponent } from './components/approval-requests/category-employee-requests/category-employee-requests.component';
import { GoodsVoucherComponent } from './components/sales/goods-voucher/goods-voucher.component';
import { ProjectsComponent } from './components/projects-and-contracts/projects/projects.component';
import { TypeOfProjectsComponent } from './components/projects-and-contracts/type-of-projects/type-of-projects.component';
import { ContractsComponent } from './components/projects-and-contracts/contracts/contracts.component';
import { TypeOfContractsComponent } from './components/projects-and-contracts/type-of-contracts/type-of-contracts.component';
import { SalesInvoicesComponent } from './components/sales/sales-invoices/sales-invoices.component';
import { CollectionsComponent } from './components/sales/collections/collections.component';
import { ReceiveVoucherComponent } from './components/sales/receive-voucher/receive-voucher.component';
import { ReturnInvoicesComponent } from './components/sales/return-invoices/return-invoices.component';
import { TagComponent } from './components/sales/clients/tag/tag.component';
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
import { DocumentOperationsComponent } from './components/workServeces/DocumentOperations/document-operations/document-operations.component';
import { UnitComponent } from './components/stock/stock/unit/unit.component';
import { TypeCategoryComponent } from './components/stock/categories/type-category/type-category.component';
import { BrandsComponent } from './components/stock/categories/brands/brands.component';
import { CategoryGroupComponent } from './components/stock/categories/category-group/category-group.component';
import { ItemTypeComponent } from './components/stock/categories/item-type/item-type.component';
import { StorehouseCategoryComponent } from './components/stock/storehouse/storehouse-category/storehouse-category.component';
import { StorehouseComponent } from './components/stock/storehouse/storehouse/storehouse.component';
import { StorageComponent } from './components/stock/storehouse/storage/storage.component';
import { StorehouseTransportationComponent } from './components/stock/storehouse/storehouse-transportation/storehouse-transportation.component';
import { authGuard } from './guard/auth.guard';
import { CateogriesComponent } from './components/stock/categories/cateogries/cateogries.component';
import { RepresentativeComponent } from './components/sales/salesResponsible/representative/representative.component';
import { PriceListComponent } from './components/sales/clients/price-list/price-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  {path:'forgetPassword', component: ForgetPasswordComponent,canActivate:[authGuard]},
  {path:'registration', component:RegisterComponent,canActivate:[authGuard]},
  {path:'sidebar', component:SidebarComponent,canActivate:[authGuard]},
  {path:'login', component: LoginComponent,canActivate:[authGuard]},
  {path:'staff',component:StaffComponent,canActivate:[authGuard]},

  {path:'covenant',component:ReceivedCovenantComponent,canActivate:[authGuard]},
  {path:'sections',component:SectionsComponent,canActivate:[authGuard]},
  {path:'jobs' , component:JobsComponent,canActivate:[authGuard]},
  {path:'sales', component: SalesComponent,canActivate:[authGuard]},
  {path:'description',component:DescriptionsComponent,canActivate:[authGuard]},
  {path:'approval',component:EmployeeRequestsComponent,canActivate:[authGuard]},
  {path:'typeRequest',component:TypeEmployeeRequestsComponent,canActivate:[authGuard]},
  {path:'categoryResquest',component:CategoryEmployeeRequestsComponent,canActivate:[authGuard]},
  // {path:'description',component:DescriptionsComponent,canActivate:[authGuard]},
  {path:'goodsVoucher' , component: GoodsVoucherComponent,canActivate:[authGuard]},
  {path:'projects',component:ProjectsComponent,canActivate:[authGuard]},
  {path:'projectType', component:TypeOfProjectsComponent,canActivate:[authGuard]},
  {path:'contracts',component:ContractsComponent,canActivate:[authGuard]},
  {path:'contractsType',component:TypeOfContractsComponent,canActivate:[authGuard]},
  {path:'salesInvoices', component:SalesInvoicesComponent,canActivate:[authGuard]},
  {path:'collections', component: CollectionsComponent,canActivate:[authGuard]},
  {path:'receiveVoucher', component: ReceiveVoucherComponent,canActivate:[authGuard]},
  {path:'returnInvoices' , component:ReturnInvoicesComponent,canActivate:[authGuard]},
  {path:'Tag', component: TagComponent,canActivate:[authGuard]},
  {path:'repaymentPeriod', component:RepaymentPeriodComponent,canActivate:[authGuard]},
  {path:'repaymentWay', component: RepaymentWayComponent,canActivate:[authGuard]},
  {path:'boxAndCommitment' , component: BoxAndCommitmentComponent,canActivate:[authGuard]},
  {path:'contacts', component: ContactsComponent,canActivate:[authGuard]},
  {path:'branchesAndLocationsOfClients', component:BranchesAndLocationsComponent,canActivate:[authGuard]},
  {path:'clients', component: ClientsComponent,canActivate:[authGuard]},
  {path:'unitCategory',component:UnitCategoryComponent,canActivate:[authGuard]},
  {path:'unit',component:UnitComponent,canActivate:[authGuard]},
  {path:'brands',component:BrandsComponent,canActivate:[authGuard]},
  {path:'groupCategory',component:CategoryGroupComponent,canActivate:[authGuard]},
  {path:'itemType',component:ItemTypeComponent,canActivate:[authGuard]},
  {path:'typeCategory',component:TypeCategoryComponent,canActivate:[authGuard]},
  {path:'categories' , component:CateogriesComponent,canActivate:[authGuard]},
  {path:'storehouseCategory',component:StorehouseCategoryComponent,canActivate:[authGuard]},
  {path:'storehouse',component:StorehouseComponent,canActivate:[authGuard]},
  {path:'storage',component:StorageComponent,canActivate:[authGuard]},
  {path:'transportation',component:StorehouseTransportationComponent,canActivate:[authGuard]},
  {path:'workServicesrequests', component: WorkServecesReqsComponent,canActivate:[authGuard]},
  {path:'workServicesSections', component:WorkServecesSectionsComponent,canActivate:[authGuard]},
  {path:'workServicesType', component:WorkServecesTypeComponent,canActivate:[authGuard]},
  {path:'workServicesCategory', component:WorkServecesCategoryComponent,canActivate:[authGuard]},
  {path:'documentOperations' , component:DocumentOperationsComponent,canActivate:[authGuard]},
  {path:'representatives' , component: RepresentativeComponent},
  {path:'priceLists', component:PriceListComponent},
  {path:'dashboard', component: DashboardComponent},
  {path:'', component:LoginComponent},
  {path:'**', component:LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
