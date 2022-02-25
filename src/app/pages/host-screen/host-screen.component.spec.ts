import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostScreenComponent } from './host-screen.component';

describe('HostScreenComponent', () => {
  let component: HostScreenComponent;
  let fixture: ComponentFixture<HostScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
