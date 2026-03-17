import type { ChangePasswordDto, UpdateProfileDto, UserProfileDto } from './models';
import { RestService, Rest } from '@abp/ng.core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  apiName = 'Default';
  

  changePassword = (input: ChangePasswordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'POST',
      url: '/api/app/user-profile/change-password',
      body: input,
    },
    { apiName: this.apiName,...config });
  

  deleteMyAccount = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'DELETE',
      url: '/api/app/user-profile/my-account',
    },
    { apiName: this.apiName,...config });
  

  getProfile = (userName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserProfileDto>({
      method: 'GET',
      url: '/api/app/user-profile/profile',
      params: { userName },
    },
    { apiName: this.apiName,...config });
  

  searchByUserName = (query: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, UserProfileDto[]>({
      method: 'POST',
      url: '/api/app/user-profile/search-by-user-name',
      params: { query },
    },
    { apiName: this.apiName,...config });
  

  updateProfile = (input: UpdateProfileDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, void>({
      method: 'PUT',
      url: '/api/app/user-profile/profile',
      body: input,
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
