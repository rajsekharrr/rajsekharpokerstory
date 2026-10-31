import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export default function StoryOverlay({ player, onClose }) {
  const [typed, setTyped] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [closing, setClosing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const text = player.story;
    setTyped("");
    setIsTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      if (i >= text.length) {
        clearInterval(timerRef.current);
        setTyped(text);
        setIsTyping(false);
      } else {
        setTyped(text.slice(0, i));
      }
    }, 26);
    return () => clearInterval(timerRef.current);
  }, [player]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
    clearInterval(timerRef.current);
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
        <p className="chapter-hint">
          {isTyping ? "Tap the story to reveal it all" : "End of chapter"}
        </p>
      </div>
    </div>
  );
}
