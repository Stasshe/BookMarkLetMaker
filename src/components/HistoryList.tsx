import type { BookmarkletHistoryItem } from '@/utils/bookmarkletHistoryDB';

export type HistoryListProps = {
  items: BookmarkletHistoryItem[];
  onSelect: (item: BookmarkletHistoryItem) => void;
  onDelete: (id: string) => void;
};

export function HistoryList({ items, onSelect, onDelete }: HistoryListProps) {
  if (items.length === 0) {
    return <div className="text-muted-foreground text-sm text-center py-8">履歴はありません</div>;
  }
  return (
    <div className="divide-y divide-border">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center justify-between py-3 px-2 hover:bg-muted/60 rounded transition-colors"
        >
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(item)}>
            <div className="font-medium text-card-foreground truncate">{item.title || '無題'}</div>
            <div className="text-xs text-muted-foreground truncate">
              {item.code.slice(0, 60)}
              {item.code.length > 60 ? '...' : ''}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
          <button
            className="ml-4 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
            onClick={() => onDelete(item.id)}
            aria-label="履歴を削除"
            type="button"
          >
            削除
          </button>
        </div>
      ))}
    </div>
  );
}
