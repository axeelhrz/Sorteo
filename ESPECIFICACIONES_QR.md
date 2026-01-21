# Especificaciones para Imágenes QR de Alta Resolución

## 📋 Información General

**Número de teléfono asociado:** 984908819  
**Billeteras digitales:** YAPE y PLIN

---

## 🖼️ Especificaciones Técnicas de las Imágenes

### Códigos QR (yape.png y plin.png)

**Dimensiones recomendadas:**
- **Tamaño mínimo:** 1000 x 1000 píxeles
- **Tamaño óptimo:** 2000 x 2000 píxeles
- **Tamaño máximo:** 3000 x 3000 píxeles

**Formato:**
- **Tipo de archivo:** PNG (preferido) o JPG
- **Resolución:** 300 DPI (puntos por pulgada)
- **Modo de color:** RGB
- **Fondo:** Blanco o transparente (PNG con canal alpha)

**Calidad:**
- Sin compresión o compresión mínima
- Bordes nítidos y definidos
- Alto contraste entre el código QR y el fondo
- Sin marcas de agua ni elementos adicionales

**Peso del archivo:**
- Máximo recomendado: 500 KB por imagen
- Óptimo: 200-300 KB

---

### Logos (yape-logo.png y plin-logo.png)

**Dimensiones recomendadas:**
- **Tamaño:** 512 x 512 píxeles
- **Formato:** PNG con transparencia
- **Resolución:** 300 DPI

---

## 📁 Ubicación de los Archivos

Los archivos deben colocarse en:
```
frontend/public/assets/
├── yape.png          (Código QR de YAPE - 2000x2000px)
├── plin.png          (Código QR de PLIN - 2000x2000px)
├── yape-logo.png     (Logo de YAPE - 512x512px)
└── plin-logo.png     (Logo de PLIN - 512x512px)
```

---

## 🎨 Visualización en la Aplicación

Los códigos QR se muestran en la página de checkout con las siguientes dimensiones:

- **Desktop:** 350 x 350 píxeles
- **Tablet:** 300 x 300 píxeles
- **Mobile:** 260 x 260 píxeles

La aplicación utiliza `object-fit: contain` para mantener la proporción sin distorsión.

---

## ✅ Checklist de Calidad

Antes de entregar las imágenes, verifica que:

- [ ] Las imágenes tienen al menos 2000 x 2000 píxeles
- [ ] El formato es PNG para mejor calidad
- [ ] La resolución es de 300 DPI
- [ ] El código QR es completamente legible
- [ ] No hay pixelación ni bordes borrosos
- [ ] El fondo es blanco o transparente
- [ ] El archivo pesa menos de 500 KB
- [ ] El código QR funciona correctamente al escanearlo

---

## 🔧 Herramientas Recomendadas

Para generar códigos QR de alta calidad:

1. **QR Code Generator** (https://www.qr-code-generator.com/)
   - Seleccionar tamaño: 2000 x 2000 px
   - Formato: PNG
   - Calidad: Alta

2. **Photoshop / GIMP**
   - Para ajustar tamaño y optimizar
   - Exportar como PNG-24 con transparencia

3. **TinyPNG** (https://tinypng.com/)
   - Para optimizar el peso sin perder calidad

---

## 📱 Cómo Obtener los QR desde las Apps

### YAPE:
1. Abrir la app YAPE
2. Ir a "Mi código QR" o "Recibir dinero"
3. Tomar captura de pantalla
4. Recortar solo el código QR
5. Ampliar a 2000 x 2000 px manteniendo la calidad

### PLIN:
1. Abrir la app PLIN
2. Ir a "Recibir" o "Mi QR"
3. Tomar captura de pantalla
4. Recortar solo el código QR
5. Ampliar a 2000 x 2000 px manteniendo la calidad

---

## 🚨 Problemas Comunes y Soluciones

### Problema: Imagen distorsionada o pixelada
**Solución:** Usar una imagen de mayor resolución (mínimo 2000 x 2000 px)

### Problema: Archivo muy pesado
**Solución:** Optimizar con TinyPNG o reducir a 2000 x 2000 px

### Problema: QR no escanea correctamente
**Solución:** Verificar que el contraste sea alto y los bordes estén nítidos

### Problema: Fondo con colores extraños
**Solución:** Usar fondo blanco sólido (#FFFFFF) o transparente

---

## 📞 Contacto

Si necesitas ayuda con las imágenes o tienes dudas sobre las especificaciones, contacta al equipo de desarrollo.

---

**Última actualización:** Enero 2025