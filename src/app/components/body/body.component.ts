import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css']
})
export class BodyComponent {
//  @Input() collapsed = true;<= was false
  @Input() collapsed = true;
  @Input() screenWidth = 0;

  getBodyClass(): string {
    let styleClass = '';
    // the condition was (this.collapsed && this.screenWidth>768)
    if(this.collapsed) {
      styleClass = 'body-trimmed';
    } else if(this.collapsed && this.screenWidth <= 768 && this.screenWidth > 0) {
      styleClass = 'body-md-screen'
    }
    return styleClass;
  }
}
