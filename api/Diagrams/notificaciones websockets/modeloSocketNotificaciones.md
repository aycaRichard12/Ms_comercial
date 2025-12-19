# Modelo C4 - Sistema Web con Notificaciones en Tiempo Real

Este documento muestra un **modelo C4 simplificado** de un sistema web con backend y frontend en PHP y notificaciones en tiempo real usando un **WebSocket externo** (como Pusher o Ably).

---

## 1️⃣ Nivel de Sistema (Context)

```mermaid
graph TD
    Usuario[Usuario] -->|Usa| Frontend[Frontend PHP]
    Frontend -->|HTTP Requests| Backend[Backend PHP]
    Backend -->|Envía eventos| WebSocket[Servidor WebSocket Externo]
    WebSocket -->|Eventos en tiempo real| Frontend



```

```mermaid
graph TD
    Frontend -->|Solicitudes| Backend
    Backend -->|Emitir evento| WebSocket
    WebSocket -->|Notificación en tiempo real| Frontend

    subgraph Frontend
        F1[Componente Solicitudes]
        F2[Componente Notificaciones]
    end

    subgraph Backend
        B1[Controlador Solicitudes]
        B2[Servicio Notificaciones]
    end
```
