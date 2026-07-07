import { useCallback, useRef, useState, useEffect } from 'react';

const YOUDAO_AM_URL = 'https://dict.youdao.com/dictvoice?audio=';

export function useWordAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Audio' in window) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      setSupported(true);
    } else {
      setSupported(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback((word: string) => {
    if (!audioRef.current || !word) return;
    try {
      const audio = audioRef.current;
      audio.pause();
      audio.src = `${YOUDAO_AM_URL}${encodeURIComponent(word)}&type=2`;
      audio.currentTime = 0;
      setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = () => setPlaying(false);
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => setPlaying(false));
      }
    } catch (e) {
      setPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  return { play, stop, playing, supported };
}
