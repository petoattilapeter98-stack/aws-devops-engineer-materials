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

function tick() {
  state.t += 0.016;
  ctx.clearRect(0, 0, state.w, state.h);

  const shimmer = (0.028 + (Math.sin(state.t * 0.8) * 0.010));

  ctx.fillStyle = `rgba(124,77,255,${shimmer})`;

  ctx.fillRect(0, 0, state.w, state.h);

  if (state.fog) drawFog();
  if (state.rain) drawRain();

  requestAnimationFrame(tick);
}

tick();