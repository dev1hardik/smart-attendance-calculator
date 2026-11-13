import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function StillfloraCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 18);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // Lighting (Warm blush + cool celestial blue)
    const ambientLight = new THREE.AmbientLight(0xdde8f2, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfce8e3, 2.2);
    dirLight1.position.set(8, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5c4db, 1.8);
    dirLight2.position.set(-8, -6, 5);
    scene.add(dirLight2);

    // Interactive mouse cursor light
    const mouseLight = new THREE.PointLight(0xffeedd, 2.0, 20);
    scene.add(mouseLight);

    // Central Refractive Glass Torus/Vessel Sculpture
    const glassGeo = new THREE.TorusKnotGeometry(2.4, 0.55, 128, 32, 2, 3);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.12,
      ior: 1.5,
      thickness: 1.8,
      specularIntensity: 1.0,
      specularColor: 0xf5ded9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const glassSculpture = new THREE.Mesh(glassGeo, glassMat);
    glassSculpture.position.set(4.5, 1.5, -2);
    scene.add(glassSculpture);

    // Floating Petals
    const petalCount = 45;
    const petalGeo = new THREE.ConeGeometry(0.35, 0.9, 5);
    petalGeo.scale(1, 0.2, 1.4); // flatten into organic petal profile

    const petalColors = [0xf7d5cd, 0xfce8e4, 0xd8e6f1, 0xe4eff7, 0xf2ded9];
    const petals = [];

    for (let i = 0; i < petalCount; i++) {
      const color = petalColors[i % petalColors.length];
      const petalMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.05,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });

      const mesh = new THREE.Mesh(petalGeo, petalMat);
      mesh.position.set(
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scale = 0.5 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      petals.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.015,
        vy: -0.008 - Math.random() * 0.012,
        vx: (Math.random() - 0.5) * 0.006,
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayOffset: Math.random() * Math.PI * 2,
      });
      scene.add(mesh);
    }

    // Dew / Pollen Sparkling Particles
    const pollenCount = 120;
    const pollenGeo = new THREE.BufferGeometry();
    const pollenPositions = new Float32Array(pollenCount * 3);

    for (let i = 0; i < pollenCount * 3; i += 3) {
      pollenPositions[i] = (Math.random() - 0.5) * 28;
      pollenPositions[i + 1] = (Math.random() - 0.5) * 22;
      pollenPositions[i + 2] = (Math.random() - 0.5) * 14;
    }

    pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPositions, 3));
    const pollenMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const pollen = new THREE.Points(pollenGeo, pollenMat);
    scene.add(pollen);

    // Mouse movement interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse easing
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      mouseLight.position.set(currentMouseX * 10, currentMouseY * 8, 4);

      // Rotate central glass sculpture with breath-like float
      if (glassSculpture) {
        glassSculpture.rotation.x = elapsedTime * 0.18 + currentMouseY * 0.3;
        glassSculpture.rotation.y = elapsedTime * 0.22 + currentMouseX * 0.4;
        glassSculpture.position.y = 1.2 + Math.sin(elapsedTime * 0.7) * 0.4;
      }

      // Drift Petals
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
        p.mesh.rotation.z += p.rotSpeedZ;

        p.mesh.position.y += p.vy;
        p.mesh.position.x += p.vx + Math.sin(elapsedTime * p.swaySpeed + p.swayOffset) * 0.005;

        // Wrap around top if fallen off screen
        if (p.mesh.position.y < -11) {
          p.mesh.position.y = 11;
          p.mesh.position.x = (Math.random() - 0.5) * 26;
        }
      }

      // Gentle pollen float
      pollen.rotation.y = elapsedTime * 0.02;

      // Gentle camera parallax
      camera.position.x = currentMouseX * 1.2;
      camera.position.y = currentMouseY * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  );
}
