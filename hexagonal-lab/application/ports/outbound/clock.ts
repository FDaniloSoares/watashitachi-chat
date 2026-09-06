/**
 * PORTA DE SAÍDA — o tempo.
 *
 * Parece exagero ter uma porta só para `new Date()`, mas é um ótimo exemplo
 * didático: `new Date()` é I/O disfarçado. Ele consulta um recurso externo
 * (o relógio do sistema) e devolve um valor diferente a cada chamada.
 *
 * Com esta porta, o teste injeta um relógio fixo e as asserções sobre data
 * ficam determinísticas — sem mock de biblioteca, sem "congelar o tempo".
 */

export interface Clock {
  now(): Date;
}
