import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthNotificationService } from '../../services/auth-notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authNotificationService = inject(AuthNotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
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

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        if (response.success) {
          const returnUrl = this.router.getCurrentNavigation()?.extras?.queryParams?.['returnUrl'] || '/dashboard';
          // Arrancar el servicio de notificaciones con el token recién obtenido
          this.authNotificationService.start();
          this.router.navigate([returnUrl]);
        } else {
          this.errorMessage = response.message || 'Error en la respuesta';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        const msg = error?.error?.message || error?.message || 'Error al iniciar sesión';
        this.errorMessage = msg;
        this.loginForm.reset();
        this.cdr.detectChanges();
      }
    });
  }
}
