/**
 * ADAPTADOR DE SAÍDA — implementa TaskRepository usando um Map na memória.
 *
 * É a implementação mais burra possível da porta, e é exatamente por isso que
 * ela é útil: serve para rodar a aplicação sem infraestrutura nenhuma e para
 * os testes rodarem em milissegundos.
 *
 * Compare com json-file-task-repository.ts: o núcleo não distingue os dois.
 */

import type { Task, TaskId } from '../../domain/task';
import type { TaskRepository } from '../../application/ports/outbound/task-repository';

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<TaskId, Task>();

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async findById(id: TaskId): Promise<Task | null> {
    return this.tasks.get(id) ?? null;
  }

  async findAll(): Promise<Task[]> {
    return [...this.tasks.values()];
  }
}
