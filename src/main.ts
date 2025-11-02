import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { LightingManager } from './core/Lighting';
import { CameraController } from './controls/CameraController';
import { defaultViewpoints } from './controls/viewpoints';
import { RaycasterManager } from './interactions/RaycasterManager';
import { ViewpointUI } from './ui/ViewpointUI';

class App {
  private sceneManager: SceneManager;
  private lightingManager: LightingManager;
  private cameraController: CameraController;
  private raycasterManager: RaycasterManager;
  private viewpointUI: ViewpointUI;
  private testCube: THREE.Mesh | null = null;

  constructor() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    // Inicializa escena
    this.sceneManager = new SceneManager({
      canvas,
      enableShadows: true
    });

    // Inicializa iluminación
    this.lightingManager = new LightingManager(
      this.sceneManager.scene,
      this.sceneManager.renderer
    );

    // Inicializa controlador de cámara
    this.cameraController = new CameraController(
      this.sceneManager.camera,
      this.sceneManager.controls
    );

    // Inicializa raycaster
    this.raycasterManager = new RaycasterManager(
      this.sceneManager.camera,
      canvas
    );

    // Inicializa UI
    this.viewpointUI = new ViewpointUI('ui-container');

    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Agrega iluminación básica (cargaremos HDR después)
      this.lightingManager.addBasicLighting();

      // Agrega cubo de prueba con material PBR
      this.addTestCube();

      // Agrega grid de referencia
      const gridHelper = new THREE.GridHelper(10, 10);
      this.sceneManager.scene.add(gridHelper);

      // Configura viewpoints de cámara
      this.setupViewpoints();

      // Configura raycaster para click-to-focus
      this.setupRaycaster();

      // Configura UI
      this.setupUI();

      // Oculta pantalla de carga
      const loadingEl = document.getElementById('loading');
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }

      // Inicia render loop
      this.sceneManager.startRenderLoop();

      console.log('3D Viewer initialized successfully!');
      console.log('- Click on the cube to focus on it');
      console.log('- Use UI buttons to switch viewpoints');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  private setupViewpoints(): void {
    // Agrega viewpoints por defecto
    this.cameraController.addViewpoints(defaultViewpoints);

    // Cambia a overview al iniciar
    this.cameraController.switchToViewpoint('overview', 0);
  }

  private setupRaycaster(): void {
    // Hace el cubo clickeable
    if (this.testCube) {
      this.raycasterManager.addClickableObject(this.testCube);
    }

    // Maneja clicks en objetos
    this.raycasterManager.onObjectClick((point, object) => {
      console.log('Clicked on:', object.name || 'object', 'at point:', point);

      // Enfoca cámara en el punto clickeado
      this.cameraController.focusOnPoint(point, 1.0);
    });
  }

  private setupUI(): void {
    const viewpointNames = this.cameraController.getViewpointNames();
    this.viewpointUI.createViewpointButtons(viewpointNames);

    // Maneja cambios de viewpoint desde UI
    this.viewpointUI.onViewpointChange((viewpointName) => {
      console.log('Switching to viewpoint:', viewpointName);
      this.cameraController.switchToViewpoint(viewpointName);
    });
  }

  private addTestCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.3,
      metalness: 0.7
    });

    this.testCube = new THREE.Mesh(geometry, material);
    this.testCube.position.y = 0.5;
    this.testCube.castShadow = true;
    this.testCube.receiveShadow = true;
    this.testCube.name = 'test-cube';

    this.sceneManager.scene.add(this.testCube);
  }
}

// Inicializa la app
new App();
