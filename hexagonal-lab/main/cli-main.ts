/**
 * PONTO DE ENTRADA — CLI.
 *
 * Monta o núcleo e entrega para o adaptador de CLI. Só isso.
 *
 * Aqui o padrão é o repositório em arquivo, porque cada execução da CLI é um
 * processo novo — com o repositório em memória, `add` e depois `list` nunca se
 * enxergariam. Repare que essa é uma decisão de INFRAESTRUTURA, tomada na
 * borda: o caso de uso não sabe nem se importa.
 */

import { buildTaskService } from './composition-root';
import { runCli } from '../adapters/inbound/cli/cli-adapter';

const service = buildTaskService('file');

process.exitCode = await runCli(service, process.argv.slice(2));
