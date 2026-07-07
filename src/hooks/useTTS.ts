import { useCallback, useEffect, useRef, useState } from 'react';

// Web Speech API 语音合成 Hook，用于单词发音与听力播报
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const englishVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    setSupported(true);

    const pickEnglishVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return false;
      // 优先选择美式英语，其次英式英语，最后任何英语
      const preferred =
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en-US')) ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
      englishVoiceRef.current = preferred || null;
      return true;
    };

    if (pickEnglishVoice()) {
      setVoicesReady(true);
    } else {
      const onVoicesChanged = () => {
        if (pickEnglishVoice()) {
          setVoicesReady(true);
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      // 某些浏览器需要额外触发一次
      setTimeout(() => {
        if (englishVoiceRef.current) {
          setVoicesReady(true);
        }
      }, 1000);
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, opts?: { rate?: number; lang?: string; onEnd?: () => void }) => {
      if (!supported) {
        opts?.onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = opts?.lang || 'en-US';
      utter.rate = opts?.rate ?? 0.9;
      utter.pitch = 1;
      utter.volume = 1;
      if (englishVoiceRef.current) {
        utter.voice = englishVoiceRef.current;
      }
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => {
        setSpeaking(false);
        opts?.onEnd?.();
      };
      utter.onerror = (e) => {
        console.warn('TTS error:', e);
        setSpeaking(false);
        opts?.onEnd?.();
      };
      window.speechSynthesis.speak(utter);
    },
    [supported],
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { speak, cancel, speaking, supported, ready: voicesReady };
}
