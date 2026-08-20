# Aplus Assemblers — o que está pronto e o que falta

## Pronto: 36 páginas

```
Home · About · Contact · Book (fluxo completo, testado no navegador)
Services (hub) + 7 serviços:
  furniture-assembly · fitness-equipment-assembly · tv-mounting
  handyman-services · finish-carpentry · custom-cabinetry · painting
Brands (hub) + 20 marcas
Privacy · Terms · 404
```

Build verde, audit limpo, 2,2 KB de JS por página de conteúdo, 312 KB só no `/book`. Overlap máximo entre páginas: 12,7%.

---

## Falta: 26 páginas + o lançamento

### 1. Páginas de cidade — 10
```
MA  Boston (furniture) · Boston (fitness) · Quincy · Brockton · New Bedford
RI  Providence (furniture) · Providence (tv-mounting) · Cranston · Warwick
CT  New London
```
São as de maior risco de sair genéricas — exigem pesquisa real de bairro e tipo de construção por cidade.

### 2. Páginas de problema — 16 (15 + hub) — **por último, conforme sua decisão**
Lista já revista com as cinco trocas (gesso sobre ripa, ausência de stud, escada estreita, esteira com ruído, furo espanado). Escrever só depois do retorno do cliente, porque as sugestões dele podem mudar quais problemas valem a pena.

Total ao final: **62 páginas**.

---

## Antes de qualquer uma dessas: mostre o site ao cliente agora

O site já é apresentável. Ele tem home, about, os 7 serviços, as 20 marcas e o fluxo de agendamento inteiro funcionando. É material mais que suficiente para o Julio reagir ao visual, ao tom, à lista de serviços e sugerir o que quiser.

Escrever 26 páginas antes de ouvi-lo é risco puro: se ele disser que não faz mais cabinetry, que quer outro serviço em destaque, ou que atende uma cidade que não está na lista, o retrabalho é grande.

**Como mostrar sem depender do domínio:** deploy na Vercel gera uma URL de preview em minutos, sem precisar apontar o AplusAssemblers.com ainda. Manda o link pra ele.

---

## Pendências que dependem do Julio

| Item | Por quê |
|---|---|
| Fotos reais dos trabalhos | Hoje são placeholders. É o que mais muda a percepção do site. |
| Confirmar 325 jobs / 4.9★ / 184 reviews / Top Pro 2019 | Extraído do perfil público, marcado `asOf: '2026-08'`. Não publicar sem confirmar. |
| Pintura externa ou só interna? | Muda uma subcategoria de `/services/painting`. |
| Cidades onde o trabalho realmente acontece | A lista atual é proxy por população. O que ele souber de verdade vale mais. |

---

## Checklist de lançamento

- [ ] Apontar AplusAssemblers.com para a Vercel
- [ ] GA4 measurement ID nas env vars
- [ ] Verificação do Search Console + enviar sitemap
- [ ] Trocar placeholders pelas fotos reais
- [ ] Confirmar os números de prova social

## Fora do código — comece hoje

- [ ] **Google Business Profile** — categoria primária "Furniture Assembly Service", configurado como service-area business. Leva semanas para verificar; começar agora vale mais que qualquer página que ainda falta.
- [ ] **Campanha de reviews no Google** — ele tem 184 no Thumbtack, que não contam para o Google. Link curto de review, pedido a todo cliente ao final do serviço.
