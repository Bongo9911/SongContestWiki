import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserScreenComponent } from './user-screen.component';

describe('UserScreenComponent', () => {
  let component: UserScreenComponent;
  let fixture: ComponentFixture<UserScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
