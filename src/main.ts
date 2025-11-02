import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { LightingManager } from './core/Lighting';
import { CameraController } from './controls/CameraController';
import { defaultViewpoints } from './controls/viewpoints';
import { RaycasterManager } from './interactions/RaycasterManager';
import { ViewpointUI } from './ui/ViewpointUI';
import { ModelLoader } from './loaders/ModelLoader';

class App {
  private sceneManager: SceneManager;
  private lightingManager: LightingManager;
  private cameraController: CameraController;
  private raycasterManager: RaycasterManager;
  private viewpointUI: ViewpointUI;
  private modelLoader: ModelLoader;
  private currentModel: THREE.Group | null = null;
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

    // Inicializa model loader
    this.modelLoader = new ModelLoader();

    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Configura callbacks de carga
      this.setupLoadingCallbacks();

      // Agrega iluminación básica
      this.lightingManager.addBasicLighting();

      // Carga HDRI environment
      try {
        await this.lightingManager.loadEnvironment('/hdri/university_workshop_2k.hdr');
        console.log('HDRI environment loaded successfully!');
      } catch (error) {
        console.warn('Could not load HDRI environment:', error);
        console.log('Continuing with basic lighting...');
      }

      // Intenta cargar modelo, si no existe, usa cubo de prueba
      await this.loadModelOrFallback();

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
      this.hideLoading();

      // Inicia render loop
      this.sceneManager.startRenderLoop();

      console.log('3D Viewer initialized successfully!');
      console.log('- Click on the model to focus on it');
      console.log('- Use UI buttons to switch viewpoints');
    } catch (error) {
      console.error('Error initializing app:', error);
      this.showError(error as Error);
    }
  }

  // Intenta cargar modelo, si falla usa cubo de prueba
  private async loadModelOrFallback(): Promise<void> {
    const modelPath = '/models/product.glb'; // Cambia esto a tu modelo

    try {
      console.log('Attempting to load model from:', modelPath);
      this.currentModel = await this.modelLoader.loadModel(modelPath);
      this.sceneManager.scene.add(this.currentModel);

      // Debug info del modelo
      this.debugModelInfo(this.currentModel);

      // Ajusta la cámara al modelo
      this.fitCameraToModel(this.currentModel);

      console.log('Model loaded successfully!');
    } catch (error) {
      console.warn('Could not load model, using test cube instead');
      console.warn('Place your .glb model in: public/models/product.glb');
      this.addTestCube();
    }
  }

  // Debug: muestra info del modelo cargado
  private debugModelInfo(model: THREE.Group): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('📦 Model Info:');
    console.log('  - Size:', size);
    console.log('  - Center:', center);
    console.log('  - Position:', model.position);
    console.log('  - Scale:', model.scale);
    console.log('  - Children:', model.children.length);

    // Cuenta meshes y materiales
    let meshCount = 0;
    let materialCount = 0;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshCount++;
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          materialCount++;
        }
      }
    });
    console.log('  - Meshes:', meshCount);
    console.log('  - Materials:', materialCount);
  }

  // Ajusta la cámara y escala del modelo
  private fitCameraToModel(model: THREE.Group): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    box.getCenter(new THREE.Vector3());

    // Escala el modelo a un tamaño manejable (target: ~3 unidades)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 3;
    const scale = targetSize / maxDim;
    model.scale.multiplyScalar(scale);

    // Recentra el modelo en el origen (Y=0)
    // Recalcula box después del escalado
    box.setFromObject(model);
    const newCenter = box.getCenter(new THREE.Vector3());
    const newSize = box.getSize(new THREE.Vector3());

    // Mueve el modelo para que esté centrado en 0,0,0
    model.position.x -= newCenter.x;
    model.position.y -= newCenter.y;
    model.position.z -= newCenter.z;

    // Opcional: poner base del modelo en Y=0 en lugar de centro
    model.position.y += newSize.y / 2;

    // Posiciona la cámara
    const fov = this.sceneManager.camera.fov * (Math.PI / 180);
    let cameraDistance = Math.abs(targetSize / Math.sin(fov / 2)) * 1.5;

    const direction = new THREE.Vector3(1, 0.5, 1).normalize();
    const cameraPosition = direction.multiplyScalar(cameraDistance);

    this.sceneManager.camera.position.copy(cameraPosition);
    this.sceneManager.controls.target.set(0, newSize.y / 2, 0);
    this.sceneManager.controls.update();

    console.log('📷 Model scaled and camera adjusted');
    console.log('  - Original size:', maxDim.toFixed(2), 'units');
    console.log('  - Scale factor:', scale.toFixed(4));
    console.log('  - New size:', targetSize.toFixed(2), 'units');
    console.log('  - Camera position:', cameraPosition);
  }

  // Configura callbacks de progreso de carga
  private setupLoadingCallbacks(): void {
    const loadingEl = document.getElementById('loading');

    this.modelLoader.onProgress((progress) => {
      if (loadingEl) {
        loadingEl.textContent = `Loading... ${Math.round(progress)}%`;
      }
    });

    this.modelLoader.onLoad(() => {
      console.log('All assets loaded!');
    });

    this.modelLoader.onError((error) => {
      console.error('Loading error:', error);
    });
  }

  private hideLoading(): void {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  private showError(error: Error): void {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.textContent = `Error: ${error.message}`;
      loadingEl.style.color = '#ff4444';
    }
  }

  private setupViewpoints(): void {
    // Agrega viewpoints por defecto
    this.cameraController.addViewpoints(defaultViewpoints);

    // Cambia a overview al iniciar
    this.cameraController.switchToViewpoint('overview', 0);
  }

  private setupRaycaster(): void {
    // Hace el modelo clickeable
    if (this.currentModel) {
      this.raycasterManager.addClickableObject(this.currentModel);
    } else if (this.testCube) {
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
