"use client";

import React from "react";

export function SettingsDrawer({
  voices,
  selectedVoice,
  onVoiceChange,
  autoSpeak,
  onAutoSpeakChange,
  language,
  onLanguageChange
}: {
  voices: SpeechSynthesisVoice[];
  selectedVoice: string | null;
  onVoiceChange: (name: string) => void;
  autoSpeak: boolean;
  onAutoSpeakChange: (v: boolean) => void;
  language: string;
  onLanguageChange: (v: string) => void;
}) {
  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 700 }}>Settings</div>
      <label className="row" style={{ justifyContent: "space-between" }}>
        <span>Auto speak responses</span>
        <input type="checkbox" checked={autoSpeak} onChange={(e) => onAutoSpeakChange(e.target.checked)} />
      </label>
      <label className="stack">
        <span>Speech recognition language</span>
        <input className="input" value={language} onChange={(e) => onLanguageChange(e.target.value)} placeholder="e.g. en-US" />
      </label>
      <label className="stack">
        <span>TTS voice</span>
        <select className="input" value={selectedVoice || ""} onChange={(e) => onVoiceChange(e.target.value)}>
          {voices.map(v => (
            <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </label>
    </div>
  );
}
