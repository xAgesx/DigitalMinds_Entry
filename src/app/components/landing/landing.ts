import { Component, ElementRef, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
 private container = viewChild.required<ElementRef>('canvasContainer');
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private frameId?: number;
  
  public scrollY = 0;
  public hasScrolled = false;

  private particles!: THREE.Points;
  private lines!: THREE.LineSegments;
  private core!: THREE.Group;
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
    this.scene.fog = new THREE.FogExp2(0x000000, 0.05);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(this.renderer.domElement);

    // --- GENERATE NEURAL ABYSS ---
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 180 - 80;
    }

    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.particles = new THREE.Points(pointGeo, new THREE.PointsMaterial({ 
      color: 0x6366f1, size: 0.12, transparent: true, opacity: 0.5 
    }));
    this.scene.add(this.particles);

    const lineIndices: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dz = Math.abs(pos[i * 3 + 2] - pos[j * 3 + 2]);
        if (dz < 4) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          if (Math.sqrt(dx*dx + dy*dy) < 3.2) lineIndices.push(i, j);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    lineGeo.setIndex(lineIndices);
    this.lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ 
      color: 0x4444bc, transparent: true, opacity: 0.15 
    }));
    this.scene.add(this.lines);

    // --- THE DODECAHEDRON CORE ---
    this.core = new THREE.Group();
    const coreGeo = new THREE.DodecahedronGeometry(3, 0);
    const inner = new THREE.Mesh(coreGeo, new THREE.MeshPhongMaterial({ 
      color: 0x6366f1, wireframe: true, emissive: 0x6366f1, emissiveIntensity: 2 
    }));
    const outer = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ 
      color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 
    }));
    outer.scale.set(1.2, 1.2, 1.2);
    this.core.add(inner, outer);
    this.core.position.z = -140;
    this.scene.add(this.core);

    this.scene.add(new THREE.PointLight(0x6366f1, 800).translateZ(-135), new THREE.AmbientLight(0xffffff, 0.1));
  }

  private onScroll() {
    this.scrollY = window.scrollY;
    if (this.scrollY > 50) this.hasScrolled = true;
  }

  private animate() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const p = this.scrollY / (maxScroll || 1);

    // The Big Dive
    const targetZ = 10 - (p * 165);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, 0.05);

    // Core Animation
    this.core.rotation.y += 0.005 + (p * 0.05);
    this.core.rotation.x += 0.002;
    this.core.scale.setScalar(1 + (p * 1.5));

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(() => this.animate());
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }
}
