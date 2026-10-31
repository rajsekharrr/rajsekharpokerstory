import { useEffect, useState } from "react";
import { Ban } from "lucide-react";

export default function FoldToast({ player, onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2600);
    const t2 = setTimeout(onDone, 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`fold-toast${leaving ? " is-leaving" : ""}`}
      data-testid="fold-toast"
      role="alert"
    >
      <span className="toast-icon" aria-hidden="true">
        <Ban size={17} strokeWidth={2.4} />
      </span>
      <span className="toast-copy">
        <strong data-testid="fold-toast-player">{player.name} folded.</strong>
        <span>{player.foldMessage}</span>
      </span>
    </div>
  );
}
