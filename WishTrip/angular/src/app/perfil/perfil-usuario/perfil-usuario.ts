import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ConfigStateService } from '@abp/ng.core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserProfileService } from '../../proxy/users/user-profile.service';
import { TravelExperienceService } from '../../proxy/travel-experiences/travel-experience.service';
import { LogExperienceModalComponent } from '../../log-experience-modal/log-experience-modal.component';
import { TravelExperienceDto } from '../../proxy/travel-experiences/models';

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LogExperienceModalComponent],
  templateUrl: './perfil-usuario.html',
  styleUrls: ['./perfil-usuario.scss']
})
export class PerfilUsuarioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configState = inject(ConfigStateService);
  private profileService = inject(UserProfileService);
  private experienceService = inject(TravelExperienceService);
  private httpBackend = inject(HttpBackend);
  private http: HttpClient;

  userProfile: any = null;
  isMyProfile = false;
  searchUsername: string = '';
  usuarioNoEncontrado = false;

  experiences: any[] = [];
  experiencesConReview: any[] = [];
  totalReviews = 0;
  totalDestinos = 0;

  showEditModal = false;
  experienceToEdit?: TravelExperienceDto;

  showConfirmModal = false;
  experienceToDelete: any = null;

  constructor() {
    this.http = new HttpClient(this.httpBackend);
  }

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
    this.experiences = [];
    this.experiencesConReview = [];

    this.profileService.getProfile(userName).subscribe({
      next: (data) => {
        if (!data) {
          this.usuarioNoEncontrado = true;
        } else {
          this.userProfile = data;
          this.loadExperiences(userName);
        }
      },
      error: () => { this.usuarioNoEncontrado = true; }
    });
  }

  loadExperiences(userName: string) {
    this.experienceService.getByUserName(userName).subscribe({
      next: (data) => {
        this.experiences = data;
        this.experiencesConReview = data.filter(e => e.review && e.review.trim() !== '');
        this.totalReviews = this.experiencesConReview.length;
        this.totalDestinos = data.length;
        this.experiences.forEach(exp => {
          if (exp.destinationName) {
            this.fetchWikiImage(exp.destinationName, exp);
          }
        });
      },
      error: () => {
        this.experiences = [];
        this.experiencesConReview = [];
      }
    });
  }

  fetchWikiImage(queryName: string, exp: any) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(queryName)}&prop=pageimages&format=json&pithumbsize=300&origin=*`;
    this.http.get(url).pipe(catchError(() => of(null))).subscribe((res: any) => {
      if (res?.query?.pages) {
        const pageId = Object.keys(res.query.pages)[0];
        if (pageId !== '-1' && res.query.pages[pageId]?.thumbnail) {
          exp.imageUrl = res.query.pages[pageId].thumbnail.source;
        } else if (queryName === exp.destinationName) {
          this.fetchWikiImage(`${exp.destinationName}, ${exp.destinationPais || ''}`, exp);
        }
      }
    });
  }

  irADestino(exp: any) {
    const city = {
      nombre: exp.destinationName,
      pais: exp.destinationPais || '',
      poblacion: 0,
      imageUrl: exp.imageUrl || null,
      region: null
    };
    this.router.navigate(['/destinos/detalle'], { state: { data: city } });
  }

  editarExperiencia(exp: any) {
    this.experienceToEdit = {
      id: exp.id,
      destinationId: exp.destinationId,
      review: exp.review,
      rating: exp.rating,
      isFavorite: exp.isFavorite,
      startDate: exp.startDate,
      endDate: exp.endDate,
    } as TravelExperienceDto;
    this.showEditModal = true;
  }

  onEditSaved(updated: TravelExperienceDto) {
    this.showEditModal = false;
    this.experienceToEdit = undefined;
    const currentUser = this.configState.getOne('currentUser');
    const routeUser = this.route.snapshot.paramMap.get('username');
    this.loadExperiences(routeUser || currentUser?.userName || '');
  }

  onEditClosed() {
    this.showEditModal = false;
    this.experienceToEdit = undefined;
  }

  eliminarExperiencia(exp: any) {
    this.experienceToDelete = exp;
    this.showConfirmModal = true;
  }

  confirmarEliminar() {
    if (!this.experienceToDelete) return;
    this.experienceService.delete(this.experienceToDelete.id).subscribe({
      next: () => {
        this.experiences = this.experiences.filter(e => e.id !== this.experienceToDelete.id);
        this.experiencesConReview = this.experiences.filter(e => e.review && e.review.trim() !== '');
        this.totalDestinos = this.experiences.length;
        this.totalReviews = this.experiencesConReview.length;
        this.showConfirmModal = false;
        this.experienceToDelete = null;
      },
      error: (err) => console.error('Error al eliminar:', err)
    });
  }

  cancelarEliminar() {
    this.showConfirmModal = false;
    this.experienceToDelete = null;
  }

  buscarUsuario() {
    const user = this.searchUsername.trim();
    if (user) {
      this.router.navigate(['/perfil', user]);
      this.searchUsername = '';
    }
  }

  volverAMiPerfil() {
    const currentUser = this.configState.getOne('currentUser');
    if (currentUser) {
      this.router.navigate(['/perfil', currentUser.userName]);
    } else {
      this.router.navigate(['/']);
    }
  }

  getStars(rating: number) {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating));
  }
}