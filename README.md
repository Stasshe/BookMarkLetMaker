tailwind v3.
## BookMarkLetMaker

JavaScriptブックマークレットを簡単に作成・テストできる静的Webアプリです。

### 主な特徴
- **Tailwind CSS v3** によるスタイリング
- **GSAP**による必要最小限のアニメーション（framer-motionは未使用）
- **CodeMirror**ベースのJavaScriptエディタ搭載
- **Terser**によるminify機能
- **ライブプレビュー**（テスト用iframeで即時反映）
- **ダーク/ライトテーマ切替**
- **静的サイト**（Next.js Static Export）
- **動的パラメータ・SSR未使用**

### 使い方
1. JavaScriptコードをエディタで編集します。
2. 右側のテストページ（iframe）で即時プレビューされます。
3. 「Create Bookmarklet」ボタンでminify＆bookmarkletコード生成。
4. 「Copy to Clipboard」でコードをコピー。
5. ブラウザのブックマークに新規作成し、URL欄に貼り付けて利用。

#### サンプル例
エディタ下部の「Examples」からサンプルコードをワンクリックで挿入できます。

### 注意事項
- アニメーションはGSAPのみ利用可能です。
- framer-motionは使いません。
- 静的サイトのため、動的ルーティングやパラメータは利用しません。
- テストページは`/public/bookmarklet-test.html`です。

### 開発
```bash
npm install
npm run dev
```

### ディレクトリ構成例

```
src/
	app/
		layout.tsx
		page.tsx
		globals.css
	components/
		BookmarkletEditor.tsx
		ThemeToggle.tsx
	contexts/
		ThemeContext.tsx
public/
	bookmarklet-test.html
```

---
詳細仕様は `SPECIFICATION.md` を参照してください。

