# reemplazar-api.ps1
Write-Host "🔄 Reemplazando 'import { api } from...' en archivos .vue y .js dentro de src..."

Get-ChildItem -Recurse -Include *.vue,*.js -Path .\src | ForEach-Object {
  (Get-Content $_.FullName) -replace "import { api } from 'src/boot/axios'", "import { useApi } from 'src/composables/useApi'`nconst api = useApi()" | Set-Content $_.FullName
}

Write-Host "✅ Reemplazo completado."