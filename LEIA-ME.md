# Plataforma de Planejamento Estratégico · Mantora Lab

**Abrir:** dois cliques em `Abrir plataforma.bat` (use o Chrome; precisa de internet para fontes, leitura de PDF e exportação PPTX).

## Fluxo da estrategista
1. **+ Novo cliente** → *Projeto & IDV*: nome, estrategista, data, cores da IDV do cliente, estilo dos slides, fotos e **upload da IDV (PDF)**.
2. **Briefing & DNA** (tópico 01): quem é o cliente, para quem fala, objetivo em 12 meses. Isso alimenta o contexto de todos os prompts.
3. Na tela inicial, copie o **prompt de contexto** e cole no Claude do projeto do cliente (com briefing, DNA, pesquisa e call anexados).
4. Preencher os tópicos na ordem do menu. Em cada um: *Copiar prompt* → Claude → colar o JSON em *Importar resposta* (ou digitar direto) → revisar. Cada tópico tem **notas de fala** e um interruptor *Incluir na apresentação*.
5. **Revisar & gerar**: confira percentuais e pendências, depois **Apresentar** (tecla N mostra as notas), **PDF**, **PPTX editável (Canva)**, **Word (.docx)** com o planejamento completo, **Pacote .md** ou **HTML**.

## IA conectada (Claude, ChatGPT ou Gemini)
1. Clique em **⚙ IA** (menu lateral), escolha o provedor, cole a chave da API (Claude: console.anthropic.com · ChatGPT: platform.openai.com · Gemini: aistudio.google.com) e use *Testar conexão*. Cada chave fica só neste computador. *Carregar modelos da minha conta* lista os modelos disponíveis para você escolher.
2. Dá para usar um provedor para gerar os tópicos e outro para a aba Pesquisa (ex.: Gemini ou ChatGPT na busca, Claude na redação).
3. No tópico **Briefing & DNA**, cole (ou anexe .txt/.md/.pdf) o briefing, o DNA do Expert, a pesquisa e a call em *Material-base*.
4. Em cada tópico, **✨ Gerar com IA** preenche o formulário usando o material e o que já foi definido nos outros tópicos. Na tela inicial, **Gerar todos os tópicos pendentes** faz isso em sequência. Mercado e Concorrência usam busca na web (desligável).
5. Sempre revise: a IA marca "[a confirmar]" onde faltar dado, e o painel *Revisar & gerar* avisa quais campos ainda têm pendência. O uso é cobrado na sua conta de cada provedor.

## Pesquisa com IA (aba própria) — segue o POP da Mantora
Menu lateral → **Pesquisa com IA**. Reproduz o POP "Pesquisa de mercado, tamanho de mercado, análise de desejo":
1. **Pesquisa com IA** em 14 temas (os 12 blocos do prompt do Anexo A + benchmarks, canais e tendências), com busca na web, fontes e datas. **Pesquisar tudo** roda em sequência.
2. **Cruzar com duas IAs** (opcional, precisa de 2 chaves): cada tema roda em duas IAs e uma terceira chamada consolida, listando divergências de números e fatos.
3. **Sprint de inteligência real** (tópico manual 04): anúncios da Meta Ads Library, frases literais de comentários, Reclame Aqui e YouTube. A IA usa esses dados com prioridade.
4. **Checklist de validação** (Anexo B) com botão *Auditar com IA*. Antes de gerar os tópicos o app avisa se o checklist não estiver completo.
5. **Pacote .md** (botão na aba e na tela de revisão): ZIP com 01_Briefing e 02_Estratégia e os nomes do POP (Pesquisa de Mercado Inicial, 02_Análise da Concorrência, 03_Análise de Mercado, 04_0 Público-Alvo Base, 04.1–04.3 Personas, 05_0 Gênesis, 06 Ideação, 07 Posicionamento, 08 Conteúdo). No Windows o "|" do nome vira " - "; o título do Drive vai no começo de cada arquivo.

## Custo de IA e alternativas sem API
- **Contador de uso:** na tela inicial e em ⚙ IA, "Uso de IA neste cliente" mostra chamadas, tokens, buscas e custo estimado (informe o preço do modelo em ⚙ IA; a cobrança oficial é a do provedor).
- **Modo econômico** (⚙ IA): menos contexto e menos buscas por chamada.
- **Modo manual, sem custo de API:** em cada tópico use *Copiar prompt completo* (inclui material, pesquisa e demais tópicos), rode no seu ChatGPT/Claude/Gemini/Perplexity (planos de assinatura) e cole o JSON em *Importar resposta*. Na aba Pesquisa, use *Copiar prompt* + *Colar relatório* em cada tema, e *Copiar prompt da auditoria* + *Colar resposta da auditoria*.
- **IA no seu computador:** em ⚙ IA escolha "Outra IA (compatível com OpenAI)" e aponte para o Ollama ou LM Studio (grátis, sem busca na web, qualidade menor). Groq, OpenRouter e Mistral também funcionam por aí e costumam ter camadas gratuitas com limites.

## Tópicos (21)
Briefing · Presença digital · Mercado · Sprint de inteligência real (manual) · Concorrência · Público · Voz do mercado & consciência · Identidade & objetivos · Marca & valores · Expertise & arquétipos · História de origem · Movimento · Esteira · Posicionamento · Tom de voz & linhas editoriais · Conteúdo · Lançamento & e-mail · Projeções & ROI · Plano de ação · Resumo executivo & SWOT · Proposta (opcional).
A apresentação inclui automaticamente capa, roteiro (agenda) e encerramento. Tópicos vazios ou desmarcados não geram slides.

## Editar no Canva
Botão **PPTX editável (Canva)** → no Canva: *Criar um design → Importar arquivo* → escolher o `.pptx`. Textos e formas ficam editáveis; as páginas da IDV entram como imagem. Fontes (Inter, Outfit, Source Serif 4) podem ser substituídas pelo Canva se não estiverem na conta.
(O exemplo de cliente real fica fora do repositório público.)

## Detalhes
- Dados salvos neste navegador. *Mais → Exportar projeto (JSON)* faz backup ou leva o projeto a outro computador.
- *Mais → Carregar exemplo* só aparece quando o arquivo de exemplo local existe (não é versionado).
- Para editar um slide: altere o tópico e clique em *Atualizar prévia*.
