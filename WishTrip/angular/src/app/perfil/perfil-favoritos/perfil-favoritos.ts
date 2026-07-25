import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { TravelExperienceService } from '../../proxy/travel-experiences/travel-experience.service';
import { FavoriteDestinationDto } from '../../proxy/travel-experiences/models';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-perfil-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-favoritos.html',
  styleUrls: ['./perfil-favoritos.scss']
})
export class MisFavoritosComponent implements OnInit {
  private experienceService = inject(TravelExperienceService);
  public router = inject(Router);

  favoritos: FavoriteDestinationDto[] = [];
  isLoading = true;

  private http: HttpClient;

  constructor(handler: HttpBackend) {
    // HttpClient para llamadas a APIs externas (Wikipedia)
    this.http = new HttpClient(handler);
  }

  ngOnInit() {
    this.cargarFavoritos();
  }

cargarFavoritos() {
    this.isLoading = true;
    this.experienceService.getMyFavorites().subscribe({
      next: (data) => {
        this.favoritos = data || [];
        this.isLoading = false;

        // FORZAMOS a que siempre busque la foto en vivo en Wikipedia, 
        // ignorando la que haya quedado "congelada" en la base de datos.
        this.favoritos.forEach(fav => {
          this.obtenerFotoWikipedia(fav);
        });
      },
      error: (err) => {
        console.error('Error al cargar favoritos:', err);
        this.isLoading = false;
      }
    });
  }

  obtenerFotoWikipedia(fav: FavoriteDestinationDto) {
    // Usamos EXACTAMENTE la misma API (en inglés) que usa tu buscador
    if (fav.destinationName) {
      this.fetchWikiImage(fav.destinationName, fav);
    }
  }

private fetchWikiImage(queryName: string, fav: FavoriteDestinationDto) {
    // Agregamos &redirects=1 para que siga las redirecciones de Wikipedia al igual que en el buscador
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(queryName)}&prop=pageimages&format=json&pithumbsize=500&redirects=1&origin=*`;
    
    this.http.get(url).pipe(catchError(() => of(null))).subscribe((res: any) => {
      if (res?.query?.pages) {
        const pages = res.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId !== '-1' && pages[pageId]?.thumbnail) {
          fav.destinationImageUrl = pages[pageId].thumbnail.source;
        } else if (queryName === fav.destinationName) {
          // Si falla con el nombre solo, intenta con "Nombre, País"
          this.fetchWikiImage(`${fav.destinationName}, ${fav.destinationPais}`, fav);
        } else {
          this.onImageError(fav);
        }
      } else {
        this.onImageError(fav);
      }
    });
  }

  onImageError(fav: FavoriteDestinationDto) {
    // Si la URL de la imagen está rota, usamos la de respuesto
    const destinationName = fav.destinationName ?? '';
    fav.destinationImageUrl = `https://loremflickr.com/600/800/${encodeURIComponent(destinationName)},city`;
  }

  quitarFavorito(fav: FavoriteDestinationDto, event: Event) {
    event.stopPropagation();

    if (!fav.destinationId) {
      console.warn('No destination id available for favorite removal', fav);
      return;
    }

    const dto = {
      rating: fav.rating,
      isFavorite: false,
      isWishlist: fav.isWishlist,
      isVisited: fav.isVisited
    };

    this.experienceService.updateUserPreference(fav.destinationId, dto).subscribe({
      next: () => {
        this.favoritos = this.favoritos.filter(x => x.destinationId !== fav.destinationId);
      }
    });
  }

  irADetalle(fav: FavoriteDestinationDto) {
    const citySimulada = {
      nombre: fav.destinationName,
      pais: fav.destinationPais,
      imageUrl: fav.destinationImageUrl
    };

    this.router.navigate(['/destinos/detalle'], { state: { data: citySimulada } });
  }
}