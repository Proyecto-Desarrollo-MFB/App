import type { CreateUpdateTravelExperienceDto, DestinationReviewDto, TravelExperienceDto, UserExperienceDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TravelExperienceService {
  apiName = 'Default';
  

  create = (input: CreateUpdateTravelExperienceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TravelExperienceDto>({
      method: 'POST',
      url: '/api/app/travel-experience',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: `/api/app/travel-experience/${id}`,
    },
    { apiName: this.apiName,...config });
  

  getByDestination = (destinationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TravelExperienceDto>({
      method: 'GET',
      url: `/api/app/travel-experience/by-destination/${destinationId}`,
    },
    { apiName: this.apiName,...config });
  

  getByUserName = (userName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserExperienceDto[]>({
      method: 'GET',
      url: '/api/app/travel-experience/by-user-name',
      params: { userName },
    },
    { apiName: this.apiName,...config });
  

  getReviewsByDestination = (destinationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DestinationReviewDto[]>({
      method: 'GET',
      url: `/api/app/travel-experience/reviews-by-destination/${destinationId}`,
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateTravelExperienceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TravelExperienceDto>({
      method: 'PUT',
      url: `/api/app/travel-experience/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
