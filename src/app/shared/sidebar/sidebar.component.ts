import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, HostListener, OnInit, Output, Renderer2 } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('350ms',
          style({opacity: 1})
        )
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('350ms',
          style({opacity: 0})
        )
      ])
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms', 
          keyframes([
            style({transform: 'rotate(0deg)', offset: '0'}),
            style({transform: 'rotate(2turn)', offset: '1'})
          ])
        )
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit {
  isOpen = true;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  constructor(private authService: AuthService,    private renderer: Renderer2,
  ) {
   
  }
  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }

  isCollapsed: { [key: string]: boolean } = {
    type: true,


    salesMovementSub: true,
    salesManagersSub: true,
    clientsSub: true,
    salesReportsSub: true,
    settingsSub: true,
    sidebarLayouts: true
  };

  logout() {
    const tenant = localStorage.getItem('tenant');
    localStorage.clear;
    if (tenant) {
      this.authService.logout(tenant).subscribe(
        (response) => {
          console.log('Logged out successfully', response);
          // Perform any additional actions on successful logout
        },
        (error) => {
          console.error('Logout failed', error);
          // Handle error case
        }
      );
    } else {
      console.warn('No tenant found in local storage');
    }};


  isCollapsed2: { [key: string]: boolean } = {
    warehouseMovementSub: true,
    warehouseManagersSub: true,
    typeSub: true,
    warehouseReportsSub: true,
    settingsSub2: true,
  };

  openSubmenus: { [key: string]: boolean } = {};

  toggleSubmenu(menuId: string) {
    // Close the currently open submenu if it's different
    for (const key in this.openSubmenus) {
      if (key !== menuId) {
        this.openSubmenus[key] = false;
      }
    }
    // Toggle the clicked submenu
    this.openSubmenus[menuId] = !this.openSubmenus[menuId];
  }

  isSubmenuOpen(menuId: string): boolean {
    return !!this.openSubmenus[menuId];
  }
  
  toggleCollapse(section: string) {
    this.isCollapsed[section] = !this.isCollapsed[section];
  }


  toggleCollapse2(section: string) {
    this.isCollapsed2[section] = !this.isCollapsed2[section];
  }


   // Track collapsed states
   isCollapsed3: { [key: string]: boolean } = {
    mainMenu: true,
    projectsMovementSub: true,
    contractsMovementSub: true
  };

  // Toggle collapse based on section key
  toggleCollapse3(section: string) {
    this.isCollapsed3[section] = !this.isCollapsed3[section];
  }

  // Track collapsed states
  isCollapsed4: { [key: string]: boolean } = {
    charts: true,
    forms: true, 
    tables: true,
    
    warehouseMovementSub: true,
    warehouseManagersSub: true,
    typeSub: true,
    warehouseReportsSub: true,
    settingsSub2: true,
  };

  // Toggle collapse based on section key
  toggleCollapse4(section: string) {
    
    this.isCollapsed4[section] = !this.isCollapsed4[section];
  }

  // ////////////////////////////////////////////
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = true;
  screenWidth = 0;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768 ) {
      this.collapsed = false;
      this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
    }
  }
  toggleCollapseNav(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

}
