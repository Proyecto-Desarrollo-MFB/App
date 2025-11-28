import type { CitySearchRequestDto, CitySearchResultDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CitySearchService {
  apiName = 'Default';
  

  searchCities = (input: CitySearchRequestDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, CitySearchResultDto>({
      method: 'POST',
      url: '/api/app/city-search/search-cities',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
