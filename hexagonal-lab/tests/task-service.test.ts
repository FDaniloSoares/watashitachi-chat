/**
 * TESTES DO NÚCLEO.
 *
 * O recado deste arquivo: para testar toda a regra da aplicação não subimos
 * servidor, não tocamos em disco, não usamos biblioteca de mock e não
 * esperamos I/O. Só trocamos os adaptadores por fakes.
 *
 * Quando testar dói, geralmente é sinal de que o núcleo está acoplado à borda.
 * A arquitetura hexagonal é, na prática, uma forma de manter esse teste fácil.
 *
 * Rode com: pnpm lab:test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TaskServiceImpl } from '../application/services/task-service-impl';
import { InMemoryTaskRepository } from '../adapters/outbound/in-memory-task-repository';
import { FixedClock, SequentialIdGenerator } from '../adapters/testing/fakes';
import { EmptyTitleError, TaskAlreadyDoneError, TaskNotFoundError } from '../domain/errors';
import { Task } from '../domain/task';

const NOW = new Date('2026-01-01T12:00:00.000Z');

function makeService() {
  const repository = new InMemoryTaskRepository();
  const service = new TaskServiceImpl(repository, new FixedClock(NOW), new SequentialIdGenerator());

  return { service, repository };
}

test('cria uma tarefa pendente com id e data do relógio injetado', async () => {
  const { service } = makeService();

  const task = await service.create('  estudar arquitetura hexagonal  ');

  assert.equal(task.id, 'task-1');
  assert.equal(task.title, 'estudar arquitetura hexagonal'); // o domínio faz o trim
  assert.equal(task.done, false);
  assert.deepEqual(task.createdAt, NOW);
});

test('recusa título vazio', async () => {
  const { service } = makeService();

  await assert.rejects(() => service.create('   '), EmptyTitleError);
});

test('conclui uma tarefa e persiste o novo estado', async () => {
  const { service, repository } = makeService();
  const created = await service.create('ler sobre portas e adaptadores');

  const completed = await service.complete(created.id);

  assert.equal(completed.done, true);
  assert.deepEqual(completed.completedAt, NOW);
  assert.equal((await repository.findById(created.id))?.done, true);
});

test('não deixa concluir duas vezes', async () => {
  const { service } = makeService();
  const created = await service.create('desenhar o hexágono');
  await service.complete(created.id);

  await assert.rejects(() => service.complete(created.id), TaskAlreadyDoneError);
});

test('erro ao concluir tarefa inexistente', async () => {
  const { service } = makeService();

  await assert.rejects(() => service.complete('nao-existe'), TaskNotFoundError);
});

test('lista o que foi criado', async () => {
  const { service } = makeService();
  await service.create('primeira');
  await service.create('segunda');

  const titles = (await service.list()).map((task) => task.title);

  assert.deepEqual(titles, ['primeira', 'segunda']);
});

// Teste de domínio puro: nem service, nem repositório, nem async.
test('domínio: a entidade é imutável ao concluir', () => {
  const task = Task.create('t1', 'imutabilidade', NOW);

  const completed = task.complete(NOW);

  assert.equal(task.done, false);
  assert.equal(completed.done, true);
});
