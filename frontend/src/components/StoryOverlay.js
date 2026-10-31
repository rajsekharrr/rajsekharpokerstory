import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Pause, Play, RotateCcw } from "lucide-react";
import { startAmbience, stopAmbience } from "@/utils/sounds";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const audioCache = new Map();

export default function StoryOverlay({ player, onClose, onRead }) {
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [closing, setClosing] = useState(false);
  const [narration, setNarration] = useState("idle");
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const text = player.story;
    setTyped("");
    setIsTyping(true);
    let i = 0;
    const base = text.length > 600 ? 14 : 22;
    const tick = () => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        setIsTyping(false);
        return;
      }
      const ch = text[i - 1];
      let delay = base;
      if (ch === "." || ch === "!" || ch === "?") delay += 220;
      else if (ch === "," || ch === ";" || ch === ":" || ch === "—") delay += 110;
      timerRef.current = setTimeout(tick, delay);
    };
    timerRef.current = setTimeout(tick, 280);
    return () => clearTimeout(timerRef.current);
  }, [player]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!isTyping) onRead(player.id);
  }, [isTyping, onRead, player.id]);

  useEffect(
    () => () => {
      if (audioRef.current) audioRef.current.pause();
      stopAmbience();
    },
    [],
  );

  useEffect(() => {
    const onSoundChange = (e) => {
      const on = e.detail;
      if (audioRef.current) audioRef.current.muted = !on;
      if (on && narration === "playing") startAmbience();
      else stopAmbience();
    };
    window.addEventListener("soundchange", onSoundChange);
    return () => window.removeEventListener("soundchange", onSoundChange);
  }, [narration]);

  const toggleNarration = async () => {
    if (narration === "loading") return;
    const el = audioRef.current;
    if (el && (narration === "playing" || narration === "paused")) {
      if (narration === "playing") {
        el.pause();
        setNarration("paused");
      } else {
        el.play();
        setNarration("playing");
      }
      return;
    }
    setNarration("loading");
    try {
      let url = audioCache.get(`hd:${player.id}`);
      if (!url) {
        const titlePart = /[.?!…]$/.test(player.chapterTitle)
          ? player.chapterTitle
          : `${player.chapterTitle}.`;
        const spoken = ["One", "Two", "Three", "Four", "Five", "Six"][player.id - 1];
        const text = `Chapter ${spoken}. ${titlePart} ${player.story}`;
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/narration`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          },
        );
        if (!res.ok) throw new Error("narration failed");
        url = URL.createObjectURL(await res.blob());
        audioCache.set(`hd:${player.id}`, url);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => {
        setNarration("playing");
        startAmbience();
      };
      audio.onpause = () => {
        setNarration("paused");
        stopAmbience();
      };
      audio.onended = () => {
        setNarration("idle");
        stopAmbience();
      };
      revealAll();
      await audio.play();
    } catch (e) {
      setNarration("error");
    }
  };

  const replayNarration = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play();
    setNarration("playing");
  };

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 480);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const revealAll = () => {
    if (!isTyping) return;
    clearTimeout(timerRef.current);
    setTyped(player.story);
    setIsTyping(false);
  };

  return (
    <div
      className={`overlay${closing ? " is-closing" : ""}`}
      data-testid="story-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${player.chapterTitle} chapter`}
    >
      <div className="overlay-cards" aria-hidden="true">
        <span className="deal-card card-a">
          <b className="suit-black">A♠</b>
        </span>
        <span className="deal-card card-b">
          <b className="suit-red">K♥</b>
        </span>
        <span className="deal-card card-c">
          <b className="suit-black">Q♠</b>
        </span>
        <span className="deal-card card-d">
          <b className="suit-red">J♦</b>
        </span>
      </div>

      <span className="chapter-chip" data-testid="chapter-chip" aria-hidden="true">
        {ROMAN[player.id - 1]}
      </span>

      <button
        type="button"
        className="overlay-back"
        data-testid="back-to-table-button"
        onClick={requestClose}
      >
        <ArrowLeft size={15} strokeWidth={2.4} />
        <span>Back to Table</span>
      </button>

      <div className="overlay-body" onClick={revealAll}>
        <p className="chapter-eyebrow">
          {player.seat} · Chapter {ROMAN[player.id - 1]}
        </p>
        <h2 className="chapter-title" data-testid="chapter-title">
          {player.chapterTitle}
        </h2>
        <span className="chapter-rule" aria-hidden="true" />
        <p className="chapter-story" data-testid="story-text">
          {typed}
          {isTyping && <span className="type-cursor" aria-hidden="true" />}
        </p>
        <div className="narration-row">
          <button
            type="button"
            className={`narration-btn${narration === "playing" ? " is-playing" : ""}`}
            data-testid="narration-play-button"
            onClick={toggleNarration}
          >
            {narration === "loading" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : narration === "playing" ? (
              <Pause size={15} />
            ) : (
              <Play size={15} />
            )}
            <span>
              {narration === "loading"
                ? "Waking the narrator"
                : narration === "playing"
                  ? "Pause"
                  : narration === "paused"
                    ? "Resume"
                    : "Listen to this chapter"}
            </span>
          </button>
          <button
            type="button"
            className="narration-btn narration-replay"
            data-testid="narration-replay-button"
            aria-label="Replay narration"
            onClick={replayNarration}
          >
            <RotateCcw size={15} />
          </button>
        </div>
        <p className="chapter-hint">
          {isTyping ? "Tap the story to reveal it all" : "End of chapter"}
        </p>
      </div>
    </div>
  );
}
