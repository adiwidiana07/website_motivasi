import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "id";

const LANG_KEY = "stay-here-lang";

const en = {
  brand: "Stay Here",
  nav: {
    home: "Home",
    daily: "Daily Words",
    games: "Games",
    music: "Music",
  },
  common: {
    menu: "Menu",
    close: "Close",
    language: "Language",
  },
  footer: {
    line: "Stay present. Stay here.",
  },
  home: {
    eyebrow: "A quiet place",
    lead: "Stay present.",
    leadAccent: "Stay here.",
    intro:
      "A small corner for pausing, breathing, and coming back to yourself. No feed, no noise — just words, music, and a little time.",
    ctaDaily: "Read today's words",
    ctaGames: "Gentle experiences",
    todaysWord: "Today's word",
    readDaily: "Daily words",
    indexTitle: "What's inside",
    index: [
      {
        number: "01",
        title: "Daily Words",
        description: "One thought at a time, rotating quietly through the day.",
        href: "/daily",
      },
      {
        number: "02",
        title: "Gentle Games",
        description: "Tiny practices for slowing down — breathing, writing, choosing.",
        href: "/games",
      },
      {
        number: "03",
        title: "Music",
        description: "Quiet sounds that keep playing as you wander.",
        href: "/music",
      },
    ],
  },
  daily: {
    eyebrow: "Daily Words",
    sit: "Sit with this",
    another: "Another message",
    sitting: "Stay with this thought.",
    empty: "The words are resting right now. Come back soon.",
  },
  games: {
    eyebrow: "Gentle Games",
    title: "Small moments, kept simple.",
    intro:
      "Interactive pauses designed to help you slow down and return to yourself.",
    begin: "Begin",
    items: [
      {
        number: "01",
        category: "Reflection",
        title: "Breathe",
        description:
          "Follow a slow rhythm of breath — inhale, hold, exhale — and let your thoughts settle.",
        href: "/games/breathe",
      },
      {
        number: "02",
        category: "Focus",
        title: "One Thought",
        description:
          "Write down one thought that keeps returning. Sit with it, then gently let it go.",
        href: "/games/one-thought",
      },
      {
        number: "03",
        category: "Perspective",
        title: "Gentle Choice",
        description:
          "Read a quiet question and choose the response that feels kindest to you.",
        href: "/games/gentle-choice",
      },
    ],
  },
  breathe: {
    eyebrow: "Reflection",
    title: "Breathe",
    intro: "Four counts in, three to hold, five out. Again, and again.",
    idle: "Ready",
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale",
    start: "Begin",
    pause: "Pause",
    resume: "Resume",
    restart: "Start over",
    cycles: "cycles",
    cycle: "cycle",
  },
  oneThought: {
    eyebrow: "Focus",
    title: "One Thought",
    prompt: "Write one thought that feels heavy right now.",
    placeholder: "Just one thought…",
    submit: "Sit with this",
    sitting: "Stay with this thought",
    release: "You don't need to solve it right now. Let it rest here — then let it go.",
    again: "Another thought",
    secondsLabel: "seconds",
  },
  gentleChoice: {
    eyebrow: "Perspective",
    title: "Gentle Choice",
    prompt: "What feels most kind to you right now?",
    options: [
      {
        label: "Rest for a moment",
        response: "Rest is a strategy. Let your body set the pace.",
      },
      {
        label: "Do one small thing",
        response: "One small thing, done gently, is still momentum.",
      },
      {
        label: "Let today be enough",
        response: "Enough is a complete answer. You don't have to negotiate with it.",
      },
    ],
    closing: "There was no wrong answer.",
    again: "Make another gentle choice",
  },
  music: {
    eyebrow: "Sounds",
    title: "Background Music",
    intro:
      "Choose a sound that feels gentle to you. It keeps playing as you wander through the site.",
    nowPlaying: "Now playing",
    pausedLabel: "Paused",
    play: "Play",
    pause: "Pause",
  },
  notFound: {
    label: "404",
    title: "Lost, but gently.",
    intro: "This page doesn't exist. Take a breath, and head back.",
    cta: "Back home",
  },
};

