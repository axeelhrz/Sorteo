# Guía de Sorteos - Explorar Sorteos

## Descripción General

La página "Explorar Sorteos" permite a los usuarios descubrir y participar en sorteos disponibles. Esta guía documenta la estructura, funcionalidades y cambios realizados.

## Cambios Implementados

### 1. Navegación a Página Principal
- **Ubicación:** Botón "Volver a inicio" en la parte superior de la página
- **Funcionalidad:** Permite regresar a la página principal desde cualquier punto de la página de sorteos
- **Diseño:** Botón con icono de flecha hacia atrás

### 2. Mejoras en el Buscador
- **Placeholder mejorado:** "Buscar productos o tiendas..." (más claro y conciso)
- **Tamaño del botón:** Aumentado para mejor visibilidad
  - Padding: 12px 24px
  - Font-size: 24px
  - Min-width: 64px
  - Min-height: 48px
- **Funcionalidad:** Busca en nombres de productos y tiendas
- **Efectos:** Hover con escala y sombra para mejor feedback visual

### 3. Clarificación de Estados

Los sorteos pueden tener los siguientes estados:

| Estado | Descripción | Color |
|--------|-------------|-------|
| **Activo** | Sorteo en curso, puedes comprar tickets | Verde (#4CAF50) |
| **Pausado** | Sorteo temporalmente detenido | Gris |
| **Agotado** | Todos los tickets han sido vendidos. El sorteo se ejecutará automáticamente cuando se alcance este estado. | Naranja (#FF9800) |
| **Finalizado** | Sorteo completado, ganador ya seleccionado | Púrpura (#9C27B0) |

#### ¿Por qué existe el estado "Agotado"?
El estado "Agotado" indica que se han vendido todos los tickets disponibles para un sorteo. Cuando un sorteo alcanza este estado, se ejecuta automáticamente para seleccionar al ganador. Esto asegura que:
- Todos los tickets disponibles se han vendido
- El sorteo tiene suficientes participantes
- Se puede proceder a la selección del ganador

### 4. Filtro de Precio Removido
- **Cambio:** Se removió el filtro de precio mínimo y máximo
- **Razón:** La búsqueda y filtrado por categoría y tienda son suficientes para encontrar sorteos. El filtro de precio no era necesario ya que el valor del producto se muestra claramente en cada tarjeta.
- **Alternativa:** Los usuarios pueden ver el valor del producto en cada tarjeta de sorteo

### 5. Estructura de Datos en Tarjetas de Sorteo

Cada tarjeta de sorteo muestra la siguiente información:

```
┌─────────────────────────────────┐
│  [Imagen del Producto]  [Badge] │
├─────────────────────────────────┤
│ Nombre del Producto             │
│ Nombre de la Tienda             │
├─────────────────────────────────┤
│ Valor del producto              │
│ S/ 299.99                       │
│ Tickets: 100 disponibles        │
├─────────────────────────────────┤
│ Tickets vendidos                │
│ 45 de 100                       │
│ [████████░░░░░░░░░░░░░░░░░░░░] │
│ 45 tickets disponibles    45%   │
├─────────────────────────────────┤
│ [Ver sorteo / Ver detalles]     │
└─────────────────────────────────┘
```

**Elementos mostrados:**
1. **Nombre del producto:** Título principal del sorteo
2. **Nombre de la tienda:** Identificación del vendedor
3. **Valor del ticket/producto:** Precio en soles peruanos (S/)
4. **Tickets vendidos:** Contador de tickets vendidos vs. total
5. **Barra de avance:** Visualización gráfica del progreso
6. **Porcentaje:** Porcentaje de tickets vendidos
7. **Tickets disponibles:** Cantidad de tickets aún disponibles

## Idioma

Todo el contenido utiliza **español neutro/peruano** con términos como:
- "Sorteos" en lugar de "Rifas"
- "Tienda" para identificar vendedores
- "Tickets" para los boletos
- "S/" para la moneda (Soles peruanos)

## Filtros Disponibles

### Filtros Principales
- **Búsqueda:** Por nombre de producto o tienda
- **Ordenar por:**
  - Más recientes
  - Más cerca de completarse
  - Menor precio
  - Mayor precio

### Filtros Avanzados (Más filtros)
- **Categoría:** Filtrar por tipo de producto
- **Tienda:** Filtrar por tienda específica
- **Estado:** Filtrar por estado del sorteo
  - Activo
  - Pausado
  - Agotado
  - Finalizado

## Responsividad

La página es completamente responsiva:
- **Desktop:** Grid de 3-4 columnas
- **Tablet:** Grid de 2 columnas
- **Mobile:** 1 columna

## Notas Técnicas

- **Paginación:** Automática con 12 sorteos por página
- **Carga:** Lazy loading de imágenes
- **Performance:** Optimizado para búsquedas rápidas
- **Accesibilidad:** Todos los elementos tienen labels y son navegables por teclado

## Próximas Mejoras Sugeridas

1. Agregar filtro de rango de precios si es necesario en el futuro
2. Implementar búsqueda en tiempo real (sin necesidad de presionar botón)
3. Agregar favoritos/guardados
4. Mostrar historial de sorteos ganados
5. Notificaciones cuando un sorteo está cerca de completarse