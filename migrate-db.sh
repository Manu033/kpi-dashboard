#!/bin/bash
# Script para migrar base de datos KPI

echo "🔄 Iniciando migración de base de datos..."

# Variables
SERVER="${1:-localhost}"
DB="kpi_softprod"
SCHEMA_FILE="./sql/schema.sql"
SEED_FILE="./sql/seed.sql"

# Validar archivos
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: No se encontró $SCHEMA_FILE"
    exit 1
fi

if [ ! -f "$SEED_FILE" ]; then
    echo "❌ Error: No se encontró $SEED_FILE"
    exit 1
fi

echo "📋 Servidor: $SERVER"
echo "📋 Base de datos: $DB"
echo ""

# Ejecutar schema
echo "1️⃣  Ejecutando schema.sql..."
sqlcmd -S "$SERVER" -i "$SCHEMA_FILE"
if [ $? -ne 0 ]; then
    echo "❌ Error en schema.sql"
    exit 1
fi
echo "✅ Schema actualizado"

# Ejecutar seed
echo ""
echo "2️⃣  Ejecutando seed.sql..."
sqlcmd -S "$SERVER" -d "$DB" -i "$SEED_FILE"
if [ $? -ne 0 ]; then
    echo "❌ Error en seed.sql"
    exit 1
fi
echo "✅ Datos insertados"

echo ""
echo "🎉 Migración completada exitosamente!"
