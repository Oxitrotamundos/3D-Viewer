import * as THREE from 'three';
import { Viewpoint } from '../types';

// Configuraciones predefinidas de viewpoints
// Personaliza según tu modelo de producto
export const defaultViewpoints: Viewpoint[] = [
  {
    name: 'overview',
    target: new THREE.Vector3(0, 0.5, 0),
    cameraPosition: new THREE.Vector3(3, 2, 3),
    limits: {
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 2,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity
    }
  },
  {
    name: 'front',
    target: new THREE.Vector3(0, 0.5, 0),
    cameraPosition: new THREE.Vector3(0, 0.5, 4),
    limits: {
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 2,
      minAzimuthAngle: -Math.PI / 6,
      maxAzimuthAngle: Math.PI / 6
    }
  },
  {
    name: 'top',
    target: new THREE.Vector3(0, 0.5, 0),
    cameraPosition: new THREE.Vector3(0, 5, 0.1),
    limits: {
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 4,
      minAzimuthAngle: -Math.PI / 4,
      maxAzimuthAngle: Math.PI / 4
    }
  },
  {
    name: 'detail',
    target: new THREE.Vector3(0, 0.8, 0),
    cameraPosition: new THREE.Vector3(0.5, 0.8, 2),
    limits: {
      minPolarAngle: Math.PI / 6,
      maxPolarAngle: Math.PI / 3,
      minAzimuthAngle: -Math.PI / 8,
      maxAzimuthAngle: Math.PI / 8
    }
  }
];
