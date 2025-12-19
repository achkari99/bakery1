# Add script.js to all pages
$pages = @(
    "catalogue.html",
    "contact.html",
    "faq.html",
    "le-laboratoire.html",
    "nos-boutiques.html",
    "nos-services.html",
    "presse.html"
)

foreach ($page in $pages) {
    $filePath = "pages\$page"
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Check if script.js is already added
        if ($content -notmatch 'src="../script.js"') {
            # Add script.js before i18n.js
            $content = $content -replace '(\s*<script src="../js/i18n.js")', '    <script src="../script.js"></script>$1'
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "✓ Added script.js to $page"
        } else {
            Write-Host "- $page already has script.js"
        }
    }
}

Write-Host "`nDone!"
