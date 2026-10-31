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
