import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReallocatorScreenComponent } from './reallocator-screen.component';

describe('ReallocatorScreenComponent', () => {
  let component: ReallocatorScreenComponent;
  let fixture: ComponentFixture<ReallocatorScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReallocatorScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReallocatorScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
