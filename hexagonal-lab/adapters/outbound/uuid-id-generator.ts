/**
 * ADAPTADOR DE SAÍDA — ids via `node:crypto`.
 *
 * O único arquivo do "lado de dentro para fora" que sabe que estamos rodando
 * em Node. Num browser ou num Deno, você escreveria outro adaptador e o núcleo
 * continuaria idêntico.
 */

import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '../../application/ports/outbound/id-generator';

export class UuidIdGenerator implements IdGenerator {
  next(): string {
    return randomUUID();
  }
}
