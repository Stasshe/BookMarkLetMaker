/* eslint-disable */
'use client';

import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, basicSetup } from 'codemirror';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { minify } from 'terser';

import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import {
  BookmarkletHistoryItem,
  addHistory,
  deleteHistory,
  getAllHistory,
} from '@/utils/bookmarkletHistoryDB';
import EditorGrid from './BookmarkletEditor/EditorGrid';
import ExamplesGrid from './BookmarkletEditor/ExamplesGrid';
import HistoryGrid from './BookmarkletEditor/HistoryGrid';
import InstructionsGrid from './BookmarkletEditor/InstructionsGrid';
import LivePreviewGrid from './BookmarkletEditor/LivePreviewGrid';
import MinifyOptionsGrid from './BookmarkletEditor/MinifyOptionsGrid';
import OutputGrid from './BookmarkletEditor/OutputGrid';

import { QRCodeGenerator } from './BookmarkletEditor/QRCodeGenerator';

const defaultCode = `// Example: Alert current page title
alert('Current page: ' + document.title);

// Example: Highlight all links
document.querySelectorAll('a').forEach(link => {
  link.style.backgroundColor = 'yellow';
  link.style.padding = '2px';
});`;

export function BookmarkletEditor() {
  // --- Minifyオプション管理 ---
  const [showMinifyOptions, setShowMinifyOptions] = useState(false); // 初期状態: 閉じている
  // --- 履歴管理 ---
  const [history, setHistory] = useState<BookmarkletHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyTitle, setHistoryTitle] = useState('');

  // 履歴取得
  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const items = await getAllHistory();
      setHistory(items);
    } catch (e) {
      setHistoryError('履歴の取得に失敗しました');
    }
    setHistoryLoading(false);
  };
  useEffect(() => {
    loadHistory();
  }, []);

  // 履歴保存
  const saveToHistory = async (code: string, bookmarkletCode: string) => {
    let title = historyTitle.trim();
    if (!title) {
      const firstLine = (code || '').split('\n')[0] || '';
      title = firstLine.slice(0, 32) || '無題';
    }
    await addHistory({ title, code, bookmarkletCode });
    setHistoryTitle('');
    await loadHistory();
  };

  // 履歴からエディタへ復元
  const handleHistorySelect = (item: BookmarkletHistoryItem) => {
    if (!window.confirm('この履歴の内容でエディタを上書きします。よろしいですか？')) return;
    if (viewRef.current) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: item.code,
        },
      });
      viewRef.current.dispatch(transaction);
      viewRef.current.focus();
    }
    setCode(item.code);
  };

  // 履歴削除
  const handleHistoryDelete = async (id: string) => {
    await deleteHistory(id);
    await loadHistory();
  };
  const getDefaultMinifyOptions = () => ({
    compress: {
      arrows: true,
      booleans: true,
      collapse_vars: true,
      comparisons: true,
      computed_props: true,
      conditionals: true,
      dead_code: true,
      drop_console: true,
      drop_debugger: true,
      evaluate: true,
      hoist_funs: true,
      hoist_props: true,
      hoist_vars: true,
      if_return: true,
      inline: true,
      join_vars: true,
      keep_fargs: false,
      keep_fnames: false,
      keep_infinity: false,
      loops: true,
      negate_iife: true,
      passes: 3,
      properties: true,
      reduce_funcs: true,
      reduce_vars: true,
      sequences: true,
      side_effects: true,
      switches: true,
      toplevel: true,
      typeofs: true,
      unsafe: true,
      unsafe_arrows: true,
      unsafe_comps: true,
      unsafe_Function: true,
      unsafe_math: true,
      unsafe_methods: true,
      unsafe_proto: true,
      unsafe_regexp: true,
      unsafe_undefined: true,
      unused: true,
    },
    mangle: {
      toplevel: true,
      properties: true,
      keep_classnames: false,
      keep_fnames: false,
      module: true,
      safari10: false,
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
  const [minifyOptions, setMinifyOptions] = useState(getDefaultMinifyOptions());

  // オプション変更ハンドラ
  const handleMinifyOptionChange = (group: string, key: string, value: any) => {
    setMinifyOptions(prev => {
      if (group === 'root') {
        return { ...prev, [key]: value };
      }
      if (group === 'compress' || group === 'mangle' || group === 'format') {
        return { ...prev, [group]: { ...prev[group], [key]: value } };
      }
      return prev;
    });
  };
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
  const editorRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const viewRef = useRef<EditorView | null>(null);
  // ...existing code...
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // --- ボタンアニメーション用 ---
  const runBtnRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  const createBtnRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;

  // コーポレート感重視の上品なボタンアニメーション
  const animateButton = (ref: React.RefObject<HTMLButtonElement | null>) => {
    if (!ref.current) return;
    const el = ref.current;
    const originalBg = el.style.backgroundColor;
    gsap.fromTo(
      el,
      {
        scale: 1,
        boxShadow: '0 0 0px #0000',
        backgroundColor: originalBg,
      },
      {
        scale: 1.07,
        boxShadow: '0 4px 24px 0 #38bdf8cc',
        backgroundColor: '#e0f2fe',
        duration: 0.13,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
        onComplete: () => {
          gsap.to(el, {
            scale: 1,
            boxShadow: '0 0 0px #0000',
            backgroundColor: originalBg,
            duration: 0.13,
          });
        },
      }
    );
  };

  // iframeリセットボタン用
  const handleReloadIframe = () => {
    setIframeLogs([]);
    setIframeError(null);
    setIframeLoaded(false);
    if (iframeRef.current) {
      iframeRef.current.src = testPageUrl;
    }
  };
  const iframeRef = useRef<HTMLIFrameElement>(null) as React.RefObject<HTMLIFrameElement>;
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

  // Bookmarklet生成のみ
  const createBookmarklet = async () => {
    animateButton(createBtnRef);
    if (!code.trim()) return;
    setIsProcessing(true);
    let wrappedCode = '';
    try {
      const result = await minify(code, {
        ...minifyOptions,
        compress: { ...minifyOptions.compress },
        mangle: { ...minifyOptions.mangle },
        format: { ...minifyOptions.format },
        ecma: minifyOptions.ecma as any,
      });
      const minifiedCode = result.code || code;
      wrappedCode = `javascript:(function(){${minifiedCode}})();`;
      setBookmarkletCode(wrappedCode);
    } catch (error) {
      console.error('Minification error:', error);
      wrappedCode = `javascript:(function(){${code}})();`;
      setBookmarkletCode(wrappedCode);
    }
    setIsProcessing(false);
  };

  // iframeへの注入のみ
  const runInIframe = () => {
    animateButton(runBtnRef);
    // Reset logs and error before each run
    setIframeLogs([]);
    setIframeError(null);
    // If iframe is not loaded, force reload
    if (!iframeLoaded && iframeRef.current) {
      setIframeLoaded(false);
      iframeRef.current.src = testPageUrl;
      // injectCodeToIframe will be called onLoad
    } else {
      injectCodeToIframe(code);
    }
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
      <MinifyOptionsGrid
        show={showMinifyOptions}
        setShow={setShowMinifyOptions}
        minifyOptions={minifyOptions}
        handleMinifyOptionChange={handleMinifyOptionChange}
        getDefaultMinifyOptions={getDefaultMinifyOptions}
        setMinifyOptions={setMinifyOptions}
      />
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
          <div className="space-y-6">
            <EditorGrid
              code={code}
              setCode={setCode}
              editorRef={editorRef}
              createBtnRef={createBtnRef}
              createBookmarklet={createBookmarklet}
              isProcessing={isProcessing}
            />
            <ExamplesGrid examples={examples} loadExample={loadExample} />
            <HistoryGrid
              history={history}
              historyLoading={historyLoading}
              historyError={historyError}
              historyTitle={historyTitle}
              setHistoryTitle={setHistoryTitle}
              code={code}
              saveToHistory={saveToHistory}
              handleHistorySelect={handleHistorySelect}
              handleHistoryDelete={handleHistoryDelete}
              bookmarkletCode={bookmarkletCode}
            />
            {/* QRコードを左側に移動 */}
            <div className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div className="font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                QRコードで共有
              </div>
              <QRCodeGenerator value={bookmarkletCode} size={180} />
              <div className="text-xs text-neutral-500">
                スマートフォンでスキャンしてブックマークレットを追加できます
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <LivePreviewGrid
              code={code}
              runInIframe={runInIframe}
              setIsFullscreen={setIsFullscreen}
              iframeRef={iframeRef}
              testPageUrl={testPageUrl}
              iframeLoaded={iframeLoaded}
              setIframeLoaded={setIframeLoaded}
              iframeLogs={iframeLogs}
              iframeError={iframeError}
              showIframeError={showIframeError}
              setShowIframeError={setShowIframeError}
              runBtnRef={runBtnRef}
              onReloadIframe={handleReloadIframe}
            />
            <OutputGrid
              bookmarkletCode={bookmarkletCode}
              copySuccess={copySuccess}
              copyToClipboard={copyToClipboard}
              executeBookmarklet={executeBookmarklet}
              getByteLength={getByteLength}
            />
            <InstructionsGrid />
          </div>
        </div>
      </div>
    </>
  );
}
