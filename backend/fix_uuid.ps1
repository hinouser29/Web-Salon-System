$ErrorActionPreference = "Stop"
$src = "E:\cn5\SWP391\project\Web-Salon-System\backend\src\main\java"

$files = Get-ChildItem -Path $src -Filter "*.java" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Entity ID declarations
    $content = $content -replace 'private Long id;', 'private UUID id;'
    $content = $content -replace 'GenerationType.IDENTITY', 'GenerationType.UUID'
    
    # Repository signatures
    $content = $content -replace 'extends JpaRepository<([^,]+),\s*Long>', 'extends JpaRepository<$1, UUID>'
    
    # CustomUserDetails and DTOs
    $content = $content -replace 'public Long getId', 'public UUID getId'
    $content = $content -replace 'public void setId\(Long ', 'public void setId(UUID '
    
    # Services
    $content = $content -replace 'Long userId', 'UUID userId'
    
    # Specific fix for JwtService
    if ($file.Name -eq "JwtService.java") {
        $content = $content -replace 'public Long getUserId', 'public UUID getUserId'
        $content = $content -replace 'Number uid = parseClaims\(token\)\.get\(CLAIM_USER_ID, Number\.class\);', 'String uid = parseClaims(token).get(CLAIM_USER_ID, String.class);'
        $content = $content -replace 'return uid != null \? uid\.longValue\(\) : null;', 'return uid != null ? java.util.UUID.fromString(uid) : null;'
    }
    
    # Specific fix for JwtAuthenticationFilter
    if ($file.Name -eq "JwtAuthenticationFilter.java") {
        $content = $content -replace 'Long userId =', 'java.util.UUID userId ='
    }

    # Import UUID if needed
    if ($content -match '\bUUID\b' -and $content -notmatch 'import java\.util\.UUID;') {
        $content = $content -replace '(?m)^(package .*;\r?\n)', "`$1`nimport java.util.UUID;`n"
    }
    
    if ($original -ne $content) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Modified: $($file.Name)"
    }
}
Write-Host "Done"
