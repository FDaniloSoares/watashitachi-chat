/**
 * ADAPTADOR DE ENTRADA — CLI.
 *
 * Trabalho de um adaptador de entrada, sempre o mesmo em qualquer tecnologia:
 *   1. traduzir a entrada do mundo externo (aqui, argv) para uma chamada da
 *      porta de entrada;
 *   2. traduzir o resultado (ou o erro) de volta para o mundo externo (aqui,
 *      texto no stdout e exit code).
 *
 * Ele depende de `TaskService`, a INTERFACE. Nunca de `TaskServiceImpl`.
 */

import { DomainError } from '../../../domain/errors';
import type { TaskService } from '../../../application/ports/inbound/task-service';

const USAGE = `
Uso:
  pnpm lab:cli add "<titulo>"    cria uma tarefa
  pnpm lab:cli done <id>         conclui uma tarefa
  pnpm lab:cli list              lista as tarefas
`.trim();

export async function runCli(service: TaskService, argv: string[]): Promise<number> {
  const [command, ...rest] = argv;

  try {
    switch (command) {
      case 'add': {
        const task = await service.create(rest.join(' '));
        console.log(`criada: ${task.id}  ${task.title}`);

        return 0;
      }

      case 'done': {
        const task = await service.complete(rest[0] ?? '');
        console.log(`concluida: ${task.id}  ${task.title}`);

        return 0;
      }

      case 'list': {
        const tasks = await service.list();
        if (tasks.length === 0) console.log('(nenhuma tarefa)');

        for (const task of tasks) {
          console.log(`${task.done ? '[x]' : '[ ]'} ${task.id}  ${task.title}`);
        }

        return 0;
      }

      default:
        console.log(USAGE);

        return 1;
    }
  } catch (error) {
    // Tradução do erro de domínio para a linguagem deste adaptador:
    // na CLI, "erro de negócio" vira mensagem + exit code.
    if (error instanceof DomainError) {
      console.error(`erro: ${error.message}`);

      return 1;
    }

    throw error;
  }
}
