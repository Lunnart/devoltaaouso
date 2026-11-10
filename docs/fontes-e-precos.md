# Fontes e preços — Fortaleza–CE

Regras: só valores com fonte verificável; nada inventado; sem fonte = **cotação pendente**. Todos os preços ficam em `material_prices` com fonte, URL, data de consulta, data de referência, tipo e situação.

**Fonte consultada:** [SucataFinder — Preço da sucata em Fortaleza](https://sucatafinder.com/cidade/preco-da-sucata-fortaleza/) — consulta em 10/11/2026. A própria fonte informa que os valores são a **média dos últimos 30 dias** (tipo `media_referencia`), não cotação confirmada.

| Material | Item da fonte | R$/kg | Tipo |
|---|---|---|---|
| Latinhas de alumínio | Latinha de alumínio solta | 10,70 | Média de referência |
| Alumínio (sucata geral) | Perfil de alumínio Natural Limpo | 10,39 | Média de referência |
| Ferro | Ferro miúdo | 0,50 | Média de referência |
| Aço | Inox não ferroso 304 | 4,00 | Média de referência |
| Papelão | Papelão solto | 0,60 | Média de referência |
| Papel branco | Arquivo branco | 0,10 | Média de referência |
| Resíduos eletroeletrônicos | REEE Linha Branca Montado | 0,70 | Média de referência |
| Baterias e pilhas | Bateria Notebook / Celular | 2,00 | Média de referência |

## Sem preço (cotação pendente)
- **Plástico PET** — a fonte não publica PET para Fortaleza.
- **Vidro (embalagens inteiras)** — a fonte só lista cacos, que não são aceitos no sistema.
- **Pilhas comuns** — sem item específico na fonte.

## Materiais não aceitos
Cobre, papel misto, plástico PP, plástico PEAD, metais diversos, cacos de vidro, madeira e têxtil. Registros antigos foram **desativados** (não excluídos) para preservar o histórico.

## Como atualizar
Insira uma nova linha e preencha `valid_to` da anterior — nunca sobrescreva o valor antigo.
