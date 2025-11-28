import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, finalize } from 'rxjs/operators';
import { DestinoService } from '../../proxy/destinos/destino.service'; // Tu servicio manual
import { CityDto } from '../../proxy/destinos/models'; // Tus modelos

@Component({
  selector: 'app-buscar-ciudades',
  templateUrl: './buscar-ciudades.component.html',
  styleUrls: ['./buscar-ciudades.component.scss'] // O .css si usas css
})
export class BuscarCiudadesComponent implements OnInit {
  
  // Variables para la vista
  ciudades: CityDto[] = [];
  loading = false;
  busqueda$ = new Subject<string>(); // "Subject" para manejar el debounce

  constructor(private destinoService: DestinoService) {}

  ngOnInit(): void {
    // Configuración del Debounce (Pide el PDF)
    this.busqueda$.pipe(
      filter(texto => texto.length > 2), // Solo busca si hay más de 2 letras
      debounceTime(500),                 // Espera 500ms a que dejes de escribir
      distinctUntilChanged(),            // No busca si el texto es igual al anterior
      switchMap(texto => {
        this.loading = true;             // Activa el spinner
        return this.destinoService.searchCities({ partialName: texto })
          .pipe(finalize(() => this.loading = false)); // Apaga el spinner al terminar
      })
    ).subscribe({
      next: (resultado) => {
        this.ciudades = resultado.cities;
      },
      error: (err) => {
        console.error('Error buscando ciudades', err);
        this.loading = false;
      }
    });
  }

  // Método que llama el input del HTML
  onSearch(texto: string): void {
    if (!texto) {
      this.ciudades = [];
      return;
    }
    this.busqueda$.next(texto); // Empuja el texto al "tubo" del debounce
  }
}