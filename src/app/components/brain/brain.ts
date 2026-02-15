import { Component, ElementRef, viewChild, afterNextRender, OnDestroy } from '@angular/core';
import * as THREE from 'three';
@Component({
  selector: 'app-brain',
  imports: [],
  templateUrl: './brain.html',
  styleUrl: './brain.css',
})
export class Brain {
 private container = viewChild.required<ElementRef>('canvasContainer');
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private frameId?: number;
  
  public scrollP = 0; 
  private lerpP = 0;
  private brainGroup = new THREE.Group();
  private torusMesh!: THREE.Mesh;

  constructor() {
    afterNextRender(() => {
      this.initThree();
      this.animate();
      
      // Force an initial update
      this.updateScroll();
      
      window.addEventListener('scroll', () => this.updateScroll(), { passive: true });
      window.addEventListener('resize', () => this.onResize());
    });
  }

  private updateScroll() {
    const winScroll = window.pageYOffset || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    // Ensure we don't divide by zero and clamp between 0 and 1
    this.scrollP = height > 0 ? Math.min(Math.max(winScroll / height, 0), 1) : 0;
  }

  // Improved helper for template
  public getOpacity(start: number, end: number): string {
    return (this.scrollP >= start && this.scrollP <= end) ? '1' : '0';
  }

  public getTransform(start: number, end: number): string {
    const isVisible = this.scrollP >= start && this.scrollP <= end;
    return isVisible ? 'translateY(0)' : 'translateY(40px)';
  }

  private initThree() {
    const el = this.container().nativeElement;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.04);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 30;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(this.renderer.domElement);

    this.createFullBrain();

    const torusGeo = new THREE.TorusKnotGeometry(4, 0.4, 100, 16);
    this.torusMesh = new THREE.Mesh(torusGeo, new THREE.MeshStandardMaterial({ 
      color: 0x6366f1, wireframe: true, transparent: true, opacity: 0 
    }));
    this.torusMesh.position.set(10, 0, -25);
    this.scene.add(this.torusMesh);
    
    this.scene.add(new THREE.AmbientLight(0xffffff, 1));
  }

  private createFullBrain() {
    const count = 12000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI; 
      const r = 10 + (Math.sin(u * 5) * 0.3);
      pos[i * 3] = r * Math.sin(v) * Math.cos(u);
      pos[i * 3 + 1] = r * Math.sin(v) * Math.sin(u) * 0.85;
      pos[i * 3 + 2] = r * Math.cos(v) * 1.1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.brainGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x6366f1, size: 0.1 })));
    this.scene.add(this.brainGroup);
  }

  private animate() {
    this.lerpP = THREE.MathUtils.lerp(this.lerpP, this.scrollP, 0.08);
    
    this.camera.position.z = 30 - (this.lerpP * 100);
    this.brainGroup.position.x = THREE.MathUtils.smoothstep(this.lerpP, 0.1, 0.4) * -22;
    this.brainGroup.rotation.y += 0.002;

    const tMat = this.torusMesh.material as THREE.MeshStandardMaterial;
    tMat.opacity = THREE.MathUtils.smoothstep(this.lerpP, 0.45, 0.75);

    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(() => this.animate());
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngOnDestroy() { if (this.frameId) cancelAnimationFrame(this.frameId); }
}
