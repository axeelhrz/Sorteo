# Guía de prueba: flujo completo del sorteo

Esta guía permite probar de punta a punta el ciclo de un sorteo: creación, aprobación, compra de tickets, ejecución, validación del ganador y confirmación de entrega.

**Requisitos:** tener al menos 3 cuentas (o usar ventanas incógnito):

- **Organizador** (rol organizer/shop) — crea sorteos y valida ganador.
- **Admin** (rol admin) — aprueba sorteos y ejecuta el sorteo.
- **Usuario** (rol user) — compra tickets y confirma recepción si gana.

---

## 1. Crear un sorteo (Organizador)

**Quién:** Organizador  
**Dónde:** Panel del organizador

1. Iniciar sesión con una cuenta **organizador** (o registrar una en `/register` con rol Organizador).
2. Ir a **Dashboard** → se redirige a `/dashboard/store`.
3. En el panel del organizador, usar **Crear oportunidad** o la opción que abre el formulario de crear sorteo.
4. Completar:
   - Nombre del producto
   - Descripción
   - **Valor (ticket)** — p. ej. 5 (S/. 5 por ticket)
   - WhatsApp del organizador
   - Imagen principal (opcional para prueba)
   - Entrega: recojo en local o delivery (dirección/distrito o zonas)
5. Enviar el formulario.
6. El sistema crea producto + sorteo en estado **Borrador** y lo envía a **Pendiente de aprobación** (y puede enviar email al organizador).

**Resultado:** El sorteo aparece en “Sorteos” del organizador con estado **Pendiente** y en el admin en “Sorteos pendientes”.

---

## 2. Aprobar un sorteo (Admin)

**Quién:** Admin  
**Dónde:** Panel de administración

1. Iniciar sesión con una cuenta **admin**.
2. Ir a **Dashboard** → se redirige a `/dashboard/admin`.
3. Abrir la pestaña **Sorteos pendientes**.
4. Localizar el sorteo recién creado en la lista.
5. Clic en **Ver** (o la acción que abre el detalle) y luego **Aprobar**, o usar el botón **Aprobar** directo si existe.
6. En el modal de aprobación:
   - Revisar que **Costo por ticket** y **Número de tickets** coincidan con lo que definió el organizador (se rellenan con sus valores).
   - Ajustar si hace falta (costo, ratio, número de tickets).
7. Confirmar **Aprobar oportunidad**.

**Resultado:** El sorteo pasa a estado **Activo** y desaparece de “Sorteos pendientes”. Aparece en **Sorteos activos** y, si la app tiene marketplace, en la lista pública de sorteos.

---

## 3. Comprar un ticket (Usuario)

**Quién:** Usuario (rol user; no organizador ni admin para esta prueba)  
**Dónde:** Página del sorteo / checkout

1. Iniciar sesión con una cuenta **usuario** (o registrar una con rol Usuario).
2. Ir a la lista de sorteos:
   - **Opción A:** `/sorteos` (marketplace).
   - **Opción B:** Desde el dashboard usuario si hay enlace a sorteos.
3. Entrar al sorteo que acabas de aprobar (clic en la tarjeta o en “Ver”).
4. En la página del sorteo (`/sorteos/[id]`):
   - Elegir cantidad de tickets (al menos 1).
   - Ir a **Comprar** / **Checkout**.
5. En checkout:
   - Completar datos si se piden.
   - Elegir método de pago (Yape/Plin u otro según la app).
   - Si hay flujo con voucher: subir comprobante o marcar pago según corresponda.
6. Confirmar la compra.

**Resultado:** El usuario tiene al menos 1 ticket asignado. Para poder **ejecutar** el sorteo, en la lógica actual suele exigirse que se hayan vendido **todos** los tickets (o el mínimo configurado). Para una prueba rápida, conviene crear un sorteo con **pocos tickets** (p. ej. 2) y comprar los 2 con el mismo usuario o con dos usuarios.

---

## 4. Ejecutar un sorteo (Admin)

**Quién:** Admin  
**Dónde:** Panel de administración → Sorteos activos

1. Iniciar sesión como **admin**.
2. Ir a `/dashboard/admin` → pestaña **Sorteos activos**.
3. Localizar el sorteo que ya tiene todos los tickets vendidos (barra de progreso 100% o “X/X tickets”).
4. Clic en **Ejecutar** (o “Ejecutar sorteo”) para ese sorteo.
5. Confirmar en el modal si aparece.

**Resultado:**  
- El sistema elige un ganador aleatorio entre los tickets vendidos.  
- Se guarda el código de verificación del ganador.  
- Se envían emails al ganador y al organizador (si están configurados).  
- El sorteo pasa a estado **Finalizado** y aparece en **Sorteos finalizados**.

