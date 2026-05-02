$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if (Test-Path -LiteralPath $BundledPython) {
  $Python = $BundledPython
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  $Python = "python"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
  $Python = "py"
} else {
  throw "Không tìm thấy Python. Hãy cài Python hoặc chạy trong môi trường Codex đã có Python đi kèm."
}

Write-Host "Đang mở app Python tại http://127.0.0.1:9100"
Write-Host "Nhấn Ctrl+C trong cửa sổ này để dừng server."
& $Python (Join-Path $Root "python_server.py") --host 127.0.0.1 --port 9100
