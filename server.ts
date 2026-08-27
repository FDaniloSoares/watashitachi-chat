import Fastify from 'fastify';
import { fileURLToPath } from 'node:url';
import websocket from '@fastify/websocket'
import fastfyStatic from '@fastify/static'
import { ChatRoutes } from './ws/chat-routes';

const fastify = Fastify({
  logger: true,
});


await fastify.register(fastfyStatic, {
  root: fileURLToPath(new URL('public', import.meta.url)),
});

fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

await fastify.register(websocket);

fastify.register(ChatRoutes);

const PORT = Number(process.env.PORT) || 3000;

const start = async () => {
  try {
    await fastify.listen({  port: PORT, host: '0.0.0.0'});
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();