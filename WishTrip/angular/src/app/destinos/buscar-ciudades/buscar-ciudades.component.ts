import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@abp/ng.core';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { CitySearchService } from '../../proxy/destinos/city-search.service';
import { CityDto, CitySearchRequestDto } from '../../proxy/destinos/models';
import { Subject, Subscription } from 'rxjs'; // Importar RxJS
import { debounceTime } from 'rxjs/operators'; // Importar operador

@Component({
  selector: 'app-buscar-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule, ThemeSharedModule],
  templateUrl: './buscar-ciudades.component.html',
  styleUrls: ['./buscar-ciudades.component.scss']
})
export class BuscarCiudadesComponent implements OnInit, OnDestroy {

  private cityService = inject(CitySearchService);

  // Subject para manejar el debounce
  private searchDebouncer$: Subject<void> = new Subject();
  private debouncerSubscription!: Subscription;

  cities: CityDto[] = [];
  isLoading = false;

  // pagination state
  page = 1;
  pageSize = 10;

  filters = {
    partialName: '',
    country: '',
    region: '',
    minPopulation: undefined,
    maxResultCount: this.pageSize,
    skipCount: 0,
  } as CitySearchRequestDto;

  ngOnInit() {
    // 1. Configuramos el debounce: esperar 500ms tras dejar de escribir para buscar
    this.debouncerSubscription = this.searchDebouncer$
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.search();
      });

    // 2. ELIMINADO: Ya no se llama a this.search() automáticamente al iniciar.
  }

  ngOnDestroy() {
    // Buena práctica: desuscribirse para evitar memory leaks
    if (this.debouncerSubscription) {
      this.debouncerSubscription.unsubscribe();
    }
  }

  // Este método se llama cada vez que el usuario escribe una letra
  onInputChange() {
    this.searchDebouncer$.next();
  }

  search() {
    const partial = (this.filters.partialName || '').toString().trim();
    const country = (this.filters.country || '').toString().trim();
    
    // Validación: Si no hay ni ciudad ni país, limpiamos y no buscamos
    if (!partial && !country) {
      this.cities = [];
      return;
    }

    this.isLoading = true;

    const payload: any = {
      partialName: partial,
      country: this.filters.country || undefined,
      region: this.filters.region || undefined,
      minPopulation: this.filters.minPopulation || undefined,
      maxResultCount: this.pageSize || 10,
      skipCount: (this.page - 1) * (this.pageSize || 10),
    };

    // Si estás usando los proxys de ABP, asegúrate que payload coincida con CitySearchRequestDto
    this.cityService.searchCities(payload).subscribe({
      next: (res) => {
        this.cities = (res.cities || []).slice();
        // Ordenar por población descendente (si existe)
        this.cities.sort((a, b) => (b.poblacion || 0) - (a.poblacion || 0));
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
  }
}