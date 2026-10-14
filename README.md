# アイコンリング合成

ブラウザ内でアイコンとリングを合成する静的Webツール。画像は外部に送信しません。

## 使い方

1. アイコン画像とリング画像を選択します。リング画像は省略可能です。
2. サイズ・回転を調整し、プレビューをドラッグして位置を合わせます。
3. 保存サイズを選び、PNGを保存します。

PNG・JPEG・WebP対応。リングには中央が透明なPNGを推奨します。

## GitHub Pagesでの公開

1. GitHubで `icon-ring-composer` の公開リポジトリを作成します。
2. このフォルダの `index.html`、`app.js`、`.nojekyll` をリポジトリ直下にアップロードします。
3. Settings → Pages → Build and deploymentで「Deploy from a branch」を選択します。
4. ブランチ `main`、フォルダ `/ (root)` を指定して保存します。
5. 公開URLは `https://ユーザー名.github.io/icon-ring-composer/` になります。

ビルド・ライブラリ・APIキーは不要です。
