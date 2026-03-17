import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TravelExperienceService } from '../proxy/travel-experiences/travel-experience.service';
import { CreateUpdateTravelExperienceDto, TravelExperienceDto } from '../proxy/travel-experiences/models';

@Component({
  selector: 'app-log-experience-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './log-experience-modal.component.html',
  styleUrls: ['./log-experience-modal.component.scss']
})
export class LogExperienceModalComponent implements OnInit {
  @Input() destinationId!: string;
  @Input() destinationName!: string;
  @Input() existingExperience?: TravelExperienceDto;
  @Output() saved = new EventEmitter<TravelExperienceDto>();
  @Output() closed = new EventEmitter<void>();

  isSaving = false;
  stars = [1, 2, 3, 4, 5];

  form = {
    review: '',
    rating: 0,
    isFavorite: false,
    isRepeatVisit: false,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '',
  };

  constructor(
    private experienceService: TravelExperienceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.existingExperience) {
      this.form.review = this.existingExperience.review || '';
      this.form.rating = this.existingExperience.rating;
      this.form.isFavorite = this.existingExperience.isFavorite;
      this.form.isRepeatVisit = this.existingExperience.isRepeatVisit || false;
      this.form.startDate = this.existingExperience.startDate?.substring(0, 10) || '';
      this.form.endDate = this.existingExperience.endDate?.substring(0, 10) || '';
    }
  }

  setRating(value: number) {
    this.form = { ...this.form, rating: value };
    this.cdr.detectChanges();
  }

  toggleFavorite() {
    this.form.isFavorite = !this.form.isFavorite;
  }

  save() {
  if (this.form.endDate && this.form.endDate < this.form.startDate) {
    alert('La fecha de salida no puede ser menor que la fecha de llegada.');
    return;
  }
  this.isSaving = true;
  // ... resto del método igual
    const dto: CreateUpdateTravelExperienceDto = {
      destinationId: this.destinationId,
      review: this.form.review,
      rating: this.form.rating,
      isFavorite: this.form.isFavorite,
      isRepeatVisit: this.form.isRepeatVisit,
      startDate: this.form.startDate,
      endDate: this.form.endDate || undefined,
    };

    const request$ = this.existingExperience
      ? this.experienceService.update(this.existingExperience.id, dto)
      : this.experienceService.create(dto);

    request$.subscribe({
      next: (result) => {
        this.isSaving = false;
        this.saved.emit(result);
      },
      error: () => { this.isSaving = false; }
    });
  }

  close() {
    this.closed.emit();
  }
}