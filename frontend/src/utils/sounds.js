let audioCtx = null;
let enabled = null;

const soundEnabled = () => {
  if (enabled === null) {
    try {
      enabled = window.localStorage.getItem("rajsekhar-sound") !== "off";
    } catch {
      enabled = true;
    }
  }
  return enabled;
};

export const setSoundEnabled = (value) => {
  enabled = value;
  try {
    window.localStorage.setItem("rajsekhar-sound", value ? "on" : "off");
  } catch {
    /* storage unavailable — sound preference just won't persist */
  }
};

export const isSoundEnabled = () => soundEnabled();

const getCtx = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

const clink = (at, base, gain) => {
  const ctx = getCtx();
  const t = ctx.currentTime + at;

  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(base, t);
  body.frequency.exponentialRampToValueAtTime(base * 0.55, t + 0.1);
  bodyGain.gain.setValueAtTime(0.0001, t);
  bodyGain.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  body.connect(bodyGain).connect(ctx.destination);
  body.start(t);
  body.stop(t + 0.18);

  const tick = ctx.createOscillator();
  const tickGain = ctx.createGain();
  tick.type = "triangle";
  tick.frequency.setValueAtTime(base * 1.6, t);
  tickGain.gain.setValueAtTime(0.0001, t);
  tickGain.gain.exponentialRampToValueAtTime(gain * 0.5, t + 0.003);
  tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  tick.connect(tickGain).connect(ctx.destination);
  tick.start(t);
  tick.stop(t + 0.06);
};

export const playChipClinks = (count = 3) => {
  if (!soundEnabled()) return;
  for (let i = 0; i < count; i++) {
    clink(i * 0.07, 2100 + Math.random() * 500, 0.16);
  }
};

export const playFoldClink = () => {
  if (!soundEnabled()) return;
  clink(0, 1500, 0.14);
};

const shuffle = (gain) => {
  const ctx = getCtx();
  const dur = 0.5;
  const buffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * dur),
    ctx.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.4;
  const t = ctx.currentTime;
  band.frequency.setValueAtTime(700, t);
  band.frequency.exponentialRampToValueAtTime(2600, t + 0.24);
  band.frequency.exponentialRampToValueAtTime(900, t + dur);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t);
  noiseGain.gain.exponentialRampToValueAtTime(gain, t + 0.06);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  noise.connect(band).connect(noiseGain).connect(ctx.destination);
  noise.start(t);
  clink(0.02, 2400, gain * 0.55);
  clink(0.26, 2800, gain * 0.5);
};

export const playCardShuffle = () => {
  if (!soundEnabled()) return;
  shuffle(0.09);
};

export const playLoadShuffle = async () => {
  if (!soundEnabled()) return false;
  const ctx = getCtx();
  try {
    await ctx.resume();
  } catch {
    return false;
  }
  if (ctx.state !== "running") return false;
  shuffle(0.05);
  return true;
};

export const playChipPush = () => {
  if (!soundEnabled()) return;
  const ctx = getCtx();
  const t = ctx.currentTime;
  const dur = 0.5;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.8;
  band.frequency.setValueAtTime(300, t);
  band.frequency.exponentialRampToValueAtTime(900, t + 0.4);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.11, t + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(band).connect(g).connect(ctx.destination);
  src.start(t);
  clink(0.4, 1900, 0.14);
  clink(0.47, 2300, 0.12);
  clink(0.55, 2100, 0.1);
};

let ambienceNodes = null;

export const startAmbience = () => {
  if (!soundEnabled() || ambienceNodes) return;
  const ctx = getCtx();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 2.5);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  filter.Q.value = 0.4;
  filter.connect(master).connect(ctx.destination);

  const drift = ctx.createOscillator();
  const driftGain = ctx.createGain();
  drift.type = "sine";
  drift.frequency.value = 0.03;
  driftGain.gain.value = 240;
  drift.connect(driftGain).connect(filter.frequency);
  drift.start();

  const breathe = ctx.createOscillator();
  const breatheGain = ctx.createGain();
  breathe.type = "sine";
  breathe.frequency.value = 0.05;
  breatheGain.gain.value = 0.014;
  breathe.connect(breatheGain).connect(master.gain);
  breathe.start();

  const voices = [
    [110.0, "triangle"],
    [164.81, "triangle"],
    [246.94, "sine"],
    [261.63, "sine"],
  ].map(([freq, type], idx) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = idx % 2 === 0 ? 3 : -3;
    g.gain.value = 0.25;
    osc.connect(g).connect(filter);
    osc.start();
    return osc;
  });

  const room = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + (Math.random() * 2 - 1) * 0.02) * 0.995;
    data[i] = last * 3;
  }
  room.buffer = buf;
  room.loop = true;
  const roomFilter = ctx.createBiquadFilter();
  roomFilter.type = "lowpass";
  roomFilter.frequency.value = 320;
  const roomGain = ctx.createGain();
  roomGain.gain.value = 0.35;
  room.connect(roomFilter).connect(roomGain).connect(master);
  room.start();

  ambienceNodes = { master, drift, breathe, voices, room };
};

export const stopAmbience = () => {
  if (!ambienceNodes) return;
  const ctx = getCtx();
  const { master, drift, breathe, voices, room } = ambienceNodes;
  ambienceNodes = null;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
  setTimeout(() => {
    voices.forEach((o) => o.stop());
    drift.stop();
    breathe.stop();
    try {
      room.stop();
    } catch {
      /* already stopped */
    }
  }, 1400);
};

export const isAmbienceRunning = () => ambienceNodes !== null;

if (typeof window !== "undefined") {
  window.__appAmbience = isAmbienceRunning;
}
