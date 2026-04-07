import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export type ThreeSceneSource =
  | {
      kind: "generated";
      createModel: () => THREE.Group;
    }
  | {
      kind: "stl";
      url: string;
      color?: number;
    }
  | {
      kind: "gltf";
      url: string;
    };

interface ThreeSceneProps {
  source: ThreeSceneSource;
  isActive: boolean;
  bgColor?: string;
}

function describeSource(source: ThreeSceneSource) {
  if (source.kind === "generated") {
    return "generated";
  }

  return `${source.kind}:${source.url}`;
}

function fitCameraToObject(camera: THREE.PerspectiveCamera, object: THREE.Object3D) {
  object.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const fov = (camera.fov * Math.PI) / 180;
  const distance = maxDim / (2 * Math.tan(fov / 2));
  const safeDistance = distance * 1.9;

  console.log("[ThreeScene] fitCameraToObject", {
    center: center.toArray(),
    size: size.toArray(),
    maxDim,
    safeDistance,
  });

  camera.position.set(center.x, center.y + maxDim * 0.15, center.z + safeDistance);
  camera.near = Math.max(0.01, safeDistance / 100);
  camera.far = Math.max(100, safeDistance * 20);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

function normalizeGroup(group: THREE.Group) {
  group.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxAxis = Math.max(size.x, size.y, size.z);
  if (maxAxis > 0) {
    const scale = 3.2 / maxAxis;
    group.scale.setScalar(scale);
    console.log("[ThreeScene] normalizeGroup scale", { maxAxis, scale });
  }

  group.position.set(
    -center.x * group.scale.x,
    -center.y * group.scale.y,
    -center.z * group.scale.z
  );

  console.log("[ThreeScene] normalizeGroup bounds", {
    center: center.toArray(),
    size: size.toArray(),
    position: group.position.toArray(),
  });
}

async function loadSceneModel(source: ThreeSceneSource): Promise<THREE.Group> {
  console.log("[ThreeScene] loadSceneModel start", describeSource(source));

  if (source.kind === "generated") {
    const group = source.createModel();
    normalizeGroup(group);
    console.log("[ThreeScene] generated model ready", {
      children: group.children.length,
    });
    return group;
  }

  if (source.kind === "stl") {
    const loader = new STLLoader();
    const geometry = await loader.loadAsync(source.url);
    console.log("[ThreeScene] STL loaded", {
      url: source.url,
      attributes: Object.keys(geometry.attributes),
      vertexCount: geometry.getAttribute("position")?.count ?? 0,
    });
    geometry.computeBoundingBox();
    geometry.center();
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: source.color ?? 0xcbd5e1,
      roughness: 0.45,
      metalness: 0.18,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const group = new THREE.Group();
    group.add(mesh);

    const wireframe = new THREE.Mesh(
      geometry.clone(),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      })
    );
    group.add(wireframe);

    const debugBox = new THREE.Box3().setFromBufferAttribute(
      geometry.getAttribute("position") as THREE.BufferAttribute
    );
    const helper = new THREE.Box3Helper(debugBox, 0x22ff88);
    group.add(helper);

    normalizeGroup(group);
    console.log("[ThreeScene] STL group ready", {
      children: group.children.length,
    });
    return group;
  }

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(source.url);
  console.log("[ThreeScene] GLB loaded", {
    url: source.url,
    sceneChildren: gltf.scene.children.length,
    animations: gltf.animations.length,
  });
  const group = gltf.scene;
  const debugGroup = new THREE.Group();
  let meshCount = 0;

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshCount += 1;
      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;

      console.log("[ThreeScene] GLB mesh", {
        name: child.name,
        position: child.position.toArray(),
        rotation: [child.rotation.x, child.rotation.y, child.rotation.z],
        scale: child.scale.toArray(),
        vertexCount: child.geometry.getAttribute("position")?.count ?? 0,
      });

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => {
          material.side = THREE.DoubleSide;
          material.transparent = false;
          material.opacity = 1;
          material.depthWrite = true;
          return material;
        });
      } else if (child.material) {
        child.material.side = THREE.DoubleSide;
        child.material.transparent = false;
        child.material.opacity = 1;
        child.material.depthWrite = true;
      }

      const wireframe = new THREE.Mesh(
        child.geometry.clone(),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.12,
        })
      );
      wireframe.position.copy(child.position);
      wireframe.rotation.copy(child.rotation);
      wireframe.scale.copy(child.scale);
      debugGroup.add(wireframe);
    }
  });

  const root = new THREE.Group();
  root.add(group);
  root.add(debugGroup);

  const originMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xff3355 })
  );
  root.add(originMarker);

  const helper = new THREE.BoxHelper(group, 0x22ff88);
  root.add(helper);

  normalizeGroup(root);
  console.log("[ThreeScene] GLB root ready", {
    meshCount,
    children: root.children.length,
  });
  return root;
}

