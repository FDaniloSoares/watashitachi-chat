import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";

type ClientEvent = {
  type?: unknown;
  text?: unknown;
  isTyping?: unknown;
};

export async function ChatRoutes(app: FastifyInstance) {
  app.get(
    "/ws",
    { websocket: true },
    async (socket, _request) => {
      const id = randomUUID();

      const send = (target: WebSocket, payload: unknown) => {
        if (target.readyState === target.OPEN) {
          target.send(JSON.stringify(payload));
        }
      };

      const broadcast = (payload: unknown, includeSelf = false) => {
        for (const client of app.websocketServer.clients) {
          if (!includeSelf && client === socket) continue;
          send(client, payload);
        }
      };

      send(socket, { type: 'welcome', id });
      broadcast({ type: 'notification', text: 'Someone joined the chat' });

      socket.on('message', (raw, isBinary) => {
        if (isBinary) return;

        let event: ClientEvent;
        try {
          event = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (event.type === 'message') {
          const text = String(event.text ?? '').trim();
          if (!text) return;

          console.log('recebi: ', text);
          broadcast({ type: 'message', from: id, text }, true);
          return;
        }

        if (event.type === 'typing') {
          broadcast({ type: 'typing', from: id, isTyping: Boolean(event.isTyping) });
        }
      });

      socket.on('error', (error) => {
        app.log.error({ err: error }, 'websocket error');
      });

      socket.on('close', () => {
        broadcast({ type: 'typing', from: id, isTyping: false });
        broadcast({ type: 'notification', text: 'Someone left the chat' });
        console.log('Client disconnected');
      });
    },
  );
}
