@echo off
chcp 65001 > nul
title 契約書リスクチェッカー - 開発サーバー
color 0A

echo.
echo ========================================
echo   契約書リスクチェッカー 開発サーバー
echo ========================================
echo.

REM カレントディレクトリをbatファイルの場所に移動
cd /d "%~dp0"

echo [現在のディレクトリ]
cd
echo.

echo [1/4] 古いNode.jsプロセスを停止中...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ 古いプロセスを停止しました
    timeout /t 2 /nobreak >nul
) else (
    echo - 停止するプロセスはありませんでした
)
echo.

echo [2/4] キャッシュをクリア中...
if exist .next (
    rmdir /s /q .next
    echo ✓ .nextフォルダを削除しました
) else (
    echo - .nextフォルダは存在しません
)
echo.

echo [3/4] package.jsonを確認中...
if exist package.json (
    echo ✓ package.jsonが見つかりました
) else (
    echo ❌ package.jsonが見つかりません
    echo このbatファイルをプロジェクトのルートフォルダに置いてください
    echo.
    pause
    exit /b 1
)
echo.

echo [4/4] サーバーを起動中...
echo.
echo ========================================
echo   Webpackモードで起動します
echo   ブラウザで以下のURLを開いてください:
echo   http://localhost:3000
echo   (ポートが使用中の場合は自動的に別のポートになります)
echo ========================================
echo.
echo サーバーを停止するには Ctrl+C を押してください
echo.

REM 環境変数を設定
set NODE_OPTIONS=--no-warnings

REM npm run dev を実行
npm run dev -- --webpack

REM エラーが発生した場合
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   エラーが発生しました！
    echo ========================================
    echo.
    echo エラーコード: %errorlevel%
    echo.
    echo 【トラブルシューティング】
    echo 1. node_modulesフォルダを削除して npm install を実行
    echo 2. .envファイルにGOOGLE_API_KEYが設定されているか確認
    echo 3. Node.jsのバージョンを確認 (推奨: v18以上)
    echo.
    pause
    exit /b %errorlevel%
)

REM 正常終了
echo.
echo サーバーが停止しました
pause
