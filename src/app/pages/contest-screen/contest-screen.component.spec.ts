import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestScreenComponent } from './contest-screen.component';

describe('ContestScreenComponent', () => {
  let component: ContestScreenComponent;
  let fixture: ComponentFixture<ContestScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContestScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
