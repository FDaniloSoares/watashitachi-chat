/**
 * PORTA DE ENTRADA (driving port / primary port).
 *
 * É o contrato de "tudo que dá para pedir para esta aplicação".
 * Quem chama: adaptadores de entrada (CLI, HTTP, WebSocket, um teste...).
 * Quem implementa: a camada de aplicação (application/services).
 *
 * O adaptador de entrada depende DESTA interface, nunca da classe concreta.
 * É isso que permite trocar CLI por HTTP sem tocar no núcleo.
 */

import type { Task, TaskId } from '../../../domain/task';

export interface TaskService {
  create(title: string): Promise<Task>;
  complete(id: TaskId): Promise<Task>;
  list(): Promise<Task[]>;
}
