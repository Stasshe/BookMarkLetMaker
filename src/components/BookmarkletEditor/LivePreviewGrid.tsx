// ライブプレビュー
import { FiMaximize2 } from 'react-icons/fi';

type LivePreviewGridProps = {
  code: string;
  runInIframe: () => void;
  setIsFullscreen: (v: boolean) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  testPageUrl: string;
  iframeLoaded: boolean;
  setIframeLoaded: (v: boolean) => void;
  iframeLogs: Array<{ type: string; value: string }>;
  iframeError: string | null;
  showIframeError: boolean;
  setShowIframeError: (v: (prev: boolean) => boolean) => void;
};

export default function LivePreviewGrid({
  code,
  runInIframe,
  setIsFullscreen,
  iframeRef,
  testPageUrl,
  setIframeLoaded,
  iframeLogs,
  iframeError,
  showIframeError,
  setShowIframeError,
}: LivePreviewGridProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-card-foreground">Live Preview (Test Page)</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={runInIframe}
            disabled={!code.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Run (Preview)
          </button>
          <button
            className="ml-2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            onClick={() => setIsFullscreen(true)}
            aria-label="全画面表示"
          >
            <FiMaximize2 size={22} />
          </button>
        </div>
      </div>
      <div className="w-full h-[600px] border rounded-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          src={testPageUrl}
          title="Bookmarklet Test Page"
          className="w-full h-full bg-white"
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
      {/* iframe consoleログ出力 */}
      {iframeLogs.length > 0 && (
        <div className="mt-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded p-2 text-xs max-h-40 overflow-auto">
          <div className="font-bold mb-1 text-neutral-700 dark:text-neutral-300">Console Output</div>
          {iframeLogs.map((log, i) => (
            <div key={i} className="mb-1">
              <span className="font-mono text-blue-700 dark:text-blue-300">[{log.type}]</span>{' '}
              <span className="break-all">{log.value}</span>
            </div>
          ))}
        </div>
      )}
      {/* エラーログ（折りたたみ） */}
      {iframeError && (
        <div className="mt-3">
          <button
            className="text-xs text-red-600 underline mb-1"
            onClick={() => setShowIframeError(v => !v)}
          >
            {showIframeError ? 'エラー詳細を隠す' : 'エラー詳細を表示'}
          </button>
          {showIframeError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded p-2 text-xs whitespace-pre-wrap">
              {iframeError}
            </div>
          )}
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">
        エディタのコードは即時でテストページに反映されます（minifyせず・デバウンス無し）。
      </div>
    </div>
  );
}
