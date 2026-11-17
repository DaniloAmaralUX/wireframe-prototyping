# Instalação em outro projeto

O pacote contém a skill e o viewer completo. Não é necessário clonar o repositório do Prototype Viewer, carregar outra skill ou adicionar dependências à aplicação.

## Instalar

Pelo GitHub, execute no projeto onde deseja usar a skill:

```sh
npx skills add DaniloAmaralUX/wireframe-prototyping --skill wireframe-prototyping
```

O instalador atual requer Node.js 22.20+. A instalação usa o repositório desta adaptação e inclui os arquivos do viewer. Para verificar a descoberta sem instalar, acrescente `--list` em vez de `--skill wireframe-prototyping`.

Como alternativa, use o pacote local:

Extraia `wireframe-prototyping.zip`. Copie a pasta `wireframe-prototyping` inteira para a pasta de skills do seu agente. Para agentes que reconhecem skills de projeto em `.agents/skills/`, a estrutura é:

```text
seu-projeto/
  .agents/skills/wireframe-prototyping/
    SKILL.md
    agents/
    references/
    scripts/viewer.py
    assets/viewer/
```

Também é possível usar o instalador de skills a partir do projeto de destino, apontando para a pasta extraída:

```sh
npx skills add "<caminho-da-pasta-extraida>/wireframe-prototyping"
```

A descoberta depende do agente utilizado. Se ele não listar a skill automaticamente, indique o caminho do `SKILL.md` no chat ou recarregue a lista de skills. O conteúdo usa o formato padrão de skills, mas não pressupõe suporte em todas as IDEs. Não reinstale a partir da URL original de AJ Geddes para obter esta adaptação: aquela URL entrega a versão upstream.

## Usar

```text
Use a skill wireframe-prototyping.
Quero um sistema para reservar salas e acompanhar minhas reservas.
```

O agente cria as fontes em `prototypes/<slug>/` e entrega o HTML em `prototypes/<slug>/dist/`, com requisitos e fluxos no viewer. Pode usar outro destino solicitado. A aplicação existente não é alterada para renderizar o protótipo.

O ambiente do agente precisa de Python 3.10+ e Node.js 18+ para gerar, verificar JavaScript e extrair os metadados. Não são necessários `pip install`, `npm install`, servidor, conta externa ou outra skill. O instalador `npx skills` pode precisar de rede; a geração com a skill já instalada é local.

Quem recebe o HTML precisa apenas de navegador moderno e pode abri-lo por duplo clique. O arquivo funciona com fallback de fonte sem conexão. Não inclui backend ou integrações reais, salvo implementação solicitada à parte.
