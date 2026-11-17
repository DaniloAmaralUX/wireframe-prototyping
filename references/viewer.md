# Viewer incluído na skill

O viewer e seu empacotador estão em [assets/viewer](../assets/viewer/template/build.py). O [script de geração](../scripts/viewer.py) resolve esses arquivos pela própria localização, independentemente do projeto ou da pasta de instalação. Use Python 3.10+ e Node.js 18+ para gerar e verificar. O HTML final precisa apenas de navegador moderno. Não instale bibliotecas no projeto de destino.

## Iniciar e gerar em qualquer projeto

Localize a pasta da skill instalada a partir do caminho do `SKILL.md` carregado. Nos comandos abaixo, substitua `<pasta-da-skill>` pelo caminho real e `<slug>` pelo nome do novo protótipo. Execute a partir do projeto da pessoa, usando aspas nos caminhos:

```sh
python "<pasta-da-skill>/scripts/viewer.py" init "prototypes/<slug>"
```

Isso copia o exemplo mínimo para uma pasta independente, sem sobrescrever arquivos existentes. Adapte os quatro arquivos à ideia recebida:

- `project.json`: `id`, `name`, lista `flows` com `id`/`title` e `sum` opcional; `navigation` opcional com `id`, `label`, `flow` e `version` a partir de zero.
- `screens.js`: registre cada fluxo uma única vez com `Proto.versions(id, [versões])`.
- `styles.css`: estilos limitados a `.ph`.
- `delivery.json`: requisitos, hipóteses, simulações e limites. Substitua os exemplos pelos requisitos da ideia.

Depois execute:

```sh
python "<pasta-da-skill>/scripts/viewer.py" build "prototypes/<slug>"
```

O script valida JSON, sintaxe JavaScript e registro dos fluxos; gera `prototypes/<slug>/dist/<id>.html`, `<id>-SPEC.md` e `resultado.json`. Confira código de saída e `status`; falhas retornam código 1 e `errors`. O relatório só anuncia HTML e SPEC após geração bem-sucedida. Arquivos de tentativas anteriores podem permanecer no disco; não os entregue como resultado de uma tentativa que falhou.

Python e Node ausentes são bloqueios de geração; informe o requisito faltante sem alterar o ambiente automaticamente. Os comandos são trabalho interno do agente. Não peça que a pessoa execute o build quando você puder fazê-lo.

## Contrato das telas

Use [o exemplo incluído](../assets/viewer/starter/screens.js) como ponto de partida. Cada versão possui `name`, `render(root, ctx)` e notas:

| Campo | Conteúdo no viewer |
| --- | --- |
| `axis` | Objetivo da tela ou decisão que se pretende avaliar |
| `fixes` | Requisitos contemplados, em linguagem de produto |
| `tryThis` | Ações concretas para experimentar o fluxo |
| `tradeoff` | Hipóteses, simulações e limitações |

`render` é síncrona e pode retornar uma função de limpeza. `ctx.go(id, versão = 0)` navega; `ctx.toast(texto)` exibe feedback. `ctx.theme`, `ctx.large` e `ctx.reduced` consultam preferências. Trocas de fluxo/versão remontam a tela; estado compartilhado precisa ficar fora de `render`. Limpe listeners, timers e observadores ao desmontar, e antes de remontagens internas.

O Kit é opcional e fica em `window.Kit`: `Kit.esc(texto)` escapa conteúdo, `Kit.on(root, seletor, evento, handler)` devolve uma função de limpeza, `Kit.bar({title, icons: []})` monta o cabeçalho e `Kit.tabs(id)` usa a navegação declarada no JSON. Consulte [kit.js](../assets/viewer/template/src/kit.js) e [kit.css](../assets/viewer/template/src/kit.css) somente conforme necessário. Não altere o shell por regras do domínio.

Use os tokens `--sk-bg`, `--sk-surface`, `--sk-ink`, `--sk-ink-2`, `--sk-ink-3`, `--sk-accent`, `--sk-on-accent`, `--sk-focus` e `--fs`. Variações podem usar `.ph[data-theme="dark"]` e `.ph[data-device="web"]`. A classe `.sk-scroll` tem posicionamento próprio para o Kit; para layout próprio, defina a área de scroll sem sobrepor cabeçalho ou navegação. Preserve a logo Pitang do viewer.

Use HTML/CSS/JavaScript nativos, com nomes acessíveis, teclado, foco visível e ações reais. Escape dados inseridos em HTML. O build não transpila JSX/TSX nem resolve imports npm; o template TSX original é apenas referência. Os runtimes opcionais já incorporados de UI SDK acompanham o viewer: `"uiSdk": ["combobox"]` habilita `Kit.combobox`, e `"uiSdk": ["workflow"]` inclui também input/button/dialog. São opcionais; prefira controles nativos quando suficientes. Não use APIs adicionais do SDK sem consultar documentação compatível. Nenhuma outra skill é necessária à geração.

## Requisitos e entrega

O [delivery.json inicial](../assets/viewer/starter/delivery.json) demonstra `schema_version: "1.0"`, `requirements` com `id`/`description`/`flow` e listas de texto `assumptions`, `simulations` e `limitations`. IDs devem ser únicos e os fluxos precisam existir. Não invente requisitos para preencher o exemplo. Notas e comportamento precisam corresponder ao solicitado e implementado.

Abra o HTML gerado e percorra tarefas principais, erro/vazio aplicáveis, conservação de estado, voltar/editar, teclado e foco dos modais. Confira cortes e sobreposições nas molduras/temas afetados, inclusive texto Grande quando relevante. Registre esperado, observado e evidência em `prototypes/<slug>/validacao.md`; informe bloqueios. Se editar fontes, gere novamente e repita os percursos afetados.

O relatório conserva `human_review.status: not_run`: checks de geração não comprovam a experiência no navegador. A revisão do agente também não equivale ao teste com usuários sugerido em [Prototype Testing](prototype-testing.md). Não invente participantes ou resultados.

Entregue primeiro o caminho do HTML e instrução para abrir por duplo clique. Resuma o que funciona e os limites relevantes; inclua SPEC, resultado e validação como complementos. Não exija acesso a este repositório nem copie infraestrutura para a aplicação da pessoa. O HTML contém o viewer e as telas; a fonte Inter é opcional e pode usar fallback sem rede.
