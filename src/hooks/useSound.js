import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for playing notification sounds
 * Uses Web Audio API for reliable cross-browser sound playback
 */
export function useSound() {
  const audioContextRef = useRef(null);
  const isEnabledRef = useRef(true);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  /**
   * Play a notification chime using Web Audio API
   */
  const playNotification = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a pleasant two-tone chime
      const now = ctx.currentTime;
      
      // First tone - higher pitch
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second tone - slightly lower, delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1174.66, now + 0.15); // D6
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);

      // Third tone - resolution
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(1318.51, now + 0.3); // E6
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.2, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.7);

    } catch (err) {
      console.warn('Sound playback failed:', err);
    }
  }, []);

  /**
   * Play an urgent alert sound
   */
  const playUrgent = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // Urgent double-beep
      for (let i = 0; i < 2; i++) {
        const offset = i * 0.25;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(1000, now + offset);
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.15);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      }
    } catch (err) {
      console.warn('Sound playback failed:', err);
    }
  }, []);

  const toggleSound = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  return { playNotification, playUrgent, toggleSound };
}
