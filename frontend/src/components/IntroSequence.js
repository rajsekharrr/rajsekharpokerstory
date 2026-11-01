import { useEffect, useRef, useState } from "react";
import { playCardShuffle } from "@/utils/sounds";

const LINES = [
  { text: "Welcome to the table.", style: "line-1", pause: 1500 },
  {
    text: "Every player here has lived a chapter of one man’s story.",
    style: "line-2",
    pause: 1500,
  },
  { text: "Place your bets carefully.", style: "line-3", pause: 1000 },
  { text: "— Rajsekhar’s Table, Est. 2001", style: "line-4", pause: 2000 },
];

export default function IntroSequence({ onFadeStart, onGone }) {
  const [step, setStep] = useState(-1);
  const [chars, setChars] = useState(0);
  const [fading, setFading] = useState(false);
  const timers = useRef([]);
  const doneRef = useRef(false);

  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  useEffect(() => {
    playCardShuffle();
    later(() => setStep(0), 1700);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step < 0 || step >= LINES.length) return;
    const line = LINES[step];
    if (chars < line.text.length) {
      const ch = line.text[chars];
      const extra =
        ch === "." || ch === "!" || ch === "?"
          ? 300
          : ch === "," || ch === "—" || ch === "’"
            ? 150
            : 0;
      later(() => setChars(chars + 1), 55 + extra);
    } else {
      later(
        () => {
          setChars(0);
          setStep(step + 1);
        },
        line.pause,
      );
    }
  }, [step, chars]);

  useEffect(() => {
    if (step !== LINES.length || doneRef.current) return;
    doneRef.current = true;
    playCardShuffle();
    setFading(true);
    onFadeStart(false);
    later(onGone, 1050);
  }, [step]);

  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    onFadeStart(true);
    later(onGone, 1050);
  };

  return (
    <div
      className={`intro${fading ? " is-fading" : ""}`}
      data-testid="intro-sequence"
    >
      <span className="intro-spotlight" aria-hidden="true" />
      <button
        type="button"
        className="intro-skip"
        data-testid="intro-skip"
        onClick={skip}
      >
        Skip intro
      </button>
      <div className="intro-lines">
        {LINES.map((line, i) =>
          i <= step ? (
            <p key={i} className={`intro-line ${line.style}`}>
              {line.text.slice(0, i < step ? line.text.length : chars)}
              {i === step && chars < line.text.length && (
                <span className="intro-cursor" aria-hidden="true" />
              )}
            </p>
          ) : null,
        )}
      </div>
    </div>
  );
}
