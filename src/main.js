import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ═══════════════════════════════════════════════════════════════
// INTRO SCREEN
// ═══════════════════════════════════════════════════════════════
const introScreen = document.getElementById("intro-screen");
const hintEl = document.getElementById("hint");

document.getElementById("start-btn").addEventListener("click", () => {
  introScreen.classList.add("hidden");
  introScreen.style.pointerEvents = "none";

  // Show the hint after a short delay
  setTimeout(() => {
    hintEl.classList.add("hint-visible");
    // Fade hint out after a few seconds
    setTimeout(() => hintEl.classList.remove("hint-visible"), 6000);
  }, 1500);
});

// ═══════════════════════════════════════════════════════════════
// 1. SCENE + CAMERA + RENDERER
// ═══════════════════════════════════════════════════════════════
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020311);
scene.fog = new THREE.FogExp2(0x020311, 0.012);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ═══════════════════════════════════════════════════════════════
// 2. ORBIT CONTROLS
// ═══════════════════════════════════════════════════════════════
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 40;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.15;
controls.zoomSpeed = 0.5;

// ═══════════════════════════════════════════════════════════════
// 3. TEXTURES (procedural)
// ═══════════════════════════════════════════════════════════════

// Achievement star: warm gold with a cross-flare
function createAchievementTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const cx = size / 2;

  // Outer glow
  const g1 = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  g1.addColorStop(0, "rgba(255, 240, 180, 1)");
  g1.addColorStop(0.08, "rgba(255, 220, 140, 0.95)");
  g1.addColorStop(0.25, "rgba(232, 196, 124, 0.5)");
  g1.addColorStop(0.6, "rgba(232, 180, 100, 0.12)");
  g1.addColorStop(1, "rgba(232, 180, 100, 0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, size, size);

  // Cross-flare (horizontal + vertical streaks)
  ctx.globalCompositeOperation = "screen";
  for (const angle of [0, Math.PI / 2]) {
    ctx.save();
    ctx.translate(cx, cx);
    ctx.rotate(angle);
    const g2 = ctx.createLinearGradient(-cx, 0, cx, 0);
    g2.addColorStop(0, "rgba(255,240,200,0)");
    g2.addColorStop(0.35, "rgba(255,240,200,0)");
    g2.addColorStop(0.48, "rgba(255,245,220,0.25)");
    g2.addColorStop(0.5, "rgba(255,250,230,0.6)");
    g2.addColorStop(0.52, "rgba(255,245,220,0.25)");
    g2.addColorStop(0.65, "rgba(255,240,200,0)");
    g2.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(-cx, -3, size, 6);
    ctx.restore();
  }

  // Diagonal flares (smaller)
  for (const angle of [Math.PI / 4, -Math.PI / 4]) {
    ctx.save();
    ctx.translate(cx, cx);
    ctx.rotate(angle);
    const g3 = ctx.createLinearGradient(-cx, 0, cx, 0);
    g3.addColorStop(0, "rgba(255,240,200,0)");
    g3.addColorStop(0.4, "rgba(255,240,200,0)");
    g3.addColorStop(0.49, "rgba(255,245,220,0.1)");
    g3.addColorStop(0.5, "rgba(255,250,230,0.25)");
    g3.addColorStop(0.51, "rgba(255,245,220,0.1)");
    g3.addColorStop(0.6, "rgba(255,240,200,0)");
    g3.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = g3;
    ctx.fillRect(-cx, -2, size, 4);
    ctx.restore();
  }

  return new THREE.CanvasTexture(c);
}

// Background star: cool-tinted soft dot
function createBgStarTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const cx = size / 2;
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  g.addColorStop(0, "rgba(210, 220, 255, 1)");
  g.addColorStop(0.25, "rgba(180, 195, 255, 0.6)");
  g.addColorStop(1, "rgba(180, 195, 255, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cx, cx, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(c);
}

// Nebula cloud texture
function createNebulaTexture(r, g, b) {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const cx = size / 2;
  const grad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.12)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.05)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

const achieveTex = createAchievementTexture();
const bgStarTex = createBgStarTexture();

