import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionScreenComponent } from './edition-screen.component';

describe('EditionScreenComponent', () => {
  let component: EditionScreenComponent;
  let fixture: ComponentFixture<EditionScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditionScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditionScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