---

## 5. Validar la entrega del premio (Organizador + Ganador)

Hay dos partes: **organizador valida al ganador** y **ganador confirma que recibió el premio**.

### 5.1 Organizador: validar código del ganador

**Quién:** Organizador  
**Dónde:** Panel del organizador → detalle del sorteo finalizado

1. Iniciar sesión como **organizador** dueño del sorteo.
2. Ir a `/dashboard/store` y abrir **Sorteos** (o la sección donde se listan sus sorteos).
3. Entrar al sorteo que está **Finalizado** (el que se ejecutó).
4. En el detalle del sorteo (`RaffleDetail`) debe aparecer la sección **Validar ganador** (componente `WinnerValidation`).
5. El ganador recibe por email un **código de verificación** (p. ej. formato XXXX-XXXX-XXXX). Para la prueba, el ganador puede copiarlo o anotarlo.
6. En la pantalla del organizador, ingresar ese código en el campo correspondiente y enviar **Validar**.
7. Si el código es correcto, el sistema marca al ganador como validado y puede habilitar el flujo de “evidencia de entrega”.

**Resultado:** Ganador validado por el organizador; el organizador puede coordinar la entrega y luego subir evidencia.

### 5.2 Organizador: subir evidencia de entrega (opcional pero recomendado)

**Quién:** Organizador  
**Dónde:** Mismo detalle del sorteo finalizado

1. Tras validar el código, si la app lo muestra, usar la sección para **Subir evidencia de entrega** (foto del premio entregado, etc.).
2. Subir al menos una imagen y guardar.

**Resultado:** El ganador puede ver que la entrega fue registrada y la app puede enviar un email al ganador.

### 5.3 Ganador: confirmar recepción del premio

**Quién:** Usuario que ganó el sorteo  
**Dónde:** Panel del usuario → Sorteos ganados

1. Iniciar sesión con la cuenta **ganadora** (la que compró el ticket que salió sorteado).
2. Ir al panel de usuario:
   - **Opción A:** `/user-panel` o `/user-panel/won-raffles`.
   - **Opción B:** Desde el dashboard usuario, sección “Sorteos ganados” o similar.
3. En la lista de **Sorteos ganados**, localizar el sorteo correspondiente.
4. Usar el botón o formulario **Confirmar recepción** (componente `DeliveryConfirmation`).
5. Marcar que recibió el premio y, si se pide, agregar comentario.
6. Enviar la confirmación.

**Resultado:**  
- Queda registrada la confirmación de recepción por parte del ganador.  
- Se puede enviar email al organizador.  
- En admin, en “Sorteos finalizados”, puede verse que el ciclo de entrega está cerrado (ganador confirmó recepción).

---

## Resumen del flujo en orden

| Paso | Acción                    | Rol        | Dónde                          |
|------|---------------------------|------------|---------------------------------|
| 1    | Crear sorteo              | Organizador| `/dashboard/store`             |
| 2    | Aprobar sorteo            | Admin      | `/dashboard/admin` → Sorteos pendientes |
| 3    | Comprar ticket(s)         | Usuario    | `/sorteos` → sorteo → checkout |
| 4    | Ejecutar sorteo          | Admin      | `/dashboard/admin` → Sorteos activos |
| 5a   | Validar código ganador   | Organizador| `/dashboard/store` → detalle sorteo finalizado |
| 5b   | Subir evidencia entrega   | Organizador| Mismo detalle (si aplica)      |
| 5c   | Confirmar recepción       | Ganador    | `/user-panel/won-raffles`      |

---

## Notas para pruebas

- **Emails:** Si los envíos de email no están configurados, el flujo en la app sigue siendo probado; solo no llegarán correos (revisar `.env` y servicio de emails si quieres probar notificaciones).
- **Pagos:** Si el checkout usa pasarela real (Yape/Plin, etc.), en desarrollo puedes tener un flujo “mock” o de prueba según cómo esté implementado.
- **Mínimo de tickets para ejecutar:** En la implementación actual, normalmente se exige que **todos** los tickets estén vendidos para poder ejecutar. Crea sorteos con 2–3 tickets y cómpralos para probar rápido.
- **Código del ganador:** Tras ejecutar el sorteo, el código suele enviarse por email al ganador. Para probar sin email, puedes revisar en base de datos (Firestore) el documento del sorteo → `winnerInfo.verificationCode`, o añadir temporalmente un log en el backend que imprima el código al ejecutar.

Con esto puedes probar el flujo completo de principio a fin en tu entorno local o de staging.
