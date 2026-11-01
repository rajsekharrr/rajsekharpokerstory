import { useEffect, useRef, useState } from "react";

const ALL_READ_SAY = "Now you know who’s sitting across from you.";

export default function DealerCard({ dealerName, firstDeal }) {
  const [hoveredName, setHoveredName] = useState(null);
  const [foldName, setFoldName] = useState(null);
  const [allRead, setAllRead] = useState(false);
  const foldTimer = useRef(null);

  useEffect(() => {
    const onHover = (e) => setHoveredName(e.detail);
    const onFold = (e) => {
      setFoldName(e.detail);
      clearTimeout(foldTimer.current);
      foldTimer.current = setTimeout(() => setFoldName(null), 4500);
    };
    const onAllRead = () => setAllRead(true);
    window.addEventListener("dealer-hover", onHover);
    window.addEventListener("dealer-fold", onFold);
    window.addEventListener("dealer-allread", onAllRead);
    return () => {
      window.removeEventListener("dealer-hover", onHover);
      window.removeEventListener("dealer-fold", onFold);
      window.removeEventListener("dealer-allread", onAllRead);
      clearTimeout(foldTimer.current);
    };
  }, []);

  const cap = (n) => n.charAt(0).toUpperCase() + n.slice(1);

  let say;
  if (allRead) say = ALL_READ_SAY;
  else if (foldName) say = `${cap(foldName)} doesn’t know that word.`;
  else if (hoveredName) say = `Curious about ${hoveredName}? Place your bet.`;
  else if (firstDeal)
    say = `Six players. Six chapters. One story. We start from the dealer — ${dealerName} wears the D. Click him to begin.`;
  else
    say = `The deal moves clockwise — ${dealerName} wears the D now. Click him for the next chapter.`;

  return (
    <aside className="dealer-card" data-testid="dealer-card">
      <span className="dealer-face" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M2.5 6.5 10 10.6V9.8c0-.5.4-.9.9-.9h2.2c.5 0 .9.4.9.9v.8l7.5-4.1v11L14 13.4v.8c0 .5-.4.9-.9.9h-2.2a.9.9 0 0 1-.9-.9v-.8L2.5 17.5v-11Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="dealer-bubble" data-testid="dealer-say" key={say}>
        {say}
      </span>
    </aside>
  );
}
