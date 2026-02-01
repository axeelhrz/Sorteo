# Módulo Organizador: Crear Oportunidad

Este módulo permite al organizador solicitar la creación de una oportunidad (sorteo). Está habilitado para pruebas.

## Campos del formulario

1. **Nombre del producto** (obligatorio)
2. **Foto(s) del producto** — subida de una o más imágenes
3. **Descripción del producto** (obligatorio)
4. **Valor del producto** (S/.) (obligatorio) — se calcula cantidad de tickets (valor × 2)
5. **Entrega**
   - **Recojo en local:** indicar dirección de recojo y distrito (obligatorio)
   - **Delivery:** indicar zonas de cobertura; opcionalmente **costo de delivery** (S/.)
6. **WhatsApp de Organizador** (obligatorio) — para que el admin de TIKETEA pueda comunicarse en caso de ser necesario
7. **Redes sociales del Organizador** (opcional)
8. **Condiciones especiales del sorteo** (opcional)

## Flujo

- El organizador completa el formulario y envía la solicitud.
- Se crea el producto y el sorteo en estado **borrador**, se envía automáticamente a **revisión** (pending_approval).
- El organizador recibe un **correo** indicando que su solicitud de oportunidad está en revisión.

## Reglas de negocio

### Entrega

- Si el organizador elige **Delivery** y asigna un **monto fijo** de delivery: ese monto se suma al valor del producto y se entrega al organizador al finalizar la oportunidad, junto con las evidencias de entrega.
- Si elige **Delivery** y **no** indica cobertura ni monto: el costo de envío va a cuenta del organizador; recibirá solo el valor del producto al finalizar con las evidencias de entrega.
- Si la oportunidad ofrece delivery, el ganador debe brindar una dirección **dentro de la zona de cobertura**.
- Si el ganador no puede dar dirección en zona y se coordina **recojo en local**, el valor indicado como delivery queda **a favor de la plataforma**.

### Anulación

- El organizador **solo** puede solicitar la anulación de una oportunidad si **aún no hay tickets comprados** (`soldTickets === 0`). Si ya hay tickets vendidos, el botón de cancelar no se muestra y se indica el motivo.

## Implementación

- **Formulario:** `src/components/ShopPanel/CreateRaffleForm.tsx`
- **Email “solicitud en revisión”:** `src/app/api/emails/send-opportunity-under-review/route.ts` y `emailService.sendOpportunityUnderReviewEmail`
- **Restricción de cancelación:** `src/components/ShopPanel/RaffleDetail.tsx` (solo permite cancelar si `soldTickets === 0`)
- **Producto:** tipos y Firebase en `src/types/product.ts` y `src/services/firebase-product-service.ts` (campos `deliveryCost`, `pickupAddress`, `pickupDistrict`, `images`, etc.)
