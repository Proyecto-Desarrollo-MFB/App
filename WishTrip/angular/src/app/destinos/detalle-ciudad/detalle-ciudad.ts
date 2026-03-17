import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConfigStateService } from '@abp/ng.core';
import { LogExperienceModalComponent } from '../../log-experience-modal/log-experience-modal.component';
import { TravelExperienceDto } from '../../proxy/travel-experiences/models';
import { DestinoService } from '../../proxy/destinos/destino.service';
import { TravelExperienceService } from '../../proxy/travel-experiences/travel-experience.service';

@Component({
  selector: 'app-detalle-ciudad',
  standalone: true,
  imports: [CommonModule, RouterLink, LogExperienceModalComponent, FormsModule],
  templateUrl: './detalle-ciudad.html',
  styleUrls: ['./detalle-ciudad.scss']
})
export class DetalleCiudadComponent implements OnInit {

  city: any;

  descripcion: string = 'Buscando información...';
  textoCompleto: string = '';
  mostrarTodo: boolean = false;
  tieneTextoLargo: boolean = false;

  ratingPromedio: number = 0;
  totalVisitas = 0;

  showExperienceModal = false;
  showCannotUnvisitAlert = false;
  currentExperience?: TravelExperienceDto;
  resolvedDestinationId?: string;

  myExperience?: TravelExperienceDto;
  myPreference?: any; // Esto guardará los datos del panel actual
  isLoggedIn = false;
  currentUserName = '';

  allReviews: any[] = [];
  reviews: any[] = [];

  searchKeyword: string = '';
  keywords: string[] = [];
  filtroSentimiento: 'todos' | 'positivo' | 'neutral' | 'negativo' = 'todos';

  showConfirmModal = false;
  reviewToDelete: any = null;

  myExperiencesList: TravelExperienceDto[] = [];
  showSelectExperienceModal = false;

  private http: HttpClient;

  constructor(
    public router: Router,
    private location: Location,
    private destinoService: DestinoService,
    private experienceService: TravelExperienceService,
    private configState: ConfigStateService,
    handler: HttpBackend
  ) {
    this.http = new HttpClient(handler);

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['data']) {
      this.city = nav.extras.state['data'];
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    const currentUser = this.configState.getOne('currentUser');
    this.isLoggedIn = !!currentUser?.id;
    this.currentUserName = currentUser?.userName || '';

    if (this.city) {
      this.obtenerDescripcionWikipedia(this.city.nombre);
      this.resolverDestino();
    }
  }

resolverDestino() {
    this.destinoService.getOrCreateByName({
      nombre: this.city.nombre,
      pais: this.city.pais,
      poblacion: this.city.poblacion || 0
    }).subscribe({
      next: (destino) => {
        this.resolvedDestinationId = destino.id;
        this.city.poblacion = destino.poblacion || this.city.poblacion;
        this.cargarReviews(destino.id);
        if (this.isLoggedIn) {
          this.cargarMiExperiencia(destino.id);
          this.cargarMiPreferencia(destino.id);
          this.cargarStats(destino.id);
        }
      },
      error: (err) => console.error('Error al resolver destino:', err)
    });
  }

  cargarMiExperiencia(destinationId: string) {
    this.experienceService.getMyExperiencesByDestination(destinationId).subscribe({
      next: (data) => { 
        this.myExperiencesList = data || []; 
        // Dejamos la primera como referencia si hace falta
        this.myExperience = this.myExperiencesList.length > 0 ? this.myExperiencesList[0] : undefined;
      },
      error: () => { this.myExperiencesList = []; this.myExperience = undefined; }
    });
  }

