# CargaSafe Frontend — Test Build (Demo con fake-backend)

Esta entrega convierte el proyecto en una **versión de prueba** que corre 100% en el
navegador (fake-backend + `localStorage`), pero sin que se note que es una demo, y con
todas las pantallas reaccionando en vivo a lo que hace el "dispositivo IoT" simulado.

No se tocó nada del diseño/estructura general del proyecto: solo se reemplazan los
23 archivos listados abajo.

---

## 1. Cómo aplicar los cambios

1. Descomprime el zip que te compartí.
2. Copia cada archivo respetando la misma ruta relativa dentro de tu proyecto
   (van a **reemplazar** los archivos existentes; 3 de ellos son nuevos):

```
src/app/app.ts

src/app/core/fake-backend/fake-db.ts
src/app/core/fake-backend/fake-backend.interceptor.ts
src/app/core/fake-backend/fake-db-events.service.ts        ← NUEVO
src/app/core/iot-simulation/iot-simulation.service.ts       ← NUEVO

src/app/shared/presentation/directives/long-press.directive.ts   ← NUEVO
src/app/shared/presentation/layout/root-layout/root-layout.ts
src/app/shared/presentation/layout/root-layout/root-layout.html
src/app/shared/presentation/layout/root-layout/root-layout.css

src/app/iam/presentation/pages/login-page/login-page.ts
src/app/iam/presentation/pages/login-page/login-page.html
src/app/iam/presentation/pages/login-page/login-page.css

src/app/monitoring/presentation/views/vehicle-monitoring/vehicle-monitoring.component.ts
src/app/monitoring/presentation/views/vehicle-monitoring/vehicle-monitoring.component.html
src/app/monitoring/presentation/views/vehicle-monitoring/vehicle-monitoring.component.css

src/app/dashboard/application/services/dashboard.service.ts
src/app/dashboard/presentation/views/dashboard.component.ts
src/app/dashboard/presentation/views/dashboard.component.html
src/app/dashboard/presentation/views/dashboard.component.css
src/app/dashboard/presentation/components/trip-detail/trip-detail.component.ts
src/app/dashboard/presentation/components/trip-detail/trip-detail.component.html
src/app/dashboard/presentation/components/trip-detail/trip-detail.component.css

src/app/alerts/application/alert.store.ts
```

3. Instala dependencias y corre normalmente:

```bash
npm install
npm start   # o: ng serve
```

No hace falta ningún backend real ni variables de entorno nuevas — todo sigue viviendo
en `localStorage`, como ya lo hacía el fake-backend original.

> ⚠️ Como cambié la forma en que se guardan los datos (nueva versión de "seed"), la
> primera vez que abras la app con estos archivos, el `localStorage` viejo se ignora
> automáticamente y se siembra la base de datos nueva (2 camiones / 1 dispositivo).
> No necesitas borrar nada a mano.

---

## 2. Qué se hizo, punto por punto

### 1) Ya no se nota que es una demo
- Se quitó por completo el cuadro **"Test build · demo accounts"** de la vista de Login
  (los botones de autocompletar cuentas y el link de "reset").
- El login ahora solo tiene el formulario normal (email / password).
- El reset de la base de datos sigue existiendo, pero se movió a un **truco oculto**
  (ver punto 7).

### 2) Dashboard y Alerts se actualizan solos
- Antes, el Dashboard leía un set de datos "de analítica" separado y estático (no tenía
  nada que ver con los vehículos/viajes reales).
- Ahora el Dashboard y el endpoint `/analytics/trips` calculan todo **en vivo** a partir
  de las tablas reales (`vehicles`, `trips`, `alerts`). Si agregas un vehículo desde
  Fleet, o si el sensor genera una alerta nueva, el Dashboard y la vista de Alerts se
  refrescan solos (sin recargar la página) gracias a un pequeño sistema de eventos
  (`FakeDbEventsService`) que avisa cada vez que la base de datos cambia.
- Se agregaron 2 tarjetas nuevas al Dashboard: **Vehicles** y **Devices Online**.

### 3) Base de datos inicial: 2 camiones (Truck), 1 solo dispositivo IoT
- `fake-db.ts` ahora siembra exactamente:
  - `TRK-001` (Truck) → **con** el único dispositivo IoT (`IMEI-8841205`)
  - `TRK-002` (Truck) → **sin** dispositivo asignado
- Viajes de ejemplo (para poder probar los 3 escenarios pedidos):
  - Viaje **IN_PROGRESS** en `TRK-001` → tiene datos en vivo (tiene dispositivo).
  - Viaje **CREATED** (no iniciado) en `TRK-002` → sin dispositivo, no hay datos.
  - Viaje **COMPLETED** en `TRK-001` → solo historial, ya no genera datos en vivo.

### 4) "Recent Trips" → viaje IN PROGRESS → gráfico en tiempo real
- En el Dashboard, sección **Recent Trips**, si haces clic en el viaje que está
  **In Progress** (el de `TRK-001`), la vista de detalle empieza a mostrar el gráfico de
  Temperatura y Vibración **actualizándose cada ~2 segundos**, con los mismos datos que
  estaría generando el dispositivo IoT real (mismo motor que usa la pantalla de
  Monitoring).
- Verás un badge rojo **"LIVE"** parpadeando arriba a la derecha del título mientras el
  viaje sigue en curso.

