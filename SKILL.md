---
name: wireframe-prototyping
description: >
  Transforma uma ideia ou briefing em wireframes interativos de baixa fidelidade no
  Prototype Viewer da Pitang, com requisitos e fluxos em um HTML portátil.
  Use quando o usuário pedir wireframes ou protótipos para visualizar fluxos e coletar feedback inicial.
license: MIT
compatibility: Geração requer Python 3.10+ e Node.js 18+; visualizar o HTML requer apenas navegador moderno.
---

# Wireframe Prototyping

Adaptação da skill de AJ Geddes com entrega no Prototype Viewer da Pitang. Veja a [origem e alterações locais](ORIGIN.md).

## Entrega padrão: ideia → wireframe no viewer

A pessoa descreve a ideia; você organiza os requisitos e fluxos e entrega o wireframe navegável no viewer. Um pedido curto é suficiente. Não exija documentos, JSON, comandos ou escolhas de ferramenta. Pergunte somente quando faltar informação essencial para entender a tarefa principal; registre decisões reversíveis como hipóteses.

```text
Use a skill wireframe-prototyping.
Quero um sistema para abrir solicitações internas e acompanhar o andamento.
```

Mantenha a abordagem original abaixo: baixa fidelidade por padrão, composição mobile-first, blocos neutros, imagens reservadas quando necessário, espaçamento consistente e interações claras. Use textos concretos em português para permitir experimentar a tarefa. Gere uma versão por fluxo; crie alternativas apenas quando solicitadas. Preserve estados de erro e vazio relevantes e os dados necessários entre telas.

Esta skill é autocontida: leva o viewer, os exemplos e o empacotador em `assets/viewer/`, com os comandos em `scripts/viewer.py`. Não depende de outra skill, deste repositório ou de arquivos externos à pasta instalada. Para entregar, siga o [contrato do viewer incluído](references/viewer.md), com requisitos nas notas de cada fluxo. As referências originais a ferramentas e o template TSX são materiais de consulta, não dependências da entrega.

Localize a pasta desta skill pela localização do `SKILL.md` carregado; não suponha que esteja em `.agents/`, `.codex/` ou no diretório de trabalho. Execute o script dessa pasta e salve fontes e saídas em `prototypes/<slug>/` no projeto da pessoa, ou no destino solicitado. Respeite as instruções desse projeto. Não altere seu framework, package.json, aplicação, configurações ou outras skills para gerar o protótipo. Não é preciso instalar pacotes npm ou Python para usar o viewer incluído.

Execute a geração e os percursos principais, corrija falhas e entregue primeiro o link do HTML com instrução de abertura. Resuma o que foi verificado e os limites relevantes; deixe SPEC, relatório e evidências como links complementares. Não exponha diagnósticos técnicos na interface do produto sem pedido. Ao receber ajustes, edite as fontes do mesmo projeto, gere novamente e confira o comportamento alterado.

Se a pessoa pedir explicitamente outro formato ou ferramenta, respeite o pedido e declare a mudança de entrega. O viewer é o padrão desta adaptação.

## Table of Contents

- [Overview](#overview)
- [Contrato do viewer](references/viewer.md)
- [Instalação independente](references/installation.md)
- [When to Use](#when-to-use)
- [Quick Start](#quick-start)
- [Reference Guides](#reference-guides)
- [Best Practices](#best-practices)

## Overview

Wireframes and prototypes bridge the gap between ideas and implementation, enabling teams to test concepts, get feedback, and refine designs before costly development.

## When to Use

- Early concept validation
- Stakeholder alignment
- User testing and feedback
- Developer handoff
- Feature exploration
- UX problem-solving
- Rapid iteration

## Quick Start

Minimal working example:

```yaml
Wireframe Principles:

Low Fidelity (Sketches):
  Tools: Paper, whiteboard, Balsamiq
  Time: 30 minutes - 2 hours
  Detail: Basic layout, no colors/fonts
  Best For: Brainstorming, exploration
  Cost: Free

Medium Fidelity:
  Tools: Figma, Sketch, Adobe XD
  Time: 2-8 hours
  Detail: Layout, content, basic interaction
  Best For: Team alignment, feedback
  Cost: Low

High Fidelity:
  Tools: Figma, Framer, web dev tools
  Time: 8+ hours
  Detail: Visual design, interactions, animations
  Best For: Developer handoff, user testing
  Cost: Medium

---
## Wireframe Components
// ... (see reference guides for full implementation)
```

## Reference Guides

Detailed implementations in the `references/` directory:

| Guide | Contents |
|---|---|
| [Prototyping Tools & Techniques](references/prototyping-tools-techniques.md) | Prototyping Tools & Techniques |
| [Wireframe Examples](references/wireframe-examples.md) | Wireframe Examples |
| [Prototype Testing](references/prototype-testing.md) | Prototype Testing |

## Best Practices

### ✅ DO

- Start with low-fidelity sketches
- Get feedback early and often
- Test with real users
- Iterate based on feedback
- Use consistent grids and spacing
- Document interaction flows
- Include edge cases (empty states, errors)
- Create mobile-first wireframes
- Share prototypes for collaboration
- Keep wireframes simple and focused

### ❌ DON'T

- Jump directly to high-fidelity
- Over-design before validation
- Ignore mobile/responsive needs
- Create wireframes without user input
- Leave interactions undefined
- Make wireframes too detailed
- Test only with team members
- Ignore accessibility
- Lock into designs too early
- Create unrealistic user flows
