// Gentle wind ambience. Browsers need a tap first, so we start on the first touch/click.
export function startSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 380;
  const gain = ctx.createGain(); gain.gain.value = 0.05;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.03;
  lfo.connect(lfoGain).connect(gain.gain);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(); lfo.start();
}
