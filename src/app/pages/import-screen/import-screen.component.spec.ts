import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportScreenComponent } from './import-screen.component';

describe('ImportScreenComponent', () => {
  let component: ImportScreenComponent;
  let fixture: ComponentFixture<ImportScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
