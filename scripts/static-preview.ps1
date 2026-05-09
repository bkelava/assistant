param(
  [string]$Root = "",
  [string]$Data = "",
  [int]$Port = 8788,
  [switch]$Open
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if ([string]::IsNullOrWhiteSpace($Root)) {
  $Root = Join-Path $PSScriptRoot "..\public"
}

$Root = [System.IO.Path]::GetFullPath($Root)
if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
  throw "Static root does not exist: $Root"
}

if (-not [string]::IsNullOrWhiteSpace($Data)) {
  $Data = [System.IO.Path]::GetFullPath($Data)
  if (-not (Test-Path -LiteralPath $Data -PathType Leaf)) {
    throw "Static data JSON does not exist: $Data"
  }
  $null = Get-Content -LiteralPath $Data -Raw -Encoding UTF8 | ConvertFrom-Json
}

function Get-ContentType {
  param([string]$Path)
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".css" { "text/css; charset=utf-8"; break }
    ".html" { "text/html; charset=utf-8"; break }
    ".js" { "text/javascript; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".png" { "image/png"; break }
    ".svg" { "image/svg+xml; charset=utf-8"; break }
    ".webp" { "image/webp"; break }
    default { "application/octet-stream" }
  }
}

function Resolve-StaticPath {
  param([string]$UrlPath)

  $pathOnly = ($UrlPath -split "\?", 2)[0]
  $decoded = [System.Uri]::UnescapeDataString($pathOnly)
  if ($decoded -eq "/") {
    $decoded = "/index.html"
  }

  $relative = $decoded.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
  $candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $relative))
  $rootPrefix = $Root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar

  if ($candidate -ne $Root -and -not $candidate.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    return ""
  }

  if (Test-Path -LiteralPath $candidate -PathType Container) {
    $index = Join-Path $candidate "index.html"
    if (Test-Path -LiteralPath $index -PathType Leaf) {
      return $index
    }
  }

  if (Test-Path -LiteralPath $candidate -PathType Leaf) {
    return $candidate
  }

  return ""
}

function Write-HttpResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$Status,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType
  )

  $headers = @(
    "HTTP/1.1 $Status $StatusText",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    "Cache-Control: no-store",
    "Connection: close",
    "",
    ""
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$listener.Start()

Write-Host "Serving $Root"
if (-not [string]::IsNullOrWhiteSpace($Data)) {
  Write-Host "Static JSON import: $Data -> /app/static-data.json"
}
Write-Host "Open http://localhost:$Port/app/"
Write-Host "Press Ctrl+C to stop."

if ($Open) {
  Start-Process "http://localhost:$Port/app/"
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      while ($true) {
        $line = $reader.ReadLine()
        if ($null -eq $line -or $line.Length -eq 0) {
          break
        }
      }

      $parts = $requestLine.Split(" ")
      $method = $parts[0]
      $target = $parts[1]

      if ($method -ne "GET" -and $method -ne "HEAD") {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Method not allowed")
        Write-HttpResponse $stream 405 "Method Not Allowed" $body "text/plain; charset=utf-8"
        continue
      }

      if (-not [string]::IsNullOrWhiteSpace($Data) -and (($target -split "\?", 2)[0] -eq "/app/static-data.json")) {
        $body = if ($method -eq "HEAD") { [byte[]]::new(0) } else { [System.IO.File]::ReadAllBytes($Data) }
        Write-HttpResponse $stream 200 "OK" $body "application/json; charset=utf-8"
        continue
      }

      $filePath = Resolve-StaticPath $target
      if ([string]::IsNullOrWhiteSpace($filePath)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        Write-HttpResponse $stream 404 "Not Found" $body "text/plain; charset=utf-8"
        continue
      }

      $body = if ($method -eq "HEAD") { [byte[]]::new(0) } else { [System.IO.File]::ReadAllBytes($filePath) }
      Write-HttpResponse $stream 200 "OK" $body (Get-ContentType $filePath)
    } catch {
      try {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Server error")
        Write-HttpResponse $stream 500 "Internal Server Error" $body "text/plain; charset=utf-8"
      } catch {
      }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
