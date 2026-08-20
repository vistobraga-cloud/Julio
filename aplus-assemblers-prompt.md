# Aplus Assemblers — Arquitetura completa do site

Cole no Claude Code / Claude.ai. Este documento define **a stack, o que existe no site e como o cliente será encontrado**.

---

## 0. Quem escreve o conteúdo

Você (a IA que está construindo) escreve **todo** o texto. Não existe cliente redigindo nada.

A regra "escrita à mão" do spec herdado significa apenas: **cada página tem texto próprio armazenado como dado único no repo** (uma entrada real em `problems.ts`, `brands.ts`, `cityPages.ts`), **não** um template interpolado em build-time com o nome trocado. Você escreve cada entrada individualmente, com ângulo, exemplos e FAQ diferentes.

Teste de aprovação: se eu trocar o nome da cidade/marca de uma página pela de outra e o texto continuar fazendo sentido, o conteúdo está errado — reescreva.

---

## 1. STACK — e a resposta honesta sobre "qual é melhor pra ser encontrado"

### O veredito curto

Para **este** site — 60 páginas, muito conteúdo, uma única tela interativa (o agendamento) — a escolha tecnicamente melhor é **Astro**. A mais segura e convencional é **Next.js**. A stack do spec herdado (**TanStack Start**) é a mais fraca das três para este trabalho específico, e eu tenho prova disso: a auditoria que você mesmo me mandou do `reparacionesea2.es` — mesma stack, mesmo tipo de site — encontrou exatamente os problemas que essa escolha causa.

### O que a auditoria do projeto-origem provou na prática

| Achado real | Causa |
|---|---|
| Nenhum HTML estático gerado; toda página renderizada a cada request | TanStack Start é SSR-on-request por padrão |
| Chunk de 410KB (124KB gzip) na home + 187KB de dados em *toda* rota | Bundling manual, sem otimização automática por rota |
| Logo de 250KB / 10417×3353px exibido a 32px de altura | Sem pipeline de imagem automático |
| Meta description cortada no meio da palavra | Truncamento manual, sem API de metadata |
| Titles acima de 60 caracteres em 46% das páginas | Sem validação de metadata |

Nenhum desses é culpa do dev — são coisas que Astro e Next.js resolvem **estruturalmente**, sem ninguém precisar lembrar.

### Comparação para este caso

| | Astro | Next.js | TanStack Start |
|---|---|---|---|
| JS enviado numa página de conteúdo | **~0KB** (islands) | ~80-120KB | ~180KB+ |
| HTML estático pré-gerado | Padrão | Fácil (SSG/ISR) | Não por padrão |
| Otimização de imagem (AVIF/WebP, width/height) | Automática | Automática (`next/image`) | Manual |
| Metadata e sitemap | `@astrojs/sitemap` | Metadata API + `next-sitemap` | Manual |
| Core Web Vitals típicos | Excelente | Bom | Exige trabalho |
| Ecossistema / achar ajuda | Bom | **Enorme** | Pequeno, ainda estabilizando |
| A tela de agendamento | React island | Nativo | Nativo |

### Minha recomendação

**Astro.** Um site de handyman é 95% conteúdo estático e 5% interação. Astro entrega HTML puro sem JavaScript nas 59 páginas de conteúdo e carrega React **só** na tela de agendamento (`client:load` numa island). Isso significa Core Web Vitals excelentes sem esforço — e CWV é fator de ranqueamento real.

**Mas há um argumento de negócio legítimo pra ficar no TanStack Start:** se você está montando uma operação repetível de sites para clientes locais, dominar **uma** stack profundamente e reaproveitar componentes entre projetos vale mais do que otimizar cada projeto isoladamente. Você já tem o `reparacionesea2.es` nessa stack. Trocar significa recomeçar a curva.

Decisão prática: **se este site é para durar e escalar, Astro.** Se a prioridade é velocidade de entrega reaproveitando o que você já tem, fique no TanStack Start e aplique religiosamente os guardrails da seção 9 — eles fecham a maior parte da diferença.

### Se for Astro (recomendado) — configuração

