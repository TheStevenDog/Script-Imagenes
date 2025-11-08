Write-Host "== Setup del proyecto Script-Imagenes =="

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "1) Creando carpetas 'uploads' y 'compressed' si no existen..."
$dirs = @('uploads','compressed')
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d | Out-Null
        Write-Host "  - Carpeta creada: $d"
    } else {
        Write-Host "  - Carpeta ya existe: $d"
    }
}

Write-Host "\n2) Creando entorno virtual .venv si no existe..."
if (-not (Test-Path '.venv')) {
    Write-Host "  - Ejecutando: python -m venv .venv"
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error: no se pudo crear el entorno virtual. Asegúrate de que 'python' esté en PATH."
        exit 1
    }
    Write-Host "  - Entorno virtual creado en .venv"
} else {
    Write-Host "  - .venv ya existe, omitiendo creación"
}

$pipPath = Join-Path $scriptDir '.venv\Scripts\pip.exe'
if (-not (Test-Path $pipPath)) {
    Write-Error "No se encontró pip en '.venv\Scripts'. Asegúrate de que el entorno virtual se creó correctamente."
    exit 1
}

Write-Host "\n3) Comprobando requirements.txt..."
if (-not (Test-Path 'requirements.txt')) {
    Write-Host "  - No se encontró requirements.txt; creando uno por defecto..."
    @(
        'Flask==2.3.2',
        'numpy==1.26.4',
        'Pillow==10.1.0',
        'scipy==1.11.3',
        'Flask-Cors==3.1.1'
    ) | Out-File -Encoding utf8 requirements.txt
    Write-Host "  - requirements.txt creado"
} else {
    Write-Host "  - requirements.txt encontrado"
}

Write-Host "\n4) Instalando dependencias en el entorno virtual (esto puede tardar)..."
& $pipPath install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Error "La instalación de dependencias falló. Revisa la salida anterior para más detalles."
    exit 1
}

Write-Host "\n== Setup completado =="
Write-Host "Para activar el entorno (PowerShell): .\.venv\Scripts\Activate.ps1"
Write-Host "O puedes usar el pip del entorno: .\.venv\Scripts\pip.exe install <paquete>"
