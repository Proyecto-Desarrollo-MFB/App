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

  showCalendar = false;
  calendarMonth = new Date(); // Mes que se está viendo
  calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  selStart: Date | null = null;
  selEnd: Date | null = null;
  weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  showMonthDropdown = false;
  isEditingYear = false;
  inputYear: number = new Date().getFullYear();

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

    // Inicializar el calendario con las fechas del form
    if (this.form.startDate) this.selStart = new Date(this.form.startDate + 'T00:00:00');
    if (this.form.endDate) this.selEnd = new Date(this.form.endDate + 'T00:00:00');
    this.calendarMonth = this.selStart ? new Date(this.selStart) : new Date();
    this.generarCalendario();
  }

  setRating(value: number) {
    this.form = { ...this.form, rating: value };
    this.cdr.detectChanges();
  }

  clearRating() {
    this.form = { ...this.form, rating: 0 };
    this.cdr.detectChanges();
  }

  // --- LÓGICA DEL CALENDARIO CUSTOM ---
  abrirCalendario() {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) this.generarCalendario();
  }

  cambiarMes(offset: number) {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + offset, 1);
    this.generarCalendario();
  }

  // Selecciona un mes desde el dropdown
  seleccionarMes(index: number) {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), index, 1);
    this.showMonthDropdown = false;
    this.generarCalendario();
  }

  // Abre el modo edición para el año
  iniciarEdicionYear() {
    this.inputYear = this.calendarMonth.getFullYear();
    this.isEditingYear = true;
  }

  // Guarda el año si es válido (1900 - 2050)
  guardarYear() {
    if (this.inputYear >= 1900 && this.inputYear <= 2050) {
      this.calendarMonth = new Date(this.inputYear, this.calendarMonth.getMonth(), 1);
      this.generarCalendario();
    }
    this.isEditingYear = false;
  }

  generarCalendario() {
    this.calendarDays = [];
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
    }
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Días del próximo mes para completar las 6 filas (42 celdas)
    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      this.calendarDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
  }

  seleccionarFecha(d: Date) {
    // Si no hay nada seleccionado, o si ya hay un rango completo, empezamos de cero
    if (!this.selStart || (this.selStart && this.selEnd)) {
      this.selStart = d;
      this.selEnd = null;
    } else {
      // Si seleccionó una fecha anterior a la de inicio, las invertimos
      if (d < this.selStart) {
        this.selEnd = this.selStart;
        this.selStart = d;
      } else {
        this.selEnd = d;
      }
    }

    // Actualizamos el formulario en tiempo real
    this.form.startDate = this.formatDateLocal(this.selStart!);
    this.form.endDate = this.selEnd ? this.formatDateLocal(this.selEnd) : '';
  }

  formatDateLocal(d: Date): string {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  esInicio(d: Date): boolean { return !!this.selStart && d.getTime() === this.selStart.getTime(); }
  esFin(d: Date): boolean { return !!this.selEnd && d.getTime() === this.selEnd.getTime(); }
  estaEnRango(d: Date): boolean { return !!this.selStart && !!this.selEnd && d > this.selStart && d < this.selEnd; }

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