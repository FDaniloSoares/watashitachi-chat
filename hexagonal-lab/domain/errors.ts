/**
 * DOMÍNIO — erros de negócio.
 *
 * Repare que não existe "HTTP 400" ou "status code" aqui. O domínio não sabe
 * que existe HTTP. Traduzir esses erros para o mundo externo é trabalho do
 * adaptador de entrada (ver adapters/inbound/http).
 */

export class DomainError extends Error {}

export class EmptyTitleError extends DomainError {
  constructor() {
    super('O título da tarefa não pode ser vazio');
  }
}

export class TitleTooLongError extends DomainError {
  constructor(max: number) {
    super(`O título da tarefa não pode passar de ${max} caracteres`);
  }
}

export class TaskAlreadyDoneError extends DomainError {
  constructor(id: string) {
    super(`A tarefa ${id} já está concluída`);
  }
}

export class TaskNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Tarefa ${id} não encontrada`);
  }
}
