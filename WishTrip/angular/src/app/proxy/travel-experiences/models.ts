import type { EntityDto, FullAuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateTravelExperienceDto {
  destinationId: string;
  review?: string;
  rating: number;
  isFavorite: boolean;
  isRepeatVisit: boolean;
  startDate: string;
  endDate?: string;
}

export interface DestinationReviewDto extends EntityDto<string> {
  userName?: string;
  userAvatarUrl?: string;
  review?: string;
  rating: number;
  isFavorite: boolean;
  startDate?: string;
  endDate?: string;
  creationTime?: string;
}

export interface TravelExperienceDto extends FullAuditedEntityDto<string> {
  destinationId?: string;
  userId?: string;
  review?: string;
  rating: number;
  isFavorite: boolean;
  isRepeatVisit: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserExperienceDto extends FullAuditedEntityDto<string> {
  destinationId?: string;
  destinationName?: string;
  destinationPais?: string;
  destinationImageUrl?: string;
  review?: string;
  rating: number;
  isFavorite: boolean;
  isRepeatVisit: boolean;
  startDate?: string;
  endDate?: string;
}
