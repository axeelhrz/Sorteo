#!/bin/bash

# Script para configurar CORS en Firebase Storage
# Este script requiere Google Cloud SDK instalado

echo "🔧 Configurando CORS en Firebase Storage..."
echo ""

# Verificar si gsutil está instalado
if ! command -v gsutil &> /dev/null; then
    echo "❌ gsutil no está instalado."
    echo ""
    echo "Para instalar Google Cloud SDK en macOS:"
    echo "  brew install google-cloud-sdk"
    echo ""
    echo "Para instalar en otros sistemas, visita:"
    echo "  https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gsutil encontrado"
echo ""

# Autenticar con Google Cloud
echo "🔐 Autenticando con Google Cloud..."
gcloud auth login

echo ""
echo "📋 Configurando proyecto..."
gcloud config set project sorteo-b8fb0

echo ""
echo "⚙️  Aplicando configuración CORS..."
gsutil cors set cors.json gs://sorteo-b8fb0.firebasestorage.app

echo ""
echo "✅ ¡CORS configurado exitosamente!"
echo ""
echo "Ahora puedes acceder a Firebase Storage desde:"
echo "  - https://sorteo-self.vercel.app"
echo "  - http://localhost:3000"
echo "  - http://localhost:3001"