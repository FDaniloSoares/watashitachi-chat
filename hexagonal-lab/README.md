# hexagonal-lab

Laboratório de estudo de **arquitetura hexagonal** (Alistair Cockburn, 2005 — também
chamada de *Ports & Adapters*). Domínio propositalmente bobo (uma lista de tarefas)
para que a atenção fique na estrutura, não nas regras.

Isolado do chat: nada aqui importa `server.ts` ou `ws/`, e nada lá importa daqui.

---

## A ideia em um parágrafo

Uma aplicação tem um **núcleo** (regras que existiriam mesmo se o sistema fosse
resolvido no papel) e um monte de **detalhes de tecnologia** (HTTP, banco, fila,
CLI, relógio). A arquitetura hexagonal diz: o núcleo declara **portas**
(interfaces) descrevendo o que ele oferece e o que ele precisa; a tecnologia entra
como **adaptadores** que implementam essas portas. A regra que sustenta tudo:

> **Toda dependência aponta para dentro.** O núcleo nunca importa a borda.

O "hexágono" não tem significado especial — são só seis lados para lembrar que há
vários pontos de entrada e saída, e não um "topo" e uma "base" como no desenho de
camadas tradicional.

---

## O desenho

```
        ADAPTADORES DE ENTRADA            ADAPTADORES DE SAÍDA
        (quem dirige a aplicação)         (quem a aplicação dirige)

            CLI ─────┐                        ┌───── InMemoryTaskRepository
                     │                        │
            HTTP ────┤                        ├───── JsonFileTaskRepository
                     │                        │
            teste ───┤                        ├───── SystemClock / UuidIdGenerator
                     │                        │
                     ▼                        ▼
              ┌────────────┐          ┌───────────────┐
              │ porta de   │          │  portas de    │
              │  ENTRADA   │          │    SAÍDA      │
              │TaskService │          │TaskRepository │
              │            │          │Clock          │
              │            │          │IdGenerator    │
              └─────┬──────┘          └───────▲───────┘
                    │                         │
                    ▼                         │
        ┌───────────────────────────────────────────────┐
        │  APLICAÇÃO   TaskServiceImpl (casos de uso)    │
        │  ┌─────────────────────────────────────────┐  │
        │  │  DOMÍNIO   Task, erros de negócio        │  │
        │  │  zero imports de fora                    │  │
        │  └─────────────────────────────────────────┘  │
        └───────────────────────────────────────────────┘
                    ▲
                    │ escolhe as implementações concretas
              main/composition-root.ts
```

Um detalhe que costuma confundir no começo: as setas dos adaptadores de **saída**
apontam para dentro mesmo sendo o núcleo quem chama. Quem *chama* é o núcleo, mas
quem *depende* (implementa a interface do outro) é o adaptador. Isso é inversão de
dependência, e é o coração da coisa.

---

## Mapa dos arquivos

| Arquivo | Papel |
| --- | --- |
| `domain/task.ts` | Entidade e regras. Não importa nada de fora. |
| `domain/errors.ts` | Erros de negócio, sem noção de HTTP. |
| `application/ports/inbound/task-service.ts` | **Porta de entrada**: o que dá para pedir. |
| `application/ports/outbound/task-repository.ts` | **Porta de saída**: o que o núcleo precisa. |
| `application/ports/outbound/clock.ts` | Porta de saída para o tempo (`new Date()` é I/O). |
| `application/ports/outbound/id-generator.ts` | Porta de saída para ids. |
| `application/services/task-service-impl.ts` | Casos de uso: orquestra, não decide regra. |
| `adapters/inbound/cli/cli-adapter.ts` | Adaptador de entrada: argv → porta. |
| `adapters/inbound/http/http-adapter.ts` | Adaptador de entrada: Fastify → porta. |
| `adapters/outbound/in-memory-task-repository.ts` | Adaptador de saída: `Map`. |
| `adapters/outbound/json-file-task-repository.ts` | Adaptador de saída: arquivo JSON. |
| `adapters/outbound/system-clock.ts`, `uuid-id-generator.ts` | Adaptadores de saída: Node. |
| `adapters/testing/fakes.ts` | Adaptadores de teste (relógio fixo, ids previsíveis). |
| `main/composition-root.ts` | O único lugar que conhece todo mundo. |
| `main/cli-main.ts`, `main/http-main.ts` | Pontos de entrada. |
| `tests/task-service.test.ts` | Testes do núcleo, sem infraestrutura. |

