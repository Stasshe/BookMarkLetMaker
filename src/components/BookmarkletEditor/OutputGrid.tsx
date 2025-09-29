// 出力・操作
type OutputGridProps = {
  bookmarkletCode: string;
  copySuccess: boolean;
  copyToClipboard: () => void;
  executeBookmarklet: () => void;
  getByteLength: (str: string) => number;
};

export default function OutputGrid({
  bookmarkletCode,
  copySuccess,
  copyToClipboard,
  executeBookmarklet,
  getByteLength,
}: OutputGridProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-card-foreground mb-4">Generated Bookmarklet Code</h2>
      {bookmarkletCode ? (
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md border">
            <code className="text-sm break-all text-muted-foreground">
              {bookmarkletCode.length > 120
                ? `${bookmarkletCode.slice(0, 120)}...`
                : bookmarkletCode}
            </code>
          </div>
          {bookmarkletCode.length > 120 && (
            <div className="mt-2 text-xs text-muted-foreground">※ 全文はクリップボードにコピーされます</div>
          )}
          {/* 文字数・バイト数表示 */}
          <div className="mt-2 text-xs text-muted-foreground flex gap-4">
            <span>文字数: {bookmarkletCode.length}文字</span>
            <span>容量: {getByteLength(bookmarkletCode)}バイト</span>
          </div>
          <div className="mt-6">
            <div className="text-sm font-semibold text-card-foreground mb-2">操作</div>
            <div className="flex flex-col gap-4">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60"
                style={{ letterSpacing: '0.02em' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16h8a2 2 0 002-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
                  />
                </svg>
                {copySuccess ? 'コピーしました！' : 'クリップボードにコピー'}
              </button>
              <button
                onClick={executeBookmarklet}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-lg bg-accent text-accent-foreground shadow hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/60"
                style={{ letterSpacing: '0.02em' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
                その場で実行
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">📝</div>
          <p>
            Write your JavaScript code and click Create Bookmarklet to generate the bookmarklet.
          </p>
        </div>
      )}
    </div>
  );
}