// ═══════════════════════════════════════════════════════════════
// 4. ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════
const achievements = [
  {
    x: 3, y: 2, z: -4,
    title: "First First-Author Publication",
    description: "PIADS!!!! Your research made it into the world. The first of many btw"
  },
  {
    x: -4, y: -1.5, z: -5,
    title: "Passed Your Prelims",
    description: "A milestone that proves you belong here. You will crush it."
  },
  {
    x: 0.5, y: -3, z: -7,
    title: "Accepted into a Bioengineering PhD",
    description: "The next chapter begins. The world isn't ready for Dr. Rutuja."
  },
  {
    x: -2, y: 3.5, z: -6,
    title: "Completed Your First Grad Semester",
    description: "7 classes? That's light for Rutuja."
  },
  {
    x: 6, y: 0.5, z: -6,
    title: "Conducted cell research at local university",
    description: "During high school wtfffff!"
  },
  {
    x: -6, y: 2, z: -8,
    title: "Did a semester on the other side of the world in Australia",
    description: "And you thrived like the queen you are"
  },
  {
    x: 4, y: -4, z: -5,
    title: "Won best dancer TWICE in a single ddn season",
    description: "People still talk about it today"
  },
  {
    x: -3, y: -4, z: -9,
    title: "Developed a transdermal drug patch",
    description: "The first of many great Rutuja creations"
  },
  {
    x: 7, y: 3.5, z: -10,
    title: "First provisional Patent application for non-invasive lung diagnostic device",
    description: "Truly an inventive engineer"
  },
  {
    x: -5, y: -1, z: -12,
    title: "Completed your PhD defense and become a doctor!!!",
    description: "Dr. Rutuja Kulkarni"
  },
  {
    x: 2, y: 5, z: -8,
    title: "Presented a poster at RESNA in Chicago",
    description: "One of the biggest conferences? No problem for Rutuja"
  },
  {
    x: -7, y: -3, z: -7,
    title: "Got accepted into UMich industrial engineering PhD program",
    description: "You might not have ended up going but it still shows how smart you are"
  },
  {
    x: 5, y: -2, z: -11,
    title: "First day lecturing a class",
    description: "I know you're going to become a great professor"
  },
  {
    x: -4, y: 5, z: -10,
    title: "Officially become a professor",
    description: "Your rate my professor will be a 5/5"
  },
  {
    x: 8, y: 1, z: -8,
    title: "First paper where you are a supervising author",
    description: "Would rather have no one else as my PI personally (the Rutuja lab)"
  },
  {
    x: 6, y: 7, z: -1,
    title: "Graduated from Pitt in bioengineering!",
    description: "Your degree actually has your major on it"
  },
];

// ═══════════════════════════════════════════════════════════════
// 5. ACHIEVEMENT STARS (interactive)
// ═══════════════════════════════════════════════════════════════
const achieveStars = [];
const achieveBaseScale = 0.9;

achievements.forEach((a) => {
  const mat = new THREE.SpriteMaterial({
    map: achieveTex,
    color: 0xffe8b0,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(achieveBaseScale, achieveBaseScale, 1);
  sprite.position.set(a.x, a.y, a.z);
  sprite.userData = a;

  scene.add(sprite);
  achieveStars.push(sprite);
});

// ═══════════════════════════════════════════════════════════════
// 6. CONSTELLATION LINES
// ═══════════════════════════════════════════════════════════════
const linePoints = achievements.map(a => new THREE.Vector3(a.x, a.y, a.z));
const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
const lineMat = new THREE.LineBasicMaterial({
  color: 0xe8c47c,
  transparent: true,
  opacity: 0.12,
  linewidth: 1,
});
const constellationLine = new THREE.Line(lineGeo, lineMat);
scene.add(constellationLine);

// Tiny dots at each constellation vertex
achievements.forEach((a) => {
  const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0xe8c47c,
    transparent: true,
    opacity: 0.35,
  });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.set(a.x, a.y, a.z);
  scene.add(dot);
});

// ═══════════════════════════════════════════════════════════════
// 7. BACKGROUND STARS
// ═══════════════════════════════════════════════════════════════
const bgStarData = [];

function addBackgroundStars(count = 900) {
  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({
      map: bgStarTex,
      transparent: true,
      opacity: Math.random() * 0.4 + 0.15,
      depthWrite: false,
    });

    // Vary colour temperature slightly
    const temp = Math.random();
    if (temp > 0.85) mat.color = new THREE.Color(0xffeedd); // warm
    else if (temp > 0.7) mat.color = new THREE.Color(0xccddff); // cool blue
    else mat.color = new THREE.Color(0xdde4ff); // default blue-white

    const star = new THREE.Sprite(mat);
    const s = Math.random() * 0.12 + 0.04;
    star.scale.set(s, s, 1);

    const x = THREE.MathUtils.randFloatSpread(120);
    const y = THREE.MathUtils.randFloatSpread(120);
    const z = THREE.MathUtils.randFloatSpread(120);
    star.position.set(x, y, z);

    scene.add(star);
    bgStarData.push({
      sprite: star,
      baseOpacity: mat.opacity,
      speed: Math.random() * 0.003 + 0.0008,
      offset: Math.random() * 6000,
    });
  }
}
addBackgroundStars();

// ═══════════════════════════════════════════════════════════════
// 8. NEBULA CLOUDS (atmosphere)
// ═══════════════════════════════════════════════════════════════
const nebulae = [
  { x: 8, y: -4, z: -20, r: 60, g: 40, b: 120, size: 18 },
  { x: -12, y: 6, z: -25, r: 30, g: 50, b: 100, size: 22 },
  { x: 3, y: 10, z: -30, r: 100, g: 50, b: 70, size: 16 },
  { x: -6, y: -8, z: -18, r: 40, g: 70, b: 110, size: 14 },
];

