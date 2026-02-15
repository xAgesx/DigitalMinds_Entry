import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SceneCanvas } from './scene-canvas';

describe('SceneCanvas', () => {
  let component: SceneCanvas;
  let fixture: ComponentFixture<SceneCanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneCanvas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SceneCanvas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
