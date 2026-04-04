# Alineacion Diccionario de Datos vs Implementacion

Este documento compara el diccionario de datos compartido (diagrama) contra la implementacion actual del backend.

## Resumen ejecutivo

- Estado operativo para integracion: SI.
- Alineacion 1:1 con diccionario: PARCIAL.
- Recomendacion: mantener contrato actual para no romper integracion y aplicar migracion por fases.
- Avance fase 1: implementado feedback de estado real de actuadores (MQTT + HTTP + consulta para Front).

## Matriz de alineacion

| Dominio | Diccionario (esperado) | Implementacion actual | Estado |
|---|---|---|---|
| Telemetria ciclo | `cycle_measurement(metric, value)` orientado a serie por metrica | `cycle_measurements(temperature, humidity, co2, pm25, measuredAt, receivedAt, source)` | Parcial |
| Acciones de actuadores | `device_action` ligado por `device_id`, campos de modo/energia | `device_actions` con `roomId`, `cycleId`, `deviceType`, `action`, `level`, `reason`, `requestedBy` | Parcial |
| Emulador | `update_interval_sec`, `is_running` | `emulators` con `emulatorExternalId`, `status` | Parcial |
| Setup derivado | relacion por `room_setup_id` | `room_setup_derived` relacionado por `roomId` | Parcial |
| Alarmas | alarma por `room_id`, `cycle_id`, `type`, `message` | `alarms` con `severity`, `isActive`, `triggeredAt`, `resolvedAt`, `metadata` | Mejorado (superset) |
| Dispositivos | `device(type, size, label, installed_at, is_active)` | `devices(type, label, isEnabled, metadata)` | Parcial |
| API metrics para Front | consulta actual/historico por room | implementado en rutas v1 | Alineado |
| Ingestion emulador | payload de metricas por telemetria | implementado HTTP + MQTT | Alineado |

## Referencias de implementacion

- Modelo de telemetria: src/infrastructure/database/models/cycle-measurement.model.ts
- Modelo de acciones: src/infrastructure/database/models/device-action.model.ts
- Modelo de emulador: src/infrastructure/database/models/emulator.model.ts
- Modelo setup derivado: src/infrastructure/database/models/room-setup-derived.model.ts
- Modelo dispositivos: src/infrastructure/database/models/device.model.ts
- Modelo alarmas: src/infrastructure/database/models/alarm.model.ts
- Rutas de metricas: src/api/routes/v1/metrics.routes.ts
- Servicio de acciones: src/application/services/device-action.service.ts

## Brechas funcionales detectadas

1. Persisten diferencias de esquema nominal contra el diccionario (nombres/normalizacion), aunque ya existe feedback de estado real de actuadores.
2. El modelo de mediciones no sigue formato EAV (`metric`, `value`) del diagrama original.
3. El modelo de dispositivo no almacena explicitamente `size`, `installed_at`, `is_active` con los mismos nombres del diccionario.
4. `emulator` no guarda `update_interval_sec` ni `is_running`.

## Plan recomendado por fases

## Fase 0 (actual, estable)

- Mantener esquema actual para no romper Front ni Emuladores.
- Seguir con endpoint `POST /api/v1/telemetry` y topic `safeair/{emulatorId}/telemetry`.

## Fase 1 (alineacion minima sin romper)

1. Agregar columnas faltantes sin eliminar existentes:
   - `emulators.updateIntervalSec`, `emulators.isRunning`
   - `devices.size`, `devices.installedAt`, `devices.isActiveLegacy` (si requieren nomenclatura exacta)
2. Agregar tabla de estado actual de actuador:
   - `device_states(deviceId, powerState, mode, targetTemperature, updatedAt, source)`
3. Agregar topic de feedback:
   - `safeair/{roomId}/actuator-state`

## Fase 2 (alineacion fuerte con diccionario)

1. Definir estrategia para `cycle_measurement(metric,value)`:
   - Opcion A: crear vista SQL para exponer formato EAV sin tocar tabla actual.
   - Opcion B: doble escritura temporal y migracion gradual.
2. Mapear `device_action` a formato canonico con `device_id` si el consumidor lo exige.

## Fase 3 (cierre)

- Documentar contrato definitivo (API + MQTT + modelo de datos).
- Congelar diccionario y versionar cambios.

## SQL sugerido (fase 1)

```sql
ALTER TABLE emulators
  ADD COLUMN IF NOT EXISTS update_interval_sec integer,
  ADD COLUMN IF NOT EXISTS is_running boolean;

CREATE TABLE IF NOT EXISTS device_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL,
  power_state varchar(20) NOT NULL,
  mode varchar(40),
  target_temperature numeric(6,2),
  source varchar(20) NOT NULL DEFAULT 'emulator',
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

## Conclusion

- El sistema ya esta listo para operar con Front y Emuladores.
- Si el objetivo academico es cumplir el diccionario al 100%, falta una fase de alineacion de esquema.
- La ruta mas segura es evolucionar por compatibilidad, no reemplazar tablas en caliente.
