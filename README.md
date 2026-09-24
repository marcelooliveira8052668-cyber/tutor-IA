# Lina — Tutor de Inglês com IA 🤖🇺🇸

Sua professora particular de inglês **de verdade**, do zero à fluência. A Lina é uma IA que:

- 👂 **Entende você** — você fala (microfone 🎤) ou escreve em **português ou inglês**;
- 🗣️ **Ensina inglês real** — contrações, phrasal verbs, gírias, o jeito que os nativos falam;
- ✏️ **Corrige seus erros** em toda fala em inglês (✅ o que acertou · 🔧 o erro · 💬 como o nativo diria);
- 🎭 **Simula cenários reais**: trabalho, escola, amigos, viagem, restaurante, entrevista de emprego e mais;
- 🎧 **Mergulho total**: modo em que ela responde só em inglês;
- 📚 **Salva seu vocabulário** novo automaticamente e dá XP;
- 📈 **Acompanha progresso**: XP, dias seguidos e nível (A1 → C2).

## Onde a Lina roda (PC, internet e celular)

O app é publicado no **Firebase Hosting** e conversa com uma **Cloud Function** protegendo a chave da IA no servidor:

- URL do app: **https://tutor-ia-f6eca.web.app**
- API (proxy de IA): Cloud Function `lina` no mesmo projeto
- A chave da IA fica **no servidor** (Firebase Secret Manager) — ela **nunca** vai para o navegador.

## Como começar (2 minutos)

1. **Abra o app**: rode um servidor local
   (`npx serve tutor-ia` ou `python -m http.server` na pasta) ou publique no Firebase;
2. **Monte seu perfil**: nome, nível atual e onde você vai usar o inglês;
3. Pronto — em **modo servidor**, a Lina já fala com a IA sem você colar chave nenhuma.

> Sem a API publicada/ativa, a Lina funciona em **modo básico** (frases e correções prontas).

## Como publicar (PC, internet e celular)

Requisitos: Node.js + Firebase CLI logado (`npx firebase login`) e o projeto no
plano **Blaze** (gratuito para testar; Cloud Functions pede esse plano).

1. Configure a chave da IA no servidor (uma única vez):
   ```bash
   echo "SK-OU-SUA-CHAVE-OPENROUTER" | npx firebase functions:secrets:set LINA_OPENROUTER_KEY --project tutor-ia-f6eca
   ```
   (Para Gemini, o nome do secret é `LINA_GEMINI_KEY`.)
2. Publique a API e o app:
   ```bash
   npx firebase deploy --project tutor-ia-f6eca
   ```
3. Abra **https://tutor-ia-f6eca.web.app** no PC ou no celular.

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
    ├── chave.js        → config da API (`LINA_API`) e chave local opcional
    ├── ia.js           → integração com a API (chave no servidor) + fallback
    └── app.js          → chat, voz, microfone, XP e progresso
```

A API vive em `../functions/index.js` (Cloud Function `lina`), que chama
Gemini/OpenRouter com a chave guardada nas secrets do Firebase.

## Dicas

- Use **Chrome ou Edge** para o microfone e para a melhor qualidade de voz.
- No **modo básico** (sem chave), digite assuntos como *"pedir comida"*, *"trabalho"*,
  *"viagem"*, *"como perguntar"* — a Lina responde com frases úteis.
- Para trocar o modelo da IA, edite em ⚙️ Configurações (lista em
  https://ai.google.dev/gemini-api/docs/models).

Projeto educacional livre. Textos autorais criados para fins de ensino.