export default function ThreeScene({
  source,
  isActive,
  bgColor = "#0f172a",
}: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    animFrameId: number;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
    targetRotation: { x: number; y: number };
    autoRotate: boolean;
    model: THREE.Group;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cleanupFn: (() => void) | null;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current || stateRef.current) {
      return;
    }

    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;
    console.log("[ThreeScene] init", {
      source: describeSource(source),
      width,
      height,
      bgColor,
      isActive,
    });

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.45);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.75);
    rimLight.position.set(0, -2, -5);
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0x334455, 0.55, 10);
    bottomLight.position.set(0, -3, 2);
    scene.add(bottomLight);

    const model = new THREE.Group();
    scene.add(model);

    const groundGeom = new THREE.CircleGeometry(4, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bgColor).multiplyScalar(0.6),
      roughness: 0.5,
      metalness: 0.3,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.2;
    ground.receiveShadow = true;
    scene.add(ground);

    const state = {
      renderer,
      animFrameId: 0,
      isDragging: false,
      previousMousePosition: { x: 0, y: 0 },
      targetRotation: { x: 0, y: 0 },
      autoRotate: true,
      model,
      scene,
      camera,
      cleanupFn: null as (() => void) | null,
    };

    stateRef.current = state;

    let disposed = false;

    loadSceneModel(source)
      .then((loadedModel) => {
        if (disposed) {
          console.log("[ThreeScene] model resolved after dispose", describeSource(source));
          return;
        }
        state.model.add(loadedModel);
        console.log("[ThreeScene] model added to scene", {
          source: describeSource(source),
          modelChildren: state.model.children.length,
        });
        fitCameraToObject(state.camera, state.model);
      })
      .catch((error) => {
        console.error("Failed to load slide model", error);
      });

    const animate = () => {
      state.animFrameId = requestAnimationFrame(animate);

      if (state.autoRotate) {
        state.model.rotation.y += 0.008;
      } else {
        state.model.rotation.y +=
          (state.targetRotation.y - state.model.rotation.y) * 0.08;
        state.model.rotation.x +=
          (state.targetRotation.x - state.model.rotation.x) * 0.08;
      }

      renderer.render(scene, camera);
    };

    state.animFrameId = requestAnimationFrame(animate);

    const onPointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      state.isDragging = true;
      state.autoRotate = false;
      state.targetRotation.y = state.model.rotation.y;
      state.targetRotation.x = state.model.rotation.x;
      state.previousMousePosition = { x: e.clientX, y: e.clientY };
      renderer.domElement.setPointerCapture(e.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!state.isDragging) {
        return;
      }
      e.stopPropagation();

      const deltaX = e.clientX - state.previousMousePosition.x;
      const deltaY = e.clientY - state.previousMousePosition.y;

      state.targetRotation.y += deltaX * 0.01;
      state.targetRotation.x += deltaY * 0.008;
      state.targetRotation.x = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, state.targetRotation.x)
      );

      state.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      state.isDragging = false;
      renderer.domElement.style.cursor = "grab";
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current) {
        return;
      }
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) {
        console.warn("[ThreeScene] resize ignored due to zero size", {
          source: describeSource(source),
          w,
          h,
        });
        return;
      }
      console.log("[ThreeScene] resize", {
        source: describeSource(source),
        w,
        h,
      });
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (state.model.children.length > 0) {
        fitCameraToObject(camera, state.model);
      }
    });
    resizeObserver.observe(container);

    state.cleanupFn = () => {
      console.log("[ThreeScene] cleanup", describeSource(source));
      disposed = true;
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      cancelAnimationFrame(state.animFrameId);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      stateRef.current = null;
    };

    return () => {
      if (state.cleanupFn) {
        state.cleanupFn();
      }
    };
  }, [bgColor, source]);

  useEffect(() => {
    console.log("[ThreeScene] isActive changed", {
      source: describeSource(source),
      isActive,
    });
    if (isActive && stateRef.current && mountRef.current) {
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      console.log("[ThreeScene] active sizing", {
        source: describeSource(source),
        w,
        h,
        modelChildren: stateRef.current.model.children.length,
      });
      if (w > 0 && h > 0) {
        stateRef.current.camera.aspect = w / h;
        stateRef.current.camera.updateProjectionMatrix();
        stateRef.current.renderer.setSize(w, h);
        if (stateRef.current.model.children.length > 0) {
          fitCameraToObject(stateRef.current.camera, stateRef.current.model);
        }
      }
    }
  }, [isActive]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full overflow-hidden"
      style={{ touchAction: "none", cursor: "grab" }}
    />
  );
}
