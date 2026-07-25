import type { CreateUpdateTravelExperienceDto, DestinationReviewDto, DestinationStatsDto, FavoriteDestinationDto, TravelExperienceDto, UpdateUserPreferenceDto, UserDestinationPreferenceDto, UserExperienceDto, UserReviewDto, WishlistDestinationDto } from './models';
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
  

  getDestinationStats = (destinationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DestinationStatsDto>({
      method: 'GET',
      url: `/api/app/travel-experience/destination-stats/${destinationId}`,
    },
    { apiName: this.apiName,...config });
  

  getMyExperiencesByDestination = (destinationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TravelExperienceDto[]>({
      method: 'GET',
      url: `/api/app/travel-experience/my-experiences-by-destination/${destinationId}`,
    },
    { apiName: this.apiName,...config });
  

  getMyFavorites = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, FavoriteDestinationDto[]>({
      method: 'GET',
      url: '/api/app/travel-experience/my-favorites',
    },
    { apiName: this.apiName,...config });
  

  getMyReviews = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserReviewDto[]>({
      method: 'GET',
      url: '/api/app/travel-experience/my-reviews',
    },
    { apiName: this.apiName,...config });
  

  getMyWishlist = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, WishlistDestinationDto[]>({
      method: 'GET',
      url: '/api/app/travel-experience/my-wishlist',
    },
    { apiName: this.apiName,...config });
  

  getReviewsByDestination = (destinationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, DestinationReviewDto[]>({
      method: 'GET',
      url: `/api/app/travel-experience/reviews-by-destination/${destinationId}`,
    },
    { apiName: this.apiName,...config });
  

  getUserPreference = (destinationId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserDestinationPreferenceDto>({
      method: 'GET',
      url: `/api/app/travel-experience/user-preference/${destinationId}`,
    },
    { apiName: this.apiName,...config });
  

  syncHistoricalPreferences = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/travel-experience/sync-historical-preferences',
    },
    { apiName: this.apiName,...config });
  

  update = (id: string, input: CreateUpdateTravelExperienceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, TravelExperienceDto>({
      method: 'PUT',
      url: `/api/app/travel-experience/${id}`,
      body: input,
    },
    { apiName: this.apiName,...config });
  

  updateUserPreference = (destinationId: string, input: UpdateUserPreferenceDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserDestinationPreferenceDto>({
      method: 'PUT',
      url: `/api/app/travel-experience/user-preference/${destinationId}`,
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
