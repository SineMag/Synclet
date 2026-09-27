import { useEffect, useRef, useState } from 'react';
import { detectWakeWord } from '@/lib/synclet/voiceService';

// REAL continuous speech recognition via the browser (Chrome/Edge). Only phrases
// that contain the wake word "Synclet" are passed on — there is no tap-to-speak.
export default function useLiveListening(onPhrase) {
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const [active, setActive] = useState(false);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState('');
  const cb = useRef(onPhrase);
  cb.current = onPhrase;

  useEffect(() => {
    if (!active || !SR) return;
    let stopped = false;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-ZA';
    rec.onresult = (e) => {
      const r = e.results[e.results.length - 1];
      const text = r[0].transcript.trim();
      setHeard(text);
      if (r.isFinal && detectWakeWord(text).detected) cb.current(text);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') { stopped = true; setActive(false); setError('Microphone permission denied.'); }
    };
    rec.onend = () => { if (!stopped) rec.start(); };
    setError('');
    rec.start();
    return () => { stopped = true; rec.stop(); };
  }, [active]);

  return { supported: !!SR, active, setActive, heard, error };
}