```
Astro 5 + @astrojs/react (só para a island de agendamento)
+ @astrojs/sitemap + @astrojs/tailwind + Tailwind 4
+ Zod (já vem embutido via Content Collections)
output: 'static'   →  60 arquivos HTML pré-gerados, servidos da CDN
Deploy: Vercel (adaptador não é necessário em modo static)
```

- Dados de negócio em `src/data/*.ts` validados por Zod — mesma regra do spec.
- Conteúdo das páginas em **Content Collections** com schema Zod (dá validação de frontmatter de graça).
- `<Image />` do Astro para tudo: gera AVIF/WebP e injeta `width`/`height` sozinho — mata na raiz os dois achados de imagem da auditoria.
- Sitemap automático. Sem código manual, sem risco de desincronizar.
- A tela `/book` é o **único** componente React, com `client:load`.

### Se ficar no TanStack Start — mínimo obrigatório

Prerender das 60 rotas para HTML estático (não deixar SSR-on-request), `manualChunks` separado por família de dados (não um chunk único), pipeline de imagem com `unplugin-imagemin` ou equivalente, e helper de truncamento por palavra criado **antes** dos templates. Sem isso, você repete a auditoria inteira.

### Metas de performance (válidas em qualquer stack)

LCP < 2.5s · INP < 200ms · CLS < 0.1 · JS numa página de conteúdo < 100KB gzip · hero com `fetchpriority="high"` e preload · fontes self-hosted com `font-display: swap` (não Google Fonts via `<link>` — foi outro achado da auditoria).

---

## 2. Dados do negócio

| Campo | Valor |
|---|---|
| Marca | **Aplus Assemblers** |
| Domínio | AplusAssemblers.com |
| Telefone = WhatsApp | **(774) 559-8157** |
| Horário | Segunda a sábado, 8am–8pm · Domingo fechado |
| Idioma | Inglês |
| Seguro | Insured (usar). Licença HIC: **não tem — nunca mencionar** |
| `priceRange` | `"$$"` |
| Base | Fall River, MA |
| Área declarada (`areaServed`) | Massachusetts, Rhode Island e Connecticut — estados inteiros |
| Pagamento | Cash, Check, Venmo, Zelle |

**Julio Oliveira** — 10 anos, one-man business, atende pessoalmente do início ao fim.
Prova social real: **325 jobs · 4.9★ em 184 reviews · Top Pro desde 2019 · background checked** (Thumbtack).

Bio (`/about` + `handyman.ts`):

> With 10 years in business as a one-person pro, I personally handle every project from start to finish. I offer expert furniture and fitness equipment assembly, TV mounting, handyman services, finish carpentry, and custom cabinetry.
>
> From beds, wardrobes, and shelves to complex gym equipment and TV installations, I focus on precision, safety, and clean, reliable work. I also provide detailed carpentry finishes and custom cabinet solutions that are both functional and visually appealing.
>
> You'll work directly with me, so communication is clear and your project gets the attention it deserves. My goal is to deliver customized, high-quality results that fit your space and your needs.
>
> Reach out today to discuss your project and get a straightforward plan for getting it done right.

---

## 3. MAPA DE ROTAS COMPLETO — 60 páginas

### Estáticas (9)
```
/                        Home
/about                   Autoridade E-E-A-T (crítica)
/services                Hub de serviços
/problems                Hub de problemas
/brands                  Hub de marcas
/book                    Agendamento (estilo Zenbooker)
/contact                 Contato
/privacy-policy
/terms
```

### `/services/$slug` — 6 páginas (categorias)
```
/services/furniture-assembly
/services/fitness-equipment-assembly
/services/tv-mounting
/services/handyman-services
/services/finish-carpentry
/services/custom-cabinetry
```

