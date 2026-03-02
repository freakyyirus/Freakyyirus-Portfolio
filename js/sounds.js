/* ============ SOUND MANAGER ============ */
const Sounds = (() => {
  let audioCtx = null;
  let enabled = false;
  let initialized = false;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(frequency, duration, type = 'square', volume = 0.1) {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = volume;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch(e) { /* silently fail */ }
  }

  function playSequence(notes, baseTime = 0.15) {
    if (!enabled) return;
    notes.forEach((note, i) => {
      setTimeout(() => {
        playTone(note.freq, note.dur || 0.2, note.type || 'sine', note.vol || 0.08);
      }, i * baseTime * 1000);
    });
  }

  return {
    init() {
      if (initialized) return;
      initialized = true;
      // Try to initialize audio context on first user interaction
      document.addEventListener('click', () => { getCtx(); }, { once: true });
    },

    toggle() {
      enabled = !enabled;
      const btn = document.getElementById('sound-toggle');
      if (btn) btn.textContent = enabled ? '🔊' : '🔇';
      if (enabled) {
        getCtx();
        Sounds.play('click');
      }
      return enabled;
    },

    isEnabled() { return enabled; },

    play(type) {
      if (!enabled) return;
      switch (type) {
        case 'startup':
          // Windows XP-like startup jingle
          playSequence([
            { freq: 523.25, dur: 0.3, vol: 0.06 },  // C5
            { freq: 659.25, dur: 0.2, vol: 0.06 },  // E5
            { freq: 783.99, dur: 0.25, vol: 0.07 }, // G5
            { freq: 1046.5, dur: 0.5, vol: 0.08 },  // C6
          ], 0.25);
          break;

        case 'error':
          // Error buzz
          playTone(200, 0.15, 'square', 0.08);
          setTimeout(() => playTone(160, 0.2, 'square', 0.06), 150);
          break;

        case 'click':
          playTone(800, 0.05, 'sine', 0.04);
          break;

        case 'close':
          playTone(400, 0.08, 'sine', 0.05);
          setTimeout(() => playTone(300, 0.1, 'sine', 0.03), 50);
          break;

        case 'open':
          playTone(600, 0.06, 'sine', 0.04);
          setTimeout(() => playTone(800, 0.08, 'sine', 0.05), 60);
          break;

        case 'minimize':
          playTone(600, 0.05, 'sine', 0.03);
          setTimeout(() => playTone(400, 0.08, 'sine', 0.03), 50);
          break;

        case 'maximize':
          playTone(500, 0.05, 'sine', 0.03);
          setTimeout(() => playTone(700, 0.08, 'sine', 0.04), 50);
          break;

        case 'notify':
          playSequence([
            { freq: 880, dur: 0.1, vol: 0.05 },
            { freq: 1100, dur: 0.15, vol: 0.06 },
          ], 0.12);
          break;

        case 'recycle':
          playTone(500, 0.06, 'sine', 0.04);
          setTimeout(() => playTone(350, 0.1, 'sine', 0.03), 80);
          setTimeout(() => playTone(250, 0.15, 'sine', 0.02), 160);
          break;

        case 'bsod':
          playTone(120, 0.8, 'sawtooth', 0.1);
          break;

        default:
          playTone(800, 0.05, 'sine', 0.03);
      }
    }
  };
})();

Sounds.init();
