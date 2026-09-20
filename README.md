# Lina — Tutor de Inglês com IA 🤖🇺🇸

Sua professora particular de inglês **de verdade**, do zero à fluência. A Lina é uma IA que:

- 👂 **Entende você** — você fala (microfone 🎤) ou escreve em **português ou inglês**;
- 🗣️ **Ensina inglês real** — contrações, phrasal verbs, gírias, o jeito que os nativos falam;
- ✏️ **Corrige seus erros** em toda fala em inglês (✅ o que acertou · 🔧 o erro · 💬 como o nativo diria);
- 🎭 **Simula cenários reais**: trabalho, escola, amigos, viagem, restaurante, entrevista de emprego e mais;
- 🎧 **Mergulho total**: modo em que ela responde só em inglês;
- 📚 **Salva seu vocabulário** novo automaticamente e dá XP;
- 📈 **Acompanha progresso**: XP, dias seguidos e nível (A1 → C2).

## Como começar (2 minutos)

1. **Abra o app**: dê dois cliques em `tutor-ia/index.html` ou rode um servidor local
   (`npx serve tutor-ia` ou `python -m http.server` na pasta).
2. **Monte seu perfil**: nome, nível atual e onde você vai usar o inglês.
3. Cole sua chave grátis em **⚙️ Configurações** e pronto — Lina vira uma professora de verdade.

> Sem chave, a Lina funciona em **modo básico** (frases e correções prontas) para você já ir praticando.

## Pegando a chave grátis (Gemini)

1. Acesse **https://aistudio.google.com/apikey** (logado na sua conta Google);
2. Clique em **"Create API key"**;
3. Copie a chave (começa com `AIza...`) e cole no app em **⚙️ Configurações**.

A chave fica **apenas no seu navegador**. Grátis: dezenas de conversas por dia.

## O que você pode fazer

| Recurso | Como |
| --- | --- |
| Conversar livremente | Digite em português ou inglês na barra |
| Treinar pronúncia | Botão 🎤 (use Chrome/Edge), selecione 🇺🇸 e fale |
| Ouvir a Lina | Botão 🔊 / 🇺🇸 Treinar pronúncia em cada mensagem |
| Simular situações | Painel ➜ **Cenários de conversa** (trabalho, aeroporto, entrevista…) |
| Aulas rápidas | Painel ➜ **Temas de aula rápida** |
| Mergulho total | Botão **Mergulho total 🎧** — só inglês |
| Seu progresso | ⭐ XP no topo + barra de evolução + dias seguidos 🔥 |
| Vocabulário | Guardado automaticamente no painel (palavras ★) |

## Estrutura

```
tutor-ia/
├── index.html          → a página única do app
├── css/estilo.css      → visual (claro/escuro, responsivo)
└── js/
    ├── conversas.js    → persona da Lina, níveis, cenários, temas e plano B
    ├── ia.js           → integração com a API Gemini + fallback offline
    └── app.js          → chat, voz, microfone, XP e progresso
```

## Dicas

- Use **Chrome ou Edge** para o microfone e para a melhor qualidade de voz.
- No **modo básico** (sem chave), digite assuntos como *"pedir comida"*, *"trabalho"*,
  *"viagem"*, *"como perguntar"* — a Lina responde com frases úteis.
- Para trocar o modelo da IA, edite em ⚙️ Configurações (lista em
  https://ai.google.dev/gemini-api/docs/models).

Projeto educacional livre. Textos autorais criados para fins de ensino.