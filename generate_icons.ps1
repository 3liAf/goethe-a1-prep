Add-Type -AssemblyName System.Drawing

function Create-GoetheIcon([int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Background gradient
    $bgRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $cTop = [System.Drawing.ColorTranslator]::FromHtml("#008f58")
    $cBottom = [System.Drawing.ColorTranslator]::FromHtml("#005a36")
    $brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, $cTop, $cBottom, 45)
    $g.FillRectangle($brushBg, $bgRect)

    # Scale factor relative to 512
    $scale = $size / 512.0

    # Center white card
    $cardW = [int](370 * $scale)
    $cardH = [int](360 * $scale)
    $cardX = [int]((($size - $cardW) / 2))
    $cardY = [int](76 * $scale)
    $cardRect = New-Object System.Drawing.Rectangle($cardX, $cardY, $cardW, $cardH)
    $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($cardBrush, $cardRect)

    # Header bar inside card
    $headerH = [int](85 * $scale)
    $headerRect = New-Object System.Drawing.Rectangle($cardX, $cardY, $cardW, $headerH)
    $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#007346"))
    $g.FillRectangle($greenBrush, $headerRect)

    # GOETHE text
    $fontGoethe = New-Object System.Drawing.Font("Arial", [float](28 * $scale), [System.Drawing.FontStyle]::Bold)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $formatCenter = New-Object System.Drawing.StringFormat
    $formatCenter.Alignment = [System.Drawing.StringAlignment]::Center
    $formatCenter.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("GOETHE", $fontGoethe, $whiteBrush, [float]($size / 2.0), [float]($cardY + $headerH / 2.0), $formatCenter)

    # Big A1 text
    $fontA1 = New-Object System.Drawing.Font("Arial", [float](90 * $scale), [System.Drawing.FontStyle]::Bold)
    $g.DrawString("A1", $fontA1, $greenBrush, [float]($size / 2.0), [float]($cardY + 160 * $scale), $formatCenter)

    # Subtitle: START DEUTSCH 1
    $fontSub = New-Object System.Drawing.Font("Arial", [float](16 * $scale), [System.Drawing.FontStyle]::Bold)
    $darkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#334155"))
    $g.DrawString("START DEUTSCH 1", $fontSub, $darkBrush, [float]($size / 2.0), [float]($cardY + 230 * $scale), $formatCenter)

    # Sound wave lines
    $penWave = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#007346"), [float](4.0 * $scale))
    $penWave.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penWave.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $waveHeights = @(16, 24, 38, 28, 48, 28, 38, 24, 16)
    $waveBaseY = [float]($cardY + 295 * $scale)
    $waveStartX = [float]($size / 2.0 - 50 * $scale)
    $waveGap = [float](12.5 * $scale)

    for ($i = 0; $i -lt $waveHeights.Length; $i++) {
        $x = $waveStartX + $i * $waveGap
        $h = [float]($waveHeights[$i] * $scale)
        $g.DrawLine($penWave, $x, [float]($waveBaseY - $h / 2.0), $x, [float]($waveBaseY + $h / 2.0))
    }

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outPath ($size x $size)"
}

$destDir = "C:\Users\a.yousuf\.gemini\antigravity\scratch\goethe-a1-prep\public\icons"
Create-GoetheIcon 512 "$destDir\icon-512x512.png"
Create-GoetheIcon 192 "$destDir\icon-192x192.png"
Create-GoetheIcon 180 "$destDir\apple-touch-icon.png"
