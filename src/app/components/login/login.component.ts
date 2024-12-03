import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;

  selectedTenant: string = '';
  constructor(  private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  private http: HttpClient){
      this.loginForm = this.fb.group({
        tenant: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      });
    }

  
  

    onSubmit() {
      // if (this.loginForm.valid) {
      //   const { tenant, email, password } = this.loginForm.value;
  
      //   // Call the AuthService to send login request
      //   this.authService.login({ email, password }, tenant).subscribe(
      //     (response) => {
      //       console.log('Login successful:', response);
      //       // Store token and navigate or handle further actions
      //       localStorage.setItem('authToken', response.token); // Store JWT token
      //       this.router.navigate(['/sidebar']); // Redirect on successful login
      //     },
      //     (error) => {
      //       console.error('Login failed:', error);
      //       // Handle login failure (e.g., show error message)
      //     }
      //   );
      // }


      if (this.loginForm.valid) {
        const { tenant, email, password } = this.loginForm.value;
    
        // Call the AuthService to send login request
        this.authService.login({ email, password }, tenant).subscribe(
          (response) => {
            console.log('Login successful:', response);
            
            // Store the JWT token in localStorage
            let tenantId=localStorage.setItem('tenant',tenant);
            // console.log(this.authService.refreshToken(tenantId));
            localStorage.setItem('authToken', response.token);
            this.router.navigate(['/dashboard']); 
          },
          (error) => {
            console.error('Login failed:', error);
            // Handle login failure (e.g., show error message)
          }
        );
      }
     

    }

    // private api = environment.apiUrl;
    // // Method to refresh the access token using the refresh token stored in the cookie
    // refreshToken(): Observable<any> {
    //   // Retrieve tenant from local storage
    //   const tenant = localStorage.getItem('tenant') || ''; // Default to an empty string if null
  
    //   const headers = new HttpHeaders({
    //     tenant: tenant // tenant is guaranteed to be a string here
    //   });
  
    //   // Send the request to refresh the token
    //   return this.http.post<any>(`${this.api}Auth/RefreshToken`, {}, { headers });
    // }

}
