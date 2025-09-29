// エディタ部分
type EditorGridProps = {
  code: string;
  setCode: (v: string) => void;
  editorRef: React.RefObject<HTMLDivElement>;
  createBtnRef: React.RefObject<HTMLButtonElement>;
  createBookmarklet: () => void;
  isProcessing: boolean;
};

export default function EditorGrid({
  code,
  editorRef,
  createBtnRef,
  createBookmarklet,
  isProcessing,
}: EditorGridProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-card-foreground">JavaScript Editor</h2>
        <button
          ref={createBtnRef}
          onClick={createBookmarklet}
          disabled={isProcessing || !code.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Create Bookmarklet'}
        </button>
      </div>
      <div className="border border-border rounded-md overflow-hidden">
        <div
          ref={editorRef}
          className="min-h-[400px] max-h-[600px] overflow-auto"
          style={{ maxHeight: 600 }}
        />
      </div>
    </div>
  );
}
