import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCiudadComponent } from './detalle-ciudad';

describe('DetalleCiudadComponent', () => {
  let component: DetalleCiudadComponent;
  let fixture: ComponentFixture<DetalleCiudadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCiudadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCiudadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