### `/problems/$slug` — 15 páginas
```
/problems/furniture-arrived-missing-parts
/problems/no-time-to-assemble-furniture
/problems/ikea-delivered-but-not-assembled
/problems/wobbly-furniture-after-assembly
/problems/treadmill-too-heavy-to-move-upstairs
/problems/peloton-arrived-in-box
/problems/home-gym-too-complex-to-assemble
/problems/mount-tv-on-brick-or-concrete
/problems/tv-mounted-too-high-over-fireplace
/problems/hide-tv-cables-in-wall
/problems/tv-mount-wont-hold-large-tv
/problems/moving-out-need-furniture-disassembled
/problems/playset-assembly-takes-all-weekend
/problems/closet-system-doesnt-fit-my-space
/problems/cabinet-doors-wont-close-straight
```

### `/brands/$slug` — 20 páginas ← **maior alavanca de SEO do projeto**
```
Móveis
/brands/ikea-furniture-assembly
/brands/wayfair-furniture-assembly
/brands/ashley-furniture-assembly
/brands/pottery-barn-furniture-assembly
/brands/west-elm-furniture-assembly
/brands/crate-and-barrel-furniture-assembly
/brands/article-furniture-assembly
/brands/amazon-furniture-assembly

Fitness
/brands/peloton-assembly
/brands/nordictrack-assembly
/brands/bowflex-assembly
/brands/sole-fitness-assembly
/brands/proform-assembly
/brands/tonal-installation
/brands/concept2-rower-assembly
/brands/rep-fitness-rack-assembly

Playset / outdoor / office
/brands/backyard-discovery-playset-assembly
/brands/lifetime-shed-assembly
/brands/weber-traeger-grill-assembly
/brands/uplift-flexispot-desk-assembly
```

### `/services/$slug-$city` — 10 páginas locais
```
MA
/services/furniture-assembly-boston
/services/fitness-equipment-assembly-boston
/services/furniture-assembly-quincy
/services/furniture-assembly-brockton
/services/furniture-assembly-new-bedford

RI
/services/furniture-assembly-providence
/services/tv-mounting-providence
/services/furniture-assembly-cranston
/services/furniture-assembly-warwick

CT
/services/furniture-assembly-new-london
```

**Fall River fica de fora** — cidade-base, mas nunca gerou serviço real (confirmado pelo cliente).
Expansão só com impressão real no Search Console.

### Endpoints
```
/sitemap.xml    gerado automaticamente pelo framework
/robots.txt     libera tudo + aponta o sitemap absoluto
404             status HTTP 404 real, não soft-404
```

---

## 4. Categorias e subcategorias

Cada `/services/$slug` lista suas subcategorias como seções `<h2>` e linka para `/brands` e `/problems` relacionados.

**Furniture Assembly** — bed frames & headboards · wardrobes e closet systems (IKEA PAX, Elfa) · desks e home office · bookshelves e shelving · dining sets · sofás e seccionais · patio/outdoor furniture · cribs e nursery · storage sheds · playsets e swing sets

**Fitness Equipment Assembly** — treadmills · exercise bikes (Peloton, Echelon) · ellipticals · rowing machines · power racks e squat racks · multi-station home gyms · smart mirrors e wall-mounted (Tonal, Mirror) · adjustable dumbbells e storage

**TV Mounting** — fixed, tilting e full-motion · drywall com stud · **brick, concreto e pedra** · over-fireplace · in-wall cable concealment · soundbar · multi-monitor

**Handyman Services** — picture e mirror hanging · curtain rods e blinds · door adjustment · floating shelf install · baby-proofing e furniture anchoring · small repairs

**Finish Carpentry** — interior doors · window e door casing · baseboards e crown molding · wainscoting e wall panels · trim repair

**Custom Cabinetry** — kitchen cabinet install · built-in shelving · closet build-outs · garage e mudroom storage · cabinet door alignment e hardware

---

## 5. Estrutura de cada tipo de página

**`/services/$slug`** — H1 do serviço · abertura (o que é, por que contratar) · grid de subcategorias · "How it works" em 3-4 passos · marcas atendidas (linka `/brands`) · problemas relacionados (linka `/problems`) · FAQ 4-6 perguntas · CTA duplo. Mínimo **450 palavras únicas**.

**`/problems/$slug`** — H1 na voz do cliente ("My treadmill is too heavy to move upstairs") · reconhece a situação · por que acontece · como o Julio resolve · o que ele leva/verifica · tempo típico · linka o serviço exato · FAQ 3-4 · CTA. Mínimo **400 palavras únicas**.

