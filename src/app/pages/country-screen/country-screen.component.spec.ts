import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryScreenComponent } from './country-screen.component';

describe('CountryScreenComponent', () => {
  let component: CountryScreenComponent;
  let fixture: ComponentFixture<CountryScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountryScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
