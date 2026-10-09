import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AnimatedGlobeProps {
  onIntroComplete?: () => void;
  className?: string;
}

export const AnimatedGlobe: React.FC<AnimatedGlobeProps> = ({
  onIntroComplete,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onIntroCompleteRef = useRef(onIntroComplete);
  onIntroCompleteRef.current = onIntroComplete;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Dimensions
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group holding the globe and atmosphere
    const globeGroup = new THREE.Group();
    // Axial tilt (approx 15 degrees)
    globeGroup.rotation.z = THREE.MathUtils.degToRad(-15);
    scene.add(globeGroup);

    // 1. Earth Sphere
    const sphereRadius = 1.35;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth_emerald.png');
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const sphereMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.1,
      emissive: new THREE.Color(0x063a21),
      emissiveIntensity: 0.25,
    });

    const earthMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(earthMesh);

    // 2. Glowing Atmosphere Halo
    const atmosphereGeo = new THREE.SphereGeometry(sphereRadius * 1.06, 48, 48);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x34d399),
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Outer Soft White-Green Glow Halo
    const outerHaloGeo = new THREE.SphereGeometry(sphereRadius * 1.14, 48, 48);
    const outerHaloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xa7f3d0),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const outerHaloMesh = new THREE.Mesh(outerHaloGeo, outerHaloMat);
    globeGroup.add(outerHaloMesh);

    // 3. Orbital Paths & Connection Nodes
    const orbitsGroup = new THREE.Group();
    scene.add(orbitsGroup);

    // Define 3 tilted orbital rings
    const orbitConfigs = [
      { rx: 2.1, ry: 1.15, rotX: 68, rotY: 15, rotZ: 25, speed: 0.25 },
      { rx: 2.25, ry: 1.05, rotX: 112, rotY: -20, rotZ: -30, speed: 0.32 },
      { rx: 1.95, ry: 1.3, rotX: 42, rotY: 35, rotZ: 60, speed: 0.22 },
    ];

    interface OrbitTrack {
      curve: THREE.EllipseCurve;
      group: THREE.Group;
      pulseMesh: THREE.Mesh;
      speed: number;
    }

    const orbitTracks: OrbitTrack[] = [];
    const connectionPoints: THREE.Mesh[] = [];

    orbitConfigs.forEach((cfg) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.x = THREE.MathUtils.degToRad(cfg.rotX);
      ringGroup.rotation.y = THREE.MathUtils.degToRad(cfg.rotY);
      ringGroup.rotation.z = THREE.MathUtils.degToRad(cfg.rotZ);

      // Curve
      const curve = new THREE.EllipseCurve(
        0,
        0,
        cfg.rx,
        cfg.ry,
        0,
        2 * Math.PI,
        false,
        0
      );
      const points = curve.getPoints(100);
      const points3D = points.map((p) => new THREE.Vector3(p.x, p.y, 0));

      const ringGeo = new THREE.BufferGeometry().setFromPoints(points3D);
      const ringMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(0x6ee7b7),
        transparent: true,
        opacity: 0.55,
      });
      const lineMesh = new THREE.Line(ringGeo, ringMat);
      ringGroup.add(lineMesh);

      // Traveling light pulse node
      const pulseGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xffffff),
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      ringGroup.add(pulseMesh);

      // Add a couple of stationary sparkling connection nodes on each orbit
      [0.2, 0.55, 0.85].forEach((tVal) => {
        const pt = curve.getPoint(tVal);
        const nodeGeo = new THREE.SphereGeometry(0.035, 12, 12);
        const nodeMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0xfef08a), // warm gold-white node
        });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.set(pt.x, pt.y, 0);
        ringGroup.add(nodeMesh);
        connectionPoints.push(nodeMesh);
      });

      orbitsGroup.add(ringGroup);
      orbitTracks.push({
        curve,
        group: ringGroup,
        pulseMesh,
        speed: cfg.speed,
      });
    });

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe6fffa, 2.0);
    dirLight.position.set(4, 3, 5);
    scene.add(dirLight);

    // Animation state
    const startTime = performance.now();
    const INTRO_DURATION = 4000; // Exact 4-second introductory animation
    let introNotified = false;
    let reqId: number;

    const initialY = THREE.MathUtils.degToRad(-120);
    // 4-second introductory sweep: 1.5 full rotations (approx 3pi radians) with smooth cubic ease-out
    const sweepAngle = Math.PI * 2.2;
    earthMesh.rotation.y = initialY;

    const animate = (now: number) => {
      reqId = requestAnimationFrame(animate);

      const elapsed = now - startTime;

      if (prefersReducedMotion) {
        // Minimal motion for accessibility
        earthMesh.rotation.y = initialY + 0.5;
        renderer.render(scene, camera);
        return;
      }

      if (elapsed <= INTRO_DURATION) {
        // 4-second introductory animation
        const p = elapsed / INTRO_DURATION;
        // Cubic ease-out: 1 - (1 - p)^3
        const ease = 1 - Math.pow(1 - p, 3);
        earthMesh.rotation.y = initialY + sweepAngle * ease;

        // Subtle gentle orbit motion
        orbitsGroup.rotation.y = 0.08 * Math.sin(p * Math.PI);
      } else {
        // Finished 4-second intro: settle into smooth, continuous idle rotation
        if (!introNotified) {
          introNotified = true;
          if (onIntroCompleteRef.current) {
            onIntroCompleteRef.current();
          }
        }
        const idleTime = (elapsed - INTRO_DURATION) / 1000;
        const idleSpeed = 0.22; // rad/sec (~28s per rotation)
        earthMesh.rotation.y = initialY + sweepAngle + idleTime * idleSpeed;

        // Gentle ambient wobble for orbital paths
        orbitsGroup.rotation.y = Math.sin(idleTime * 0.4) * 0.05;
      }

      // Animate traveling pulse lights along the orbits
      const totalSec = elapsed / 1000;
      orbitTracks.forEach((track, i) => {
        const u = (totalSec * track.speed + i * 0.33) % 1.0;
        const pt = track.curve.getPoint(u);
        track.pulseMesh.position.set(pt.x, pt.y, 0);
      });

      // Subtle sparkle pulse on connection nodes
      connectionPoints.forEach((node, idx) => {
        const scale = 1 + 0.35 * Math.sin(totalSec * 4 + idx * 1.5);
        node.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };

    reqId = requestAnimationFrame(animate);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 320;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      outerHaloGeo.dispose();
      outerHaloMat.dispose();
      earthTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
