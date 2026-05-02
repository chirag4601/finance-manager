"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isDictationSupported(): boolean {
  return getCtor() !== null;
}

export function useDictation(opts: {
  onCommit: (text: string) => void;
  lang?: string;
}): {
  listening: boolean;
  supported: boolean;
  interim: string;
  start: () => void;
  stop: () => void;
} {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    setSupported(isDictationSupported());
  }, []);

  const start = () => {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = opts.lang || "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    finalRef.current = "";
    setInterim("");

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk;
        else interimText += chunk;
      }
      if (finalText) {
        finalRef.current += finalText;
        opts.onCommit(finalRef.current.trim());
      }
      setInterim(interimText);
    };
    rec.onerror = () => {
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { listening, supported, interim, start, stop };
}
