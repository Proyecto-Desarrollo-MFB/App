import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@abp/ng.core';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { CitySearchService } from '../../proxy/destinos/city-search.service';
import { CityDto, CitySearchRequestDto } from '../../proxy/destinos/models';

@Component({
  selector: 'app-buscar-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule, ThemeSharedModule],
  templateUrl: './buscar-ciudades.component.html',
  styleUrls: ['./buscar-ciudades.component.scss']
})
export class BuscarCiudadesComponent implements OnInit {

  private cityService = inject(CitySearchService);

  cities: CityDto[] = [];
  isLoading = false;

  filters = {
    destination: '',
    country: '',
    maxResultCount: 10,
    skipCount: 0
  } as CitySearchRequestDto;

  ngOnInit() {
    this.search();
  }

  search() {
    this.isLoading = true;

    this.cityService.searchCities(this.filters).subscribe({
      next: (res) => {
        this.cities = res.cities || []; 
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
    this.search();
  }
}