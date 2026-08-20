# Prompt de construção — Aplus Assemblers

Cole isso direto no Claude Code / Claude.ai (dentro deste mesmo projeto, que já tem a arquitetura técnica fixada nas instruções do projeto — stack, rotas, regras de schema, fases). Este documento resolve as decisões de negócio/conteúdo que a arquitetura sozinha não resolve. Tudo abaixo é decisão fechada, não é rascunho.

---

Construa o site da **Aplus Assemblers**, handyman em Massachusetts/Rhode Island/Connecticut, com estes dados e decisões:

## Negócio
- Nome: **Aplus Assemblers** · Domínio: AplusAssemblers.com
- Telefone = WhatsApp: **(774) 559-8157**
- Horário: **segunda a sábado, 8am–8pm, domingo fechado**
- Idioma: só inglês
- Seguro: tem (usar "insured"). Licença HIC: **não tem — não mencionar licença em nenhum lugar**
- `priceRange` no schema: **"$$"**

## Profissional
- **Julio Oliveira**, 10 anos de experiência, one-man business, atende pessoalmente do início ao fim
- Prova social real (Thumbtack): 325 contratações, 4.9/5 em 184 avaliações, Top Pro desde 2019, background checked
- Bio para `/about` e `handyman.ts`:

> With 10 years in business as a one-person pro, I personally handle every project from start to finish. I offer expert furniture and fitness equipment assembly, TV mounting, handyman services, finish carpentry, and custom cabinetry.
>
> From beds, wardrobes, and shelves to complex gym equipment and TV installations, I focus on precision, safety, and clean, reliable work. I also provide detailed carpentry finishes and custom cabinet solutions that are both functional and visually appealing.
>
> You'll work directly with me, so communication is clear and your project gets the attention it deserves. My goal is to deliver customized, high-quality results that fit your space and your needs.
>
> Reach out today to discuss your project and get a straightforward plan for getting it done right.

## Serviços (`services.ts`) — 6 serviços, site multi-serviço completo
1. Furniture Assembly (camas, mesas, guarda-roupas, prateleiras)
2. Fitness Equipment Assembly (esteiras, bikes, equipamentos de ginástica, Peloton)
3. TV Mounting (drywall, tijolo, concreto, pedra, gesso, madeira; inclui ocultação de cabos)
4. Handyman Services (geral)
5. Finish Carpentry (portas, janelas, molduras, painéis)
6. Custom Cabinetry

## Problemas (`problems.ts`)
1. "My treadmill/Peloton arrived and I don't know how to assemble it" → Fitness Equipment Assembly
2. "My TV mount needs to go on brick/concrete, not drywall" → TV Mounting
3. "Furniture instructions are confusing or parts are missing" → Furniture Assembly
4. "My gym equipment is too heavy/complex to assemble alone" → Fitness Equipment Assembly
5. "My cabinets don't fit my space, need something custom" → Custom Cabinetry

## Área de atendimento — REGIÃO DEFINIDA
- `areaServed` no schema: **estados inteiros de Massachusetts, Rhode Island e Connecticut** (não é raio, não é lista de condados — os 3 estados completos). Boston incluída como mercado regular, não exceção.
- Viagens extraordinárias (Maine, ilhas via ferry) NÃO entram no `areaServed` — viram 1 pergunta de FAQ: "Do you travel outside your standard service area?" com resposta sobre taxa de deslocamento adicional.
- **9 páginas locais** (`/services/$slug-$city`), escritas à mão, conteúdo único por cidade (FAQ local + contexto local real, não só o nome trocado):
  - MA: **Boston, New Bedford, Taunton**
  - RI: **Providence, Warwick, Cranston**
  - CT: **New London, Norwich, Groton**
- Fall River fica FORA da lista de páginas locais (cidade-base do cliente, mas nunca gerou serviço real — não é prioridade de conteúdo).
- Expansão futura dessas páginas só com dado real do Search Console — não gerar mais nenhuma por enquanto.

## Agendamento/contato — Fase 1
- **Sem Zenbooker, sem sincronização automática de calendário nesta fase.** Julio usa Google Calendar manualmente.
- Site tem: botão de WhatsApp (mensagem pré-preenchida) **+** formulário de contato/orçamento que envia por email, validado com Zod, sem dado sensível. Os dois canais lado a lado, sticky no mobile.
- Fase 2 (futuro, não construir agora): se quiser disponibilidade em tempo real, isso exige integração com a API do Google Calendar (OAuth + backend) — é escopo à parte, fora do "sem CMS/DB" da Fase 1-2 atual.

## Schema.org — regras técnicas (lições de auditoria real, aplicar como guardrail)
- `HomeAndConstructionBusiness`: nome, telefone, `areaServed` (3 estados), `priceRange: "$$"`, `openingHoursSpecification` (Mo-Sa 08:00-20:00). Sem HIC. Sem endereço público a menos que autorizado depois.
- `Service` por serviço, `provider` apontando pro `@id` da empresa.
- `FAQPage`: resposta precisa estar no HTML renderizado de verdade (usar accordion que mantém conteúdo no DOM mesmo fechado, tipo Radix), não só no JSON-LD.
- Telefone/preço/área SEMPRE derivados de `business.ts` — nunca string literal duplicada em outro arquivo.
- Meta description: truncar sempre no último espaço antes do limite, nunca no meio da palavra.
- `/services/$slug` (visão geral) e `/services/$slug-$city` (local) precisam de `<title>` e ângulo de conteúdo diferentes um do outro — não deixar viraram a mesma página com nome trocado.

## Fotos/logo
- Nenhum material real ainda — usar placeholders. Trocar quando o cliente enviar.

---

*Assunções assumidas por mim, sem travar mais nada: 10 anos de experiência (não 8 ou 9), priceRange "$$", e a lista final das 9 cidades acima. Se algo aqui estiver errado, é mais rápido corrigir depois de ver o site pronto do que travar antes de começar.*
