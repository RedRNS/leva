let audioContext = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;

  const ContextClass = window.AudioContext || window.webkitAudioContext;
  if (!ContextClass) return null;

  if (!audioContext) audioContext = new ContextClass();
  return audioContext;
};

export const playSoftChime = ({ duration = 0.24, frequency = 800, volume = 0.3 } = {}) => {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      // Browser may suspend AudioContext until the first user interaction.
      ctx.resume();
    }

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);

    return true;
  } catch {
    return false;
  }
};
