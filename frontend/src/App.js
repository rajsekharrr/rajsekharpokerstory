import { useCallback, useState } from "react";
import { Spade, X } from "lucide-react";
import PokerTable from "@/components/PokerTable";
import StoryOverlay from "@/components/StoryOverlay";
import FoldToast from "@/components/FoldToast";
import { PLAYERS } from "@/data/players";
import "@/App.css";

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const clearToast = useCallback(() => setToast(null), []);

  const selected = PLAYERS.find((p) => p.id === selectedId) ?? null;

  const toggleSeat = (id) => setSelectedId((cur) => (cur === id ? null : id));

  const handleBet = () => {
    if (selected) setChapterOpen(true);
  };

  const handleFold = () => {
    if (!selected) return;
    setToast({ id: Date.now(), player: selected });
  };

  return (
    <div className="felt-page">
      <span className="ambient ambient-blue-top" aria-hidden="true" />
      <span className="ambient ambient-blue-bottom" aria-hidden="true" />
      <span className="ambient ambient-gold" aria-hidden="true" />
      <span className="page-grain" aria-hidden="true" />

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
          onSelectSeat={toggleSeat}
        />

        <div
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
      </main>

      {chapterOpen && selected && (
        <StoryOverlay player={selected} onClose={() => setChapterOpen(false)} />
      )}
      {toast && (
        <FoldToast key={toast.id} player={toast.player} onDone={clearToast} />
      )}
    </div>
  );
}
