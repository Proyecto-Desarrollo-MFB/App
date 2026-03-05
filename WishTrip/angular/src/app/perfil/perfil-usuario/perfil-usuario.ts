import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink, ActivatedRoute, Router } from '@angular/router'; 
import { ConfigStateService } from '@abp/ng.core';
import { UserProfileService } from '../../proxy/users/user-profile.service'; 

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './perfil-usuario.html',
  styleUrls: ['./perfil-usuario.scss'] 
})
export class PerfilUsuarioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router); 
  private configState = inject(ConfigStateService);
  private profileService = inject(UserProfileService);

  userProfile: any = null; 
  isMyProfile = false;
  searchUsername: string = ''; 
  
  // NUEVO: Bandera para saber si el usuario falló
  usuarioNoEncontrado = false; 

  ngOnInit() {
    const currentUser = this.configState.getOne('currentUser');
    const currentUserName = currentUser?.userName;

    this.route.paramMap.subscribe(params => {
      const routeUserName = params.get('username'); 
      const profileToLoad = routeUserName || currentUserName;
      this.isMyProfile = currentUserName === profileToLoad;

      if (profileToLoad) {
        this.loadUserProfile(profileToLoad);
      }
    });
  }

 loadUserProfile(userName: string) {
    this.userProfile = null;
    this.usuarioNoEncontrado = false;

    this.profileService.getProfile(userName).subscribe({
      next: (data) => {
        // NUEVO: Si el backend nos responde 'null', es que el usuario no existe
        if (!data) {
          this.usuarioNoEncontrado = true;
        } else {
          this.userProfile = data;
        }
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
        this.usuarioNoEncontrado = true;
      }
    });
  }

  buscarUsuario() {
    const user = this.searchUsername.trim();
    if (user) {
      this.router.navigate(['/perfil', user]);
      this.searchUsername = ''; 
    }
  }

  // NUEVO: Botón de rescate si nos metemos en un perfil falso
  volverAMiPerfil() {
    const currentUser = this.configState.getOne('currentUser');
    if (currentUser) {
      this.router.navigate(['/perfil', currentUser.userName]);
    } else {
      this.router.navigate(['/']);
    }
  }
}