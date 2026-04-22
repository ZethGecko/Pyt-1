import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthService } from './services/auth.service';
import { PermissionService } from './services/permission.service';
import { TokenService } from './services/token.service';
import { AuthStateService } from './state/auth.state';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ])
  ],
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  providers: [
    AuthService,
    PermissionService,
    TokenService,
    AuthStateService,
    // Guards ya registrados globalmente en app.config.ts
  ],
  exports: [
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthModule { }