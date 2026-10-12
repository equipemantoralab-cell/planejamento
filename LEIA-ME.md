# Plataforma de Planejamento Estratégico · Mantora Lab

**Abrir:** dois cliques em `Abrir plataforma.bat` (use o Chrome; precisa de internet para fontes, leitura de PDF e exportação PPTX).

## Fluxo da estrategista
1. **+ Novo cliente** → *Projeto & IDV*: nome, estrategista, data, cores da IDV do cliente, estilo dos slides, fotos e **upload da IDV (PDF)**.
2. **Briefing & DNA** (tópico 01): quem é o cliente, para quem fala, objetivo em 12 meses. Isso alimenta o contexto de todos os prompts.
3. Na tela inicial, copie o **prompt de contexto** e cole no Claude do projeto do cliente (com briefing, DNA, pesquisa e call anexados).
4. Preencher os tópicos na ordem do menu. Em cada um: *Copiar prompt* → Claude → colar o JSON em *Importar resposta* (ou digitar direto) → revisar. Cada tópico tem **notas de fala** e um interruptor *Incluir na apresentação*.
5. **Revisar & gerar**: confira percentuais e pendências, depois **Apresentar** (tecla N mostra as notas), **PDF**, **PPTX editável (Canva)** ou **HTML**.

## IA conectada (Claude)
1. Clique em **⚙ IA** (menu lateral), cole sua chave da API da Anthropic (console.anthropic.com → API Keys) e use *Testar conexão*. A chave fica só neste computador.
2. No tópico **Briefing & DNA**, cole (ou anexe .txt/.md/.pdf) o briefing, o DNA do Expert, a pesquisa e a call em *Material-base*.
3. Em cada tópico, **✨ Gerar com IA** preenche o formulário usando o material e o que já foi definido nos outros tópicos. Na tela inicial, **Gerar todos os tópicos pendentes** faz isso em sequência. Mercado e Concorrência usam busca na web (desligável).
4. Sempre revise: a IA marca "[a confirmar]" onde faltar dado, e o painel *Revisar & gerar* avisa quais campos ainda têm pendência. O uso é cobrado na sua conta da Anthropic.

## Tópicos (17)
Briefing · Presença digital · Mercado · Concorrência · Público · Marca & valores · Expertise · História de origem · Movimento · Esteira · Posicionamento · Conteúdo · Lançamento & e-mail · Projeções & ROI · Plano de ação · Resumo executivo & SWOT · Proposta (opcional).
A apresentação inclui automaticamente capa, roteiro (agenda) e encerramento. Tópicos vazios ou desmarcados não geram slides.

## Editar no Canva
Botão **PPTX editável (Canva)** → no Canva: *Criar um design → Importar arquivo* → escolher o `.pptx`. Textos e formas ficam editáveis; as páginas da IDV entram como imagem. Fontes (Inter, Outfit, Source Serif 4) podem ser substituídas pelo Canva se não estiverem na conta.
(O exemplo de cliente real fica fora do repositório público.)

## Detalhes
- Dados salvos neste navegador. *Mais → Exportar projeto (JSON)* faz backup ou leva o projeto a outro computador.
- *Mais → Carregar exemplo* só aparece quando o arquivo de exemplo local existe (não é versionado).
- Para editar um slide: altere o tópico e clique em *Atualizar prévia*.
