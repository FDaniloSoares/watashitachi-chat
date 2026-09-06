/**
 * PONTO DE ENTRADA — HTTP.
 *
 * O MESMO `buildTaskService()` da CLI, com outro adaptador plugado na frente.
 * Compare este arquivo com cli-main.ts: as duas aplicações compartilham 100%
 * do núcleo e 0% da borda.
 *
 * Porta 3333 para não colidir com o chat, que usa a 3000.
 */

import { buildTaskService } from './composition-root';
import { buildHttpAdapter } from '../adapters/inbound/http/http-adapter';

const app = buildHttpAdapter(buildTaskService('memory'));

const PORT = Number(process.env.LAB_PORT) || 3333;

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`hexagonal-lab HTTP em http://localhost:${PORT}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
