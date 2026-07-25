import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { TravelExperienceService } from '../../proxy/travel-experiences/travel-experience.service';
import { WishlistDestinationDto } from '../../proxy/travel-experiences/models';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-perfil-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-wishlist.html',
  styleUrls: ['./perfil-wishlist.scss']
})
export class PerfilWishlistComponent implements OnInit {
  private experienceService = inject(TravelExperienceService);
  private router = inject(Router);
  private http: HttpClient;

  wishlist: WishlistDestinationDto[] = [];
  isLoading = true;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  ngOnInit() {
    this.cargarWishlist();
  }

  cargarWishlist() {
    this.isLoading = true;
    this.experienceService.getMyWishlist().subscribe({
      next: (data) => {
        this.wishlist = data || [];
        this.isLoading = false;

        // Buscamos fotos en vivo en Wikipedia para cada destino
        this.wishlist.forEach(wish => {
          this.obtenerFotoWikipedia(wish);
        });
      },
      error: (err) => {
        console.error('Error al cargar la wishlist:', err);
        this.isLoading = false;
      }
    });
  }

  obtenerFotoWikipedia(wish: WishlistDestinationDto) {
    if (wish.destinationName) {
      this.fetchWikiImage(wish.destinationName, wish);
    }
  }

  private fetchWikiImage(queryName: string, wish: WishlistDestinationDto) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(queryName)}&prop=pageimages&format=json&pithumbsize=500&redirects=1&origin=*`;
    
    this.http.get(url).pipe(catchError(() => of(null))).subscribe((res: any) => {
      if (res?.query?.pages) {
        const pages = res.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId !== '-1' && pages[pageId]?.thumbnail) {
          wish.destinationImageUrl = pages[pageId].thumbnail.source;
        } else if (queryName === wish.destinationName) {
          // Si falla, intenta con "Nombre, Pais" para ser más específico
          this.fetchWikiImage(`${wish.destinationName}, ${wish.destinationPais}`, wish);
        } else {
          this.onImageError(wish);
        }
      } else {
        this.onImageError(wish);
      }
    });
  }

  onImageError(wish: WishlistDestinationDto) {
    const name = wish.destinationName ?? '';
    wish.destinationImageUrl = `https://loremflickr.com/600/800/${encodeURIComponent(name)},city`;
  }

  quitarDeWishlist(wish: WishlistDestinationDto, event: Event) {
    event.stopPropagation(); // Evita que al borrar haga clic y navegue al detalle

    if (!wish.destinationId) {
      return;
    }

    const dto = {
      rating: wish.rating,
      isFavorite: wish.isFavorite,
      isWishlist: false, // Lo sacamos de la lista
      isVisited: wish.isVisited
    };

    this.experienceService.updateUserPreference(wish.destinationId, dto).subscribe({
      next: () => {
        // Filtramos la lista local para que desaparezca al instante
        this.wishlist = this.wishlist.filter(x => x.destinationId !== wish.destinationId);
      }
    });
  }

  irADetalle(wish: WishlistDestinationDto) {
    const cityData = {
      nombre: wish.destinationName,
      pais: wish.destinationPais,
      imageUrl: wish.destinationImageUrl
    };

    this.router.navigate(['/destinos/detalle'], { state: { data: cityData } });
  }
}