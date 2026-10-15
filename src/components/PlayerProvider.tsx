import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { findTrack, tracks, type Track } from "../lib/tracks";

const TRACK_KEY = "stay-here-track";
const TIME_KEY = "stay-here-time";
const PLAYING_KEY = "stay-here-playing";

/** Keys used by the old static site — adopted once for a seamless upgrade. */
const LEGACY_TRACK_KEY = "bg-music";
const LEGACY_PLAYING_KEY = "bg-playing";

type PlayerValue = {
  current: Track | null;
  playing: boolean;
  /** Play a track (or toggle it when it is already selected). */
  select: (id: string) => void;
  /** Toggle the current track, or start the first one. */
  toggle: () => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

/**
 * One <audio> element lives here for the whole app, so music keeps playing
 * while you move between pages — no restart, no localStorage juggling per page.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastStoredTime = useRef(0);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.volume = 0.4;
      audio.preload = "metadata";

      audio.addEventListener("play", () => {
        setPlaying(true);
        localStorage.setItem(PLAYING_KEY, "true");
      });
      audio.addEventListener("pause", () => {
        setPlaying(false);
        localStorage.setItem(PLAYING_KEY, "false");
      });
      audio.addEventListener("timeupdate", () => {
        if (Math.abs(audio.currentTime - lastStoredTime.current) >= 2) {
          lastStoredTime.current = audio.currentTime;
          localStorage.setItem(TIME_KEY, String(audio.currentTime));
        }
      });
      audio.addEventListener("loadedmetadata", () => {
        const saved = Number(localStorage.getItem(TIME_KEY) ?? "0");
        if (Number.isFinite(saved) && saved > 0 && saved < audio.duration) {
          audio.currentTime = saved;
        }
      });

      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  // Restore the previous session (with a one-time adopt of the legacy keys).
  useEffect(() => {
    const savedId =
      localStorage.getItem(TRACK_KEY) ?? localStorage.getItem(LEGACY_TRACK_KEY);
    const track = findTrack(savedId);
    if (!track) return;

    const audio = getAudio();
    setCurrentId(track.id);
    audio.src = track.file;

    const wasPlaying =
      localStorage.getItem(PLAYING_KEY) === "true" ||
      localStorage.getItem(LEGACY_PLAYING_KEY) === "true";

    if (wasPlaying) {
      audio.play().catch(() => {
        // Autoplay was blocked — resume on the first interaction, like before.
        const resume = () => {
          audio.play().catch(() => {});
        };
        document.addEventListener("pointerdown", resume, { once: true });
      });
    }
  }, [getAudio]);

  const select = useCallback(
    (id: string) => {
      const track = findTrack(id);
      if (!track) return;

      const audio = getAudio();

      if (currentId === track.id) {
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
        return;
      }

      setCurrentId(track.id);
      lastStoredTime.current = 0;
      localStorage.setItem(TRACK_KEY, track.id);
      localStorage.setItem(TIME_KEY, "0");

      audio.src = track.file;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
    [currentId, getAudio],
  );

  const toggle = useCallback(() => {
    if (!currentId) {
      select(tracks[0].id);
      return;
    }
    const audio = getAudio();
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [currentId, getAudio, select]);

  const value = useMemo<PlayerValue>(
    () => ({ current: findTrack(currentId), playing, select, toggle }),
    [currentId, playing, select, toggle],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerValue {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("usePlayer must be used inside <PlayerProvider>.");
  return value;
}
