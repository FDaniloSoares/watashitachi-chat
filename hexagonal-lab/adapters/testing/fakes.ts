/**
 * ADAPTADORES DE TESTE.
 *
 * Sim: um fake de teste é um adaptador como qualquer outro. Ele implementa a
 * mesma porta que o adaptador de produção.
 *
 * É por isso que numa arquitetura hexagonal você quase não precisa de
 * biblioteca de mock — a substituição já está prevista no desenho.
 */

import type { Clock } from '../../application/ports/outbound/clock';
import type { IdGenerator } from '../../application/ports/outbound/id-generator';

/** Relógio que nunca anda: deixa asserções sobre data determinísticas. */
export class FixedClock implements Clock {
  constructor(private readonly fixed: Date) {}

  now(): Date {
    return this.fixed;
  }
}

/** Ids previsíveis: task-1, task-2, task-3... */
export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  next(): string {
    this.counter += 1;

    return `task-${this.counter}`;
  }
}
