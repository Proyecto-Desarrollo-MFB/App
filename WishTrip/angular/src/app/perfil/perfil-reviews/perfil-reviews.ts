import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TravelExperienceService } from '../../proxy/travel-experiences/travel-experience.service';
import { UserReviewDto, TravelExperienceDto } from '../../proxy/travel-experiences/models';
import { LogExperienceModalComponent } from '../../log-experience-modal/log-experience-modal.component';

@Component({
  selector: 'app-perfil-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, LogExperienceModalComponent],
  templateUrl: './perfil-reviews.html',
  styleUrls: ['./perfil-reviews.scss']
})
export class PerfilReviewsComponent implements OnInit {
  private experienceService = inject(TravelExperienceService);
  public router = inject(Router);

  reviews: UserReviewDto[] = [];
  isLoading = true;

  private http: HttpClient;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  // Variables para el Modal de Edición
  showExperienceModal = false;
  selectedDestinationId = '';
  selectedDestinationName = '';
  experienceToEdit?: TravelExperienceDto;

  // Variables para Confirmar Eliminación
  showConfirmModal = false;
  reviewToDelete?: UserReviewDto;

  ngOnInit() {
    this.cargarReviews();
  }

  cargarReviews() {
    this.isLoading = true;
    this.experienceService.getMyReviews().subscribe({
      next: (data) => {
        this.reviews = data || [];
        this.isLoading = false;

        // Buscamos la foto en Wikipedia para cada reseña
        this.reviews.forEach(review => {
          this.obtenerFotoWikipedia(review);
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  obtenerFotoWikipedia(review: UserReviewDto) {
    if (review.destinationName) {
      this.fetchWikiImage(review.destinationName, review);
    }
  }

  private fetchWikiImage(queryName: string, review: UserReviewDto) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(queryName)}&prop=pageimages&format=json&pithumbsize=500&redirects=1&origin=*`;

    this.http.get(url).pipe(catchError(() => of(null))).subscribe((res: any) => {
      if (res?.query?.pages) {
        const pages = res.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId !== '-1' && pages[pageId]?.thumbnail) {
          review.destinationImageUrl = pages[pageId].thumbnail.source;
        } else {
          this.onImageError(review);
        }
      } else {
        this.onImageError(review);
      }
    });
  }

  onImageError(review: UserReviewDto) {
    const name = review.destinationName ?? '';
    review.destinationImageUrl = `https://loremflickr.com/300/300/${encodeURIComponent(name)},city`;
  }

  getStarsArray(rating: number) {
    return Array(5).fill(0).map((_, i) => i < rating);
  }

  // --- LÓGICA DE EDICIÓN ---
  editarReview(review: UserReviewDto) {
    this.selectedDestinationId = review.destinationId ?? '';
    this.selectedDestinationName = review.destinationName ?? '';

    this.experienceToEdit = {
      id: review.id,
      destinationId: review.destinationId,
      review: review.review,
      rating: review.rating,
      isFavorite: review.isFavorite,
      startDate: review.startDate?.toString()
    } as TravelExperienceDto;

    this.showExperienceModal = true;
  }

  onExperienceSaved() {
    this.showExperienceModal = false;
    this.cargarReviews();
  }

  // --- LÓGICA DE ELIMINACIÓN ---
  confirmarEliminar(review: UserReviewDto) {
    this.reviewToDelete = review;
    this.showConfirmModal = true;
  }

  ejecutarEliminacion() {
    if (!this.reviewToDelete?.id) return;
    this.experienceService.delete(this.reviewToDelete.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.reviewToDelete!.id);
        this.showConfirmModal = false;
        this.reviewToDelete = undefined;
      }
    });
  }

  irADetalle(review: UserReviewDto) {
    const citySimulada = {
      nombre: review.destinationName,
      pais: review.destinationPais,
      imageUrl: review.destinationImageUrl
    };

    this.router.navigate(['/destinos/detalle'], { state: { data: citySimulada } });
  }
}