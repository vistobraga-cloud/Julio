# Fase 2 — as 20 páginas de marca

Aprovado. Antes da lista, três coisas que mudam como essas páginas devem ser escritas.

---

## A. Uso de marca de terceiro — aqui a ressalva É obrigatória

Atenção: isto **não** contradiz a regra que acabamos de aplicar. São situações opostas.

- Negar um serviço que ele nunca ofereceu (electrical/plumbing) = ruído, remove
- Esclarecer que ele não é afiliado a uma marca cujo nome você está usando comercialmente = **requisito legal**

Você vai publicar 20 páginas usando marca registrada de terceiro no `<title>`, no `<h1>` e na URL. Isso é lícito sob *nominative fair use*, mas só enquanto duas condições forem respeitadas:

1. **Nenhum logotipo de marca.** Texto apenas. Logo implica endosso. Nada de IKEA, Peloton, Wayfair em imagem, favicon, OG card ou SVG.
2. **Declaração de independência em toda página de marca**, discreta, no rodapé do conteúdo:
   `Aplus Assemblers is an independent assembly service and is not affiliated with, authorized by, or endorsed by [Marca].`

Adicione ao audit: página em `/brands/*` sem essa declaração → build abortado. E nenhum arquivo de imagem cujo nome contenha um slug de marca.

Linguagem a **evitar**: "official", "authorized", "certified installer", "partner". Linguagem correta: "independent", "we assemble", "experienced with".

---

## B. Certificações — assunto encerrado

Você acertou em não tocar no assunto de lead paint na página de painting. Mantenha assim e não levante mais o tema.

Nenhuma página do site menciona, reivindica ou nega qualquer certificação. O site declara apenas o que já está confirmado: seguro (insured), 10 anos de experiência e a prova social. Nada de campo, flag ou comentário no código sobre certificação.

---

## C. A lista de marcas mudou — inteligência regional

Eu tinha montado a lista original por volume nacional. Errado para este cliente. Ele atende sudeste de MA, RI e leste de CT, e nessa região as redes de móveis dominantes não são as que aparecem em lista genérica de e-commerce.

Trocas: **saem** Crate & Barrel, Article e Amazon (genérico demais ou entregue montado). **Entram** três varejistas que mandam nesse mercado — Bob's Discount Furniture nasceu em Connecticut, Jordan's Furniture é instituição de Massachusetts, e Raymour & Flanigan é a rede do Nordeste. Wayfair fica e sobe de prioridade: a sede é em Boston.

### Móveis (8)
```
/brands/ikea-furniture-assembly
/brands/wayfair-furniture-assembly
/brands/bobs-discount-furniture-assembly
/brands/jordans-furniture-assembly
/brands/raymour-flanigan-furniture-assembly
/brands/ashley-furniture-assembly
/brands/pottery-barn-west-elm-assembly
/brands/costco-furniture-assembly
```

### Fitness (7)
```
/brands/peloton-assembly
/brands/nordictrack-assembly
/brands/bowflex-assembly
/brands/sole-treadmill-assembly
/brands/tonal-installation
/brands/concept2-rower-assembly
/brands/power-rack-assembly
```

### Outdoor, grill e escritório (5)
```
/brands/backyard-discovery-playset-assembly
/brands/lifetime-shed-assembly
/brands/weber-grill-assembly
/brands/traeger-grill-assembly
/brands/standing-desk-assembly
```

Três slugs são de categoria, não de marca (`power-rack-assembly`, `standing-desk-assembly`) — nesses, cite as marcas no corpo (Rogue, REP, Titan / Uplift, FlexiSpot, Autonomous) sem transformá-las em título. Menos exposição de marca, mesma captura de busca.

---

## D. O que faz cada página não ser genérica

O risco real destas 20 páginas é virarem a mesma página com o nome trocado. Seu detector de duplicação por shingles precisa rodar cruzando as 20 entre si, não só contra o resto do site.

Cada página precisa de substância que **só** existe naquela marca:

- **Linhas e modelos reais** — IKEA: PAX, MALM, BILLY, KALLAX, HEMNES. Peloton: Bike, Bike+, Tread. NordicTrack: séries Commercial e EXP. Não invente modelo.
- **A particularidade técnica da montagem daquela marca** — o que é diferente ali, de verdade. Cam locks e dowels do flat-pack sueco versus parafuso e porca de móvel americano. Esteira que chega com o console pré-cabeado e o risco de prender o chicote ao levantar o mastro. Equipamento montado na parede que exige localizar stud e não serve em drywall sozinho. Playset com centenas de peças e sequência que não perdoa erro de ordem.
- **Faixa de tempo realista** — "most PAX wardrobes take 2–4 hours depending on width and door type". Faixa, nunca número exato.
- **O que o cliente precisa ter pronto** — espaço livre, caixa já no cômodo certo, tomada, parede definida.
- **FAQ 3–4 perguntas específicas daquela marca**, não recicladas.

Sem preço em nenhuma página. `priceRange: "$$"` fica só no schema do negócio.

Regra de honestidade: se ele nunca montou uma marca dessas, não escreva como se fosse rotina. Escreva a competência real — o mecanismo de montagem é o mesmo dentro de cada categoria.

---

## E. Ligação interna

Toda página de marca linka:
- o serviço-pai (`/services/furniture-assembly`, `/services/fitness-equipment-assembly`, etc.)
- 1–2 problemas relacionados, quando existirem (a Fase 3 os cria — deixe o campo pronto e valide depois)
- 2–3 marcas irmãs da mesma categoria

Aplique a mesma validação de reciprocidade que você criou para `relatedServiceSlugs`. Mensagem WhatsApp contextual por marca.

O hub `/brands` agrupa por categoria, conta as marcas dinamicamente, e não usa número escrito por extenso.

---

## F. Ordem

Comece pelas 3 de maior intenção comercial — `ikea`, `peloton`, `wayfair` — e me mostre essas três antes de escrever as outras 17. Se o padrão estiver certo nelas, o resto escala.
