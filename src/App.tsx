import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { PlayerProvider } from "./components/PlayerProvider";
import { LanguageProvider } from "./lib/i18n";
import AdminPage from "./pages/Admin";
import BreathePage from "./pages/Breathe";
import DailyPage from "./pages/Daily";
import GamesPage from "./pages/Games";
import GentleChoicePage from "./pages/GentleChoice";
import HomePage from "./pages/Home";
import MusicPage from "./pages/Music";
import NotFoundPage from "./pages/NotFound";
import OneThoughtPage from "./pages/OneThought";

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <PlayerProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="daily" element={<DailyPage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="games/breathe" element={<BreathePage />} />
              <Route path="games/one-thought" element={<OneThoughtPage />} />
              <Route path="games/gentle-choice" element={<GentleChoicePage />} />
              <Route path="music" element={<MusicPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </PlayerProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