nebulae.forEach((n) => {
  const tex = createNebulaTexture(n.r, n.g, n.b);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(n.size, n.size, 1);
  sprite.position.set(n.x, n.y, n.z);
  scene.add(sprite);
});

// ═══════════════════════════════════════════════════════════════
// 9. AMBIENT DRIFTING PARTICLES
// ═══════════════════════════════════════════════════════════════
const particleCount = 120;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleVelocities = [];

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3]     = THREE.MathUtils.randFloatSpread(40);
  particlePositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(40);
  particlePositions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(40);
  particleVelocities.push({
    x: (Math.random() - 0.5) * 0.003,
    y: (Math.random() - 0.5) * 0.003,
    z: (Math.random() - 0.5) * 0.003,
  });
}
particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.06,
  color: 0xe8c47c,
  transparent: true,
  opacity: 0.25,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ═══════════════════════════════════════════════════════════════
// 10. RAYCASTING (hover + click)
// ═══════════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredStar = null;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(achieveStars, true);

  if (hits.length > 0) {
    const star = hits[0].object;
    document.body.style.cursor = "pointer";
    if (hoveredStar !== star) {
      if (hoveredStar) resetStarScale(hoveredStar);
      hoveredStar = star;
    }
  } else {
    document.body.style.cursor = "crosshair";
    if (hoveredStar) {
      resetStarScale(hoveredStar);
      hoveredStar = null;
    }
  }
}

function resetStarScale(star) {
  star.scale.set(achieveBaseScale, achieveBaseScale, 1);
}

window.addEventListener("pointermove", onPointerMove);

// Click — use pointerdown/pointerup to avoid OrbitControls eating clicks
const panel = document.getElementById("info-overlay");
const infoTitle = document.getElementById("info-title");
const infoDesc = document.getElementById("info-desc");
const infoClose = document.getElementById("info-close");

const pointerDown = new THREE.Vector2();
const pointerUp = new THREE.Vector2();
const CLICK_THRESHOLD = 5; // pixels — anything less counts as a click, not a drag

function showInfo(data) {
  infoTitle.textContent = data.title;
  infoDesc.textContent = data.description || "";
  panel.classList.remove("hidden");
  // force reflow so the transition fires
  void panel.offsetWidth;
  panel.classList.add("visible");
}

function hideInfo() {
  panel.classList.remove("visible");
  // Wait for fade-out transition to finish, then fully hide
  setTimeout(() => {
    if (!panel.classList.contains("visible")) {
      panel.classList.add("hidden");
    }
  }, 500);
}

infoClose.addEventListener("pointerup", (e) => {
  e.stopPropagation();
  hideInfo();
});

window.addEventListener("pointerdown", (event) => {
  pointerDown.set(event.clientX, event.clientY);
});

window.addEventListener("pointerup", (event) => {
  pointerUp.set(event.clientX, event.clientY);

  // If pointer moved too far, it was a drag — not a click
  if (pointerDown.distanceTo(pointerUp) > CLICK_THRESHOLD) return;

  // Ignore if clicking on panel or its children
  if (panel.contains(event.target)) return;

  // Use the already-detected hoveredStar from pointermove (which works)
  // instead of re-raycasting (which conflicts with OrbitControls)
  if (hoveredStar) {
    showInfo(hoveredStar.userData);
  } else {
    hideInfo();
  }
});

// ═══════════════════════════════════════════════════════════════
// 11. ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════
function animate(time) {
  requestAnimationFrame(animate);
  controls.update();

  // --- Achievement star breathing pulse ---
  achieveStars.forEach((star, i) => {
    const breath = Math.sin(time * 0.0015 + i * 1.8) * 0.15;
    const scale = achieveBaseScale + breath;

    // Enlarge further on hover
    if (star === hoveredStar) {
      star.scale.set(scale + 0.35, scale + 0.35, 1);
    } else {
      star.scale.set(scale, scale, 1);
    }

    // Soft opacity pulse
    star.material.opacity = 0.75 + Math.sin(time * 0.002 + i * 2.5) * 0.25;
  });

  // --- Background star twinkle ---
  bgStarData.forEach((d) => {
    const t = Math.sin(time * d.speed + d.offset);
    d.sprite.material.opacity = d.baseOpacity + t * 0.15;
  });

  // --- Constellation line subtle pulse ---
  lineMat.opacity = 0.08 + Math.sin(time * 0.001) * 0.04;

  // --- Ambient particles drift ---
  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    pos[i * 3]     += particleVelocities[i].x;
    pos[i * 3 + 1] += particleVelocities[i].y;
    pos[i * 3 + 2] += particleVelocities[i].z;

    // Wrap around
    for (let axis = 0; axis < 3; axis++) {
      if (pos[i * 3 + axis] > 20) pos[i * 3 + axis] = -20;
      if (pos[i * 3 + axis] < -20) pos[i * 3 + axis] = 20;
    }
  }
  particleGeo.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}

animate(0);

// ═══════════════════════════════════════════════════════════════
// RESIZE
// ═══════════════════════════════════════════════════════════════
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
