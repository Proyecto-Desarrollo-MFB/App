import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpBackend } from '@angular/common/http';

@Component({
  selector: 'app-detalle-ciudad',
  standalone: true,
  imports: [CommonModule],
  // CORREGIDO: Nombres de archivo sin .component
  templateUrl: './detalle-ciudad.html',
  styleUrls: ['./detalle-ciudad.scss']
})
export class DetalleCiudadComponent implements OnInit {
  
  city: any;
  
  // Variables para manejar el texto largo
  descripcion: string = 'Buscando información...';
  textoCompleto: string = '';
  mostrarTodo: boolean = false;
  tieneTextoLargo: boolean = false;
  
  ratingPromedio: number = 4.5;
  totalReviews: number = 1254;
  
  reviews = [
    { usuario: 'Sofia_Travels', avatar: 'https://i.pravatar.cc/150?u=1', rating: 5, texto: '¡Increíble lugar! La comida es espectacular y la gente muy amable.', fecha: 'Hace 2 días' },
    { usuario: 'MarcosG', avatar: 'https://i.pravatar.cc/150?u=2', rating: 4, texto: 'Muy lindo paisaje, aunque un poco caro en temporada alta.', fecha: 'Hace 1 semana' },
    { usuario: 'Ana_R', avatar: 'https://i.pravatar.cc/150?u=3', rating: 5, texto: 'Volvería mil veces. Es mágico.', fecha: 'Hace 2 semanas' }
  ];

  private http: HttpClient;

  constructor(private router: Router, private location: Location, handler: HttpBackend) {
    this.http = new HttpClient(handler);
    
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['data']) {
      this.city = nav.extras.state['data'];
    } else {
      this.router.navigate(['/']); 
    }
  }

  ngOnInit() {
    if (this.city) {
      this.obtenerDescripcionWikipedia(this.city.nombre);
    }
  }

  volver() {
    this.location.back();
  }

  obtenerDescripcionWikipedia(nombre: string) {
    const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(nombre)}&format=json&origin=*`;

    this.http.get(url).subscribe({
      next: (res: any) => {
        try {
          const pages = res.query.pages;
          const pageId = Object.keys(pages)[0];

          if (pageId !== '-1' && pages[pageId].extract) {
            // Guardamos el texto completo original
            this.textoCompleto = pages[pageId].extract;
            
            // Verificamos si es largo (más de 400 caracteres)
            if (this.textoCompleto.length > 400) {
                this.tieneTextoLargo = true;
                this.descripcion = this.textoCompleto.substring(0, 400) + '...';
            } else {
                this.tieneTextoLargo = false;
                this.descripcion = this.textoCompleto;
            }
          } else {
             if (nombre === this.city.nombre) {
                 this.obtenerDescripcionWikipedia(`${this.city.nombre}, ${this.city.pais}`);
             } else {
                 this.descripcion = "No se encontró una descripción detallada para este destino.";
             }
          }
        } catch (e) {
          this.descripcion = "Información no disponible.";
        }
      },
      error: () => {
        this.descripcion = "No se pudo conectar con Wikipedia.";
      }
    });
  }

  // Función del botón Ver más
  toggleDescripcion() {
    this.mostrarTodo = !this.mostrarTodo;
    if (this.mostrarTodo) {
        this.descripcion = this.textoCompleto;
    } else {
        this.descripcion = this.textoCompleto.substring(0, 400) + '...';
    }
  }

  getStars(rating: number) {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating));
  }
}