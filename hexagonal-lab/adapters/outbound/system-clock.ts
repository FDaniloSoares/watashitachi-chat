/**
 * ADAPTADOR DE SAÍDA — o relógio real do sistema.
 *
 * Todo o "contato com o mundo" fica concentrado nesta linha. No teste, esta
 * classe é substituída por um relógio fixo (ver adapters/testing).
 */

import type { Clock } from '../../application/ports/outbound/clock';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
