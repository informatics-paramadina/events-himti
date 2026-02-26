$response = Invoke-WebRequest -Uri "http://localhost:3000/api/participants" -Method GET -UseBasicParsing
$content = $response.Content | ConvertFrom-Json
Write-Host "Total participants: $($content.Count)"
Write-Host ""
Write-Host "All participants:"
$content | ForEach-Object {
    Write-Host "- $($_.nama) ($($_.nim)) - $($_.email) - Event ID: $($_.eventId)"
} | Out-String
