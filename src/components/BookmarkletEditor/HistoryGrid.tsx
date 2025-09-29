// 履歴一覧
import { HistoryList } from '@/components/HistoryList';

type HistoryGridProps = {
  history: any[];
  historyLoading: boolean;
  historyError: string | null;
  historyTitle: string;
  setHistoryTitle: (v: string) => void;
  code: string;
  saveToHistory: (code: string, bookmarkletCode: string) => void;
  handleHistorySelect: (item: any) => void;
  handleHistoryDelete: (id: string) => void;
  bookmarkletCode: string;
};

export default function HistoryGrid({
  history,
  historyLoading,
  historyError,
  historyTitle,
  setHistoryTitle,
  code,
  saveToHistory,
  handleHistorySelect,
  handleHistoryDelete,
  bookmarkletCode,
}: HistoryGridProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        履歴
        <span className="text-xs text-muted-foreground font-normal">（最大100件程度）</span>
      </h3>
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          className="flex-1 px-2 py-1 border rounded text-sm bg-background text-foreground"
          placeholder="タイトル（省略可）"
          value={historyTitle}
          onChange={e => setHistoryTitle(e.target.value)}
          maxLength={32}
        />
        <button
          type="button"
          className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-xs font-semibold disabled:opacity-50"
          disabled={!code.trim()}
          onClick={() => saveToHistory(code, bookmarkletCode)}
        >
          履歴に保存
        </button>
      </div>
      {historyLoading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">読み込み中...</div>
      ) : historyError ? (
        <div className="text-destructive text-sm py-8 text-center">{historyError}</div>
      ) : (
        <HistoryList
          items={history}
          onSelect={handleHistorySelect}
          onDelete={handleHistoryDelete}
        />
      )}
    </div>
  );
}
