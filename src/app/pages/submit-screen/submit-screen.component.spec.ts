import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitScreenComponent } from './submit-screen.component';

describe('SubmitScreenComponent', () => {
  let component: SubmitScreenComponent;
  let fixture: ComponentFixture<SubmitScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
