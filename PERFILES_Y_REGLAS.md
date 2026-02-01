# Perfiles y reglas de la plataforma

La plataforma tiene **3 perfiles** con permisos y restricciones claros.

---

## 1. Administrador

**Datos:** Acceso de administrador (gestión de la plataforma).

**Permisos:**
- Aprueba **oportunidades** (sorteos) solicitadas por organizadores.
- Aprueba **cantidad/ratio de tickets** del sorteo.
- Aprueba **precio de tickets**.
- **Gestiona el pago** al organizador (validación de vouchers, aprobación, etc.).

**Rutas:** `/dashboard/admin`, `/admin/*`

---

## 2. Organizador

**Datos:** Nombre del organizador, correo del organizador, contraseña del organizador.

**Permisos:**
- **Solicita la creación de oportunidades** (sorteos): crea producto, define precio, cantidad de tickets, condiciones; el sorteo queda pendiente de aprobación del administrador.

**Restricción importante:**
- **Una cuenta de organizador NO puede participar en la compra de tickets.** Si un organizador inicia sesión y entra a la página de un sorteo, no verá el bloque de compra de tickets.

**Rutas:** `/dashboard/store` (panel de tienda/organizador). No tiene acceso al dashboard de usuario para comprar tickets.

---

## 3. Usuario

**Datos:** Nombre de usuario, correo de usuario, contraseña de usuario.

**Permisos:**
- Puede **comprar tickets** en sorteos activos aprobados.
- Ve sus participaciones, historial de compras, sorteos ganados, etc.

**Restricción importante:**
- **Una cuenta de usuario NO puede solicitar creación de sorteos.** Si un usuario intenta acceder al panel de organizador (`/dashboard/store`), es redirigido al dashboard según su rol (usuario → `/dashboard/user`).

**Rutas:** `/dashboard/user`, `/user-panel/*`, `/sorteos/*` (para comprar y ver participaciones).

---

## Resumen de reglas

| Acción                    | Administrador | Organizador | Usuario |
|---------------------------|---------------|-------------|---------|
| Aprueba sorteos           | Sí            | No          | No      |
| Aprueba cantidad/precio   | Sí            | No          | No      |
| Gestiona pago organizador | Sí            | No          | No      |
| Solicitar crear sorteo    | No*           | Sí          | No      |
| Comprar tickets           | No*           | **No**      | Sí      |

\* El flujo actual redirige a admin y user a sus dashboards; la compra está pensada para rol usuario y bloqueada para organizador en la UI y en la lógica de compra.

---

## Implementación en código

- **Tipos y documentación de roles:** `src/types/auth.ts` (enum `UserRole` y comentarios).
- **Bloqueo organizador → compra:** `src/components/marketplace/BuyTicketsBlock.tsx` (no muestra compra si `user.role === ORGANIZER`); `src/components/Dashboard/UserDashboard.tsx` (solo rol USER puede comprar).
- **Restricción usuario → crear sorteos:** `src/app/dashboard/store/page.tsx` (solo `UserRole.ORGANIZER` puede acceder al panel de tienda donde está el formulario de crear sorteo).
