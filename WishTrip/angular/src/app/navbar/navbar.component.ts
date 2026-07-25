import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConfigStateService, AuthService } from '@abp/ng.core';
import { UserProfileService } from '../proxy/users/user-profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private configState = inject(ConfigStateService);
  private profileService = inject(UserProfileService);
  public router = inject(Router);
  private authService = inject(AuthService);

  hasLoggedIn = false;
  currentUserName = '';
  avatarUrl = '';
  showUserMenu = false;

  ngOnInit() {
    const currentUser = this.configState.getOne('currentUser');
    this.hasLoggedIn = currentUser?.isAuthenticated || false;
    this.currentUserName = currentUser?.userName || '';

    if (this.hasLoggedIn && this.currentUserName) {
      this.profileService.getProfile(this.currentUserName).subscribe({
        next: (data) => {
          this.avatarUrl = data?.avatarUrl ||
            `https://api.dicebear.com/7.x/pixel-art/svg?seed=${this.currentUserName}`;
        },
        error: () => {
          this.avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${this.currentUserName}`;
        }
      });
    }
  }

  toggleUserMenu() { this.showUserMenu = !this.showUserMenu; }
  closeUserMenu() { this.showUserMenu = false; }
  goTo(path: string) { this.showUserMenu = false; this.router.navigate([path]); }
  logout() {
    this.showUserMenu = false;
    this.authService.logout().subscribe(); 
  }
}