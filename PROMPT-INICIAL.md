# Prompt inicial — cole no Claude Code / Claude.ai

**Antes de colar:** anexe o arquivo `aplus-assemblers-prompt.md` à conversa.

---

Você é arquiteto de software e especialista em SEO local. Vamos construir o site da **Aplus Assemblers**, um handyman/montador profissional que atende Massachusetts, Rhode Island e Connecticut.

O arquivo `aplus-assemblers-prompt.md` em anexo é a **fonte de verdade absoluta** do projeto: stack, dados do negócio, mapa completo de 60 rotas, estrutura de cada tipo de página, schema.org e guardrails técnicos. Leia inteiro antes de escrever qualquer código. Não reabra decisões marcadas como fechadas.

**Stack:** Astro 5 (output `static`) + @astrojs/react (só para a island de agendamento) + @astrojs/sitemap + Tailwind 4 + Zod. Deploy Vercel.

## Nesta primeira etapa, construa apenas a Fase 1:

1. **Scaffold do projeto** com a stack acima, TypeScript estrito, e `.gitignore` já com `.env*`.
2. **Camada de dados** em `src/data/`, cada arquivo com schema Zod correspondente:
   - `business.ts` — nome, telefone/WhatsApp, horário, área atendida, priceRange, seguro
   - `handyman.ts` — Julio Oliveira, 10 anos, bio, prova social
   - `services.ts` — os 6 serviços com suas subcategorias
   Nenhum telefone, endereço ou preço pode aparecer hardcoded fora desses arquivos.
3. **Helper de truncamento por palavra** (`truncateAtWord`) — criado **antes** de qualquer template usar meta description. Nunca cortar no meio da palavra.
4. **Layout base**: header, footer, barra sticky no mobile com "Book Now" + WhatsApp, componente de FAQ em accordion que mantém o conteúdo no DOM mesmo fechado, e componente de CTA duplo reutilizável.
5. **Páginas**: `/` (home), `/about`, `/services` (hub com os 6 serviços), `/contact`.
6. **SEO base**: title ≤ 60 caracteres e description 120–158 únicos por página, um único `<h1>`, canonical absoluto, sitemap automático, `robots.txt`, 404 com status HTTP real.
7. **Schema.org**: `HomeAndConstructionBusiness` com `areaServed` (MA, RI, CT), `priceRange: "$$"`, `openingHoursSpecification` (Mo-Sa 08:00-20:00). Nunca mencionar licença HIC — ele não tem. Deixar `sameAs` como array vazio condicional, para preencher quando o Google Business Profile existir.
8. **GA4 + verificação do Search Console** já no primeiro deploy, com evento de clique em `tel:` e `wa.me`.

## Regras que valem para tudo

- Imagens: placeholders por enquanto, sempre com `width`/`height`, AVIF/WebP via `<Image />` do Astro, hero com `fetchpriority="high"`, resto com `loading="lazy"`.
- Fontes self-hosted, nunca `<link>` para Google Fonts.
- Você escreve todo o texto em inglês, com tom direto e confiante de profissional experiente. Sem jargão de marketing vazio, sem inventar credencial que ele não tem.
- Use a prova social real: 10 anos, 325 jobs, 4.9★ em 184 reviews, Top Pro desde 2019, background checked, insured.

Comece pelo scaffold e pela camada de dados. Ao terminar a Fase 1, pare e me mostre o que foi feito antes de seguir para as páginas de serviço, marcas, problemas e cidades.

---

*Se preferir manter TanStack Start em vez de Astro (para reaproveitar o que você já tem do outro projeto), troque a linha da Stack por: "TanStack Start + React 19 + Vite + Tailwind 4, com prerender das rotas para HTML estático, `manualChunks` separado por família de dados e pipeline de otimização de imagem." O resto do prompt não muda.*
