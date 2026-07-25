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
import { UserProfileService } from '../../proxy/users/user-profile.service';

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
  private profileService = inject(UserProfileService);
  private http: HttpClient;
  private userSearchDebouncer$ = new Subject<void>();

  constructor(private handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  private searchDebouncer$: Subject<void> = new Subject();
  private debouncerSubscription!: Subscription;

  // Pestañas
  activeTab: 'destinos' | 'usuarios' = 'destinos';

  // Destinos
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

  // Usuarios
  userSearchQuery = '';
  userResults: any[] = [];
  isSearchingUsers = false;
  userNotFound = false;

  ngOnInit() {
  const savedFilters = sessionStorage.getItem('citySearchFilters');
  const savedResults = sessionStorage.getItem('citySearchResults');
  if (savedFilters && savedResults) {
    this.filters = JSON.parse(savedFilters);
    this.cities = JSON.parse(savedResults);
    sessionStorage.removeItem('citySearchFilters');
    sessionStorage.removeItem('citySearchResults');
  }

  this.debouncerSubscription = this.searchDebouncer$
    .pipe(debounceTime(500))
    .subscribe(() => { this.search(); });

  this.userSearchDebouncer$
    .pipe(debounceTime(400))
    .subscribe(() => { if (this.userSearchQuery.trim()) this.buscarUsuario(); });
}

  ngOnDestroy() {
    if (this.debouncerSubscription) {
      this.debouncerSubscription.unsubscribe();
    }
  }

  setTab(tab: 'destinos' | 'usuarios') {
    this.activeTab = tab;
  }

  // — Destinos —
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
        this.isLoading = false;
        this.loadImagesByName();
  
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
    sessionStorage.removeItem('citySearchFilters');
    sessionStorage.removeItem('citySearchResults');
  }

  private loadImagesByName() {
    this.cities.forEach(city => {
      if (city.nombre) {
        this.fetchWikiImage(city.nombre, city);
      }
    });
  }

private fetchWikiImage(queryName: string, city: CityWithImage) {
    // ¡Agregamos &redirects=1 a la URL para que siga las redirecciones de Wikipedia!
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

  verEnMapa(city: CityWithImage) {
    if (city.lat && city.lon) {
      const url = `https://www.google.com/maps/search/?api=1&query=${city.lat},${city.lon}`;
      window.open(url, '_blank');
    }
  }

  irADetalle(city: CityWithImage) {
    sessionStorage.setItem('citySearchFilters', JSON.stringify(this.filters));
    sessionStorage.setItem('citySearchResults', JSON.stringify(this.cities));
    this.router.navigate(['/destinos/detalle'], { state: { data: city } });
  }

  // — Usuarios —
  buscarUsuario() {
  const query = this.userSearchQuery.trim();
  if (!query) return;

  this.isSearchingUsers = true;
  this.userNotFound = false;
  this.userResults = [];

  this.profileService.searchByUserName(query).subscribe({
    next: (data) => {
      this.isSearchingUsers = false;
      if (data && data.length > 0) {
        this.userResults = data;
      } else {
        this.userNotFound = true;
      }
    },
    error: () => {
      this.isSearchingUsers = false;
      this.userNotFound = true;
    }
  });
}

  irAPerfil(userName: string) {
    this.router.navigate(['/perfil', userName]);
  }

  clearUsuarios() {
    this.userSearchQuery = '';
    this.userResults = [];
    this.userNotFound = false;
  }
}