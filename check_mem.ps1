$os = Get-CimInstance Win32_OperatingSystem
$totalMB = [math]::Round($os.TotalVisibleMemorySize / 1024)
$freeMB = [math]::Round($os.FreePhysicalMemory / 1024)
Write-Host "Total: ${totalMB}MB, Free: ${freeMB}MB, Used: $($totalMB - $freeMB)MB"
Write-Host ""
Write-Host "Top memory consumers:"
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 15 | ForEach-Object {
    $mb = [math]::Round($_.WorkingSet64 / 1MB)
    Write-Host "  $($_.Name) (PID $($_.Id)): ${mb}MB"
}
