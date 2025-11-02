import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class LightingManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
  }

  // Carga HDR environment para IBL - proporciona reflejos y GI
  public async loadEnvironment(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new RGBELoader();

      loader.load(
        url,
        (texture) => {
          const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
          pmremGenerator.compileEquirectangularShader();

          const envMap = pmremGenerator.fromEquirectangular(texture).texture;

          // Aplica a la escena
          this.scene.environment = envMap;
          this.scene.background = envMap;

          // Limpia recursos
          texture.dispose();
          pmremGenerator.dispose();

          resolve(envMap);
        },
        undefined,
        reject
      );
    });
  }

  // Agrega iluminación básica de tres puntos
  public addBasicLighting(): void {
    // Luz principal
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    this.scene.add(keyLight);

    // Luz de relleno
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);

    // Luz trasera
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 5, -5);
    this.scene.add(backLight);

    // Luz ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);
  }

  // Establece intensidad del environment map
  public setEnvironmentIntensity(intensity: number): void {
    this.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.isMeshStandardMaterial) {
          material.envMapIntensity = intensity;
        }
      }
    });
  }
}