**`/brands/$slug`** — H1 tipo "Peloton Assembly Service in MA, RI & CT" · modelos/linhas da marca · o que essa marca tem de particular na montagem (peças, ferramentas, tempo, armadilhas conhecidas) · tempo médio · o que o Julio traz · linka o serviço-pai · FAQ 3-4 específicas da marca · CTA. Mínimo **400 palavras únicas**.
*Maior intenção de compra do site — quem busca "Peloton assembly near me" já comprou e precisa de alguém hoje.*

**`/services/$slug-$city`** — H1 serviço + cidade · **contexto local real** (moradia predominante, bairros reais, o que complica a entrega ali: escada estreita, walk-up sem elevador, gesso antigo vs drywall, estacionamento apertado, temporada de mudança universitária) · como o Julio atende ali · **FAQ local** com 3-4 perguntas que só fazem sentido naquela cidade · CTA. Mínimo **450 palavras**, sendo **250+ genuinamente locais**.

Crie `cityPages.ts` com: `neighborhoods[]`, `housingStock`, `accessChallenges`, `localAngle`, `localFaq[]`. **Pesquise cada cidade de verdade antes de escrever.** Boston é walk-up de tijolo e triple-decker com escada estreita; Warwick é subúrbio com garagem e acesso fácil; New London tem rotatividade militar constante (base naval em Groton, famílias mudam a cada 2-3 anos). Se o texto local não muda de cidade pra cidade, está errado.

---

## 6. Agendamento — modelo Zenbooker

Fluxo em 4 passos, com a cara e a fluidez de um app de agendamento real:

1. **Serviço** — cards clicáveis com os 6 serviços (+ subcategoria opcional)
2. **Detalhes** — quantos itens, marca (autocomplete com as marcas do site), andar/elevador, cidade
3. **Data e horário** — calendário visual, slots dentro de 8am–8pm, seg-sáb, domingo bloqueado
4. **Contato e confirmação** — nome, telefone, email, endereço, observações

Ao enviar: monta a mensagem completa e abre **WhatsApp** pré-preenchido **ou** envia por **email** — dois botões lado a lado. Tela final: *"We'll confirm your requested time — usually within a couple of hours."*

**Front-end puro**: não reserva de verdade, não bloqueia horário, não precisa de backend nem conta Zenbooker. Sincronizar com o Google Calendar do Julio fica pra fase futura (exige OAuth + backend). Validação Zod. Barra sticky no mobile com "Book Now" + WhatsApp.

---

## 7. Schema.org

`HomeAndConstructionBusiness` — name, telephone, `areaServed` (MA, RI, CT), `priceRange: "$$"`, `openingHoursSpecification` (Mo-Sa 08:00-20:00). **Sem HIC.**
`Service` em cada `/services/*`, `/brands/*` e página local, `provider` → `@id` da empresa.
`FAQPage` em toda página com FAQ — resposta **no HTML renderizado**, não só no JSON-LD (accordion que mantém conteúdo no DOM, tipo Radix).
`BreadcrumbList` em todas as páginas internas.

---

## 8. O QUE REALMENTE FAZ ELE SER ENCONTRADO (leia isto)

Preciso ser direto: **para um handyman local, o site não é o principal fator de ranqueamento.** O Google Business Profile é. Um site perfeito com GBP abandonado perde para um site medíocre com GBP bem cuidado — toda vez.

O site serve para duas coisas que o GBP não faz: capturar buscas de cauda longa (`"Peloton assembly near me"`, `"can I mount a TV on brick"`) e dar credibilidade a quem clica. Essas 60 páginas existem por isso. Mas em paralelo:

**1. Google Business Profile — prioridade máxima**
Criar/reivindicar. Categoria primária: **"Furniture Assembly Service"** (existe como categoria oficial). Secundárias: Handyman, Carpenter, TV repair/installation. Configurar como **service-area business** (esconde o endereço residencial e declara as áreas atendidas). Fotos reais de trabalhos concluídos — o GBP premia volume e frequência de fotos. Posts semanais. Responder toda pergunta na aba Q&A.

