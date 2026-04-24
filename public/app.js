const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d", { alpha: true });

const state = {
  rain: true,
  fog: true,
  mx: 0,
  my: 0,
  w: 0,
  h: 0,
  drops: [],
  fogPuffs: [],
  village: { buildings: [] },
  t: 0
};

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  state.w = Math.floor(window.innerWidth);
  state.h = Math.floor(window.innerHeight);

  canvas.width = Math.floor(state.w * dpr);
  canvas.height = Math.floor(state.h * dpr);
  canvas.style.width = state.w + "px";
  canvas.style.height = state.h + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", () => {
  resize();
  seedRain();
  seedFog();
  seedVillage();
});

resize();

/** Parallax */
const layers = [...document.querySelectorAll(".layer")];
window.addEventListener("pointermove", (e) => {
  const x = (e.clientX / state.w) * 2 - 1;
  const y = (e.clientY / state.h) * 2 - 1;
  state.mx = x;
  state.my = y;

  for (const layer of layers) {
    const depth = parseFloat(layer.dataset.depth || "0");
    const tx = (-x * 18 * depth);
    const ty = (-y * 14 * depth);
    layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
  }
});

/** UI */
const toggleRain = document.getElementById("toggleRain");
const toggleFog = document.getElementById("toggleFog");

function setChip(btn, on, label) {
  btn.textContent = `${label}: ${on ? "On" : "Off"}`;
  btn.style.borderColor = on ? "rgba(34,211,238,.35)" : "rgba(255,255,255,.18)";
  btn.style.boxShadow = on ? "0 0 0 1px rgba(34,211,238,.18) inset" : "none";
}

toggleRain.addEventListener("click", () => {
  state.rain = !state.rain;
  setChip(toggleRain, state.rain, "Rain");
});

toggleFog.addEventListener("click", () => {
  state.fog = !state.fog;
  setChip(toggleFog, state.fog, "Fog");
});

setChip(toggleRain, state.rain, "Rain");
setChip(toggleFog, state.fog, "Fog");

/** Rain */
function seedRain() {
  state.drops = [];
  const density = 0.50;
  const count = Math.floor(Math.min(900, Math.max(160, state.w * density)));
  for (let i = 0; i < count; i++) state.drops.push(makeDrop(true));
}

function makeDrop(randomY = false) {
  const x = Math.random() * state.w;
  const y = randomY ? Math.random() * state.h : -Math.random() * state.h;
  const len = 10 + Math.random() * 18;
  const speed = 8 + Math.random() * 16;
  const thickness = 1 + Math.random() * 1.2;
  const drift = -1.5 + Math.random() * 3;
  const alphaBase = 0.12 + Math.random() * 0.18;
  return { x, y, len, speed, thickness, drift, alphaBase };
}

seedRain();

/** Fog */
function seedFog() {
  state.fogPuffs = [];
  const count = 18;
  for (let i = 0; i < count; i++) {
    state.fogPuffs.push({
      x: Math.random() * state.w,
      y: state.h * (0.50 + Math.random() * 0.50),
      r: 120 + Math.random() * 220,
      vx: 0.14 + Math.random() * 0.32,
      a: 0.020 + Math.random() * 0.045
    });
  }
}

seedFog();

