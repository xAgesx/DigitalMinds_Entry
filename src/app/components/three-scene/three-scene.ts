import { AfterViewInit, Component, ElementRef, HostListener, OnInit, viewChild, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-scene',
  imports: [],
  templateUrl: './three-scene.html',
  styleUrl: './three-scene.css',
})
export class ThreeScene implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer', { static: true }) container!: ElementRef;
  @ViewChild('cursorDot') cursorDot!: ElementRef;
  @ViewChild('cursorRing') cursorRing!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mesh!: THREE.Mesh;
  private particles!: THREE.Points;
  
  private ringPos = { x: 0, y: 0 };
  private dotPos = { x: 0, y: 0 };
  private mouse = new THREE.Vector2(0, 0);

  private targetPos = new THREE.Vector3(0, 0, 0);
  private targetRot = new THREE.Euler(0, 0, 0);
  private mainLight!: THREE.PointLight;
  progressBar = viewChild<ElementRef>('progressBar');

  ngOnInit() {
    this.initThree();
    this.addLights();
    this.createParticles();
    this.animate();
  }

  ngAfterViewInit() {
    this.setupObservers();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.nativeElement.appendChild(this.renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  private addLights() {
    this.mainLight = new THREE.PointLight(0x00ff88, 50, 100);
    this.mainLight.position.set(5, 5, 5);
    this.scene.add(this.mainLight);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  }

  private createParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 3000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.02, color: 0x00ff88, transparent: true, opacity: 0.5 });
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

    this.mesh.position.lerp(this.targetPos, lerpSpeed);
    this.mesh.rotation.x += (this.targetRot.x - this.mesh.rotation.x) * lerpSpeed;
    this.mesh.rotation.y += (this.targetRot.y - this.mesh.rotation.y) * lerpSpeed;

    this.ringPos.x += (this.dotPos.x - this.ringPos.x) * 0.15;
    this.ringPos.y += (this.dotPos.y - this.ringPos.y) * 0.15;
    this.cursorRing.nativeElement.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0) translate(-50%, -50%)`;

    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0);

    this.particles.rotation.y += 0.0005;
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
        this.targetPos.set(0, 0, 0);
        this.targetRot.set(0, 0, 0);
        this.mainLight.color.setHex(0x00ff88);
        break;
      case '2':
        this.targetPos.set(-2.5, 0.5, 1);
        this.targetRot.set(Math.PI / 4, Math.PI / 4, 0);
        this.mainLight.color.setHex(0x0088ff);
        break;
      case '3':
        this.targetPos.set(2.5, -0.5, -1);
        this.targetRot.set(-Math.PI / 2, 0, Math.PI / 2);
        this.mainLight.color.setHex(0xff0088);
        break;
      case '4':
        this.targetPos.set(0, 0, 3);
        this.targetRot.set(0, Math.PI * 2, 0);
        break;
      case '5':
        this.targetPos.set(0, -4, -2);
        this.targetRot.set(Math.PI, 0, 0);
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
