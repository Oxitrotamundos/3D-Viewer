import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class ModelLoader {
  private gltfLoader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private loadingManager: THREE.LoadingManager;

  // Callbacks de progreso
  private onProgressCallback: ((progress: number) => void) | null = null;
  private onLoadCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor() {
    // Setup loading manager para tracking de progreso
    this.loadingManager = new THREE.LoadingManager();

    this.loadingManager.onProgress = (_url, loaded, total) => {
      const progress = (loaded / total) * 100;
      if (this.onProgressCallback) {
        this.onProgressCallback(progress);
      }
    };

    this.loadingManager.onLoad = () => {
      if (this.onLoadCallback) {
        this.onLoadCallback();
      }
    };

    this.loadingManager.onError = (url) => {
      const error = new Error(`Error loading: ${url}`);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    };

    // Setup Draco loader para compresión
    this.dracoLoader = new DRACOLoader(this.loadingManager);
    // CDN de Draco decoder (también puede ser local)
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.preload();

    // Setup GLTF loader
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  // Carga modelo GLTF/GLB
  public async loadModel(url: string, autoScale: boolean = false): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          // Configura materiales PBR automáticamente
          this.setupPBRMaterials(model);

          // Configura sombras
          this.setupShadows(model);

          // Centra y escala el modelo solo si se solicita
          if (autoScale) {
            this.centerAndScaleModel(model);
          }

          resolve(model);
        },
        () => {
          // Progreso ya manejado por LoadingManager
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // Configura materiales para PBR correcto
  private setupPBRMaterials(model: THREE.Group): void {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        if (material.isMeshStandardMaterial) {
          // Asegura que el environment map se aplique
          material.envMapIntensity = 1.0;
          material.needsUpdate = true;
        }

        // Habilita casteo de sombras
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }

  // Configura sombras en el modelo
  private setupShadows(model: THREE.Group): void {
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  // Centra y escala el modelo a un tamaño estándar
  private centerAndScaleModel(model: THREE.Group, targetSize: number = 2): void {
    // Calcula bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Centra el modelo
    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;

    // Escala para que quepa en targetSize
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = targetSize / maxDim;
    model.scale.setScalar(scale);
  }

  // Callbacks de progreso
  public onProgress(callback: (progress: number) => void): void {
    this.onProgressCallback = callback;
  }

  public onLoad(callback: () => void): void {
    this.onLoadCallback = callback;
  }

  public onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  // Limpia recursos
  public dispose(): void {
    this.dracoLoader.dispose();
  }
}