### 5) Monitoring → clic en el gráfico de Temperatura → detalle en grande
- En la vista **Monitoring**, la tarjeta de Temperatura ahora es clickeable (o con Enter
  si usas teclado). Al hacer clic se abre un panel más grande con:
  - El valor de temperatura en grande y su estado (NORMAL / WARNING / CRITICAL).
  - Botones para elegir la ventana de tiempo del gráfico: **10 segundos**, **1 minuto**
    o **5 minutos**.
  - Líneas punteadas mostrando el límite superior/inferior configurado.
  - Un panel de **"Reglas de temperatura"** con el mínimo, máximo, rango de humedad y de
    dónde salen esas reglas (del viaje activo del vehículo, o un rango ambiente genérico
    si no tiene ningún viaje en curso).

### 6) Viajes COMPLETED no muestran gráfico en tiempo real
- La vista de detalle del viaje (Dashboard → Recent Trips → detalle) distingue 4 casos:
  - **LIVE**: viaje `IN_PROGRESS` + vehículo con dispositivo → gráfico en vivo (2s).
  - **HISTORY**: viaje `COMPLETED` → se genera **una sola vez** un historial fijo (no
    vuelve a "tickear"); badge gris **"HISTORY ONLY"**.
  - **NOT_STARTED**: viaje `CREATED` → mensaje "Este viaje aún no ha comenzado".
  - **NO_DEVICE**: viaje en curso pero el vehículo no tiene dispositivo → mensaje
    explicando que hay que asignar uno desde Fleet.

### 7) Truco oculto para resetear la base de datos
- **Mantén presionado el logo de CargaSafe por 3 segundos** (funciona en:
  - el ícono del logo en la pantalla de Login, y
  - el logo del sidebar / header una vez que iniciaste sesión).
- Mientras lo mantienes presionado vas a ver un pequeño anillo/barra de progreso
  llenándose alrededor o debajo del logo, como feedback visual de que "algo está
  pasando".
- Al completar los 3 segundos: aparece un mensaje ("Datos reiniciados correctamente")
  y la app se recarga sola, ya con la base de datos original (2 camiones, 1 dispositivo,
  3 viajes de ejemplo) — como si fuera la primera vez que se abre.
- No hay ningún botón ni texto visible que insinúe que este truco existe.

---

## 3. Cómo probar rápido cada cosa

1. **Login sin pistas de demo** → abre la app, confirma que no aparece ningún texto de
   "demo accounts" ni botones de autocompletar.
2. **Reset oculto** → mantén clic en el logo (login o sidebar) por 3s → deberías ver el
   feedback y luego la recarga.
3. **Fleet con 2 camiones / 1 dispositivo** → ve a Fleet → Vehicles: verás `TRK-001`
   (con dispositivo) y `TRK-002` (sin dispositivo). En Fleet → Devices solo hay 1.
4. **Dashboard en vivo** → deja el Dashboard abierto ~1 minuto: la tarjeta "Total Alerts"
   puede subir sola si la temperatura simulada se sale de rango (el motor IoT corre en
   segundo plano todo el tiempo, no solo dentro de Monitoring).
5. **Recent Trips → gráfico en vivo** → en el Dashboard, clic en el viaje "In Progress"
   → verás el badge LIVE y los gráficos moviéndose cada ~2 segundos.
6. **Viaje completado → solo historial** → vuelve al Dashboard, abre el otro viaje
   (Completed) → verás el badge "HISTORY ONLY" y el gráfico ya no se mueve.
7. **Monitoring → detalle de Temperatura** → ve a Monitoring, selecciona `TRK-001`, haz
   clic en la tarjeta de Temperatura → se abre el panel grande con los botones de
   10s / 1m / 5m y las reglas de temperatura.
8. **Vehículo sin dispositivo** → en Monitoring selecciona `TRK-002` → verás el mensaje
   de que no tiene dispositivo IoT asignado, sin datos falsos mostrándose.

---

## 4. Notas técnicas (por si luego quieres seguir extendiendo esto)

- **Motor de simulación único**: `src/app/core/iot-simulation/iot-simulation.service.ts`
  es ahora la única fuente de datos de sensores. Corre un `setInterval` global (cada 2s)
  para cada vehículo que tenga un dispositivo asignado, sin importar qué pantalla esté
  abierta (se inyecta una vez en `app.ts` para arrancar apenas carga la app). Guarda su
  estado en `localStorage` bajo la clave `cargasafe_iot_sim::<vehicleId>`.
- **Alertas automáticas**: el mismo motor genera una alerta ("High/Low Temperature")
  cuando la temperatura se sale del rango configurado (rango del viaje activo, o un
  rango ambiente por defecto si no hay viaje en curso), con un pequeño "debounce" para
  no crear una alerta nueva en cada tick.
- **Eventos de base de datos**: `fake-db.ts` expone un mini pub/sub (`onDbChange`) sin
  depender de Angular ni RxJS; `FakeDbEventsService` lo envuelve en un Observable para
  que el Dashboard y el store de Alerts puedan reaccionar en vivo.
- **Reset**: `resetDb()` en `fake-db.ts` ahora también borra los snapshots del motor IoT
  guardados en `localStorage` (antes solo reseteaba las tablas de negocio).
- Todo compila limpio con `ng build` (Angular 20, zoneless change detection) — solo
  quedan los mismos warnings que ya traía el proyecto original (no relacionados a estos
  cambios).
