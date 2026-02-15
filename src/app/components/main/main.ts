import { Component, ElementRef, viewChild, afterNextRender, OnDestroy, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-main',
  imports: [RouterLink],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  @ViewChild('rendererContainer', { static: true }) container!: ElementRef;
  @ViewChild('cursorDot') cursorDot!: ElementRef;
  @ViewChild('cursorRing') cursorRing!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model: THREE.Group | null = null; 
  private particles!: THREE.Points;
  
  private ringPos = { x: 0, y: 0 };
  private dotPos = { x: 0, y: 0 };
  private mouse = new THREE.Vector2(0, 0);

  private targetPos = new THREE.Vector3(30, 0, 0);
  private targetRot = new THREE.Euler(0, 0, 0);
  private mainLight!: THREE.PointLight;
  progressBar = viewChild<ElementRef>('progressBar');

  ngOnInit() {
    this.initThree();
    this.addLights();
    this.createParticles();
    this.loadCustomModel();
    this.animate();
  }

  ngAfterViewInit() {
    this.setupObservers();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF5F7FA);
    this.scene.fog = new THREE.Fog(0xF5F7FA, 1, 40);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.nativeElement.appendChild(this.renderer.domElement);
  }

  private loadCustomModel() {
    const loader = new GLTFLoader();
    loader.load('/Pot.glb', (gltf) => {
      this.model = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.sub(center);
      
      this.scene.add(this.model);
    }, 
    undefined, 
    (error) => console.error('Error loading model:', error));
  }

  private addLights() {
    this.mainLight = new THREE.PointLight(0xFFD3A5, 50, 100); 
    this.mainLight.position.set(5, 5, 5);
    this.scene.add(this.mainLight);
    
    const skyLight = new THREE.HemisphereLight(0x2D89C8, 0xFFA500, 2); 
    this.scene.add(skyLight);
  }

  private createParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 1500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 50;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.05, color: 0x2D89C8, transparent: true, opacity: 0.4 });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.dotPos.x = e.clientX;
    this.dotPos.y = e.clientY;
    this.cursorDot.nativeElement.style.transform = `translate3d(${this.dotPos.x}px, ${this.dotPos.y}px, 0) translate(-50%, -50%)`;
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    const isHovering = (e.target as HTMLElement).closest('.card, button, a');
    document.body.classList.toggle('cursor-active', !!isHovering);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    const lerpSpeed = 0.05;

    if (this.model) {
      this.model.position.lerp(this.targetPos, lerpSpeed);
      this.model.rotation.x += (this.targetRot.x - this.model.rotation.x) * lerpSpeed;
      this.model.rotation.y += (this.targetRot.y - this.model.rotation.y) * lerpSpeed + 0.002;
    }

    this.ringPos.x += (this.dotPos.x - this.ringPos.x) * 0.1;
    this.ringPos.y += (this.dotPos.y - this.ringPos.y) * 0.1;
    this.cursorRing.nativeElement.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0) translate(-50%, -50%)`;

    this.camera.position.x += (this.mouse.x * 1.2 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 1.2 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    this.particles.rotation.y += 0.0001;
    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('window:scroll', [])
  handleScroll() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = (window.scrollY / height) * 100;
    if (this.progressBar()) this.progressBar()!.nativeElement.style.width = `${percentage}%`;
  }

  private setupObservers() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const step = entry.target.getAttribute('data-step');
          this.update3DTarget(step);
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.card, .footer-content').forEach(el => observer.observe(el));
  }

  private update3DTarget(step: string | null) {
    if (!this.mainLight) return;
    switch (step) {
      case '1':
        this.targetPos.set(7, 0, 0);
        this.targetRot.set(0, 0, 0);
        this.mainLight.color.setHex(0xFFD3A5);
        break;
      case '2':
        this.targetPos.set(-4, 0, 2); 
        this.targetRot.set(0, Math.PI / 4, 0);
        this.mainLight.color.setHex(0x2D89C8);
        break;
      case '3':
        this.targetPos.set(7, 0, -2); 
        this.targetRot.set(0, -Math.PI / 4, 0);
        this.mainLight.color.setHex(0xFFFFFF);
        break;
      case '4':
        this.targetPos.set(0, 0, 6); 
        this.targetRot.set(0, Math.PI * 2, 0);
        break;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
