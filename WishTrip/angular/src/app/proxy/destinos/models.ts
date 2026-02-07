import type { AuditedEntityDto, PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface CalificacionDto extends AuditedEntityDto<string> {
  destinoId?: string;
  puntaje: number;
  comentario?: string;
  userId?: string;
}

export interface CityDto {
  nombre?: string;
  pais?: string;
  countryCode?: string;
  region?: string;
  poblacion?: number;
  lat?: number;
  lon?: number;
}

export interface CitySearchRequestDto extends PagedAndSortedResultRequestDto {
  partialName?: string;
  destination?: string;
  country?: string;
  region?: string;
  minPopulation?: number;
}

export interface CitySearchResultDto {
  cities: CityDto[];
}

export interface CreateUpdateCalificacionDto {
  destinoId: string;
  puntaje: number;
  comentario?: string;
}

export interface CreateUpdateDestinoDto {
  nombre: string;
  pais: string;
  poblacion: number;
  foto: string;
}

export interface DestinoDto extends AuditedEntityDto<string> {
  nombre: string;
  pais: string;
  poblacion: string;
}
