// Prettierをクライアントサイドで使うためのラッパー
// CDNからprettier/standaloneとprettier/parser-babelを動的import
export async function formatCodeWithPrettier(code: string): Promise<string> {
  if (typeof window === 'undefined') return code;
  // 公式推奨: standalone.js→parser-babel.jsの順でロード
  const win = window as any;
  if (!win.prettier) {
    try {
      await loadScript('https://unpkg.com/prettier@2.8.8/standalone.js');
    } catch (e) {
      alert('Prettier本体の読み込みに失敗: ' + (e instanceof Error ? e.message : String(e)));
      return code;
    }
  }
  if (
    !win.prettierPlugins ||
    !Array.isArray(win.prettierPlugins) ||
    win.prettierPlugins.length === 0
  ) {
    try {
      await loadScript('https://unpkg.com/prettier@2.8.8/parser-babel.js');
      // デバッグ: グローバル変数の状態を出力
      console.log('[Prettier debug] window.prettier:', win.prettier);
      console.log('[Prettier debug] window.prettierPlugins:', win.prettierPlugins);
      console.log('[Prettier debug] window.prettierPluginsBabel:', win.prettierPluginsBabel);
      // prettierPluginsBabelがあればprettierPluginsに代入（2.x系CDN対策）
      if (Array.isArray(win.prettierPluginsBabel) && win.prettierPluginsBabel.length > 0) {
        win.prettierPlugins = win.prettierPluginsBabel;
      }
    } catch (e) {
      alert('Prettierプラグインの読み込みに失敗: ' + (e instanceof Error ? e.message : String(e)));
      return code;
    }
  }
  let pluginsArr = win.prettierPlugins;
  if (!Array.isArray(pluginsArr)) {
    pluginsArr = Object.values(pluginsArr);
  }
  if (!win.prettier || !pluginsArr || pluginsArr.length === 0) {
    alert('Prettierのプラグインが正しく読み込まれていません。');
    return code;
  }
  try {
    return win.prettier.format(code, {
      parser: 'babel',
      plugins: pluginsArr,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
    });
  } catch (e) {
    alert('Prettier整形エラー: ' + (e instanceof Error ? e.message : String(e)));
    return code;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load ' + src));
    document.body.appendChild(script);
  });
}
