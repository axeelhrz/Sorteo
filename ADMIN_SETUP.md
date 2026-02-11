# Configuración del login de administrador

## Credenciales

- **Email:** tiketea.online@gmail.com  
- **Contraseña:** tiketea_admin123  

## Primera vez: crear el usuario admin

El usuario administrador debe existir en Firebase Auth. Para crearlo (o actualizar la contraseña), ejecuta una vez:

```bash
curl -X POST https://tu-dominio.com/api/admin/ensure-admin \
  -H "x-setup-secret: TU_ADMIN_SETUP_SECRET"
```

En local:
```bash
curl -X POST http://localhost:3000/api/admin/ensure-admin \
  -H "x-setup-secret: TU_ADMIN_SETUP_SECRET"
```

### Variables de entorno necesarias

En `.env.local` o en Vercel:

```
ADMIN_EMAIL=tiketea.online@gmail.com
ADMIN_PASSWORD=tiketea_admin123
ADMIN_SETUP_SECRET=un_secreto_aleatorio_largo
```

## Acceso al panel

1. Ve a `/login/admin` (o clic en "Acceso administrador" en la página de login)
2. Ingresa el email y contraseña
3. Serás redirigido a `/dashboard/admin`

Solo el correo `tiketea.online@gmail.com` puede acceder por esta ruta. Si intentas con otro email, verás "Acceso restringido".
