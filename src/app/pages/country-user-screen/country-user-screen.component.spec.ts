import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryUserScreenComponent } from './country-user-screen.component';

describe('CountryUserScreenComponent', () => {
  let component: CountryUserScreenComponent;
  let fixture: ComponentFixture<CountryUserScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountryUserScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryUserScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
