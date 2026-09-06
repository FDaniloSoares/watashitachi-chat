/**
 * ADAPTADOR DE ENTRADA — HTTP com Fastify.
 *
 * O ponto pedagógico deste arquivo: ele resolve o MESMO problema que a CLI,
 * chamando exatamente as mesmas três operações da porta de entrada. Toda a
 * diferença entre "aplicação de terminal" e "API web" está contida aqui.
 *
 * Se você apagar esta pasta, o núcleo continua funcionando pela CLI. Essa é a
 * assimetria que a arquitetura hexagonal busca: adaptadores são descartáveis,
 * o núcleo não.
 */

import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import { DomainError, TaskNotFoundError } from '../../../domain/errors';
import type { Task } from '../../../domain/task';
import type { TaskService } from '../../../application/ports/inbound/task-service';

/**
 * Entidade do domínio -> JSON de resposta.
 *
 * Nunca devolva a entidade direto: o formato da API é um contrato com o
 * cliente, e o domínio precisa poder mudar sem quebrar esse contrato.
 */
function toResponse(task: Task) {
  return {
    id: task.id,
    title: task.title,
    done: task.done,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
  };
}

export function buildHttpAdapter(service: TaskService): FastifyInstance {
  const app = Fastify({ logger: false });

  // Erro de domínio -> status HTTP. Esta é a única parte do sistema que
  // conhece as duas linguagens ao mesmo tempo.
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error instanceof TaskNotFoundError) {
      return reply.status(404).send({ error: error.message });
    }

    if (error instanceof DomainError) {
      return reply.status(400).send({ error: error.message });
    }

    // Erros do próprio Fastify (JSON inválido, content-type não suportado...)
    // já vêm com status. Sem esta linha, um 415 viraria 500 e você perderia
    // horas procurando bug no domínio — foi exatamente o que aconteceu ao
    // testar este arquivo pela primeira vez.
    if (typeof error.statusCode === 'number' && error.statusCode < 500) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    console.error(error);

    return reply.status(500).send({ error: 'erro interno' });
  });

  app.post<{ Body: { title?: string } }>('/tasks', async (request, reply) => {
    const task = await service.create(request.body?.title ?? '');

    return reply.status(201).send(toResponse(task));
  });

  app.post<{ Params: { id: string } }>('/tasks/:id/complete', async (request) => {
    return toResponse(await service.complete(request.params.id));
  });

  app.get('/tasks', async () => {
    return (await service.list()).map(toResponse);
  });

  return app;
}
