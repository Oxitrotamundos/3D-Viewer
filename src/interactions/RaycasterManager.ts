import * as THREE from 'three';

export class RaycasterManager {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;
  private clickableObjects: THREE.Object3D[] = [];
  private onObjectClickCallback: ((point: THREE.Vector3, object: THREE.Object3D) => void) | null = null;

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.camera = camera;
    this.canvas = canvas;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', this.onClick.bind(this));
  }

  private onClick(event: MouseEvent): void {
    // Calcula posición del mouse en coordenadas normalizadas (-1 a +1)
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Actualiza raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Verifica intersecciones
    const intersects = this.raycaster.intersectObjects(this.clickableObjects, true);

    if (intersects.length > 0 && this.onObjectClickCallback) {
      const intersection = intersects[0];
      this.onObjectClickCallback(intersection.point, intersection.object);
    }
  }

  // Establece objetos que pueden ser clickeados
  public setClickableObjects(objects: THREE.Object3D[]): void {
    this.clickableObjects = objects;
  }

  // Agrega un objeto clickeable
  public addClickableObject(object: THREE.Object3D): void {
    if (!this.clickableObjects.includes(object)) {
      this.clickableObjects.push(object);
    }
  }

  // Remueve un objeto clickeable
  public removeClickableObject(object: THREE.Object3D): void {
    const index = this.clickableObjects.indexOf(object);
    if (index > -1) {
      this.clickableObjects.splice(index, 1);
    }
  }

  // Callback para cuando se clickea un objeto
  public onObjectClick(callback: (point: THREE.Vector3, object: THREE.Object3D) => void): void {
    this.onObjectClickCallback = callback;
  }

  // Obtiene posición del mouse en espacio 3D sobre un plano
  public getMousePosition3D(planeNormal: THREE.Vector3 = new THREE.Vector3(0, 1, 0), planePosition: number = 0): THREE.Vector3 | null {
    const plane = new THREE.Plane(planeNormal, planePosition);
    const intersection = new THREE.Vector3();

    this.raycaster.ray.intersectPlane(plane, intersection);

    return intersection;
  }

  // Limpia recursos
  public dispose(): void {
    this.canvas.removeEventListener('click', this.onClick.bind(this));
  }
}
