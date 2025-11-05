export type Contact = { name: string; number: string };

const DEFAULT_CONTACTS: Contact[] = [
  { name: "Mom", number: "+15551230001" },
  { name: "Dad", number: "+15551230002" },
  { name: "Alice", number: "+15551230003" },
  { name: "Bob", number: "+15551230004" }
];

const STORAGE_KEY = "voice_assistant_contacts_v1";

export function loadContacts(): Contact[] {
  if (typeof window === "undefined") return DEFAULT_CONTACTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTACTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_CONTACTS;
    return parsed as Contact[];
  } catch {
    return DEFAULT_CONTACTS;
  }
}

export function saveContacts(contacts: Contact[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {}
}

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, "").trim();
}

export function findContactByName(contacts: Contact[], name: string): Contact | null {
  const key = normalize(name);
  let best: Contact | null = null;
  let bestScore = 0;
  for (const c of contacts) {
    const ck = normalize(c.name);
    if (ck === key) return c;
    const overlap = lcsLength(ck, key) / Math.max(ck.length, key.length);
    if (overlap > bestScore) { best = c; bestScore = overlap; }
  }
  return bestScore >= 0.5 ? best : null;
}

function lcsLength(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}
