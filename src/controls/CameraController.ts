import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { Viewpoint } from '../types';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private viewpoints: Map<string, Viewpoint> = new Map();
  private currentViewpoint: string | null = null;

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
  }

  // Registra un viewpoint
  public addViewpoint(viewpoint: Viewpoint): void {
    this.viewpoints.set(viewpoint.name, viewpoint);
  }

  // Registra múltiples viewpoints
  public addViewpoints(viewpoints: Viewpoint[]): void {
    viewpoints.forEach(vp => this.addViewpoint(vp));
  }

  // Cambia a un viewpoint con animación suave
  public switchToViewpoint(name: string, duration: number = 1.5): Promise<void> {
    return new Promise((resolve, reject) => {
      const viewpoint = this.viewpoints.get(name);

      if (!viewpoint) {
        reject(new Error(`Viewpoint "${name}" not found`));
        return;
      }

      this.currentViewpoint = name;

      // Timeline de animación
      const timeline = gsap.timeline({
        onComplete: () => {
          // Aplica límites de rotación después de la transición
          this.applyViewpointLimits(viewpoint);
          resolve();
        }
      });

      // Anima la posición de la cámara
      timeline.to(this.camera.position, {
        x: viewpoint.cameraPosition.x,
        y: viewpoint.cameraPosition.y,
        z: viewpoint.cameraPosition.z,
        duration,
        ease: 'power2.inOut'
      }, 0);

      // Anima el target (anchor point)
      timeline.to(this.controls.target, {
        x: viewpoint.target.x,
        y: viewpoint.target.y,
        z: viewpoint.target.z,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.controls.update();
        }
      }, 0);
    });
  }

  // Enfoca la cámara en un punto 3D específico
  public focusOnPoint(point: THREE.Vector3, duration: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      // Calcula nueva posición manteniendo la distancia actual
      const currentDistance = this.camera.position.distanceTo(this.controls.target);
      const direction = new THREE.Vector3()
        .subVectors(this.camera.position, this.controls.target)
        .normalize();

      const newCameraPosition = new THREE.Vector3()
        .copy(point)
        .add(direction.multiplyScalar(currentDistance));

      const timeline = gsap.timeline({
        onComplete: resolve
      });

      // Anima el target
      timeline.to(this.controls.target, {
        x: point.x,
        y: point.y,
        z: point.z,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          this.controls.update();
        }
      }, 0);

      // Anima la cámara manteniendo posición relativa
      timeline.to(this.camera.position, {
        x: newCameraPosition.x,
        y: newCameraPosition.y,
        z: newCameraPosition.z,
        duration,
        ease: 'power2.inOut'
      }, 0);
    });
  }

  // Aplica límites de rotación del viewpoint
  private applyViewpointLimits(viewpoint: Viewpoint): void {
    const limits = viewpoint.limits;

    this.controls.minPolarAngle = limits.minPolarAngle;
    this.controls.maxPolarAngle = limits.maxPolarAngle;

    if (limits.minAzimuthAngle !== undefined) {
      this.controls.minAzimuthAngle = limits.minAzimuthAngle;
    } else {
      this.controls.minAzimuthAngle = -Infinity;
    }

    if (limits.maxAzimuthAngle !== undefined) {
      this.controls.maxAzimuthAngle = limits.maxAzimuthAngle;
    } else {
      this.controls.maxAzimuthAngle = Infinity;
    }
  }

  // Resetea a rotación libre sin límites
  public setFreeRotation(): void {
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.minAzimuthAngle = -Infinity;
    this.controls.maxAzimuthAngle = Infinity;
  }

  // Establece límites de rotación personalizados
  public setRotationLimits(limits: {
    minPolar?: number;
    maxPolar?: number;
    minAzimuth?: number;
    maxAzimuth?: number;
  }): void {
    if (limits.minPolar !== undefined) this.controls.minPolarAngle = limits.minPolar;
    if (limits.maxPolar !== undefined) this.controls.maxPolarAngle = limits.maxPolar;
    if (limits.minAzimuth !== undefined) this.controls.minAzimuthAngle = limits.minAzimuth;
    if (limits.maxAzimuth !== undefined) this.controls.maxAzimuthAngle = limits.maxAzimuth;
  }

  // Obtiene el nombre del viewpoint actual
  public getCurrentViewpoint(): string | null {
    return this.currentViewpoint;
  }

  // Obtiene todos los nombres de viewpoints registrados
  public getViewpointNames(): string[] {
    return Array.from(this.viewpoints.keys());
  }

  // Habilita/deshabilita controles
  public setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }
}
