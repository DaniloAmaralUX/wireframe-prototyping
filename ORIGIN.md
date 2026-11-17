# Origem da cópia local

- Autor e repositório: [AJ Geddes / useful-ai-prompts](https://github.com/aj-geddes/useful-ai-prompts).
- Caminho original: `skills/wireframe-prototyping/`.
- Commit copiado: `3f5182cfd739fc113f4af5244a1cf342ad7f7911`.
- Data da cópia: 17/11/2026.
- Licença: MIT, copyright 2025 AJ Geddes, preservada em [LICENSE](LICENSE).

Conteúdo copiado: `SKILL.md`, os três guias em `references/` e `templates/component-template.tsx`. O template TSX é material de referência original; não foi integrado ao build do viewer, que continua usando HTML/CSS/JavaScript nativos.

Alterações locais: descrição e introdução em português com entrega padrão no viewer; [contrato de acoplamento](references/viewer.md) com requisitos, fontes, geração e verificação; campo de licença e link para esta origem; manifesto `agents/openai.yaml` para descoberta conforme as convenções deste repositório. O corpo original das orientações de wireframe, os três guias e o template foram preservados.

Esta pasta é a fonte versionada da adaptação. Ela é autocontida: inclui o viewer, exemplo mínimo e runtimes opcionais em `assets/viewer/`, mais o comando independente `scripts/viewer.py`. Todos os links necessários à geração permanecem dentro da skill. Os créditos do viewer e as licenças MIT/Apache-2.0 acompanham o snapshot em [assets/viewer/CREDITS.md](assets/viewer/CREDITS.md).

Repositório desta adaptação: [DaniloAmaralUX/wireframe-prototyping](https://github.com/DaniloAmaralUX/wireframe-prototyping). Distribuição alternativa: `dist/wireframe-prototyping.zip`, gerado por `python scripts/package.py`. Esse comando é de manutenção; não é necessário no projeto de quem instala. O pacote contém uma única pasta `wireframe-prototyping`, pronta para copiar para a pasta de skills do agente. Veja [instalação e uso](references/installation.md).

A pasta raiz deste repositório é a fonte da skill independente. Reinstalar diretamente de `aj-geddes/useful-ai-prompts` volta à versão original. Para instalar esta adaptação, use `npx skills add DaniloAmaralUX/wireframe-prototyping --skill wireframe-prototyping`, o pacote distribuído ou a pasta local adaptada. Não há sincronização automática com upstream nem dependência de outras skills.
