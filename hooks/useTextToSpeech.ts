"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useTextToSpeech(defaultLang: string = "en-US") {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    setIsSupported(true);

    function loadVoices() {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
      if (!selectedVoice && vs.length > 0) {
        const match = vs.find(v => v.lang === defaultLang) || vs[0];
        setSelectedVoice(match?.name || null);
      }
    }

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null as any;
    };
  }, [defaultLang, selectedVoice]);

  const speak = useCallback((text: string, opts?: { rate?: number; pitch?: number; lang?: string }) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utter.voice = voice;
    if (opts?.lang) utter.lang = opts.lang;
    if (opts?.rate) utter.rate = opts.rate;
    if (opts?.pitch) utter.pitch = opts.pitch;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [voices, selectedVoice]);

  return { isSupported, voices, selectedVoice, setSelectedVoice, speak };
}
