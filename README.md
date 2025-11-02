# 3D Product Viewer

Visualizador 3D interactivo para productos con materiales PBR, múltiples viewpoints y personalización en tiempo real.

## Quick Start

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build
```

## Formatos de Modelos Soportados

### **GLTF/GLB (Recomendado)**

Ventajas:

-  Formato binario todo-en-uno
-  Soporte completo de PBR materials
-  Compresión Draco integrada
-  Carga rápida y optimizada
-  Estándar de la industria

###  **Convertir FBX a GLB**

Si tienes archivos FBX, conviértelos primero:

#### Opción 1: Online (Rápido)
- [gltf.report](https://gltf.report/) - Convierte y optimiza
- [Blackthread GLTF Converter](https://blackthread.io/gltf-converter/)

#### Opción 2: Blender (Control total)
```
1. File → Import → FBX
2. File → Export → glTF 2.0
3. En export options:
   - Format: GLB
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers
   - Compression: Enable Draco (importante!)
```

#### Opción 3: CLI (Automatizado)
```bash
npm install -g gltf-pipeline

# Básico
gltf-pipeline -i model.gltf -o model.glb

# Con compresión Draco
gltf-pipeline -i model.gltf -o model.glb -d
```

## Estructura de Archivos

```
public/
├── models/
│   └── product.glb          # Tu modelo 3D
├── textures/                # Texturas PBR adicionales
└── hdri/
    └── environment.hdr      # HDR para IBL (opcional)
```

## Preparar tu Modelo para Web

### 1. **Optimización de Geometría**
- **Target:** <200k triángulos (desktop), <100k (mobile)
- Usa retopology si es necesario
- Elimina geometría invisible

### 2. **Texturas PBR**
Incluye estos mapas en tu modelo:
- **Albedo/Base Color** (2K o 4K)
- **Normal Map** (2K)
- **Roughness** (2K)
- **Metalness** (2K)
- **AO (Ambient Occlusion)** (2K)

**Formato recomendado:** JPG (albedo), PNG (data maps)

### 3. **Compresión**
- Habilita **Draco compression** al exportar
- Reduce tamaño hasta 90%

### 4. **Naming**
- Nombra tus objetos/meshes descriptivamente
- Ejemplo: `handle`, `body`, `cap`, etc.
- Útil para anchor points específicos

## Usar tu Propio Modelo

### Paso 1: Coloca tu modelo
```
public/models/product.glb
```

### Paso 2: Actualiza la ruta (opcional)
En `src/main.ts`:
```typescript
const modelPath = '/models/tu-modelo.glb';
```

### Paso 3: Listo!
El sistema detecta y carga automáticamente.

## Viewpoints Personalizados

Edita `src/controls/viewpoints.ts` para crear vistas personalizadas:

```typescript
{
  name: 'custom-view',
  target: new THREE.Vector3(0, 1, 0),        // Punto al que mira
  cameraPosition: new THREE.Vector3(2, 1, 3), // Posición de cámara
  limits: {
    minPolarAngle: Math.PI / 4,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Math.PI / 6,
    maxAzimuthAngle: Math.PI / 6
  }
}
```

##  Troubleshooting

### El modelo no se ve
-  Verifica que el archivo esté en `public/models/`
-  Revisa la consola del navegador para errores
-  Confirma que el formato es GLB/GLTF

### Modelo muy grande/pequeño
El sistema auto-escala, pero puedes ajustar en `ModelLoader.ts`:
```typescript
this.centerAndScaleModel(model, 2); // Cambia el número
```

### Materiales se ven mal
-  Asegura que el modelo tenga texturas PBR
-  Verifica que el export de Blender use "Principled BSDF"

### Carga muy lenta
-  Habilita compresión Draco al exportar
-  Reduce tamaño de texturas (2K max)
-  Optimiza geometría (<200k triangles)

## Recursos Útiles

- [Khronos GLTF Guide](https://www.khronos.org/gltf/)
- [Three.js GLTF Loader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [Draco Compression](https://google.github.io/draco/)

## Ejemplos de Uso

### Cargar modelo simple
```typescript
const loader = new ModelLoader();
const model = await loader.loadModel('/models/product.glb');
scene.add(model);
```


### Con progreso
```typescript
loader.onProgress((progress) => {
  console.log(`Loading: ${progress}%`);
});

const model = await loader.loadModel('/models/product.glb');
```


