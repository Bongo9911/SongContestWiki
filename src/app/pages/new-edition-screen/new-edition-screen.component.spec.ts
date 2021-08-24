import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEditionScreenComponent } from './new-edition-screen.component';

describe('NewEditionScreenComponent', () => {
  let component: NewEditionScreenComponent;
  let fixture: ComponentFixture<NewEditionScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEditionScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEditionScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
