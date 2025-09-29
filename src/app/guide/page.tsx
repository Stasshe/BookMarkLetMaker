import Link from 'next/link';

export default function MinifyGuide() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minifyオプション詳細ガイド</h1>
          <p className="text-muted-foreground max-w-2xl">
            このページでは、Bookmarklet
            Creatorの「Minifyオプション詳細設定」で利用できる各項目について、分かりやすく解説します。
          </p>
          <div className="mt-4">
            <Link href="/">
              <span className="text-primary hover:underline">← トップページに戻る</span>
            </Link>
          </div>
        </header>
        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">compress</h2>
            <p className="mb-2 text-muted-foreground">
              JavaScriptコードの圧縮に関する細かな設定です。主な項目：
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <b>drop_console</b>:{' '}
                <span className="text-muted-foreground">
                  console.logなどのデバッグ出力を削除します。
                </span>
              </li>
              <li>
                <b>drop_debugger</b>:{' '}
                <span className="text-muted-foreground">debugger文を削除します。</span>
              </li>
              <li>
                <b>unsafe</b>:{' '}
                <span className="text-muted-foreground">
                  一部の安全でない最適化を有効化します（副作用のないコード向け）。
                </span>
              </li>
              <li>
                <b>unsafe_arrows</b>:{' '}
                <span className="text-muted-foreground">
                  アロー関数の変換をより積極的に行います。
                </span>
              </li>
              <li>
                <b>unsafe_methods</b>:{' '}
                <span className="text-muted-foreground">
                  オブジェクトメソッドの最適化を強化します。
                </span>
              </li>
              <li>
                <b>unsafe_proto</b>:{' '}
                <span className="text-muted-foreground">__proto__の最適化を有効化します。</span>
              </li>
              <li>
                <b>unsafe_undefined</b>:{' '}
                <span className="text-muted-foreground">undefinedの扱いを最適化します。</span>
              </li>
              <li>
                <b>passes</b>:{' '}
                <span className="text-muted-foreground">
                  圧縮処理の繰り返し回数（1以上の整数）。回数を増やすと圧縮率が上がる場合があります。
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">mangle</h2>
            <p className="mb-2 text-muted-foreground">
              変数名やプロパティ名の難読化・短縮に関する設定です。主な項目：
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <b>toplevel</b>:{' '}
                <span className="text-muted-foreground">
                  トップレベルの変数・関数名も短縮します。
                </span>
              </li>
              <li>
                <b>properties</b>:{' '}
                <span className="text-muted-foreground">
                  オブジェクトのプロパティ名も短縮します。
                </span>
              </li>
              <li>
                <b>keep_classnames</b>:{' '}
                <span className="text-muted-foreground">
                  クラス名を保持します（難読化しません）。
                </span>
              </li>
              <li>
                <b>keep_fnames</b>:{' '}
                <span className="text-muted-foreground">
                  関数名を保持します（難読化しません）。
                </span>
              </li>
              <li>
                <b>module</b>:{' '}
                <span className="text-muted-foreground">
                  ESモジュールとして扱い、最適化します。
                </span>
              </li>
              <li>
                <b>safari10</b>:{' '}
                <span className="text-muted-foreground">
                  Safari 10対応のためのワークアラウンドを有効化します。
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">format</h2>
            <p className="mb-2 text-muted-foreground">出力コードの整形に関する設定です。</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <b>comments</b>:{' '}
                <span className="text-muted-foreground">コメントを残すかどうか。</span>
              </li>
              <li>
                <b>beautify</b>:{' '}
                <span className="text-muted-foreground">
                  可読性重視で整形出力する（通常は無効推奨）。
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">その他のオプション</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <b>ecma</b>:{' '}
                <span className="text-muted-foreground">
                  対応するECMAScriptバージョン（例: 5, 2015, 2020など）。
                </span>
              </li>
              <li>
                <b>toplevel</b>:{' '}
                <span className="text-muted-foreground">
                  トップレベルの変数・関数を最適化します。
                </span>
              </li>
              <li>
                <b>keep_classnames</b>:{' '}
                <span className="text-muted-foreground">クラス名を保持します。</span>
              </li>
              <li>
                <b>keep_fnames</b>:{' '}
                <span className="text-muted-foreground">関数名を保持します。</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
