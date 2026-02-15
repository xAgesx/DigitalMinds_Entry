import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeD } from './three-d';

describe('ThreeD', () => {
  let component: ThreeD;
  let fixture: ComponentFixture<ThreeD>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeD]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreeD);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
