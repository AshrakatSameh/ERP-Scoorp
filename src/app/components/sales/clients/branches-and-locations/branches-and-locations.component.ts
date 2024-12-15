import { Component } from '@angular/core';

@Component({
  selector: 'app-branches-and-locations',
  templateUrl: './branches-and-locations.component.html',
  styleUrls: ['./branches-and-locations.component.css']
})
export class BranchesAndLocationsComponent {
  isMapView = false;

  toggleMap() {
    this.isMapView = true
  }
  closeMap() {
    this.isMapView = false;
  }

  
  isModalOpen = false;
  selectedCategory: any = null;
  selectedForDelete: any[] = [];
  // onCheckboxChange(category: any, event: any) {
  //   if (event.target.checked) {
  //     // Add the item to the selectedForDelete array
  //     this.selectedForDelete.push(category);
  //     // Update selectedCount
  //     this.selectedCount++;
  //     // If this is the first category selected, update selectedCategory for updating
  //     if (!this.selectedCategory) {
  //       this.selectedCategory = { ...category };
  //     }
  //   } else {
  //     // Remove the category from the selectedForDelete array if unchecked
  //     const index = this.selectedForDelete.findIndex((i) => i.id === category.id);
  //     if (index > -1) {
  //       this.selectedForDelete.splice(index, 1);
  //     }
  //     // Update selectedCount
  //     this.selectedCount--;
  //     // If this category is deselected and was the selectedCategory, clear it
  //     if (this.selectedCategory?.id === category.id) {
  //       this.selectedCategory = null;
  //     }
  //   }
  //   this.updateSelectAll(); // Update the "select all" checkbox status
  // }
}
