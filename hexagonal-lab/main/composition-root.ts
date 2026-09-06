/**
 * COMPOSITION ROOT — o único lugar do sistema que conhece TODO MUNDO.
 *
 * Aqui as classes concretas são escolhidas e plugadas nas portas. Repare que
 * é o único arquivo que importa adaptadores E aplicação ao mesmo tempo.
 *
 * Concentrar o "wiring" num ponto só é o que mantém o resto do código sem
 * `new` espalhado — e é o que faz a troca de infraestrutura ser uma mudança de
 * uma linha. Experimente rodar o servidor com `TASKS_STORAGE=file`: nenhum
 * outro arquivo do projeto muda.
 */

import { TaskServiceImpl } from '../application/services/task-service-impl';
import type { TaskService } from '../application/ports/inbound/task-service';
import type { TaskRepository } from '../application/ports/outbound/task-repository';
import { InMemoryTaskRepository } from '../adapters/outbound/in-memory-task-repository';
import { JsonFileTaskRepository } from '../adapters/outbound/json-file-task-repository';
import { SystemClock } from '../adapters/outbound/system-clock';
import { UuidIdGenerator } from '../adapters/outbound/uuid-id-generator';

export type Storage = 'memory' | 'file';

export function buildTaskService(fallback: Storage = 'memory'): TaskService {
  const storage = (process.env.TASKS_STORAGE as Storage | undefined) ?? fallback;

  const repository: TaskRepository =
    storage === 'file'
      ? new JsonFileTaskRepository('hexagonal-lab/.data/tasks.json')
      : new InMemoryTaskRepository();

  return new TaskServiceImpl(repository, new SystemClock(), new UuidIdGenerator());
}
