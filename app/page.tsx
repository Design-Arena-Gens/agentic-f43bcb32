"use client";

import { useEffect, useMemo, useState } from "react";
import { MicrophoneButton } from "@components/MicrophoneButton";
import { CommandLog } from "@components/CommandLog";
import { SettingsDrawer } from "@components/SettingsDrawer";
import { useSpeechRecognition } from "@hooks/useSpeechRecognition";
import { useTextToSpeech } from "@hooks/useTextToSpeech";
import { appToUrl, parseCommand } from "@utils/nlu";
import { findContactByName, loadContacts } from "@utils/contacts";

export default function Page() {
  const [language, setLanguage] = useState("en-US");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [manualText, setManualText] = useState("");
  const [log, setLog] = useState<{ from: "user" | "assistant"; text: string }[]>([]);

  const contacts = useMemo(() => loadContacts(), []);

  const { isSupported: asrSupported, isListening, transcript, start, stop } = useSpeechRecognition({
    lang: language,
    interimResults: true,
    continuous: false,
  });

  const { isSupported: ttsSupported, voices, selectedVoice, setSelectedVoice, speak } = useTextToSpeech(language);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!transcript) return;
    // Only act on final-ish chunks; heuristic: when we're not listening anymore
    if (!isListening) {
      handleCommand(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  function addToLog(from: "user" | "assistant", text: string) {
    setLog((prev) => [...prev, { from, text }]);
  }

  function respond(text: string) {
    addToLog("assistant", text);
    if (autoSpeak && ttsSupported) speak(text, { lang: language });
  }

  function handleCommand(input: string) {
    const cleaned = input.trim();
    if (!cleaned) return;
    addToLog("user", cleaned);
    const command = parseCommand(cleaned);

    switch (command.type) {
      case "call": {
        const target = resolveContactOrNumber(command.contactOrNumber);
        if (!target) return respond(`I couldn't find ${command.contactOrNumber}.`);
        const tel = `tel:${target}`;
        safeOpen(tel);
        return respond(`Calling ${command.contactOrNumber}.`);
      }
      case "sms": {
        const target = resolveContactOrNumber(command.contactOrNumber);
        if (!target) return respond(`I couldn't find ${command.contactOrNumber}.`);
        const body = encodeURIComponent(command.message || "");
        const sms = `sms:${target}?body=${body}`;
        safeOpen(sms);
        return respond(`Opening messages to ${command.contactOrNumber}.`);
      }
      case "navigate": {
        const dest = encodeURIComponent(command.destination);
        const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
        safeOpen(url, true);
        return respond(`Starting directions to ${command.destination}.`);
      }
      case "open": {
        const url = appToUrl(command.app);
        if (!url) return respond(`I can't open ${command.app}.`);
        safeOpen(url, true);
        return respond(`Opening ${command.app}.`);
      }
      case "time": {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        return respond(`It is ${time}.`);
      }
      case "battery": {
        if (typeof navigator !== "undefined" && (navigator as any).getBattery) {
          (navigator as any).getBattery().then((b: any) => {
            const level = Math.round((b.level || 0) * 100);
            respond(`Battery is at ${level} percent${b.charging ? ", and charging" : ""}.`);
          }).catch(() => respond("I couldn't read the battery level."));
        } else {
          return respond("Battery info is not supported on this device.");
        }
        break;
      }
      case "vibrate": {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([200, 100, 200]);
          return respond("Buzzing now.");
        } else {
          return respond("Vibration is not supported on this device.");
        }
      }
      case "help": {
        return respond("Try: call Mom, text Alice hello, navigate to Times Square, open YouTube, what's the time, vibrate, battery.");
      }
      case "unknown":
      default: {
        return respond("Sorry, I didn't understand that.");
      }
    }
  }

  function resolveContactOrNumber(nameOrNumber: string): string | null {
    const trimmed = nameOrNumber.replace(/\s+/g, "");
    if (/^\+?\d{5,}$/.test(trimmed)) return trimmed; // looks like a number
    const match = findContactByName(contacts, nameOrNumber);
    return match?.number || null;
  }

  function toggleMic() {
    if (!asrSupported) return respond("Speech recognition is not supported in this browser.");
    if (isListening) stop(); else start();
  }

  function submitManual() {
    const text = manualText.trim();
    if (!text) return;
    setManualText("");
    handleCommand(text);
  }

  function safeOpen(url: string, newTab = false) {
    try {
      if (newTab) window.open(url, "_blank");
      else window.location.href = url;
    } catch {}
  }

  return (
    <div className="container">
      <div className="header">
        <div className="title">Voice Assistant</div>
        <span className="badge">{asrSupported ? "Voice ready" : "Voice not supported"}</span>
      </div>

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <div className="row" style={{ justifyContent: "center" }}>
          <MicrophoneButton isListening={isListening} onToggle={toggleMic} />
        </div>
        <div className="row">
          <input className="input" placeholder="Type a command..." value={manualText} onChange={(e) => setManualText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitManual(); }} />
          <button className="badge" onClick={submitManual} style={{ border: 0, cursor: "pointer" }}>Send</button>
        </div>
        {transcript ? <div style={{ color: "#334155" }}>Heard: <strong>{transcript}</strong></div> : null}
      </div>

      <div style={{ height: 12 }} />
      <SettingsDrawer
        voices={voices}
        selectedVoice={selectedVoice}
        onVoiceChange={(v) => setSelectedVoice(v)}
        autoSpeak={autoSpeak}
        onAutoSpeakChange={setAutoSpeak}
        language={language}
        onLanguageChange={setLanguage}
      />

      <div style={{ height: 12 }} />
      <CommandLog items={log} />

      <div className="footer">Add contacts by name on your device's contacts; common names are preloaded.</div>
    </div>
  );
}