**2. Reviews no Google — a maior alavanca isolada**
Ele tem **184 reviews no Thumbtack e provavelmente pouquíssimas no Google**. Isso é dinheiro parado. Reviews do Thumbtack **não** contam para o ranqueamento no Google. Criar um link curto de review e pedir para **todo** cliente ao final do serviço, com o telefone na mão, na hora. Volume e recência importam. Se ele sair de 5 para 50 reviews no Google em 6 meses, isso vale mais que tudo neste documento.

**3. NAP consistente**
Nome, telefone e área idênticos no site, GBP, Thumbtack, Yelp, Angi, Nextdoor, Facebook. Qualquer divergência (formato do telefone, variação do nome) dilui o sinal.

**4. Ligar o site ao GBP**
Assim que o GBP existir, preencher `sameAs` no schema `Organization` com a URL do perfil + redes sociais. **Nunca inventar URL** — deixar o campo vazio até o dado existir.

**5. Medição desde o dia 1**
GA4 + verificação no Search Console no primeiro deploy. Eventos de clique em `tel:` e `wa.me`. Sem isso, daqui a 3 meses não há como saber quais das 60 páginas funcionaram — e a regra de expandir as páginas locais "só com dado do Search Console" vira impossível de aplicar.

---

## 9. Guardrails técnicos (erros reais da auditoria do projeto-origem)

- Truncar meta description **sempre no último espaço** antes do limite — nunca no meio da palavra. Criar o helper **antes** dos templates.
- Telefone/preço/área **sempre** derivados de `business.ts` — nunca string literal duplicada em JSON-LD (aconteceu em 7 arquivos lá).
- `/services/furniture-assembly` e `/services/furniture-assembly-boston` precisam de `<title>` e ângulo diferentes — a genérica fala do serviço, a local fala de atender naquela cidade. Foi exatamente aqui que duas páginas canibalizaram uma à outra.
- Mensagem de WhatsApp contextual por página (marca/serviço/cidade), não uma genérica no site inteiro.
- Title ≤ 60 caracteres · description 120–158 · um único `<h1>` · canonical absoluto.
- Imagens: redimensionar o arquivo-fonte antes de otimizar. Nunca subir 10000px para exibir a 32px.
- Fontes self-hosted, não `<link>` para Google Fonts.
- Headers de segurança: `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`.
- `.env*` no `.gitignore` desde o primeiro commit.

---

## 10. Ordem de construção

1. Stack + `business.ts`/`handyman.ts` + schemas Zod + helper de truncamento
2. Layout, header, footer, sticky bar, FAQ accordion, CTAs
3. `/`, `/about`, `/contact`, `/book`
4. `services.ts` + `/services` + 6 páginas de serviço
5. `brands.ts` + `/brands` + 20 páginas de marca ← **prioridade de SEO, não deixar por último**
6. `problems.ts` + `/problems` + 15 páginas
7. `cityPages.ts` + 10 páginas locais
8. sitemap, robots, 404, GA4 + Search Console, deploy Vercel

**Em paralelo, fora do código:** Google Business Profile + campanha de reviews no Google (seção 8).

---

## Decisões fechadas

10 anos de experiência (o "9 years" do Thumbtack é perfil desatualizado) · `priceRange "$$"` · site multi-serviço, não landing única · 3 estados inteiros no `areaServed` · 10 páginas locais nas cidades acima · agendamento estilo Zenbooker só no front-end · sem HIC · sem CMS · imagens placeholder até chegarem as fotos do Julio.

**Duas mudanças em relação ao spec herdado, ambas propositais:**
1. **Hub `/brands`** — não estava previsto. Incluído porque neste nicho a marca do produto é o que as pessoas digitam. Maior oportunidade de tráfego qualificado do projeto.
2. **Stack** — o spec fixa TanStack Start; a recomendação técnica é Astro pelos motivos da seção 1. **Sua decisão.** As duas rotas estão documentadas e o resto do projeto não muda.
