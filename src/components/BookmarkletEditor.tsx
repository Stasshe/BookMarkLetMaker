'use client';

import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiX } from 'react-icons/fi';
import { minify } from 'terser';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

const defaultCode = `// Example: Alert current page title
alert('Current page: ' + document.title);

// Example: Highlight all links
document.querySelectorAll('a').forEach(link => {
  link.style.backgroundColor = 'yellow';
  link.style.padding = '2px';
});`;

export function BookmarkletEditor() {
  // --- iframe consoleログ管理 ---
  const [iframeLogs, setIframeLogs] = useState<Array<{ type: string; value: string }>>([]);
  const [code, setCode] = useState(defaultCode);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.__bm_console) {
        setIframeLogs(logs => [...logs, { type: event.data.type, value: event.data.value }]);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // ...existing code...
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // --- ライブプレビュー用 ---
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [showIframeError, setShowIframeError] = useState(false);
  const injectCodeToIframe = (jsCode: string) => {
    if (!iframeRef.current || !iframeLoaded) return;
    try {
      const win = iframeRef.current.contentWindow;
      if (!win) return;
      // 既存のscriptタグを削除
      const scripts = win.document.querySelectorAll('script[data-bm]');
      scripts.forEach(s => s.remove());
      // consoleフック用スクリプト
      const hookScript = win.document.createElement('script');
      hookScript.setAttribute('data-bm', '1');
      hookScript.type = 'text/javascript';
      hookScript.text = `
        (function() {
          const send = (type, value) => {
            window.parent.postMessage({ __bm_console: true, type, value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value) }, '*');
          };
          ['log','dir'].forEach(fn => {
            const orig = console[fn];
            console[fn] = function(...args) {
              args.forEach(a => send(fn, a));
              orig.apply(console, args);
            };
          });
        })();
      `;
      win.document.body.appendChild(hookScript);
      // 新しいユーザーコードスクリプト
      const script = win.document.createElement('script');
      script.setAttribute('data-bm', '1');
      script.type = 'text/javascript';
      script.text = jsCode;
      win.document.body.appendChild(script);
      setIframeError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setIframeError(e.message);
      } else {
        setIframeError(String(e));
      }
    }
  };
  // 全画面プレビュー用
  const [isFullscreen, setIsFullscreen] = useState(false);
  // 全画面時のescキー対応
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);
  // テストページのURL
  const testPageUrl = '/bookmarklet-test.html';

  useEffect(() => {
    if (!editorRef.current) return;

    const handleDocChange = (update: { docChanged: boolean; state: EditorState }) => {
      if (update.docChanged) {
        setCode(update.state.doc.toString());
      }
    };

    const extensions = [basicSetup, javascript(), EditorView.updateListener.of(handleDocChange)];
    if (theme === 'dark') {
      extensions.push(oneDark);
    }
    const state = EditorState.create({
      doc: code,
      extensions,
    });
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });
    viewRef.current = view;

    // Alt+Up/DownでスクロールしないようにpreventDefault
    const handler = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
      }
    };
    const dom = view.dom;
    dom.addEventListener('keydown', handler);

    return () => {
      dom.removeEventListener('keydown', handler);
      view.destroy();
    };
  }, [theme]);

  const createBookmarklet = async () => {
    if (!code.trim()) return;

    setIsProcessing(true);
    try {
      const result = await minify(code, {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 3,
          unsafe: true,
          unsafe_arrows: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_undefined: true,
        },
        mangle: {
          toplevel: true,
        },
        format: {
          comments: false,
          beautify: false,
        },
        ecma: 2020,
        toplevel: true,
        keep_classnames: false,
        keep_fnames: false,
      });

      const minifiedCode = result.code || code;
      const wrappedCode = `javascript:(function(){${minifiedCode}})();`;
      setBookmarkletCode(wrappedCode);
      injectCodeToIframe(code);
    } catch (error) {
      console.error('Minification error:', error);
      const wrappedCode = `javascript:(function(){${code}})();`;
      setBookmarkletCode(wrappedCode);
      injectCodeToIframe(code);
    }
    setIsProcessing(false);
  };

  const copyToClipboard = async () => {
    if (!bookmarkletCode) return;

    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const executeBookmarklet = () => {
    if (!bookmarkletCode) return;

    try {
      const codeToExecute = bookmarkletCode.replace('javascript:', '');
      eval(codeToExecute);
    } catch (error) {
      console.error('Execution error:', error);
      alert('Error executing bookmarklet: ' + error);
    }
  };
  const loadExample = (exampleCode: string) => {
    setCode(exampleCode);
    if (viewRef.current) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: exampleCode,
        },
      });
      viewRef.current.dispatch(transaction);
      // フォーカス維持
      viewRef.current.focus();
    }
  };

  const examples = [
    {
      name: 'Page Info',
      code: `const info = {
  title: document.title,
  url: window.location.href,
  domain: window.location.hostname,
  links: document.querySelectorAll('a').length,
  images: document.querySelectorAll('img').length
};

alert(JSON.stringify(info, null, 2));`,
    },
    {
      name: 'Highlight Text',
      code: `const searchTerm = prompt('Enter text to highlight:');
if (searchTerm) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
      const parent = node.parentNode;
      const highlighted = document.createElement('mark');
      highlighted.style.backgroundColor = 'yellow';
      highlighted.textContent = node.textContent;
      parent.replaceChild(highlighted, node);
    }
  }
}`,
    },
    {
      name: 'Remove Ads',
      code: `const selectors = [
  '[class*="ad"]',
  '[id*="ad"]',
  '[class*="banner"]',
  '[class*="popup"]',
  '.advertisement'
];

selectors.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = 'none';
  });
});

console.log('Ad elements hidden');`,
    },
  ];

  // 文字数・バイト数計算用関数
  const getByteLength = (str: string) => new TextEncoder().encode(str).length;

  return (
    <>
      {/* 全画面プレビュー */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center">
          <button
            className="absolute top-6 right-6 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors"
            onClick={() => setIsFullscreen(false)}
            aria-label="全画面を閉じる"
          >
            <FiX size={28} />
          </button>
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <iframe
              ref={iframeRef}
              src={testPageUrl}
              title="Bookmarklet Test Page Fullscreen"
              className="w-[90vw] h-[90vh] bg-white rounded-lg shadow-lg border"
              style={{ background: 'white' }}
              onLoad={() => {
                setIframeLoaded(true);
                injectCodeToIframe(code);
              }}
            />
            <button
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              onClick={() => injectCodeToIframe(code)}
            >
              ブックマークレットを手動で実行
            </button>
          </div>
          {/* iframeログ・エラーも全画面時に表示 */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-[min(700px,90vw)]">
            {iframeLogs.length > 0 && (
              <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded p-2 text-xs max-h-40 overflow-auto">
                <div className="font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  Console Output
                </div>
                {iframeLogs.map((log, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-mono text-blue-700 dark:text-blue-300">[{log.type}]</span>{' '}
                    <span className="break-all">{log.value}</span>
                  </div>
                ))}
              </div>
            )}
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
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Section */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-card-foreground">JavaScript Editor</h2>
                <button
                  onClick={createBookmarklet}
                  disabled={isProcessing || !code.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Create Bookmarklet/Run'}
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

            {/* Examples */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Examples</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {examples.map(example => (
                  <button
                    key={example.name}
                    onClick={() => loadExample(example.code)}
                    className="p-3 text-left bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  >
                    <div className="font-medium text-sm">{example.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-card-foreground">
                  Live Preview (Test Page)
                </h2>
                <button
                  className="ml-2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => setIsFullscreen(true)}
                  aria-label="全画面表示"
                >
                  <FiMaximize2 size={22} />
                </button>
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
                  <div className="font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                    Console Output
                  </div>
                  {iframeLogs.map((log, i) => (
                    <div key={i} className="mb-1">
                      <span className="font-mono text-blue-700 dark:text-blue-300">
                        [{log.type}]
                      </span>{' '}
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
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                Generated Bookmarklet Code
              </h2>
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
                    <div className="mt-2 text-xs text-muted-foreground">
                      ※ 全文はクリップボードにコピーされます
                    </div>
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
                    Write your JavaScript code and click Create Bookmarklet to generate the
                    bookmarklet.
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">How to Use</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p>エディタでJavaScriptコードを編集すると、右のテストページに即時反映されます</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p>Click Create Bookmarklet to minify and wrap your code</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p>Copy the generated bookmarklet code</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    4
                  </div>
                  <p>Create a new bookmark in your browser and paste the code as the URL</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    5
                  </div>
                  <p>Click the bookmark on any webpage to execute your code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
