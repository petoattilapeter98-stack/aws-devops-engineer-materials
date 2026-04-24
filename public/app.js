const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d", { alpha: true });

const state = {
  rain: true,
  fog: true,
  neon: true,
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
window.addEventListener("resize", resize);
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

/** Rain */
function seedRain() {
  state.drops = [];
  const count = Math.floor(Math.min(900, Math.max(220, state.w * 0.45)));
  for (let i = 0; i < count; i++) {
    state.drops.push(makeDrop(true));
  }
}
function makeDrop(randomY = false) {
  const x = Math.random() * state.w;
  const y = randomY ? Math.random() * state.h : -Math.random() * state.h;
  const len = 10 + Math.random() * 18;
  const speed = 8 + Math.random() * 16;
  const thickness = 1 + Math.random() * 1.2;
  const drift = -1.5 + Math.random() * 3;
  const alpha = 0.12 + Math.random() * 0.18;
  return { x, y, len, speed, thickness, drift, alpha };
}
seedRain();
window.addEventListener("resize", seedRain);

/** Fog */
function seedFog() {
  state.fogPuffs = [];
  const count = 18;
  for (let i = 0; i < count; i++) {
    state.fogPuffs.push({
      x: Math.random() * state.w,
      y: state.h * (0.45 + Math.random() * 0.55),
      r: 120 + Math.random() * 220,
      vx: 0.15 + Math.random() * 0.35,
      a: 0.02 + Math.random() * 0.05
    });
  }
}
seedFog();
window.addEventListener("resize", seedFog);

/** UI wiring */
const toggleRain = document.getElementById("toggleRain");
const toggleFog = document.getElementById("toggleFog");
const toggleNeon = document.getElementById("toggleNeon");
const pulseBtn = document.getElementById("pulse");
const timeEl = document.getElementById("time");
const modeEl = document.getElementById("mode");

function setChip(btn, on, label) {
  btn.textContent = `${label}: ${on ? "On" : "Off"}`;
  btn.style.borderColor = on ? "rgba(34,211,238,.35)" : "rgba(255,255,255,.18)";
  btn.style.boxShadow = on ? "0 0 0 1px rgba(34,211,238,.18) inset" : "none";
}

setChip(toggleRain, state.rain, "Rain");
setChip(toggleFog, state.fog, "Fog");
setChip(toggleNeon, state.neon, "Neon");

toggleRain.addEventListener("click", () => {
  state.rain = !state.rain;
  setChip(toggleRain, state.rain, "Rain");
});

toggleFog.addEventListener("click", () => {
  state.fog = !state.fog;
  setChip(toggleFog, state.fog, "Fog");
});

toggleNeon.addEventListener("click", () => {
  state.neon = !state.neon;
  setChip(toggleNeon, state.neon, "Neon");
  document.documentElement.style.setProperty("--neon", state.neon ? "#7c4dff" : "#1b1f4d");
  document.documentElement.style.setProperty("--neon2", state.neon ? "#22d3ee" : "#334155");
  modeEl.textContent = state.neon ? "Night Ops" : "Stealth";
});

pulseBtn.addEventListener("click", () => {
  // quick glow pulse
  const g1 = document.querySelector(".glow-1");
  const g2 = document.querySelector(".glow-2");
  g1.animate([{ opacity: 0.55 }, { opacity: 0.95 }, { opacity: 0.55 }], { duration: 900, easing: "ease-in-out" });
  g2.animate([{ opacity: 0.55 }, { opacity: 0.90 }, { opacity: 0.55 }], { duration: 900, easing: "ease-in-out" });
});

/** Clock */
setInterval(() => {
  const d = new Date();
  timeEl.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}, 500);

/** Render loop */
function drawRain() {
  const wind = state.mx * 2.4;
  ctx.lineCap = "round";

  for (const d of state.drops) {
    d.x += (d.drift + wind) * 0.9;
    d.y += d.speed;

    // slight perspective: thicker near bottom
    const p = d.y / state.h;
    const thick = d.thickness * (0.6 + p * 0.9);

    ctx.strokeStyle = `rgba(220, 235, 255, ${d.alpha})`;
    ctx.lineWidth = thick;

    // slant by wind
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
  // soft fog gradient at bottom + drifting puffs
  const g = ctx.createLinearGradient(0, state.h * 0.55, 0, state.h);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(200,220,255,0.10)");
  ctx.fillStyle = g;
  ctx.fillRect(0, state.h * 0.55, state.w, state.h);

  for (const f of state.fogPuffs) {
    f.x += f.vx * (0.5 + Math.abs(state.mx));
    if (f.x - f.r > state.w) f.x = -f.r;

    const rg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
    rg.addColorStop(0, `rgba(210,230,255,${f.a})`);
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

  // subtle shimmer for “wet lens”
  const shimmer = 0.03 + (Math.sin(state.t * 0.8) * 0.01);
  ctx.fillStyle = `rgba(124,77,255,${shimmer})`;
  ctx.fillRect(0, 0, state.w, state.h);

  if (state.fog) drawFog();
  if (state.rain) drawRain();

  requestAnimationFrame(tick);
}
tick();