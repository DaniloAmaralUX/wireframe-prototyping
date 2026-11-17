# Wireframe Prototyping com viewer

Descreva uma ideia no chat do seu agente e receba um wireframe interativo no Prototype Viewer, com requisitos e fluxos nas notas. A skill inclui o viewer, os exemplos e o empacotador; pode ser instalada em outro projeto sem depender de outro repositório ou skill.

## Instalar

No terminal do projeto de destino:

```sh
npx skills add DaniloAmaralUX/wireframe-prototyping --skill wireframe-prototyping
```

O instalador atual requer Node.js 22.20+. Selecione seu agente quando solicitado. A descoberta de skills depende do agente utilizado; se necessário, recarregue a lista ou indique o caminho do `SKILL.md` instalado no chat.

A instalação fica no projeto onde o comando foi executado e inclui o viewer completo. Use este repositório para obter a adaptação com viewer; a URL original de AJ Geddes instala a versão upstream.

## Atualizar nos projetos

As mudanças precisam primeiro ser publicadas neste repositório, com commit e push para `main`. Depois, no terminal de cada projeto que utiliza a skill, execute:

```sh
npx skills update wireframe-prototyping --project
```

O comando atualiza somente esta skill e o viewer incluído. Depois, recarregue as skills ou abra uma nova conversa na IDE para o agente carregar as novas instruções. As instalações nos outros projetos não mudam automaticamente quando uma alteração é publicada no GitHub.

O atualizador usa a origem registrada na instalação. Se você copiou a pasta manualmente ou instalou a skill original de AJ Geddes, execute o comando de instalação acima para passar a usar este repositório como origem.

Os protótipos já gerados permanecem como estão. Para aplicar mudanças do viewer a um protótipo existente, peça ao agente:

```text
Use a skill wireframe-prototyping atualizada para gerar novamente
o protótipo em prototypes/<slug>, preservando seus requisitos e fluxos.
```

Centralize as alterações na cópia deste repositório e publique-as no GitHub. Mudanças feitas diretamente nas cópias instaladas podem ser sobrescritas na próxima atualização.

## Usar

```text
Use a skill wireframe-prototyping.
Quero um sistema para reservar salas e acompanhar minhas reservas.
```

O agente organiza os fluxos, cria telas de baixa fidelidade, verifica as interações e entrega um HTML portátil. As fontes ficam em `prototypes/<slug>/`; HTML, SPEC e relatório ficam em `prototypes/<slug>/dist/`. O destino pode ser ajustado no pedido.

Quem recebe o HTML pode abrir por duplo clique. Ele contém o viewer e as telas, com estilos e scripts incorporados. Não há backend ou envio real por padrão. A fonte Inter é opcional, com fallback do sistema sem rede.

## Requisitos

- Agente com suporte a skills e execução de comandos locais.
- Python 3.10+ e Node.js 18+ para gerar e verificar; para instalar pelo `npx skills` atual, use Node.js 22.20+.
- Navegador moderno para visualizar.

Nenhum `pip install`, `npm install` na aplicação, servidor ou outra skill é necessário para gerar. O pacote não transpila componentes React/Vue ou TSX do projeto existente; cria HTML, CSS e JavaScript nativos em uma pasta própria. O teste com usuários continua sendo uma etapa separada da geração e dos checks técnicos.

## Estrutura

```text
SKILL.md              Instruções para o agente
agents/               Metadados de descoberta
references/           Wireframes, instalação e contrato de entrega
scripts/viewer.py     Inicialização e geração independentes
assets/viewer/        Viewer completo, exemplo mínimo e licenças
templates/            Template original de referência
tests/                Testes de portabilidade e geração
```

## Desenvolvimento

```sh
python -m unittest discover -s tests -p "test_*.py"
python scripts/package.py
```

O segundo comando gera `dist/wireframe-prototyping.zip`. Para testar a geração manualmente:

```sh
python scripts/viewer.py init prototypes/exemplo
python scripts/viewer.py build prototypes/exemplo
```

O build retorna JSON com `status`, `artifacts`, `checks` e `errors`. `human_review.status` permanece `not_run`, pois a revisão no navegador é separada. Falhas não anunciam um HTML de tentativa anterior como resultado válido.

## Créditos

Adaptação da skill de [AJ Geddes / useful-ai-prompts](https://github.com/aj-geddes/useful-ai-prompts), com licença MIT preservada em [LICENSE](LICENSE). O viewer deriva de [Apparicio Bueno / prototype-viewer](https://github.com/appariciojunior/prototype-viewer), adaptado com identidade Pitang. Veja [ORIGIN.md](ORIGIN.md) e [créditos do viewer](assets/viewer/CREDITS.md) para origem, licenças e runtimes opcionais do UI SDK. As marcas pertencem aos respectivos titulares.
