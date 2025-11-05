export type CommandAction =
  | { type: "call"; contactOrNumber: string }
  | { type: "sms"; contactOrNumber: string; message: string }
  | { type: "navigate"; destination: string }
  | { type: "open"; app: string }
  | { type: "time" }
  | { type: "battery" }
  | { type: "vibrate" }
  | { type: "help" }
  | { type: "unknown"; original: string };

const normalize = (s: string) => s.toLowerCase().trim();

export function parseCommand(input: string): CommandAction {
  const text = normalize(input);
  if (!text) return { type: "unknown", original: input };

  if (text === "help" || text.startsWith("what can you do")) return { type: "help" };

  const callMatch = text.match(/^(call|dial)\s+(.+)$/);
  if (callMatch) {
    return { type: "call", contactOrNumber: callMatch[2].trim() };
  }

  const smsMatch = text.match(/^(?:text|send(?:\s+(?:a\s+)?)?message(?:\s+to)?)\s+([^:,]+)[,:]?\s*(.*)$/);
  if (smsMatch) {
    return { type: "sms", contactOrNumber: smsMatch[1].trim(), message: smsMatch[2]?.trim() || "" };
  }

  const navMatch = text.match(/^(?:navigate to|directions to|take me to|go to)\s+(.+)$/);
  if (navMatch) {
    return { type: "navigate", destination: navMatch[1].trim() };
  }

  const openMatch = text.match(/^(?:open|launch)\s+(.+)$/);
  if (openMatch) {
    return { type: "open", app: openMatch[1].trim() };
  }

  if (/^(what'?s\s+the\s+time|what\s+time\s+is\s+it|time)$/.test(text)) {
    return { type: "time" };
  }

  if (/(battery)/.test(text)) {
    return { type: "battery" };
  }

  if (/vibrate|buzz/.test(text)) {
    return { type: "vibrate" };
  }

  return { type: "unknown", original: input };
}

export function appToUrl(app: string): string | null {
  const key = normalize(app);
  const map: Record<string, string> = {
    maps: "https://maps.google.com",
    youtube: "https://youtube.com",
    spotify: "https://open.spotify.com",
    whatsapp: "https://wa.me",
    gmail: "https://mail.google.com",
    calendar: "https://calendar.google.com",
    twitter: "https://x.com",
    x: "https://x.com",
    reddit: "https://reddit.com",
    weather: "https://weather.com"
  };
  return map[key] || null;
}
