#!/bin/bash

# === CONFIGURACIÓN ===
# Número de días hacia atrás que quieres ver (por ejemplo, 7)
DIAS=14

# Nombre del archivo de salida
ARCHIVO="reporte-avance.md"

# === GENERAR REPORTE ===
echo "# 🧾 Informe de Avance" > $ARCHIVO
echo "" >> $ARCHIVO
echo "**Nombre y Apellido:** Richard Ayca" >> $ARCHIVO
echo "**Proyecto:** Sistema de Ventas con Quasar" >> $ARCHIVO
echo "**Período:** $(date -d "-$DIAS days" +%Y-%m-%d) – $(date +%Y-%m-%d)" >> $ARCHIVO
echo "" >> $ARCHIVO
echo "| N° | Detalle de Actividad | Complejidad (1-10) | Estado | Horas | Fecha |" >> $ARCHIVO
echo "|----|------------------------|--------------------|--------|--------|--------|" >> $ARCHIVO

# Obtener commits y numerarlos
i=1
git log --since="$DIAS days ago" --pretty=format:"%ad|%s" --date=short | while IFS="|" read -r fecha mensaje
do
  echo "| $i | $mensaje |  |  |  | $fecha |" >> $ARCHIVO
  i=$((i+1))
done

echo "" >> $ARCHIVO
echo "📅 Generado automáticamente el $(date)" >> $ARCHIVO

echo "✅ Reporte generado: $ARCHIVO"
