(function () {
  const K = window.Kit;
  const draft = { name: "" };
  const frame = (root, active, body) => {
    root.innerHTML = `${K.bar({ title: "Primeiro projeto", icons: [] })}<div class="sk-scroll"><div class="sk-pad sample-page">${body}</div></div>${K.tabs(active)}`;
  };

  Proto.versions("briefing", [{
    name: "Formulário",
    axis: "Uma entrada simples, com validação e navegação para a prévia.",
    tryThis: ["Continue sem preencher para conferir a validação", "Informe um nome e abra a prévia", "Troque o dispositivo durante o preenchimento"],
    tradeoff: "Os dados deste exemplo ficam apenas na sessão e são apagados ao recarregar o HTML.",
    render(root, ctx) {
      frame(root, "briefing", `<form class="sk-stack"><h1>Dê um nome ao projeto</h1><p>Este é um exemplo mínimo para você adaptar na IDE.</p><label for="project-name">Nome do projeto</label><input class="sample-input" id="project-name" name="project-name" type="text" maxlength="80" required value="${K.esc(draft.name)}" placeholder="Central de solicitações"><button class="sk-btn" type="submit">Abrir prévia</button></form>`);
      const input = root.querySelector("input");
      const offInput = K.on(root, "input", "input", () => { draft.name = input.value; input.setCustomValidity(""); });
      const offSubmit = K.on(root, "form", "submit", (event) => {
          event.preventDefault();
          draft.name = input.value.trim();
          if (!draft.name) { input.setCustomValidity("Informe o nome do projeto."); input.reportValidity(); return; }
          ctx.go("review");
        });
      return () => { offInput(); offSubmit(); };
    },
  }]);

  Proto.versions("review", [{
    name: "Resumo",
    axis: "O valor informado aparece na segunda tela sem servidor ou bibliotecas adicionais.",
    tryThis: ["Confira o nome", "Volte ao formulário e altere o valor"],
    tradeoff: "Esta tela demonstra o contrato do viewer. Substitua o exemplo pelos fluxos do seu projeto.",
    render(root, ctx) {
      frame(root, "review", `<div class="sk-stack"><h1>${draft.name.trim() ? K.esc(draft.name.trim()) : "Nenhum nome informado"}</h1><p>${draft.name.trim() ? "A navegação e o estado local estão funcionando." : "Preencha o formulário para ver o resultado aqui."}</p><button class="sk-btn" type="button">Voltar ao formulário</button></div>`);
      return K.on(root, ".sk-btn", "click", () => ctx.go("briefing"));
    },
  }]);
})();
