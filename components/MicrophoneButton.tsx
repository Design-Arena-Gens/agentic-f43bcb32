"use client";

import React from "react";

type Props = {
  isListening: boolean;
  onToggle: () => void;
};

export function MicrophoneButton({ isListening, onToggle }: Props) {
  return (
    <button className={`mic ${isListening ? "listening" : ""}`} onClick={onToggle} aria-pressed={isListening} aria-label={isListening ? "Stop listening" : "Start listening"}>
      {isListening ? "Stop" : "Speak"}
    </button>
  );
}
