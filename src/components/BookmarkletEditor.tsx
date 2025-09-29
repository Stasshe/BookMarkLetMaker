'use client';

import { javascript } from '@codemirror/lang-javascript';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef, useState } from 'react';
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
  const { theme } = useTheme();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [code, setCode] = useState(defaultCode);
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // バウンス中フラグ
  const [isDebouncing, setIsDebouncing] = useState(false);

  // バウンス用タイマーref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const handleDocChange = (update: { docChanged: boolean; state: EditorState }) => {
      if (update.docChanged) {
        setCode(update.state.doc.toString());
        // バウンス: 3秒間変更がなければcreateBookmarklet実行
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        setIsDebouncing(true);
        debounceTimer.current = setTimeout(() => {
          createBookmarklet();
          setIsDebouncing(false);
        }, 3000);
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

    return () => {
      view.destroy();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setIsDebouncing(false);
    };
  }, [theme, code]);

  const createBookmarklet = async () => {
    if (!code.trim()) return;

    setIsProcessing(true);
    try {
      const result = await minify(code, {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
        mangle: false,
        format: {
          comments: false,
        },
      });

      const minifiedCode = result.code || code;
      const wrappedCode = `javascript:(function(){${minifiedCode}})();`;
      setBookmarkletCode(wrappedCode);
    } catch (error) {
      console.error('Minification error:', error);
      const wrappedCode = `javascript:(function(){${code}})();`;
      setBookmarkletCode(wrappedCode);
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

        {/* Output Section */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-card-foreground mb-4">
              Generated Bookmarklet
            </h2>
            {/* バウンス中アニメーション */}
            {isDebouncing && (
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-primary">自動生成まで3秒待機中...</span>
              </div>
            )}
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
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button
                    onClick={executeBookmarklet}
                    className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors"
                  >
                    Test Execute
                  </button>
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
                <p>Write or paste your JavaScript code in the editor</p>
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

          {/* Features */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Code minification</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Comment removal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-encapsulation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Syntax highlighting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live testing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Dark/Light theme</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
