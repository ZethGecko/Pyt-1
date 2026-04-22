import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html', 
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    console.log('[LoginComponent] onSubmit() - isLoading:', this.isLoading, 'errorMessage:', this.errorMessage);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!
    };

    console.log('[LoginComponent] Enviando credenciales para:', credentials.username);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('[LoginComponent] Respuesta recibida:', response);
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Error en la respuesta';
          this.cdr.detectChanges(); // Forzar detección de cambios
          console.log('[LoginComponent] Error en respuesta:', this.errorMessage);
        }
      },
      error: (error) => {
        console.log('[LoginComponent] Error en petición:', error);
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        const msg = error?.error?.message || error?.message || 'Error al iniciar sesión';
        this.errorMessage = msg;
        this.cdr.detectChanges(); // Forzar detección de cambios
        console.log('[LoginComponent] Mensaje de error asignado:', this.errorMessage);
      }
    });
  }
}