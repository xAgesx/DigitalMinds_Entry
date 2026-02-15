import { Component, ElementRef, OnInit, ViewChild, NgZone, AfterViewInit, viewChild, afterNextRender } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-scene-canvas',
  imports: [],
  templateUrl: './scene-canvas.html',
  styleUrl: './scene-canvas.css',
})
export class SceneCanvas {

  private container = viewChild.required<ElementRef>('canvasContainer');
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private core!: THREE.Group;
  private frameId?: number;
  private scrollY = 0;
  private lerpScroll = 0;
  
  public hasScrolled = false;
constructor() {
    afterNextRender(() => {
      this.initThree();
      this.animate();
      window.addEventListener('scroll', this.onScroll.bind(this));
      window.addEventListener('resize', this.onResize.bind(this));
    });
  }

  private initThree() {
    const el = this.container().nativeElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(this.renderer.domElement);

    this.core = new THREE.Group();

    const geo = new THREE.DodecahedronGeometry(2, 0);
    const mat1 = new THREE.MeshPhysicalMaterial({ color: 0x6366f1, wireframe: true, emissive: 0x6366f1, emissiveIntensity: 0.6 });
    const mesh1 = new THREE.Mesh(geo, mat1);

    const mat2 = new THREE.MeshPhysicalMaterial({ color: 0x4f46e5, wireframe: true, transparent: true, opacity: 0.15 });
    const mesh2 = new THREE.Mesh(geo, mat2);
    mesh2.scale.set(1.2, 1.2, 1.2);

    this.core.add(mesh1, mesh2);
    this.scene.add(this.core);

    const light = new THREE.PointLight(0xffffff, 250);
    light.position.set(5, 5, 5);
    this.scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));
  }

  private onScroll() {
    this.scrollY = window.scrollY;
    if (this.scrollY > 50 && !this.hasScrolled) {
      this.hasScrolled = true;
    }
  }

  private animate() {
    this.lerpScroll += (this.scrollY - this.lerpScroll) * 0.05;
    const scrollP = this.lerpScroll / (document.documentElement.scrollHeight - window.innerHeight);

    this.core.rotation.y += 0.005;
    this.core.rotation.x = scrollP * 3;
    this.core.position.x = Math.sin(scrollP * Math.PI) * 2;
    
    const s = 1 - (scrollP * 0.2);
    this.core.scale.set(s, s, s);

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(() => this.animate());
  }

  private onResize() {
    const el = this.container().nativeElement;
    this.camera.aspect = el.clientWidth / el.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(el.clientWidth, el.clientHeight);
  }

  ngOnDestroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
  }
}


