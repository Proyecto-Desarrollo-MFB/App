import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoreModule, ConfigStateService } from '@abp/ng.core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CoreModule, RouterLink],
  template: `
    <div class="home-container d-flex align-items-center justify-content-center text-white">
      <div class="text-center px-4 branding-section">
        
        <h1 class="display-1 fw-bold text-uppercase tracking-wider main-title mb-2">
          WISHTRIP
        </h1>
        
        <p class="lead text-white-50 mb-5 tracking-light">
          Registra. Reseña. Descubre tus próximos destinos.
        </p>

        <div class="mt-5">
            <ng-container *ngIf="hasLoggedIn; else loginBlock">
                <div class="d-flex justify-content-center gap-3">
                    <a routerLink="/buscar-ciudades" class="btn btn-primary btn-lg px-5 pill-btn">
                        <i class="fa fa-search me-2"></i> BUSCAR DESTINOS
                    </a>
                    <a [routerLink]="['/perfil', currentUserName]" class="btn btn-outline-light btn-lg px-5 pill-btn">
                        <i class="fa fa-user me-2"></i> MI PERFIL
                    </a>
                </div>
            </ng-container>

            <ng-template #loginBlock>
                <a href="/account/login" class="btn btn-primary btn-lg px-5 pill-btn">
                    <i class="fa fa-sign-in me-2"></i> INGRESAR / REGISTRAR
                </a>
            </ng-template>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh; 
      background-color: #14181c; 
      font-family: 'Graphik', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
    }

    .branding-section {
        max-width: 900px;
    }

    .main-title {
      letter-spacing: 0.18em; 
      text-shadow: 0 4px 15px rgba(0,0,0,0.6); 
      font-size: calc(4rem + 4vw); 
    }

    .tracking-wider {
        letter-spacing: 0.15em;
    }
    
    .tracking-light {
        letter-spacing: 0.05em;
    }

    .pill-btn {
        border-radius: 50px; 
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 0.1em;
        padding-top: 12px;
        padding-bottom: 12px;
    }
  `]
})
export class HomeComponent implements OnInit {
  private configState = inject(ConfigStateService);
  
  hasLoggedIn = false;
  currentUserName = '';

  ngOnInit() {
    const currentUser = this.configState.getOne('currentUser');
    this.hasLoggedIn = currentUser?.isAuthenticated || false;
    this.currentUserName = currentUser?.userName || '';
  }
}