---

## Rodando

```bash
pnpm lab:test                              # 7 testes, sem servidor e sem disco

pnpm lab:cli add "estudar hexagonal"       # CLI (persiste em .data/tasks.json)
pnpm lab:cli list
pnpm lab:cli done <id>

pnpm lab:http                              # API em http://localhost:3333
```

Com o servidor no ar:

```bash
curl -X POST localhost:3333/tasks -H "content-type: application/json" -d '{"title":"via HTTP"}'
curl localhost:3333/tasks
curl -X POST localhost:3333/tasks/<id>/complete -H "content-type: application/json" -d '{}'
```

O `-H content-type` no `complete` não é capricho: sem ele o Fastify responde 415
antes de chegar no seu código.

Trocar de infraestrutura sem tocar em núcleo nenhum:

```bash
TASKS_STORAGE=file pnpm lab:http     # mesma API, agora gravando em disco
```

---

## Ordem sugerida de leitura

1. `domain/task.ts` — comece pelo centro; note a ausência de imports externos.
2. `application/ports/` — as quatro interfaces. É o "contrato" do hexágono.
3. `application/services/task-service-impl.ts` — como o caso de uso usa só portas.
4. `adapters/inbound/cli/` e depois `adapters/inbound/http/` — **o mesmo núcleo com
   duas caras diferentes**. Se um arquivo só merece leitura atenta, é esse par.
5. `main/composition-root.ts` — onde o abstrato vira concreto.
6. `tests/task-service.test.ts` — a recompensa: testar tudo sem subir nada.

---

## Exercícios (é aqui que se aprende)

1. **Novo adaptador de entrada.** Exponha as tarefas por WebSocket, reaproveitando o
   que você já tem no chat. Meta: não alterar **nenhum** arquivo de `domain/` ou
   `application/`. Se precisar alterar, a porta estava mal desenhada — pergunte-se por quê.
2. **Novo adaptador de saída.** Escreva um `SqliteTaskRepository`. Só
   `composition-root.ts` deve mudar.
3. **Nova regra de negócio.** "Tarefa concluída há mais de 30 dias é arquivada."
   Onde ela mora? (Resposta: em `Task`, não no service, não no adaptador.)
4. **Uma porta a mais.** Notificar alguém quando a tarefa é concluída. Crie
   `Notifier` em `ports/outbound`, um `ConsoleNotifier` e um `FakeNotifier` que grava
   as chamadas — e escreva o teste que verifica a notificação sem enviar nada.
5. **O erro clássico.** Faça `TaskServiceImpl` importar `JsonFileTaskRepository`
   direto, rode os testes e sinta o estrago: eles passam a tocar em disco. Depois
   desfaça. Esse exercício ensina mais que qualquer diagrama.
6. **Traduza para o chat.** Qual seria o domínio? (`Message`, `Participant`,
   `Room`.) A porta de saída? (`Broadcaster`, `MessageRepository`.) O adaptador de
   entrada? (as rotas WebSocket que já existem em `ws/chat-routes.ts`.)

---

## Armadilhas comuns

- **Anemia.** Se `Task` virar só um saco de campos e toda regra estiver no service,
  você fez camadas com nomes bonitos, não hexagonal. Regra mora na entidade.
- **Porta que fala a língua do banco.** Uma porta com `find(query: SQLQuery)` acopla
  o núcleo ao Postgres mesmo sendo uma interface. A porta é escrita no vocabulário
  do **domínio**.
- **Uma porta por classe.** Portas existem para fronteiras de tecnologia, não para
  cada arquivo. Interface para tudo é cerimônia, não arquitetura.
- **Vazar a entidade na resposta HTTP.** O JSON da API é um contrato com o cliente;
  a entidade é sua para refatorar. Por isso existe o `toResponse` no adaptador.
- **Achar que é sempre necessário.** Um CRUD de 200 linhas não precisa disso. O custo
  (indireção, mais arquivos) só se paga quando as regras têm vida própria ou a
  infraestrutura é volátil.
