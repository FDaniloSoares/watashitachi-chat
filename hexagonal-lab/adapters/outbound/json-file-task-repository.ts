/**
 * ADAPTADOR DE SAÍDA — a MESMA porta TaskRepository, agora gravando em disco.
 *
 * Este é o momento em que a arquitetura hexagonal paga o investimento: você
 * troca memória por arquivo (ou por Postgres) e nem o domínio nem os casos de
 * uso nem a CLI nem o HTTP sabem que algo mudou. Só o composition root muda.
 *
 * Note também o par toRow/toDomain: a tradução entre o formato de
 * armazenamento (JSON com datas em string) e a entidade do domínio mora AQUI,
 * no adaptador. O domínio nunca vê `string` no lugar de `Date`.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Task, type TaskId } from '../../domain/task';
import type { TaskRepository } from '../../application/ports/outbound/task-repository';

/** Como a tarefa é representada no arquivo — não é a entidade do domínio. */
type TaskRow = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
};

export class JsonFileTaskRepository implements TaskRepository {
  constructor(private readonly filePath: string) {}

  async save(task: Task): Promise<void> {
    const rows = await this.readRows();
    const index = rows.findIndex((row) => row.id === task.id);
    const row = JsonFileTaskRepository.toRow(task);

    if (index >= 0) rows[index] = row;
    else rows.push(row);

    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(rows, null, 2), 'utf8');
  }

  async findById(id: TaskId): Promise<Task | null> {
    const row = (await this.readRows()).find((candidate) => candidate.id === id);

    return row ? JsonFileTaskRepository.toDomain(row) : null;
  }

  async findAll(): Promise<Task[]> {
    return (await this.readRows()).map(JsonFileTaskRepository.toDomain);
  }

  private async readRows(): Promise<TaskRow[]> {
    try {
      return JSON.parse(await readFile(this.filePath, 'utf8')) as TaskRow[];
    } catch {
      // Arquivo ainda não existe ou está corrompido: começa vazio.
      return [];
    }
  }

  private static toRow(task: Task): TaskRow {
    return {
      id: task.id,
      title: task.title,
      done: task.done,
      createdAt: task.createdAt.toISOString(),
      completedAt: task.completedAt?.toISOString() ?? null,
    };
  }

  private static toDomain(row: TaskRow): Task {
    return Task.restore({
      id: row.id,
      title: row.title,
      done: row.done,
      createdAt: new Date(row.createdAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
    });
  }
}
