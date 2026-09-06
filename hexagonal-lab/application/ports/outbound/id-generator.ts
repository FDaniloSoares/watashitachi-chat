/**
 * PORTA DE SAÍDA — geração de identificadores.
 *
 * Mesma ideia do Clock: `randomUUID()` vem de `node:crypto`, ou seja, é
 * infraestrutura. Se o núcleo chamasse direto, ele passaria a depender do
 * runtime Node e o teste teria saída imprevisível.
 */

import type { TaskId } from '../../../domain/task';

export interface IdGenerator {
  next(): TaskId;
}