function seedVillage() {
  state.village.buildings = [
    // Back layer depth 0.10
    {x: 0.05, y: 0.78, w: 0.03, h: 0.22, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.82}]},
    {x: 0.12, y: 0.77, w: 0.04, h: 0.23, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.81}]},
    {x: 0.20, y: 0.76, w: 0.03, h: 0.24, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.80}]},
    {x: 0.28, y: 0.78, w: 0.04, h: 0.22, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.82}]},
    {x: 0.36, y: 0.75, w: 0.03, h: 0.25, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.79}]},
    {x: 0.44, y: 0.77, w: 0.04, h: 0.23, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.81}]},
    {x: 0.52, y: 0.78, w: 0.03, h: 0.22, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.82}]},
    {x: 0.60, y: 0.76, w: 0.04, h: 0.24, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.80}]},
    {x: 0.68, y: 0.77, w: 0.03, h: 0.23, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.81}]},
    {x: 0.76, y: 0.78, w: 0.04, h: 0.22, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.82}]},
    {x: 0.84, y: 0.76, w: 0.03, h: 0.24, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.80}]},
    {x: 0.92, y: 0.77, w: 0.04, h: 0.23, depth: 0.10, color: 'rgba(124,77,255,0.5)', windows: [{x:0.5, y:0.81}]},

    // Mid layer depth 0.14
    {x: 0.03, y: 0.79, w: 0.04, h: 0.21, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.83}]},
    {x: 0.10, y: 0.78, w: 0.05, h: 0.22, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.82}]},
    {x: 0.18, y: 0.77, w: 0.04, h: 0.23, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.81}]},
    {x: 0.26, y: 0.79, w: 0.05, h: 0.21, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.83}]},
    {x: 0.34, y: 0.75, w: 0.04, h: 0.25, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.79}]},
    {x: 0.42, y: 0.77, w: 0.05, h: 0.23, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.81}]},
    {x: 0.50, y: 0.78, w: 0.04, h: 0.22, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.82}]},
    {x: 0.58, y: 0.76, w: 0.05, h: 0.24, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.80}]},
    {x: 0.66, y: 0.77, w: 0.04, h: 0.23, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.81}]},
    {x: 0.74, y: 0.79, w: 0.05, h: 0.21, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.83}]},
    {x: 0.82, y: 0.78, w: 0.04, h: 0.22, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.82}]},
    {x: 0.90, y: 0.77, w: 0.05, h: 0.23, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.81}]},
    {x: 0.97, y: 0.78, w: 0.03, h: 0.22, depth: 0.14, color: 'rgba(124,77,255,0.4)', windows: [{x:0.5, y:0.82}]},

    // Front layer depth 0.18
    {x: 0.10, y: 0.85, w: 0.10, h: 0.15, depth: 0.18, color: 'rgba(34,211,238,0.6)', windows: [{x:0.2, y:0.87}, {x:0.5, y:0.87}, {x:0.8, y:0.87}]},
    {x: 0.25, y: 0.83, w: 0.10, h: 0.17, depth: 0.18, color: 'rgba(34,211,238,0.6)', windows: [{x:0.3, y:0.85}, {x:0.7, y:0.85}]},
    {x: 0.40, y: 0.86, w: 0.08, h: 0.14, depth: 0.18, color: 'rgba(34,211,238,0.6)', windows: [{x:0.5, y:0.88}]},
    {x: 0.53, y: 0.84, w: 0.12, h: 0.16, depth: 0.18, color: 'rgba(34,211,238,0.6)', windows: [{x:0.2, y:0.86}, {x:0.5, y:0.86}, {x:0.8, y:0.86}]},
    {x: 0.70, y: 0.81, w: 0.10, h: 0.19, depth: 0.18, color: 'rgba(34,211,238,0.6)', windows: [{x:0.3, y:0.83}, {x:0.7, y:0.83}]},
    {x: 0.85, y: 0.84, w: 0.08, h: 0.16, depth: 0.18, color: 'rgba(34,211,238,0.6)', windows: [{x:0.5, y:0.86}]},

    // Forefront layer depth 0.22
    {x: 0.15, y: 0.80, w: 0.10, h: 0.20, depth: 0.22, color: 'rgba(34,211,238,0.7)', windows: [{x:0.5, y:0.82}]},
    {x: 0.30, y: 0.81, w: 0.08, h: 0.19, depth: 0.22, color: 'rgba(34,211,238,0.7)', windows: [{x:0.5, y:0.83}]},
    {x: 0.43, y: 0.78, w: 0.12, h: 0.22, depth: 0.22, color: 'rgba(34,211,238,0.7)', windows: [{x:0.3, y:0.80}, {x:0.7, y:0.80}]},
    {x: 0.60, y: 0.80, w: 0.10, h: 0.20, depth: 0.22, color: 'rgba(34,211,238,0.7)', windows: [{x:0.5, y:0.82}]},
    {x: 0.75, y: 0.77, w: 0.08, h: 0.23, depth: 0.22, color: 'rgba(34,211,238,0.7)', windows: [{x:0.5, y:0.79}]},
    {x: 0.88, y: 0.79, w: 0.08, h: 0.21, depth: 0.22, color: 'rgba(34,211,238,0.7)', windows: [{x:0.5, y:0.81}]},
  ];

  // Sort by depth descending (back first)
  state.village.buildings.sort((a, b) => b.depth - a.depth);
}

seedVillage();

function drawRain() {
  const wind = state.mx * 2.4;
  ctx.lineCap = "round";

  const base = [220, 235, 255];
  const alphaMul = 1.0;

  for (const d of state.drops) {
    d.x += (d.drift + wind) * 0.9;
    d.y += d.speed;

    const p = d.y / state.h;
    const thick = d.thickness * (0.6 + p * 0.9);

    const a = d.alphaBase * alphaMul;
    ctx.strokeStyle = `rgba(${base[0]}, ${base[1]}, ${base[2]}, ${a})`;
    ctx.lineWidth = thick;

    const sx = d.x;
    const sy = d.y;
    const ex = d.x + wind * 1.5;
    const ey = d.y + d.len;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    if (d.y > state.h + 40 || d.x < -80 || d.x > state.w + 80) {
      Object.assign(d, makeDrop(false));
      d.y = -Math.random() * 200;
    }
  }
}

function drawFog() {
  const g = ctx.createLinearGradient(0, state.h * 0.55, 0, state.h);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(200,220,255,0.10)");

  ctx.fillStyle = g;
  ctx.fillRect(0, state.h * 0.55, state.w, state.h);

  for (const f of state.fogPuffs) {
    f.x += f.vx * (0.5 + Math.abs(state.mx));
    if (f.x - f.r > state.w) f.x = -f.r;

    const rg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
    const alpha = state.night ? f.a : f.a * 1.2;
    rg.addColorStop(0, `rgba(210,230,255,${alpha})`);
    rg.addColorStop(1, "rgba(210,230,255,0)");

    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVillage() {
  for (const b of state.village.buildings) {
    const tx = -state.mx * 18 * b.depth;
    const ty = -state.my * 14 * b.depth;
    const bx = b.x * state.w + tx;
    const by = b.y * state.h + ty;
    const bw = b.w * state.w;
    const bh = b.h * state.h;

    // Draw building silhouette
    ctx.fillStyle = b.color;
    ctx.fillRect(bx, by, bw, bh);

    // Draw windows
    for (const w of b.windows) {
      const wx = bx + w.x * bw - 6;
      const wy = by + w.y * state.h - 6;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(wx, wy, 12, 12);
    }
  }
}

function tick() {
  state.t += 0.016;
  ctx.clearRect(0, 0, state.w, state.h);

  const shimmer = (0.028 + (Math.sin(state.t * 0.8) * 0.010));

  ctx.fillStyle = `rgba(124,77,255,${shimmer})`;

  ctx.fillRect(0, 0, state.w, state.h);

  drawVillage();

  if (state.fog) drawFog();
  if (state.rain) drawRain();

  requestAnimationFrame(tick);
}

tick();