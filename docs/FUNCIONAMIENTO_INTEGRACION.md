# Funcionamiento de integracion (EMQX + API + DB)

Este documento resume lo esencial para que Front y Emuladores se conecten sin friccion.

## Componentes

- EMQX: transporte MQTT y reglas de enrutamiento/validacion.
- API SafeAir: validacion, logica de negocio, persistencia y publicacion de acciones/alertas.
- PostgreSQL: almacenamiento historico de mediciones y eventos.

## Contratos de integracion

## Emuladores por MQTT

- Topic de entrada: `safeair/{emulatorId}/telemetry`
- QoS recomendado: 1
- Payload requerido: `temperature`, `humidity`, `co2`, `pm25`
- Payload opcional: `timestamp`, `roomId`

## Emuladores por HTTP (alternativo)

- Endpoint: `POST /api/v1/metrics/telemetry`
- Header obligatorio: `x-api-key: <TELEMETRY_API_KEY>`
- Body JSON con el mismo contrato de telemetria.

## Frontend

- Base API: `<API_URL>/api/v1`
- Login: `POST /auth/login`
- Endpoints protegidos por JWT (`Authorization: Bearer <token>`).

## Seguridad

- `x-api-key` solo para ingreso de telemetria por HTTP.
- JWT para endpoints de usuario y consulta.
- En EMQX aplicar ACL para limitar publicacion de emuladores a `safeair/+/telemetry`.

## Flujo operativo

1. Emulador publica telemetria por MQTT o HTTP.
2. API valida y resuelve `emulatorId`.
3. API persiste measurement en PostgreSQL.
4. API evalua reglas de negocio.
5. API publica acciones y alarmas a topics de salida.

## Datos que debes compartir al equipo

- URL de API.
- Puerto/API base.
- Topic MQTT de entrada.
- API key de telemetria HTTP.
- Ejemplo de payload valido.
