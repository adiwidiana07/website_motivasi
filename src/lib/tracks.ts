export type Track = {
  id: string;
  title: string;
  file: string;
};

export const tracks: Track[] = [
  { id: "calm-1", title: "Rewrite The Stars", file: "/music/calm-1.mp3" },
  { id: "calm-2", title: "Bohong Hati", file: "/music/calm-2.mp3" },
  { id: "calm-3", title: "Mast Magan", file: "/music/calm-3.mp3" },
];

export function findTrack(id: string | null): Track | null {
  if (!id) return null;
  return tracks.find((track) => track.id === id) ?? null;
}
