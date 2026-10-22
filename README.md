# Lina — Tutor de Inglês com IA 🤖🇺🇸

Sua professora particular de inglês **de verdade**, do zero à fluência. A Lina é uma IA que:

- 👂 **Entende você** — você fala (microfone 🎤) ou escreve em **português ou inglês**;
- 🗣️ **Ensina inglês real** — contrações, phrasal verbs, gírias, o jeito que os nativos falam;
- ✏️ **Corrige seus erros** em toda fala em inglês (✅ o que acertou · 🔧 o erro · 💬 como o nativo diria);
- 🎭 **Simula cenários reais**: trabalho, escola, amigos, viagem, restaurante, entrevista de emprego e mais;
- 🎧 **Mergulho total**: modo em que ela responde só em inglês;
- 📚 **Salva seu vocabulário** novo automaticamente e dá XP;
- 📈 **Acompanha progresso**: XP, dias seguidos e nível (A1 → C2).

---

## Como rodar (2 minutos)

### Opção 1 — com a IA de verdade (recomendado)

Roda o servidor local. Ele serve o app **e** faz o proxy da IA com a chave guardada
na sua máquina — a chave **nunca** vai para o navegador.

```bash
node server.js
```

Depois abra **http://localhost:3000**.

Para a Lina falar com a IA, coloque sua chave (grátis) numa destas duas formas:

**a) variável de ambiente**

```bash
# Windows (PowerShell)
$env:LINA_GEMINI_KEY = "AIza..."

# Mac / Linux
export LINA_GEMINI_KEY="AIza..."
```

**b) arquivo `local-secret.js`** (crie na mesma pasta; ele fica no `.gitignore`)

```js
module.exports = {
  LINA_GEMINI_KEY: "AIza...",
  LINA_OPENROUTER_KEY: ""   // ou use OpenRouter: "sk-or-v1-..."
};
```

Depois é só reiniciar o servidor.

### Opção 2 — sem servidor, direto no navegador

Abra o `index.html` com dois cliques. A Lina funciona no **modo básico**
(respostas prontas, correções e cenários — tudo offline, sem internet).

Se quiser a IA de verdade nesse modo, cole uma chave em **⚙️ Configurações**.

---

## Onde a Lina roda

| Onde | Como | O que funciona |
|------|------|----------------|
| **PC** | `node server.js` | Tudo, com a chave protegida no servidor |
| **Internet** | Firebase Hosting + Cloud Function | Tudo, com a chave no Secret Manager |
| **Só abrindo o arquivo** | dois cliques no `index.html` | Modo básico (sem IA) |

Para publicar na internet, o caminho mais curto é Firebase:

1. Configure a chave no servidor (uma única vez):
   ```bash
   echo "SK-OU-SUA-CHAVE-OPENROUTER" | npx firebase functions:secrets:set LINA_OPENROUTER_KEY --project SEU-PROJETO
   ```
   (Para Gemini, o nome do secret é `LINA_GEMINI_KEY`.)
2. Publique:
   ```bash
   npx firebase deploy --project SEU-PROJETO
   ```
3. Abra **https://SEU-PROJETO.web.app** no PC ou no celular.

O servidor local e a Cloud Function fazem o mesmo trabalho: seguram a chave e
chamam a IA no lugar do navegador. Use o que for mais fácil para você.

---

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

---

## Acessibilidade

O app foi feito para funcionar bem com teclado e leitor de tela:

- **Foco visível** em todos os botões e campos
- **Tecla Esc** fecha as janelas de configuração e de boas-vindas
- **O foco fica preso** dentro da janela aberta e volta para onde estava ao fechar
- A conversa é anunciada pelo leitor de tela (`role="log"`)
- As mensagens de aviso usam `role="status"`
- **O zoom do celular não é bloqueado** — dá para aumentar o tamanho da letra

---

## Estrutura

```
tutor-ia/
├── index.html          → a página única do app
├── server.js           → servidor local (sem dependências): serve o app e protege a chave
├── css/estilo.css      → visual (claro/escuro, responsivo)
└── js/
    ├── chave.js        → configuração da API (LINA_API e a chave local opcional)
    ├── conversas.js    → persona da Lina, níveis, cenários, temas e o modo básico
    ├── ia.js           → integração com a API (chave no servidor) + fallback
    └── app.js          → chat, voz, microfone, XP e progresso
```

---

## Dicas

- Use **Chrome ou Edge** para o microfone e para a melhor qualidade de voz.
- No **modo básico** (sem chave), digite assuntos como *"pedir comida"*, *"trabalho"*,
  *"viagem"*, *"como perguntar"* — a Lina responde com frases úteis.
- Para trocar o modelo da IA, edite em ⚙️ Configurações (lista em
  <https://ai.google.dev/gemini-api/docs/models>).
- O histórico, o XP e o vocabulário ficam guardados **no navegador** (`localStorage`).
  Limpar os dados do navegador apaga o progresso.

---

## Licença

Projeto educacional livre. Textos autorais criados para fins de ensino.

HTML, CSS e JavaScript são marcas registradas de seus respectivos proprietários.
