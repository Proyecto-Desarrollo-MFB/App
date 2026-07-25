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
  isRepeatVisit: boolean;
}

export interface DestinationStatsDto {
  averageRating: number;
  totalRatings: number;
  totalVisits: number;
}

export interface FavoriteDestinationDto {
  destinationId?: string;
  destinationName?: string;
  destinationPais?: string;
  destinationImageUrl?: string;
  rating: number;
  isFavorite: boolean;
  isWishlist: boolean;
  isVisited: boolean;
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

export interface UpdateUserPreferenceDto {
  rating: number;
  isFavorite: boolean;
  isWishlist: boolean;
  isVisited: boolean;
}

export interface UserDestinationPreferenceDto {
  id?: string;
  destinationId?: string;
  rating: number;
  isFavorite: boolean;
  isWishlist: boolean;
  isVisited: boolean;
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

export interface UserReviewDto {
  id?: string;
  destinationId?: string;
  destinationName?: string;
  destinationImageUrl?: string;
  rating: number;
  review?: string;
  startDate?: string;
  isFavorite: boolean;
  destinationPais?: string;
}

export interface WishlistDestinationDto {
  destinationId?: string;
  destinationName?: string;
  destinationPais?: string;
  destinationImageUrl?: string;
  rating: number;
  isFavorite: boolean;
  isWishlist: boolean;
  isVisited: boolean;
}
