# Configuración de Assets (Imágenes y QR)

## ✅ Archivos Copiados

Los siguientes archivos se han copiado de `src/assets/` a `public/assets/`:

- ✅ `yape.png` - QR de YAPE (408 KB)
- ✅ `yape-logo.png` - Logo de YAPE (44 KB)
- ✅ `plin.png` - QR de PLIN (89 KB)
- ✅ `plin-logo.png` - Logo de PLIN (46 KB)

## 📁 Estructura de Carpetas

```
frontend/
├── public/
│   └── assets/
│       ├── yape.png          ← QR de YAPE
│       ├── yape-logo.png     ← Logo de YAPE
│       ├── plin.png          ← QR de PLIN
│       └── plin-logo.png     ← Logo de PLIN
└── src/
    └── assets/
        └── (archivos originales)
```

## 🔧 Cómo se usan en el código

En `checkout/page.tsx`, las imágenes se cargan así:

```tsx
// Logos de métodos de pago
<Image src="/assets/yape-logo.png" alt="YAPE" width={60} height={60} />
<Image src="/assets/plin-logo.png" alt="PLIN" width={60} height={60} />

// QR codes
<Image src="/assets/yape.png" alt="QR YAPE" width={280} height={280} />
<Image src="/assets/plin.png" alt="QR PLIN" width={280} height={280} />
```

## 🎯 Para DALE

DALE no tiene logo ni QR, por lo que se muestra un placeholder con CSS:

```tsx
<span className={styles.daleLogo}>DALE</span>
```

El estilo está en `checkout.module.css`:

```css
.daleLogo {
  font-size: 32px;
  font-weight: 900;
  color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 🔄 Si las imágenes no cargan

### 1. Verifica que los archivos existan

```bash
ls -la public/assets/
```

Deberías ver:
```
-rw-r--r--  plin-logo.png
-rw-r--r--  plin.png
-rw-r--r--  yape-logo.png
-rw-r--r--  yape.png
```

### 2. Refresca el navegador

- Presiona `Ctrl + Shift + R` (Windows/Linux)
- Presiona `Cmd + Shift + R` (Mac)
- O limpia la caché del navegador

### 3. Reinicia el servidor de desarrollo

```bash
# Detén el servidor (Ctrl + C)
npm run dev
```

### 4. Verifica en el navegador

Abre estas URLs directamente:
- http://localhost:3001/assets/yape-logo.png
- http://localhost:3001/assets/plin-logo.png
- http://localhost:3001/assets/yape.png
- http://localhost:3001/assets/plin.png

Si ves las imágenes, ¡todo está funcionando! ✅

### 5. Verifica la consola del navegador

Presiona F12 y busca errores relacionados con imágenes.

## 📝 Agregar más imágenes

Si necesitas agregar más imágenes en el futuro:

1. **Coloca el archivo en `public/assets/`**
   ```bash
   cp mi-imagen.png public/assets/
   ```

2. **Úsalo en tu código**
   ```tsx
   <Image src="/assets/mi-imagen.png" alt="Descripción" width={100} height={100} />
   ```

## ⚠️ Importante

- **NO** uses rutas relativas como `./assets/` o `../assets/`
- **SIEMPRE** usa rutas absolutas desde `/assets/`
- Los archivos en `public/` son accesibles directamente desde la raíz del sitio
- Next.js optimiza automáticamente las imágenes con el componente `<Image>`

## 🎨 Optimización de Imágenes

Next.js optimiza automáticamente las imágenes:
- ✅ Convierte a formatos modernos (WebP, AVIF)
- ✅ Redimensiona según el dispositivo
- ✅ Lazy loading automático
- ✅ Previene Layout Shift

## 🚀 Próximos pasos

Si quieres agregar el logo y QR de DALE:

1. Consigue las imágenes de DALE
2. Cópialas a `public/assets/`:
   ```bash
   cp dale-logo.png public/assets/
   cp dale.png public/assets/
   ```
3. Actualiza el código en `checkout/page.tsx`:
   ```tsx
   {selectedMethod === 'dale' && (
     <Image 
       src="/assets/dale.png" 
       alt="QR DALE" 
       width={280} 
       height={280}
       className={styles.qrImage}
     />
   )}
   ```

## ✅ Verificación Final

Después de seguir estos pasos:

1. ✅ Los logos de YAPE y PLIN deben aparecer en los botones
2. ✅ Los QR de YAPE y PLIN deben aparecer al seleccionar el método
3. ✅ DALE debe mostrar un texto estilizado (hasta que agregues su logo)
4. ✅ No debe haber errores 404 en la consola del navegador

¡Todo listo! 🎉