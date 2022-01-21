import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WikiScrubberComponent } from './wiki-scrubber.component';

describe('WikiScrubberComponent', () => {
  let component: WikiScrubberComponent;
  let fixture: ComponentFixture<WikiScrubberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WikiScrubberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WikiScrubberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
