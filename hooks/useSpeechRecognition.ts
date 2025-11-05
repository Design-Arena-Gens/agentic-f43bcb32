"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecognitionResult = {
  transcript: string;
  isFinal: boolean;
};

type RecognitionOptions = {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  onResult?: (result: RecognitionResult) => void;
};

export function useSpeechRecognition(options: RecognitionOptions = {}) {
  const { lang = "en-US", interimResults = true, continuous = false, onResult } = options;
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = interimResults;
    recognition.continuous = continuous;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0].transcript;
        if (res.isFinal) final += txt;
        else interim += txt;
      }
      const text = final || interim;
      if (text) {
        setTranscript(text);
        onResult?.({ transcript: text, isFinal: !!final });
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, [lang, interimResults, continuous, onResult]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.lang = lang;
      recognition.start();
      setIsListening(true);
    } catch {}
  }, [lang]);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
      setIsListening(false);
    } catch {}
  }, []);

  return { isSupported, isListening, transcript, start, stop };
}
