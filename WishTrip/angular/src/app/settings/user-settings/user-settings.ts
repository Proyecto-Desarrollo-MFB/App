import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfigStateService, AuthService } from '@abp/ng.core';
import { UserProfileService } from '../../proxy/users/user-profile.service';
import { CitySearchService } from '../../proxy/destinos/city-search.service'; // <-- ¡INYECTAMOS TU SERVICIO!
import { HttpClient, HttpBackend } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  private cityService = inject(CitySearchService); // <-- Instanciamos tu buscador oficial
  private configState = inject(ConfigStateService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http: HttpClient;

  activeTab: 'social' | 'seguridad' = 'social';
  editData = { userName: '', name: '', email: '', bio: '', avatarUrl: '', topDestinations: '' };
  passData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  currentUserInfo: any;
  mensajeSocial = '';
  mensajeSeguridad = '';
  mensajeEmail = '';
  
  // Lista del Top 5 e interfaz del modal
  misTopDestinos: any[] = [];
  showSearchModal = false;
  indiceSeleccionado: number | null = null;
  queryBusqueda: string = '';
  resultadosBusqueda: any[] = [];
  isSearching = false;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  ngOnInit() {
    this.currentUserInfo = this.configState.getOne('currentUser');
    if (this.currentUserInfo) { this.loadMyData(); }
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
    this.mensajeSocial = 'Foto removida. Presioná "Guardar" para activar el Pixel Art.';
  }

  setTab(tab: 'social' | 'seguridad') {
    this.activeTab = tab;
    this.mensajeSocial = '';
    this.mensajeSeguridad = '';
    this.mensajeEmail = '';
  }

  saveEmail() {
    this.profileService.updateProfile(this.editData).subscribe({
      next: () => { this.mensajeEmail = '¡Correo actualizado!'; },
      error: (err) => { this.mensajeEmail = err?.error?.error?.message || 'Error al actualizar email.'; }
    });
  }

  changePassword() {
    if (this.passData.newPassword !== this.passData.confirmPassword) {
      this.mensajeSeguridad = 'Las contraseñas no coinciden.';
      return;
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
  
  loadMyData() {
    this.profileService.getProfile(this.currentUserInfo.userName).subscribe({
      next: (data) => {
        this.editData = {
          userName: data.userName || this.currentUserInfo.userName || '',
          name: data.name || '',
          email: data.email || this.currentUserInfo.email,
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || '',
          topDestinations: data.topDestinations || ''
        };
        
        if (this.editData.topDestinations) {
          try {
            this.misTopDestinos = JSON.parse(this.editData.topDestinations);
          } catch {
            this.misTopDestinos = [];
          }
        }
      }
    });
  }

  // --- MÉTODOS DEL MODAL USANDO TU PROPIO backend ---

  get range5() {
    return [0, 1, 2, 3, 4];
  }

  abrirBuscadorTop(index: number) {
    this.indiceSeleccionado = index;
    this.queryBusqueda = '';
    this.resultadosBusqueda = [];
    this.showSearchModal = true;
  }

  cerrarBuscadorTop() {
    this.showSearchModal = false;
    this.indiceSeleccionado = null;
  }

  buscarCiudadTop() {
    const query = this.queryBusqueda.trim();
    if (!query || query.length < 3) {
      this.resultadosBusqueda = [];
      return;
    }

    this.isSearching = true;

    // Usamos EXACTAMENTE el mismo mapeo de payload que usás en tu pantalla de buscar-ciudades
    const payload: any = {
      partialName: query,
      maxResultCount: 5,
      skipCount: 0
    };

    this.cityService.searchCities(payload).subscribe({
      next: (res) => {
        const rawCities = res.cities || [];
        // Mapeamos a la estructura que necesita tu Top 5
        this.resultadosBusqueda = rawCities.map((c: any) => ({
          nombre: c.nombre,
          pais: c.pais,
          imageUrl: 'https://placehold.co/150x200/2c3440/fff?text=' + encodeURIComponent(c.nombre)
        }));

        // Buscamos las fotos reales en Wikipedia usando la función de tu buscador
        this.resultadosBusqueda.forEach(city => {
          this.fetchWikiImage(city.nombre, city);
        });

        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error al buscar ciudades en el Top 5:', err);
        this.isSearching = false;
      }
    });
  }

  // Trae la foto real usando tu lógica exacta del buscador principal (Con redirects=1)
  private fetchWikiImage(queryName: string, city: any) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(queryName)}&prop=pageimages&format=json&pithumbsize=500&redirects=1&origin=*`;
    
    this.http.get(url).pipe(catchError(() => of(null))).subscribe((res: any) => {
      if (res?.query?.pages) {
        const pages = res.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== '-1' && pages[pageId]?.thumbnail) {
          city.imageUrl = pages[pageId].thumbnail.source;
        } else if (queryName === city.nombre) {
          this.fetchWikiImage(`${city.nombre}, ${city.pais}`, city);
        }
      }
    });
  }

  seleccionarCiudad(ciudad: any) {
    if (this.indiceSeleccionado !== null) {
      this.misTopDestinos[this.indiceSeleccionado] = {
        nombre: ciudad.nombre,
        pais: ciudad.pais,
        imageUrl: ciudad.imageUrl
      };
      this.cerrarBuscadorTop();
    }
  }

  quitarDestinoTop(index: number, event: Event) {
    event.stopPropagation();
    this.misTopDestinos.splice(index, 1);
  }

  saveSocial() {
    const listaLimpia = this.misTopDestinos.filter(x => x != null);
    this.editData.topDestinations = JSON.stringify(listaLimpia);

    this.profileService.updateProfile(this.editData).subscribe({
      next: () => {
        this.mensajeSocial = '¡Perfil actualizado!';
        if (this.editData.userName !== this.currentUserInfo.userName) {
          alert('Nombre cambiado. Reiniciando sesión...');
          this.logout();
        } else {
          setTimeout(() => { this.router.navigate(['/perfil', this.editData.userName]); }, 1000);
        }
      },
      error: () => this.mensajeSocial = 'Error al actualizar.'
    });
  }
}