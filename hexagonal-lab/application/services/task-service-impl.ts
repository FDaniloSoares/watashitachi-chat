/**
 * APLICAÇÃO — casos de uso.
 *
 * Esta camada orquestra: busca no repositório, chama a regra do domínio,
 * manda salvar. Ela NÃO contém regra de negócio (isso é da Task) e NÃO
 * conhece tecnologia (isso é dos adaptadores).
 *
 * Olhe os imports: só domínio e portas. Nenhum `import fastify`, nenhum
 * `import fs`. Esse arquivo roda igual num servidor HTTP, numa CLI ou num
 * teste unitário.
 */

import { Task, type TaskId } from '../../domain/task';
import { TaskNotFoundError } from '../../domain/errors';
import type { TaskService } from '../ports/inbound/task-service';
import type { TaskRepository } from '../ports/outbound/task-repository';
import type { Clock } from '../ports/outbound/clock';
import type { IdGenerator } from '../ports/outbound/id-generator';

export class TaskServiceImpl implements TaskService {
  // As dependências chegam pelo construtor (injeção de dependência).
  // Quem decide QUAIS implementações entram aqui é o composition root.
  constructor(
    private readonly repository: TaskRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async create(title: string): Promise<Task> {
    const task = Task.create(this.ids.next(), title, this.clock.now());

    await this.repository.save(task);

    return task;
  }

  async complete(id: TaskId): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) throw new TaskNotFoundError(id);

    // A decisão de "pode concluir?" está no domínio, não aqui.
    const completed = task.complete(this.clock.now());

    await this.repository.save(completed);

    return completed;
  }

  async list(): Promise<Task[]> {
    return this.repository.findAll();
  }
}
