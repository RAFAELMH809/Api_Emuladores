# SafeAir API

Backend base para SafeAir construido con Node.js, TypeScript, Express, Sequelize y PostgreSQL, con integracion MQTT (EMQX).

## Estructura separada

- `src/` contiene la API (lista para desplegarse por separado, por ejemplo en Render).
- `database/` contiene infraestructura local de PostgreSQL (docker-compose + scripts).

## Trazabilidad de fecha de peticiones

- Telemetria: `cycle_measurements` guarda `measuredAt` y `receivedAt`.
- API HTTP: `api_request_logs` guarda fecha de recepcion y respuesta por request.

## Scripts

- `npm run dev`: inicia servidor de desarrollo
- `npm run build`: compila TypeScript
- `npm run start`: ejecuta compilado
- `npm run typecheck`: validacion de tipos
- `npm run seed`: ejecuta datos semilla

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar valores segun el entorno.

## Documentacion y skills

Se integraron dos skills para reforzar la documentacion del proyecto:

- `documentation-writer`: guia de documentacion basada en Diataxis.
- `plantuml-diagram-generator`: guia para generar diagramas tecnicos con PlantUML.

Guias agregadas:

- `docs/FUNCIONAMIENTO_INTEGRACION.md`
- `docs/EMQX_RULES.md`
- `docs/PLANTUML.md`
- `docs/diagrams/architecture/safeair-runtime-flow.puml`

Plantillas de entorno:

- `.env.example`
- `.env.staging.example`
