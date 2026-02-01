 # Configuración de CORS en Firebase Storage

## 📋 Descripción del Problema

Estabas recibiendo errores de CORS al intentar acceder a imágenes en Firebase Storage desde tu aplicación en Vercel:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'https://sorteo-self.vercel.app' has been blocked by CORS policy
```

## ✅ Solución Implementada

Se ha configurado CORS en Firebase Storage para permitir solicitudes desde:
- `https://sorteo-self.vercel.app` (Producción)
- `http://localhost:3000` (Desarrollo)
- `http://localhost:3001` (Desarrollo alternativo)

## 🔧 Pasos Realizados

### 1. Archivo `cors.json`
Se creó un archivo de configuración CORS con los orígenes permitidos y métodos HTTP.

### 2. Script `setup-cors.sh`
Se creó un script automatizado que:
- Verifica si Google Cloud SDK está instalado
- Autentica con tu cuenta de Google
- Configura el proyecto correcto
- Aplica la configuración CORS a Firebase Storage

### 3. Servicio `firebase-storage-service.ts`
Se creó un servicio completo para manejar operaciones de Firebase Storage con:
- `getDownloadUrl()` - Obtiene URL de descarga
- `getPublicUrl()` - Obtiene URL pública
- `uploadFile()` - Sube archivos
- `deleteFile()` - Elimina archivos
- `fileExists()` - Valida existencia de archivos

## 🚀 Cómo Ejecutar

### Opción 1: Ejecutar el Script (Recomendado)

```bash
chmod +x setup-cors.sh
./setup-cors.sh
```

El script te pedirá que:
1. Inicies sesión en Google Cloud
2. Confirmes el proyecto `sorteo-b8fb0`
3. Aplique la configuración CORS automáticamente

### Opción 2: Comando Manual

Si prefieres hacerlo manualmente:

```bash
# Instalar Google Cloud SDK (si no lo tienes)
brew install google-cloud-sdk

# Autenticar
gcloud auth login

# Configurar proyecto
gcloud config set project sorteo-b8fb0

# Aplicar CORS
gsutil cors set cors.json gs://sorteo-b8fb0.firebasestorage.app
```

## 📝 Verificación

Para verificar que CORS está configurado correctamente:

```bash
gsutil cors get gs://sorteo-b8fb0.firebasestorage.app
```

Deberías ver la configuración JSON que aplicaste.

## 🎯 Próximos Pasos

1. **Completa la autenticación** en el navegador cuando se abra
2. **Espera a que el script termine** (verás un mensaje de éxito)
3. **Recarga tu aplicación** en el navegador
4. **Las imágenes deberían cargar sin errores de CORS**

## 🔒 Seguridad

La configuración CORS actual:
- ✅ Permite solo los orígenes especificados
- ✅ Limita los métodos HTTP necesarios
- ✅ Establece un tiempo de caché de 1 hora
- ✅ No expone credenciales innecesarias

## 📚 Recursos Útiles

- [Firebase Storage CORS Documentation](https://firebase.google.com/docs/storage/web/download-files)
- [Google Cloud SDK Installation](https://cloud.google.com/sdk/docs/install)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## ❓ Solución de Problemas

### Error: "gsutil: command not found"
Instala Google Cloud SDK:
```bash
brew install google-cloud-sdk
```

### Error: "Permission denied"
Asegúrate de que tienes permisos en el proyecto Firebase:
```bash
gcloud projects get-iam-policy sorteo-b8fb0
```

### Las imágenes aún no cargan
1. Limpia el caché del navegador (Ctrl+Shift+Delete)
2. Recarga la página (Ctrl+F5)
3. Verifica que la configuración CORS se aplicó correctamente

## 📞 Soporte

Si encuentras problemas, verifica:
1. Que estés autenticado con la cuenta correcta
2. Que tengas permisos en el proyecto Firebase
3. Que la configuración CORS se haya aplicado correctamente