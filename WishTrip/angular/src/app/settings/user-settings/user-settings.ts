import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; 
import { ConfigStateService, AuthService } from '@abp/ng.core';
import { UserProfileService } from '../../proxy/users/user-profile.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './user-settings.html',
  styleUrls: ['./user-settings.scss']
})
export class UserSettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private profileService = inject(UserProfileService);
  private configState = inject(ConfigStateService);
  private authService = inject(AuthService);

  activeTab: 'social' | 'seguridad' = 'social';
  editData = { userName: '', name: '', email: '', bio: '', avatarUrl: '' };
  passData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  currentUserInfo: any;
  mensajeSocial = '';
  mensajeSeguridad = '';
  mensajeEmail = '';

  ngOnInit() {
    this.currentUserInfo = this.configState.getOne('currentUser');
    if (this.currentUserInfo) { this.loadMyData(); }
  }

  loadMyData() {
    this.profileService.getProfile(this.currentUserInfo.userName).subscribe({
      next: (data) => {
        this.editData = { 
          userName: data.userName, 
          name: data.name, 
          email: data.email || this.currentUserInfo.email,
          bio: data.bio, 
          avatarUrl: data.avatarUrl 
        };
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.editData.avatarUrl = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar() {
    this.editData.avatarUrl = ''; 
    if (this.fileInput) { this.fileInput.nativeElement.value = ''; }
    this.mensajeSocial = 'Foto removida. Presiona "Guardar" para activar el Pixel Art.';
  }

  setTab(tab: 'social' | 'seguridad') {
    this.activeTab = tab;
    this.mensajeSocial = ''; this.mensajeSeguridad = ''; this.mensajeEmail = '';
  }

  saveSocial() {
    this.profileService.updateProfile(this.editData).subscribe({
      next: () => {
        this.mensajeSocial = '¡Perfil actualizado!';
        if (this.editData.userName !== this.currentUserInfo.userName) {
            alert('Nombre cambiado. Reiniciando sesión...');
            this.logout(); 
        } else {
            setTimeout(() => { window.location.href = '/perfil/' + this.editData.userName; }, 1000);
        }
      },
      error: () => this.mensajeSocial = 'Error al actualizar.'
    });
  }

  saveEmail() {
    this.profileService.updateProfile(this.editData).subscribe({
      next: () => { this.mensajeEmail = '¡Correo actualizado!'; },
      error: (err) => { this.mensajeEmail = err?.error?.error?.message || 'Error al actualizar email.'; }
    });
  }

  changePassword() {
    if (this.passData.newPassword !== this.passData.confirmPassword) {
      this.mensajeSeguridad = 'Las contraseñas no coinciden.'; return;
    }
    this.profileService.changePassword({
      currentPassword: this.passData.currentPassword,
      newPassword: this.passData.newPassword
    }).subscribe({
      next: () => {
        this.mensajeSeguridad = '¡Contraseña cambiada!';
        this.passData = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: () => this.mensajeSeguridad = 'Error: Contraseña actual incorrecta.'
    });
  }

  deleteAccount() {
    if (confirm('¿Eliminar cuenta permanentemente?')) {
      this.profileService.deleteMyAccount().subscribe(() => {
        this.authService.logout().subscribe(() => { window.location.href = '/'; });
      });
    }
  }

  logout() { this.authService.logout().subscribe(); }
}