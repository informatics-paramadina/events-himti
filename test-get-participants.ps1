$response = Invoke-WebRequest -Uri "http://localhost:3000/api/participants" -Method GET -UseBasicParsing
$content = $response.Content | ConvertFrom-Json
Write-Host "Total participants: $($content.Count)"
Write-Host ""
Write-Host "Latest 3 participants:"
$content | Select-Object -Last 3 | ForEach-Object {
    Write-Host "- $($_.nama) ($($_.nim)) - $($_.email)"
}
