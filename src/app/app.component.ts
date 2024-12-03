import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators'; 

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  showSidebar = true;  // By default, show the sidebar


  showHeaderFooter = true;
  constructor(private router: Router){
   // Listen to routing events
   this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      // Check if the current route is 'dashboard' and hide the header/footer if true
      this.showHeaderFooter = this.router.url !== '/forgetPassword' &&
     this.router.url !== '/login'&&
     this.router.url !== '/';

    }
  });
  }
  ngOnInit(): void {
    // Listen for route changes to determine when to hide the sidebar
   this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    // Hide sidebar when the user is on the 'login' route
    this.showSidebar = !(this.router.url === '/login' || this.router.url === '/');
  });
  }
  // constructor(private translate: TranslateService, private router: Router) {
  //   translate.use('ar')
  // }
  title = 'scoorp';
// it was false
  isSideNavCollapsed = true;
  screenWidth = 0;

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }
   


}
