import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router'; 
import { CoreModule } from '@abp/ng.core';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { CitySearchService } from '../../proxy/destinos/city-search.service';
import { CityDto, CitySearchRequestDto } from '../../proxy/destinos/models';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, catchError } from 'rxjs/operators';

interface CityWithImage extends CityDto {
  imageUrl?: string;
}

@Component({
  selector: 'app-buscar-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule, ThemeSharedModule, RouterLink],
  templateUrl: './buscar-ciudades.component.html',
  styleUrls: ['./buscar-ciudades.component.scss']
})
export class BuscarCiudadesComponent implements OnInit, OnDestroy {

  private cityService = inject(CitySearchService);
  private router = inject(Router); 
  private http: HttpClient;

  constructor(private handler: HttpBackend) {
      this.http = new HttpClient(handler);
  }

  private searchDebouncer$: Subject<void> = new Subject();
  private debouncerSubscription!: Subscription;

  cities: CityWithImage[] = [];
  isLoading = false;

  readonly pageSize = 10;
  page = 1;

  filters = {
    partialName: '',
    country: '',
    region: '',
    minPopulation: undefined,
    maxResultCount: this.pageSize,
    skipCount: 0,
  } as CitySearchRequestDto;

  ngOnInit() {
    // 1. MAGIA: Al iniciar, chequeamos si venimos de la pantalla de detalle y hay algo guardado
    const savedFilters = sessionStorage.getItem('citySearchFilters');
    const savedResults = sessionStorage.getItem('citySearchResults');

    if (savedFilters && savedResults) {
      this.filters = JSON.parse(savedFilters);
      this.cities = JSON.parse(savedResults);

      // Limpiamos la memoria para que sea de un solo uso (así si va al Home, no queda guardado)
      sessionStorage.removeItem('citySearchFilters');
      sessionStorage.removeItem('citySearchResults');
    }

    this.debouncerSubscription = this.searchDebouncer$
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.search();
      });
  }

  ngOnDestroy() {
    if (this.debouncerSubscription) {
      this.debouncerSubscription.unsubscribe();
    }
  }

  onInputChange() {
    this.searchDebouncer$.next();
  }

  search() {
    const partial = (this.filters.partialName || '').toString().trim();
    const country = (this.filters.country || '').toString().trim();
    const region = (this.filters.region || '').toString().trim();
    const minPop = this.filters.minPopulation;

    if (!partial && !country && !region && !minPop) {
      this.cities = [];
      return;
    }

    this.isLoading = true;

    const payload: any = {
      partialName: partial,
      country: country || undefined,
      region: region || undefined,
      minPopulation: minPop || undefined,
      maxResultCount: this.pageSize,
      skipCount: (this.page - 1) * this.pageSize,
    };

    this.cityService.searchCities(payload).subscribe({
      next: (res) => {
        const rawCities = res.cities || [];
        this.cities = rawCities.map((c: any) => ({ ...c } as CityWithImage));
        this.cities.sort((a, b) => (b.poblacion || 0) - (a.poblacion || 0));
        
        this.loadImagesByName();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al buscar:', err);
        this.isLoading = false;
      }
    });
  }

  clear() {
    this.filters.partialName = '';
    this.filters.country = '';
    this.filters.region = '';
    this.filters.minPopulation = undefined;
    this.page = 1;
    this.cities = [];
    
    // Si limpia manual, aseguramos de borrar todo rastro
    sessionStorage.removeItem('citySearchFilters');
    sessionStorage.removeItem('citySearchResults');
  }

  private loadImagesByName() {
    this.cities.forEach(city => {
        this.fetchWikiImage(city.nombre, city);
    });
  }

  private fetchWikiImage(queryName: string, city: CityWithImage) {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(queryName)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;

      this.http.get(url).pipe(catchError(() => of(null))).subscribe((res: any) => {
          if (res && res.query && res.query.pages) {
              const pages = res.query.pages;
              const pageId = Object.keys(pages)[0]; 
              
              if (pageId !== '-1' && pages[pageId] && pages[pageId].thumbnail) {
                  city.imageUrl = pages[pageId].thumbnail.source;
              } else {
                 if (queryName === city.nombre) {
                     this.fetchWikiImage(`${city.nombre}, ${city.pais}`, city);
                 }
              }
          }
      });
  }

  verEnMapa(city: CityWithImage) {
    if (city.lat && city.lon) {
      const url = `https://www.google.com/maps/search/?api=1&query=${city.lat},${city.lon}`;
      window.open(url, '_blank');
    }
  }

  irADetalle(city: CityWithImage) {
    // 2. MAGIA: Justo antes de ir al detalle, guardamos exactamente cómo estaba todo
    sessionStorage.setItem('citySearchFilters', JSON.stringify(this.filters));
    sessionStorage.setItem('citySearchResults', JSON.stringify(this.cities));

    this.router.navigate(['/destinos/detalle'], { state: { data: city } });
  }
}