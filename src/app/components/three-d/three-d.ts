import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as  THREE from 'three';
import { GLTFLoader, PointerLockControls } from 'three/examples/jsm/Addons.js';
@Component({
  selector: 'app-three-d',
  imports: [CommonModule],
  templateUrl: './three-d.html',
  styleUrl: './three-d.css',
})
export class ThreeD {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: PointerLockControls;


  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(0, 0);
  public hoveredObject: any = null;

  ngOnInit() {
    this.initThree();
    this.loadGalleryModel();
    this.setupControls();
    this.animate();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdddddd);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.y = 50;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.scene.add(light);
  }

  private setupControls() {
    this.controls = new PointerLockControls(this.camera, document.body);

    const instructions = document.getElementById('instructions');
    instructions?.addEventListener('click', () => {
      this.controls.lock();
    });

    this.controls.addEventListener('lock', () => {
      if (instructions) instructions.style.display = 'none';
    });

    this.controls.addEventListener('unlock', () => {
      if (instructions) instructions.style.display = 'flex';
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW': this.moveForward = true; break;
      case 'KeyA': this.moveLeft = true; break;
      case 'KeyS': this.moveBackward = true; break;
      case 'KeyD': this.moveRight = true; break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW': this.moveForward = false; break;
      case 'KeyA': this.moveLeft = false; break;
      case 'KeyS': this.moveBackward = false; break;
      case 'KeyD': this.moveRight = false; break;
    }
  }

  private loadGalleryModel() {
    const loader = new GLTFLoader();
    loader.load('/Galery.glb', (gltf) => {
      this.scene.add(gltf.scene);

    });

  }

  private animate() {
    
    requestAnimationFrame(() => this.animate());

    if (this.controls.isLocked) {
      const time = performance.now();
      const delta = 0.015;

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward) * 10;
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
      if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;

      this.controls.moveRight(-this.velocity.x * delta);
      this.controls.moveForward(-this.velocity.z * delta);
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
