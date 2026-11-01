import { useCallback, useEffect, useRef, useState } from "react";
import { Spade, Volume2, VolumeX, X } from "lucide-react";
import {
  isSoundEnabled,
  playCardShuffle,
  playChipClinks,
  playFoldClink,
  playLoadShuffle,
  setSoundEnabled,
} from "@/utils/sounds";
import PokerTable from "@/components/PokerTable";
import StoryOverlay from "@/components/StoryOverlay";
import FoldToast from "@/components/FoldToast";
import IntroSequence from "@/components/IntroSequence";
import DealerCard from "@/components/DealerCard";
import { PLAYERS } from "@/data/players";
import "@/App.css";

const SOCIAL_LINKS = [
  {
    id: "portfolio",
    label: "Portfolio",
    icon: "fas fa-globe",
    href: "https://rajsekhar.tech",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "fab fa-linkedin-in",
    href: "https://www.linkedin.com/in/rajsekhar-roy/",
  },
  {
    id: "github",
    label: "GitHub",
    icon: "fab fa-github",
    href: "https://github.com/rajsekharrr",
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: "fab fa-x-twitter",
    href: "https://x.com/snapcallin",
  },
  {
    id: "resume",
    label: "Resume",
    icon: "fas fa-file-lines",
    href: "https://drive.google.com/file/d/16IZIt_Ywv9HHt666mf1k4FO8jf0uVDDr/view?usp=drive_link",
  },
];

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(
        JSON.parse(window.localStorage.getItem("rajsekhar-read") ?? "[]"),
      );
    } catch {
      return new Set();
    }
  });

  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const soundOnRef = useRef(soundOn);

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on;
      soundOnRef.current = next;
      setSoundEnabled(next);
      window.dispatchEvent(new CustomEvent("soundchange", { detail: next }));
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    playLoadShuffle().then((played) => {
      if (cancelled || played) return;
      const retry = () => {
        if (soundOnRef.current) playLoadShuffle();
      };
      window.addEventListener("pointerdown", retry, { once: true });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const clearToast = useCallback(() => setToast(null), []);
  const actionBarRef = useRef(null);
  const [dealerId, setDealerId] = useState(1);
  const [introMounted, setIntroMounted] = useState(true);
  const [bootDone, setBootDone] = useState(false);
  const [fastBoot, setFastBoot] = useState(false);

  const handleIntroFadeStart = (skipped) => {
    setFastBoot(skipped);
    setBootDone(true);
  };

  const handleIntroGone = () => setIntroMounted(false);

  const closeChapter = () => {
    setChapterOpen(false);
    window.setTimeout(
      () => setDealerId((id) => (id % PLAYERS.length) + 1),
      550,
    );
  };

  const selected = PLAYERS.find((p) => p.id === selectedId) ?? null;

  const selectSeat = (id) => setSelectedId(id);

  useEffect(() => {
    if (selectedId && actionBarRef.current) {
      actionBarRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        window.localStorage.setItem("rajsekhar-read", JSON.stringify([...next]));
      } catch {
        /* storage unavailable — badge just won't persist */
      }
      if (next.size === PLAYERS.length) {
        window.dispatchEvent(new CustomEvent("dealer-allread"));
      }
      return next;
    });
  }, []);

  const handleBet = () => {
    if (!selected) return;
    playChipClinks();
    setChapterOpen(true);
    window.setTimeout(playCardShuffle, 260);
  };

  const handleFold = () => {
    if (!selected) return;
    playFoldClink();
    setToast({ id: Date.now(), player: selected });
    window.dispatchEvent(
      new CustomEvent("dealer-fold", { detail: selected.name }),
    );
  };

  return (
    <>
      {introMounted && (
        <IntroSequence
          onFadeStart={handleIntroFadeStart}
          onGone={handleIntroGone}
        />
      )}
      <div
        className={`felt-page${
          bootDone ? (fastBoot ? " is-fastboot" : "") : " is-booting"
        }`}
      >
      <span className="ambient ambient-blue-top" aria-hidden="true" />
      <span className="ambient ambient-blue-bottom" aria-hidden="true" />
      <span className="ambient ambient-gold" aria-hidden="true" />
      <span className="page-grain" aria-hidden="true" />

      <button
        type="button"
        className={`sound-toggle${soundOn ? "" : " is-off"}`}
        data-testid="sound-toggle"
        aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
        aria-pressed={soundOn}
        onClick={toggleSound}
      >
        {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>

      <header className="site-header">
        <h1 className="site-title">All in: the Story of Rajsekhar</h1>
        <div className="title-ornament" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>
      </header>

      <main className="stage">
        <PokerTable
          players={PLAYERS}
          selectedId={selectedId}
          readIds={readIds}
          dealerId={dealerId}
          onSelectSeat={selectSeat}
        />

        <div
          ref={actionBarRef}
          className={`action-bar${selected ? " is-visible" : ""}`}
          data-testid="action-bar"
        >
          {!selected && (
            <p className="action-hint" data-testid="action-hint">
              Select a player to place a bet
            </p>
          )}
          <button
            type="button"
            className="chip-btn chip-btn-bet"
            data-testid="bet-button"
            tabIndex={selected ? 0 : -1}
            onClick={handleBet}
          >
            <Spade size={17} strokeWidth={2.4} />
            <span>Bet</span>
          </button>
          <button
            type="button"
            className="chip-btn chip-btn-fold"
            data-testid="fold-button"
            tabIndex={selected ? 0 : -1}
            onClick={handleFold}
          >
            <X size={18} strokeWidth={2.8} />
            <span>Fold</span>
          </button>
        </div>

        <footer className="site-footer" data-testid="site-footer">
          Built with voice. Submitted to Wispr Flow × Emergent Hiring Challenge 2026.
        </footer>

        <div className="social-bar" data-testid="social-bar">
          <span className="social-rule" aria-hidden="true" />
          <div className="social-links">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.id}
                className="social-link"
                data-testid={`social-${link.id}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-icon">
                  <i className={link.icon} aria-hidden="true" />
                </span>
                <span className="social-label">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </main>

      {chapterOpen && selected && (
        <StoryOverlay
          player={selected}
          onRead={markRead}
          onClose={closeChapter}
        />
      )}
      {toast && (
        <FoldToast key={toast.id} player={toast.player} onDone={clearToast} />
      )}
      </div>

      {bootDone && <DealerCard />}
    </>
  );
}
