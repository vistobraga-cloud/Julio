# Resposta à Fase 1 — cole no Claude Code

Fase 1 aprovada. Guardrails que abortam o build em vez de checklist é exatamente o que eu queria — mantenha esse padrão para todas as fases seguintes.

---

## 1. Decisão: o aviso em `/services/handyman-services` — REMOVER

Remova completamente qualquer menção a **electrical** e **plumbing** dessa página.

Verifiquei o perfil real do profissional. Os serviços dele são: Furniture Assembly, Fitness Equipment Assembly, Handyman Services, Finish Carpentry, Cabinetry e TV Mounting. Ele **não presta e nunca prestou** serviço elétrico ou hidráulico — logo não existe nada a negar.

A linha "elétrica básica" que aparecia no spec original era herdada de outro projeto e nunca foi verdadeira sobre este cliente. Ignore-a.

Por que a negação prejudica:
- Introduz "electrical" e "plumbing" numa página sobre pendurar quadros e instalar prateleiras, puxando a relevância semântica para buscas que ele não atende
- Atrai visita de intenção errada, que sai imediatamente
- Faz parecer que ele está se defendendo de alguma coisa

A página define o escopo **pelo positivo**, e só:
picture e mirror hanging · curtain rods e blinds · door adjustment · floating shelf install · furniture anchoring e baby-proofing · small repairs

**Ajuste o audit também:** se existe regra sobre "reivindicação de licença", ela não deve premiar nem tolerar disclaimer preventivo sobre trade que o negócio não exerce. Reivindicar licença que não tem = erro. Negar trade que nunca ofereceu = ruído, também deve ser sinalizado.

---

## 2. Novo serviço: Painting — o 7º

O cliente também faz pintura, mas não anuncia isso no perfil onde os outros serviços estão listados. É receita real fora do radar. Crie `/services/painting`.

Subcategorias:
- Interior painting (rooms, whole home)
- Accent walls
- Trim, doors and baseboards
- Ceilings
- Cabinet painting and refinishing
- Wall prep, patching and priming
- Exterior trim, decks and fences

Links cruzados obrigatórios:
- `/services/painting` ↔ `/services/custom-cabinetry` — cabinet painting e refinishing é a ponte natural: quem não quer trocar o armário quer repintar
- `/services/painting` ↔ `/services/finish-carpentry` — trim, portas e baseboards são o mesmo trabalho uma etapa depois

Atualize o hub `/services`, o sitemap e o grafo de links do schema. Total de páginas de serviço passa de 6 para **7**.

---

## 3. Ordem de publicação — e o buraco antes dela

Concordo em lançar em levas, mas **não** pelo motivo de que o Google penaliza volume — isso é folclore. Os motivos reais são dois: ninguém revisa 47 páginas de texto com atenção de uma vez só, e a regra do projeto (expandir com base em impressão real do Search Console) precisa de um baseline para funcionar.

**Mas antes das marcas, falta `/book`.** O fluxo de agendamento estilo Zenbooker não foi construído na Fase 1 — falha do briefing, não sua. E é sério: as 20 páginas de marca são o tráfego de maior intenção de compra do site inteiro. Jogar esse tráfego num site sem fluxo de agendamento é desperdiçá-lo na página de contato.

Ordem definitiva:

1. **`/book`** — 4 passos: serviço → detalhes (itens, marca, andar/elevador, cidade) → data e horário (calendário visual, 8am–8pm, seg-sáb, domingo bloqueado) → contato e confirmação. Ao enviar, monta a mensagem completa e abre WhatsApp pré-preenchido **ou** envia por email, dois botões lado a lado. Tela final: *"We'll confirm your requested time — usually within a couple of hours."* Front-end puro, sem backend, sem conta Zenbooker, validação Zod.
2. **20 páginas de marca** — maior intenção comercial, menor risco de conteúdo raso
3. **15 páginas de problema** — meio de funil
4. **10 páginas de cidade** — por último, porque exigem pesquisa local real e são as de maior risco de sair genéricas; a essa altura o Search Console já mostra quais cidades geram impressão de verdade

---

## 4. Não regredir

**`aggregateRating` fica fora do schema.** Sua decisão está certa e não é para ser "consertada" depois: review coletada em plataforma de terceiro não vira rich snippet do próprio site, e forçar isso é risco de ação manual. Manter 4.9★/184 como HTML visível creditado à origem é o correto. Se alguém reverter isso mais tarde, é regressão — deixe um comentário no código dizendo por quê.

**Números da prova social precisam ser confirmados com o cliente antes do lançamento.** 325 jobs / 4.9★ / 184 reviews / Top Pro desde 2019 foram extraídos do perfil público. O `asOf: '2026-08'` só tem valor se o dado estiver correto hoje.

---

## 5. Próxima tarefa

Construa `/book` e a página `/services/painting`, e remova o disclaimer de `/services/handyman-services`. Rode o audit. Pare e me mostre antes de começar as 20 páginas de marca.
