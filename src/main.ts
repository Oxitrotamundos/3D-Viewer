import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { LightingManager } from './core/Lighting';

class App {
  private sceneManager: SceneManager;
  private lightingManager: LightingManager;

  constructor() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    // Inicializar escena
    this.sceneManager = new SceneManager({
      canvas,
      enableShadows: true
    });

    // Inicializar iluminación
    this.lightingManager = new LightingManager(
      this.sceneManager.scene,
      this.sceneManager.renderer
    );

    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Agregar iluminación básica por ahora (cargaremos HDR más tarde)
      this.lightingManager.addBasicLighting();

      // Agregar un cubo de prueba con material PBR
      this.addTestCube();

      // Agregar helper de grilla para referencia
      const gridHelper = new THREE.GridHelper(10, 10);
      this.sceneManager.scene.add(gridHelper);

      // Ocultar pantalla de carga
      const loadingEl = document.getElementById('loading');
      if (loadingEl) {
        loadingEl.style.display = 'none';
      }

      // Iniciar bucle de renderizado
      this.sceneManager.startRenderLoop();

      console.log('¡Visor 3D inicializado correctamente!');
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
    }
  }

  private addTestCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      roughness: 0.3,
      metalness: 0.7
    });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.5;
    cube.castShadow = true;
    cube.receiveShadow = true;

    this.sceneManager.scene.add(cube);
  }
}

// Inicializar aplicación cuando el DOM esté listo
new App();
