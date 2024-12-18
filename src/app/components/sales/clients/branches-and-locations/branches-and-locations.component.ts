import { Component, NgZone } from '@angular/core';
import { FormArray } from '@angular/forms';

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

  constructor(private ngZone:NgZone){}
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


fileNames: string[] = []; // Array to store file names

attachments:any =[]
    // Method to handle files dropped into the ngx-file-drop zone
    dropped(event: any): void {
      this.toggleDragDrop();
      if (event && event.length) {
        for (const droppedFile of event) {
          const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
    
          if (fileEntry.isFile) {
            fileEntry.file((file: File) => {
              const fileData = {
                fileTitle: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl: null, // Placeholder for URL after upload
                file: file,
              };
              // this.attachments.push(this.fb.control(fileData));
              console.log(this.attachments)
            });
          }
        }
      } else {
        console.error('No files detected in the dropped event:', event);
      }
    }
    
  
  
    // Method to handle when a file is over the drop zone
    fileOver(event: any): void {
      console.log('File is over the drop zone:', event);
    }
  
    // Method to handle when a file leaves the drop zone
    fileLeave(event: any): void {
      console.log('File has left the drop zone:', event);
    }
  // Method to handle file selection
  onFileSelected(event: Event): void {
    this.toggleDragDrop();
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Add the selected file to the FormArray as a FormControl
      const fileData = {
        fileTitle: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: null, // Placeholder for URL after upload
        file: file,
      };
      // this.attachments.push(this.fb.control(fileData));
      console.log(this.attachments)
      // Reset the input value to allow selecting the same file again
      input.value = '';
    }
  }

  // Method to remove a file from the attachments FormArray
  removeAttachment(index: number): void {
    this.attachments.removeAt(index);
    if(this.attachments.length==0) this.toggleDragDrop();
  }

  onFileChange(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.attachments.at(index).patchValue({ file });
    }
  }

  
// Toggle Drag and Drop
showDragDrop =true;
toggleDragDrop(){
  this.showDragDrop = !this.showDragDrop;
}

//Audio
mediaRecorder: MediaRecorder | null = null;
audioChunks: Blob[] = [];
isRecording = false;
recCount =-1;
startRecording() {
  this.isRecording = true;
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.start();
    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };
  }).catch((error) => {
    console.error("Error accessing microphone:", error);
  });
  this.recCount++;
}
isSaving = false;

stopRecording() {
  this.isRecording = false;
  if (this.mediaRecorder) {
    this.isSaving = true;
    this.mediaRecorder.stop();
    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      this.audioChunks = [];
      this.ngZone.run(() => {
        this.uploadAudio(audioBlob);
        this.isSaving = false; // Angular will detect this change
        this.toggleDragDrop();
      });
    };
  }
}

async uploadAudio(audioBlob: Blob) {
  const audioFile = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
  const fileData = {
    fileTitle: this.recCount > 0 ? `${audioFile.name.slice(0, 9)}(${this.recCount})${audioFile.name.slice(9)}` : audioFile.name,
    fileType: audioFile.type,
    fileName: audioFile.name,
    fileSize: audioFile.size,
    file: audioFile,
  };

  // Create a URL for the audio Blob
  const audioUrl = URL.createObjectURL(audioBlob);

  // Update the attachment with audio URL
  // this.attachments.push(this.fb.control({ ...fileData, audioUrl }));

  // Trigger change detection
  // this.changeDetectorRef.detectChanges();
}
}


