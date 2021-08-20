import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PotGeneratorComponent } from './pot-generator.component';

describe('PotGeneratorComponent', () => {
  let component: PotGeneratorComponent;
  let fixture: ComponentFixture<PotGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PotGeneratorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PotGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
