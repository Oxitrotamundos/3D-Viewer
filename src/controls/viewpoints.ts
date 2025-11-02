import * as THREE from 'three';
import { Viewpoint } from '../types';

// Configuraciones predefinidas de viewpoints
// Personaliza según tu modelo de producto
export const defaultViewpoints: Viewpoint[] = [
  {
    name: 'overview',
    target: new THREE.Vector3(0, 1, 0),
    cameraPosition: new THREE.Vector3(4, 2, 4),
    limits: {
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 1.5,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity
    }
  },
  {
    name: 'front',
    target: new THREE.Vector3(0, 1, 0),
    cameraPosition: new THREE.Vector3(0, 1, 5),
    limits: {
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 1.8,
      minAzimuthAngle: -Math.PI / 4,
      maxAzimuthAngle: Math.PI / 4
    }
  },
  {
    name: 'side',
    target: new THREE.Vector3(0, 1, 0),
    cameraPosition: new THREE.Vector3(5, 1, 0),
    limits: {
      minPolarAngle: Math.PI / 4,
      maxPolarAngle: Math.PI / 1.8,
      minAzimuthAngle: Math.PI / 3,
      maxAzimuthAngle: Math.PI / 1.5
    }
  },
  {
    name: 'detail',
    target: new THREE.Vector3(0, 1.2, 0),
    cameraPosition: new THREE.Vector3(1, 1.2, 2.5),
    limits: {
      minPolarAngle: Math.PI / 6,
      maxPolarAngle: Math.PI / 2.5,
      minAzimuthAngle: -Math.PI / 6,
      maxAzimuthAngle: Math.PI / 6
    }
  }
];
