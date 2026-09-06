/**
 * PORTA DE SAÍDA (driven port / secondary port).
 *
 * O núcleo declara o que PRECISA ("quero guardar e buscar tarefas"), e não
 * como isso é feito. Quem implementa é o mundo externo: memória, arquivo,
 * Postgres, Redis, uma API de terceiro.
 *
 * Ponto-chave da arquitetura hexagonal: a interface pertence ao núcleo, a
 * implementação pertence à borda. A dependência aponta de fora para dentro.
 * (Compare com a arquitetura em camadas clássica, onde o serviço importa o
 * repositório concreto e vira refém dele.)
 *
 * Repare também que a assinatura não vaza detalhe de tecnologia: nada de
 * `query`, `collection`, `SELECT`. Se a porta falasse SQL, o núcleo estaria
 * acoplado ao banco mesmo por trás de uma interface.
 */

import type { Task, TaskId } from '../../../domain/task';

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  findAll(): Promise<Task[]>;
}