const id: typeof en = {
  brand: "Stay Here",
  nav: {
    home: "Beranda",
    daily: "Kata Harian",
    games: "Permainan",
    music: "Musik",
  },
  common: {
    menu: "Menu",
    close: "Tutup",
    language: "Bahasa",
  },
  footer: {
    line: "Hadir sepenuhnya. Di sini.",
  },
  home: {
    eyebrow: "Tempat yang tenang",
    lead: "Hadir sepenuhnya.",
    leadAccent: "Di sini.",
    intro:
      "Sudut kecil untuk berhenti sejenak, bernapas, dan kembali pada dirimu. Tanpa feed, tanpa kebisingan — hanya kata, musik, dan sedikit waktu.",
    ctaDaily: "Baca kata hari ini",
    ctaGames: "Pengalaman yang lembut",
    todaysWord: "Kata hari ini",
    readDaily: "Kata harian",
    indexTitle: "Isi tempat ini",
    index: [
      {
        number: "01",
        title: "Kata Harian",
        description: "Satu pikiran berganti dengan tenang, sepanjang hari.",
        href: "/daily",
      },
      {
        number: "02",
        title: "Permainan Lembut",
        description: "Latihan kecil untuk melambat — bernapas, menulis, memilih.",
        href: "/games",
      },
      {
        number: "03",
        title: "Musik",
        description: "Suara tenang yang terus mengalun saat kamu menjelajah.",
        href: "/music",
      },
    ],
  },
  daily: {
    eyebrow: "Kata Harian",
    sit: "Duduk dengan ini",
    another: "Pesan lain",
    sitting: "Tetaplah bersama pikiran ini.",
    empty: "Kata-kata sedang beristirahat. Kembalilah nanti.",
  },
  games: {
    eyebrow: "Permainan Lembut",
    title: "Momen kecil, tetap sederhana.",
    intro:
      "Jeda interaktif yang membantumu melambat dan kembali pada diri sendiri.",
    begin: "Mulai",
    items: [
      {
        number: "01",
        category: "Refleksi",
        title: "Bernapas",
        description:
          "Ikuti ritme napas yang lambat — tarik, tahan, buang — dan biarkan pikiran mengendap.",
        href: "/games/breathe",
      },
      {
        number: "02",
        category: "Fokus",
        title: "Satu Pikiran",
        description:
          "Tulis satu pikiran yang terus kembali. Duduk dengannya, lalu lepaskan dengan lembut.",
        href: "/games/one-thought",
      },
      {
        number: "03",
        category: "Sudut Pandang",
        title: "Pilihan Lembut",
        description:
          "Baca pertanyaan sunyi dan pilih respons yang terasa paling baik untukmu.",
        href: "/games/gentle-choice",
      },
    ],
  },
  breathe: {
    eyebrow: "Refleksi",
    title: "Bernapas",
    intro: "Tarik empat hitungan, tahan tiga, buang lima. Ulangi.",
    idle: "Siap",
    inhale: "Tarik",
    hold: "Tahan",
    exhale: "Buang",
    start: "Mulai",
    pause: "Jeda",
    resume: "Lanjut",
    restart: "Ulang dari awal",
    cycles: "siklus",
    cycle: "siklus",
  },
  oneThought: {
    eyebrow: "Fokus",
    title: "Satu Pikiran",
    prompt: "Tulis satu pikiran yang terasa berat saat ini.",
    placeholder: "Hanya satu pikiran…",
    submit: "Dudukkan sejenak",
    sitting: "Tetaplah bersama pikiran ini",
    release:
      "Kamu tidak perlu menyelesaikannya sekarang. Biarkan ia beristirahat di sini — lalu lepaskan.",
    again: "Pikiran lain",
    secondsLabel: "detik",
  },
  gentleChoice: {
    eyebrow: "Sudut Pandang",
    title: "Pilihan Lembut",
    prompt: "Apa yang terasa paling baik untukmu saat ini?",
    options: [
      {
        label: "Beristirahat sejenak",
        response: "Istirahat adalah strategi. Biarkan tubuhmu menentukan ritmenya.",
      },
      {
        label: "Lakukan satu hal kecil",
        response: "Satu hal kecil yang dilakukan dengan lembut tetap sebuah langkah.",
      },
      {
        label: "Biarkan hari ini cukup",
        response: "Cukup adalah jawaban yang utuh. Tidak perlu dinegosiasikan lagi.",
      },
    ],
    closing: "Tidak ada jawaban yang salah.",
    again: "Buat pilihan lembut lagi",
  },
  music: {
    eyebrow: "Suara",
    title: "Musik Latar",
    intro:
      "Pilih suara yang terasa lembut untukmu. Musiknya terus berjalan saat kamu menjelajah.",
    nowPlaying: "Sedang diputar",
    pausedLabel: "Dijeda",
    play: "Putar",
    pause: "Jeda",
  },
  notFound: {
    label: "404",
    title: "Tersesat, tapi dengan tenang.",
    intro: "Halaman ini tidak ada. Tarik napas, lalu kembali.",
    cta: "Kembali ke awal",
  },
};

export type Copy = typeof en;

const dictionaries: Record<Lang, Copy> = { en, id };

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  copy: Copy;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "en" || saved === "id") return saved;
    return navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nValue>(() => {
    function setLang(next: Lang) {
      setLangState(next);
      localStorage.setItem(LANG_KEY, next);
    }
    return { lang, setLang, copy: dictionaries[lang] };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <LanguageProvider>.");
  return value;
}
