$files = Get-ChildItem -Path "E:\cn5\SWP391\project\Web-Salon-System\backend\src\main\java" -Filter "*.java" -Recurse
$utf8NoBom = New-Object System.Text.UTF8Encoding($False)
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
}
Write-Host "BOM removed successfully."
