/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarCiudadesComponent } from './buscar-ciudades.component';

describe('BuscarCiudadesComponent', () => {
  let component: BuscarCiudadesComponent;
  let fixture: ComponentFixture<BuscarCiudadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarCiudadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarCiudadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
