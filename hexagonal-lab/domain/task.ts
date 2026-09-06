/**
 * DOMÍNIO — o centro do hexágono.
 *
 * Regra número 1: este arquivo não importa NADA de fora do domínio.
 * Sem Fastify, sem banco, sem `node:fs`, sem `node:crypto`. Só TypeScript puro.
 *
 * Se um dia você trocar Fastify por Express, ou memória por Postgres, este
 * arquivo não muda uma vírgula. Esse é o teste prático de "está no domínio?".
 */

import { EmptyTitleError, TaskAlreadyDoneError, TitleTooLongError } from './errors';

export type TaskId = string;

const MAX_TITLE_LENGTH = 120;

export class Task {
  // Construtor privado: ninguém cria uma Task pulando as validações.
  private constructor(
    readonly id: TaskId,
    readonly title: string,
    readonly done: boolean,
    readonly createdAt: Date,
    readonly completedAt: Date | null,
  ) {}

  /** Fábrica com as invariantes de criação. */
  static create(id: TaskId, title: string, createdAt: Date): Task {
    const clean = title.trim();

    if (clean.length === 0) throw new EmptyTitleError();
    if (clean.length > MAX_TITLE_LENGTH) throw new TitleTooLongError(MAX_TITLE_LENGTH);

    return new Task(id, clean, false, createdAt, null);
  }

  /**
   * Reconstrói uma Task vinda do armazenamento (banco, arquivo, etc.).
   *
   * Existe separado de `create` porque os dados já persistidos não devem ser
   * revalidados como se fossem novos — eles já passaram pela regra um dia.
   */
  static restore(props: {
    id: TaskId;
    title: string;
    done: boolean;
    createdAt: Date;
    completedAt: Date | null;
  }): Task {
    return new Task(props.id, props.title, props.done, props.createdAt, props.completedAt);
  }

  /**
   * Regra de negócio de verdade: concluir uma tarefa.
   *
   * Retorna uma nova Task em vez de mutar a atual (imutabilidade deixa o
   * domínio mais fácil de testar e raciocinar).
   */
  complete(completedAt: Date): Task {
    if (this.done) throw new TaskAlreadyDoneError(this.id);

    return new Task(this.id, this.title, true, this.createdAt, completedAt);
  }
}
