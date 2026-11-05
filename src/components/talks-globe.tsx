"use client";

// Dotted three.js globe for the talks section. It turns to face `stops[active]`,
// draws an arc from `home` to it, and pulses a ring on the active city.
// Colors come from CSS variables, so it follows the light/dark theme.

import points from "@/data/globe-points.json";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type LatLon = { lat: number; lon: number };

const DEG = Math.PI / 180;
const R = 1;

function toVec(lat: number, lon: number, r = R) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

// Globe rotation (Y then X) that brings lat/lon to face the camera, tilted a bit.
function facing(lat: number, lon: number) {
  const p = toVec(lat, lon);
  return { y: Math.atan2(-p.x, p.z), x: lat * DEG * 0.75 };
}

function arcCurve(a: LatLon, b: LatLon) {
  const va = toVec(a.lat, a.lon).normalize();
  const vb = toVec(b.lat, b.lon).normalize();
  const angle = va.angleTo(vb);
  const lift = 0.05 + Math.min(angle, 1.6) * 0.1; // keep long routes inside the frame
  const pts: THREE.Vector3[] = [];
  const q = new THREE.Quaternion();
  const full = new THREE.Quaternion().setFromUnitVectors(va, vb);
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    q.identity().slerp(full, t);
    pts.push(va.clone().applyQuaternion(q).multiplyScalar(R + Math.sin(Math.PI * t) * lift));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function cssColor(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}

export default function TalksGlobe({ home, stops, active }: { home: LatLon; stops: LatLon[]; active: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      el.dataset.nowebgl = "1"; // CSS shows a plain fallback
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 4.9);

    const globe = new THREE.Group();
    globe.rotation.order = "XYZ";
    scene.add(globe);

    // Solid inner sphere hides the dots on the far side.
    const occluderMat = new THREE.MeshBasicMaterial();
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 64, 48), occluderMat));

    // Land dots.
    const raw = points as number[];
    const pos = new Float32Array((raw.length / 2) * 3);
    for (let i = 0; i < raw.length; i += 2) toVec(raw[i], raw[i + 1], R * 1.002).toArray(pos, (i / 2) * 3);
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const disc = document.createElement("canvas");
    disc.width = disc.height = 64;
    const c2 = disc.getContext("2d")!;
    c2.beginPath();
    c2.arc(32, 32, 28, 0, Math.PI * 2);
    c2.fillStyle = "#fff";
    c2.fill();
    const dotMat = new THREE.PointsMaterial({
      size: 2.6 * dpr,
      sizeAttenuation: false,
      map: new THREE.CanvasTexture(disc),
      transparent: true,
      alphaTest: 0.4,
    });
    globe.add(new THREE.Points(dotGeo, dotMat));

    // City markers.
    const markerMat = new THREE.MeshBasicMaterial();
    const activeMat = new THREE.MeshBasicMaterial();
    const markerGeo = new THREE.SphereGeometry(0.022, 16, 12);
    const markers = stops.map((s) => {
      const m = new THREE.Mesh(markerGeo, markerMat);
      m.position.copy(toVec(s.lat, s.lon, R * 1.01));
      globe.add(m);
      return m;
    });

    // Home: a small hollow ring.
    const homeMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const homeRing = new THREE.Mesh(new THREE.RingGeometry(0.022, 0.034, 32), homeMat);
    homeRing.position.copy(toVec(home.lat, home.lon, R * 1.012));
    homeRing.lookAt(homeRing.position.clone().multiplyScalar(2));
    globe.add(homeRing);

    // Pulse ring on the active city.
    const pulseMat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false });
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.042, 48), pulseMat);
    globe.add(pulse);

    // Arc home → active city, drawn progressively.
    const arcMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 });
    let arc: THREE.Mesh | null = null;
    let arcFor = -1;
    let arcStart = 0;

    const applyTheme = () => {
      const bg = cssColor("--bg", "#e5e6ea");
      occluderMat.color.copy(bg);
      dotMat.color.copy(cssColor("--faint", "#93959d"));
      markerMat.color.copy(cssColor("--muted", "#63656c"));
      homeMat.color.copy(cssColor("--text", "#1b1c1f"));
      const accent = cssColor("--accent", "#d2500a");
      activeMat.color.copy(accent);
      pulseMat.color.copy(accent);
      arcMat.color.copy(accent);
    };
    applyTheme();
    const themeObs = new MutationObserver(applyTheme);
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Keep the whole globe in view on narrow, tall boxes.
      camera.position.z = w / h < 0.9 ? 4.9 / (w / h / 0.9) : 4.9;
      camera.updateProjectionMatrix();
      // Smaller globes get smaller dots so the continents stay readable.
      dotMat.size = Math.max(1.5, Math.min(2.6, Math.min(w, h) / 170)) * dpr;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const start = facing(stops[activeRef.current]?.lat ?? home.lat, stops[activeRef.current]?.lon ?? home.lon);
    globe.rotation.set(start.x, start.y, 0);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const i = activeRef.current;
      const stop = stops[i];
      if (stop) {
        // Ease the globe toward the active city along the shortest path.
        const target = facing(stop.lat, stop.lon);
        let dy = target.y - globe.rotation.y;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        const k = reduced ? 1 : 0.06;
        globe.rotation.y += dy * k;
        globe.rotation.x += (target.x - globe.rotation.x) * k;

        markers.forEach((m, j) => {
          m.material = j === i ? activeMat : markerMat;
          const s = j === i ? 1.5 : 1;
          m.scale.lerp(new THREE.Vector3(s, s, s), 0.2);
        });

        if (arcFor !== i) {
          if (arc) {
            globe.remove(arc);
            arc.geometry.dispose();
          }
          arc = new THREE.Mesh(new THREE.TubeGeometry(arcCurve(home, stop), 96, 0.0055, 6), arcMat);
          globe.add(arc);
          arcFor = i;
          arcStart = t;
          pulse.position.copy(toVec(stop.lat, stop.lon, R * 1.012));
          pulse.lookAt(pulse.position.clone().multiplyScalar(2));
        }
        if (arc) {
          const p = reduced ? 1 : Math.min(1, (t - arcStart) / 1.1);
          const eased = 1 - Math.pow(1 - p, 3);
          const count = arc.geometry.index!.count;
          arc.geometry.setDrawRange(0, Math.floor((count * eased) / 36) * 36);
        }
        const ph = reduced ? 0.5 : (t * 0.8) % 1;
        const ps = 1 + ph * 2.2;
        pulse.scale.set(ps, ps, ps);
        pulseMat.opacity = 0.85 * (1 - ph);
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
      });
      [occluderMat, dotMat, markerMat, activeMat, homeMat, pulseMat, arcMat].forEach((m) => m.dispose());
      dotMat.map?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // Stops/home are static data; the active index is read from a ref each frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mount} className="pf-globe" aria-hidden="true" />;
}