  cargarMiPreferencia(destinationId: string) {
    this.experienceService.getUserPreference(destinationId).subscribe({
      next: (data) => { this.myPreference = data ?? undefined; },
      error: () => { this.myPreference = undefined; }
    });
  }

cargarReviews(destinationId: string) {
    this.experienceService.getReviewsByDestination(destinationId).subscribe({
      next: (data) => {
        // FILTRO NUEVO: Nos quedamos SOLO con las experiencias que tienen texto
        const reviewsConTexto = data.filter(r => r.review && r.review.trim() !== '');
        
        this.allReviews = reviewsConTexto;
        this.aplicarFiltros();
      },
      error: () => {
        this.allReviews = [];
        this.reviews = [];
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.allReviews];

    if (this.filtroSentimiento === 'positivo') {
      resultado = resultado.filter(r => r.rating >= 3.5);
    } else if (this.filtroSentimiento === 'negativo') {
      resultado = resultado.filter(r => r.rating <= 2.5);
    } else if (this.filtroSentimiento === 'neutral') {
      resultado = resultado.filter(r => r.rating > 2.5 && r.rating < 3.5);
    }

    if (this.keywords.length > 0) {
      resultado = resultado.filter(r =>
        r.review && this.keywords.every(kw =>
          r.review.toLowerCase().includes(kw.toLowerCase())
        )
      );
    }

    this.reviews = resultado;
  }

  setFiltro(filtro: 'todos' | 'positivo' | 'neutral' | 'negativo') {
    this.filtroSentimiento = filtro;
    this.aplicarFiltros();
  }

  agregarKeyword() {
    const kw = this.searchKeyword.trim();
    if (kw && !this.keywords.includes(kw.toLowerCase())) {
      this.keywords.push(kw.toLowerCase());
      this.searchKeyword = '';
      this.aplicarFiltros();
    }
  }

  eliminarKeyword(kw: string) {
    this.keywords = this.keywords.filter(k => k !== kw);
    this.aplicarFiltros();
  }

  limpiarKeywords() {
    this.keywords = [];
    this.searchKeyword = '';
    this.aplicarFiltros();
  }

  resaltarTexto(texto: string): string {
    if (!texto || this.keywords.length === 0) return texto;
    let result = texto;
    this.keywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    return result;
  }

  openExperienceModal() {
    if (!this.resolvedDestinationId) return;
    this.currentExperience = this.myExperience;
    this.showExperienceModal = true;
  }

  openNewExperienceModal() {
    if (!this.resolvedDestinationId) return;
    this.currentExperience = undefined;
    this.showExperienceModal = true;
  }

  editarReview(review: any) {
    this.currentExperience = {
      id: review.id,
      destinationId: this.resolvedDestinationId,
      review: review.review,
      rating: review.rating,
      isFavorite: review.isFavorite,
      startDate: review.startDate,
      endDate: review.endDate,
    } as TravelExperienceDto;
    this.showExperienceModal = true;
  }

  eliminarReview(review: any) {
    this.reviewToDelete = review;
    this.showConfirmModal = true;
  }

confirmarEliminarReview() {
    if (!this.reviewToDelete) return;
    this.experienceService.delete(this.reviewToDelete.id).subscribe({
      next: () => {
        this.showConfirmModal = false;
        this.reviewToDelete = null;
        if (this.resolvedDestinationId) {
          this.cargarReviews(this.resolvedDestinationId);
          this.cargarMiExperiencia(this.resolvedDestinationId);
          this.cargarStats(this.resolvedDestinationId);
          
          // Si nos quedamos sin experiencias, cerramos el modal de la lista
          if (this.myExperiencesList.length <= 1) {
            this.showSelectExperienceModal = false;
          }
        }
      }
    });
  }

  cancelarEliminarReview() {
    this.showConfirmModal = false;
    this.reviewToDelete = null;
  }

  onExperienceSaved(exp: TravelExperienceDto) {
    this.myExperience = exp;
    this.showExperienceModal = false;
    if (this.resolvedDestinationId) {
      this.cargarReviews(this.resolvedDestinationId);
      this.cargarMiExperiencia(this.resolvedDestinationId);
      this.cargarMiPreferencia(this.resolvedDestinationId); // <-- Esto actualiza el panel solo
      this.cargarStats(this.resolvedDestinationId);         // <-- Esto actualiza el número grande arriba
    }
  }

  onModalClosed() {
    this.showExperienceModal = false;
  }


  getStarsArray(max: number = 5) {
    return Array(max).fill(0).map((_, i) => i + 1);
  }

  obtenerDescripcionWikipedia(nombre: string) {
    const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(nombre)}&format=json&origin=*`;
    this.http.get(url).subscribe({
      next: (res: any) => {
        try {
          const pages = res.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].extract) {
            this.textoCompleto = pages[pageId].extract;
            if (this.textoCompleto.length > 400) {
              this.tieneTextoLargo = true;
              this.descripcion = this.textoCompleto.substring(0, 400) + '...';
            } else {
              this.tieneTextoLargo = false;
              this.descripcion = this.textoCompleto;
            }
          } else {
            if (nombre === this.city.nombre) {
              this.obtenerDescripcionWikipedia(`${this.city.nombre}, ${this.city.pais}`);
            } else {
              this.descripcion = "No se encontró una descripción detallada para este destino.";
            }
          }
        } catch (e) {
          this.descripcion = "Información no disponible.";
        }
      },
      error: () => {
        this.descripcion = "No se pudo conectar con Wikipedia.";
      }
    });
  }

  toggleDescripcion() {
    this.mostrarTodo = !this.mostrarTodo;
    this.descripcion = this.mostrarTodo
      ? this.textoCompleto
      : this.textoCompleto.substring(0, 400) + '...';
  }

  cargarStats(destinationId: string) {
    this.experienceService.getDestinationStats(destinationId).subscribe({
      next: (stats) => {
        this.ratingPromedio = stats.averageRating;
        this.totalVisitas = stats.totalVisits; // <-- Nuevo contador exacto
      }
    });
  }


  getStars(rating: number) {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating));
  }

  get bookingUrl(): string {
    const query = encodeURIComponent(`${this.city?.nombre ?? ''} ${this.city?.pais ?? ''}`);
    return `https://www.booking.com/search.html?ss=${query}`;
  }

// NUEVO: Método exclusivo para el ojito
toggleVisitado() {
    if (!this.resolvedDestinationId) return;

    // Si intenta desmarcar y tiene experiencias, mostramos el nuevo modal
    if (this.myPreference?.isVisited && this.myExperiencesList.length > 0) {
      this.showCannotUnvisitAlert = true;
      return; 
    }

    const dto = {
      rating: this.myPreference?.rating || 0,
      isFavorite: this.myPreference?.isFavorite || false,
      isWishlist: this.myPreference?.isWishlist || false,
      isVisited: !(this.myPreference?.isVisited || false)
    };
    this.experienceService.updateUserPreference(this.resolvedDestinationId, dto).subscribe({
      next: (updated) => { 
        this.myPreference = updated;
        this.cargarStats(this.resolvedDestinationId!); 
      }
    });
  }

  // ACTUALIZADO: Cambiar rating automáticamente marca como visitado
  cambiarRating(newRating: number) {
    if (!this.resolvedDestinationId) return;
    const dto = {
      rating: newRating,
      isFavorite: this.myPreference?.isFavorite || false,
      isWishlist: false, 
      isVisited: true // <-- Automáticamente en true al puntuar
    };
    this.experienceService.updateUserPreference(this.resolvedDestinationId, dto).subscribe({
      next: (updated) => { 
        this.myPreference = updated; 
        this.cargarStats(this.resolvedDestinationId!);
      }
    });
  }

  // ACTUALIZADO: La X de borrar (Mantiene el visitado y el corazón)
  clearRating() {
    if (!this.resolvedDestinationId) return;
    const dto = {
      rating: 0, // Solo borramos esto
      isFavorite: this.myPreference?.isFavorite || false,
      isWishlist: this.myPreference?.isWishlist || false,
      isVisited: this.myPreference?.isVisited || false // <-- Se mantiene intacto
    };
    this.experienceService.updateUserPreference(this.resolvedDestinationId, dto).subscribe({
      next: (updated) => { 
        this.myPreference = updated; 
        this.cargarStats(this.resolvedDestinationId!); 
      }
    });
  }

  // ACTUALIZADOS: Favorito y Wishlist manteniendo el resto intacto
  toggleFavorito() {
    if (!this.resolvedDestinationId) return;
    const dto = {
      rating: this.myPreference?.rating || 0,
      isFavorite: !(this.myPreference?.isFavorite || false),
      isWishlist: this.myPreference?.isWishlist || false,
      isVisited: this.myPreference?.isVisited || false
    };
    this.experienceService.updateUserPreference(this.resolvedDestinationId, dto).subscribe({
      next: (updated) => { this.myPreference = updated; }
    });
  }

toggleWishlist() {
    if (!this.resolvedDestinationId) return;
    const dto = {
      rating: this.myPreference?.rating || 0,
      isFavorite: this.myPreference?.isFavorite || false,
      isWishlist: !(this.myPreference?.isWishlist || false),
      isVisited: this.myPreference?.isVisited || false // SE MANTIENE
    };
    this.experienceService.updateUserPreference(this.resolvedDestinationId, dto).subscribe({
      next: (updated) => { this.myPreference = updated; }
    });
  }

cerrarAlertaUnvisit() {
    this.showCannotUnvisitAlert = false;
  }

  // Ahora siempre abre la lista, sin importar si hay 1 o muchas
  openMyExperiencesModal() {
    this.showSelectExperienceModal = true;
  }

  seleccionarExperienciaParaEditar(exp: TravelExperienceDto) {
    this.currentExperience = exp;
    this.showSelectExperienceModal = false;
    this.showExperienceModal = true; 
  }

  cerrarSelectExperienceModal() {
    this.showSelectExperienceModal = false;
  }


  // Calcula la cantidad de días del viaje (ej: del 4 al 7 son 4 días inclusivos)
  calcularDiasViaje(start: string | Date, end: string | Date | undefined): number {
    if (!start || !end) return 1;
    const f1 = new Date(start);
    const f2 = new Date(end);
    const diffTime = Math.abs(f2.getTime() - f1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
  }
}