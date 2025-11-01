import * as THREE from 'three';

export interface Viewpoint {
  name: string;
  target: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  limits: {
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle?: number;
    maxAzimuthAngle?: number;
  };
}

export interface MaterialPreset {
  name: string;
  color: number;
  roughness: number;
  metalness: number;
  textures?: {
    map?: string;
    normalMap?: string;
    roughnessMap?: string;
    metalnessMap?: string;
    aoMap?: string;
  };
  // Propiedades adicionales de MeshPhysicalMaterial
  clearcoat?: number;
  clearcoatRoughness?: number;
  sheen?: number;
  sheenColor?: number;
}

export interface SceneConfig {
  canvas: HTMLCanvasElement;
  enableShadows?: boolean;
  enablePostProcessing?: boolean;
}
