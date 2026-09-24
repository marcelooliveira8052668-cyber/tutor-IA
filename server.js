/* =============================================================
   Lina — Tutor de Inglês IA
   Servidor local (PC) — sem dependências externas.
   Serva o app e faz o proxy da IA com a chave protegida na SUA
   máquina (nunca no navegador).

   Como rodar:
     node server.js
   Depois abra: http://localhost:3000

   A chave é lida de:
     1) variável de ambiente  LINA_OPENROUTER_KEY  / LINA_GEMINI_KEY, ou
     2) arquivo  local-secret.js  (crie na mesma pasta, veja exemplo abaixo)
   ============================================================= */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORTA = Number(process.env.PORT) || 3000;
const PASTA_APP = __dirname;
const SECRET = path.join(PASTA_APP, "local-secret.js");

/* ---------- Leitura da chave (protegida, fora do navegador) ---------- */
function lerChaves() {
  let or = process.env.LINA_OPENROUTER_KEY || "";
  let gem = process.env.LINA_GEMINI_KEY || "";
  if ((!or && !gem) && fs.existsSync(SECRET)) {
    try {
      const s = require(SECRET);
      or = (s && s.LINA_OPENROUTER_KEY) || "";
      gem = (s && s.LINA_GEMINI_KEY) || "";
    } catch (e) {
      console.log("[Lina] local-secret.js inválido:", e.message);
    }
  }
  return { or, gem };
}
const CHAVES = lerChaves();

/* ---------- helpers da IA ---------- */
function montarConteudoGemini(historico) {
  const contents = [];
  for (const item of historico) {
    if (!item || !item.pts) continue;
    contents.push({
      role: item.role === "model" ? "model" : "user",
      parts: [{ text: item.pts }],
    });
  }
  return contents;
}
function montarMensagensOpenAI(historico, systemPrompt) {
  const mensagens = [{ role: "system", content: systemPrompt }];
  for (const item of historico) {
    if (!item || !item.pts) continue;
    const papel = item.role === "model" && !item.sys ? "assistant" : "user";
    mensagens.push({ role: papel, content: item.pts });
  }
  return mensagens;
}
function provedorDe(chave) {
  const k = String(chave || "").trim();
  if (/^AIza/i.test(k) || /^AQ/i.test(k)) return "gemini";
  if (/^sk-/i.test(k)) return "openrouter";
  return "";
}

/* ---------- chamadas à IA ---------- */
async function chamarGemini(historico, systemPrompt, temperatura, modelo, chave) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(modelo) + ":generateContent?key=" + encodeURIComponent(chave);
  const corpo = {
    contents: montarConteudoGemini(historico),
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: { temperature: Number.isFinite(temperatura) ? temperatura : 0.9 },
  };
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 60000);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    signal: ctrl.signal,
  });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (dados.error && dados.error.message) || ("Erro " + res.status);
    throw new Error(String(msg).slice(0, 220));
  }
  let texto = "";
  if (dados.candidates && dados.candidates[0]) {
    const conteudo = dados.candidates[0].content;
    if (conteudo && conteudo.parts) {
      for (const parte of conteudo.parts) {
        if (parte.text) texto += parte.text;
      }
    }
  }
  if (!texto) throw new Error("A IA retornou vazio.");
  return {
    texto: texto.trim(),
    tokens: (dados.usageMetadata && dados.usageMetadata.promptTokenCount) || 0,
  };
}
async function chamarOpenRouter(historico, systemPrompt, temperatura, modelo, chave) {
  const corpo = {
    model: modelo,
    messages: montarMensagensOpenAI(historico, systemPrompt),
    temperature: Number.isFinite(temperatura) ? temperatura : 0.9,
  };
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 60000);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + chave,
    },
    body: JSON.stringify(corpo),
    signal: ctrl.signal,
  });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (dados.error && String(dados.error.message || dados.error)) ||
      ("Erro " + res.status);
    throw new Error(String(msg).slice(0, 220));
  }
  const texto = (dados.choices && dados.choices[0] &&
    dados.choices[0].message && dados.choices[0].message.content) || "";
  if (!texto) throw new Error("A IA retornou vazio.");
  return {
    texto: texto.trim(),
    tokens: (dados.usage && dados.usage.prompt_tokens) || 0,
  };
}

/* ---------- rota da IA ---------- */
async function rotaIA(corpo) {
  if (!corpo || !Array.isArray(corpo.history) || corpo.history.length === 0) {
    const err = new Error("Envie o campo history (conversa).");
    err.status = 400;
    throw err;
  }
  const sistema = String(corpo.systemPrompt || "");
  const temperatura = Number.isFinite(corpo.temperature) ? corpo.temperature : 0.9;
  const pedido = String(corpo.provider || "").toLowerCase();

  let provedor = "";
  let chave = "";
  if (pedido === "gemini" && CHAVES.gem) {
    provedor = "gemini";
    chave = CHAVES.gem;
  } else if (pedido === "openrouter" && CHAVES.or) {
    provedor = "openrouter";
    chave = CHAVES.or;
  } else if (CHAVES.or) {
    provedor = "openrouter";
    chave = CHAVES.or;
  } else if (CHAVES.gem) {
    provedor = "gemini";
    chave = CHAVES.gem;
  } else {
    const err = new Error(
      "Servidor ainda sem chave de IA. Crie o arquivo local-secret.js " +
      "com LINA_OPENROUTER_KEY (exemplo no server.js).");
    err.status = 503;
    throw err;
  }

  const modelo = String(corpo.model && corpo.model.trim() ?
    corpo.model : (provedor === "gemini" ? "gemini-3.5-flash" : "openai/gpt-4o-mini"));

  if (provedor === "gemini") {
    return chamarGemini(corpo.history, sistema, temperatura, modelo, chave);
  }
  return chamarOpenRouter(corpo.history, sistema, temperatura, modelo, chave);
}

/* ---------- arquivos estáticos ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};
function servirArquivo(req, res) {
  let url = req.url.split("?")[0];
  if (url === "/") url = "/index.html";
  const alvo = path.normalize(path.join(PASTA_APP, url));
  if (!alvo.startsWith(PASTA_APP) || !fs.existsSync(alvo) || !fs.statSync(alvo).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 - paginação não encontrada");
    return;
  }
  const ext = path.extname(alvo).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(alvo).pipe(res);
}

/* ---------- servidor ---------- */
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && (req.url.startsWith("/api/") || req.url.startsWith("/lina"))) {
    let dados = "";
    for await (const bloco of req) dados += bloco;
    try {
      const corpo = JSON.parse(dados || "{}");
      const r = await rotaIA(corpo);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ texto: r.texto, tokens: r.tokens, provedor: provedorDe(CHAVES.or ? "sk-" : "AIza") }));
    } catch (e) {
      res.writeHead(e.status || 500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ erro: (e && e.message) || "Erro interno." }));
    }
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    servirArquivo(req, res);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("405 - método não permitido");
});

server.listen(PORTA, "0.0.0.0", () => {
  console.log("");
  console.log("  🌟  LINA — Tutor de Inglês IA");
  console.log("  ------------------------------------");
  console.log("  Local : http://localhost:" + PORTA);
  console.log("  Cell  : http://" + (require("os").hostname()) + ":" + PORTA +
    "  (mesma rede Wi-Fi)");
  console.log("  IA    : " +
    (CHAVES.or ? "OpenRouter (ok)" : (CHAVES.gem ? "Gemini (ok)" : "SEM CHAVE — crie local-secret.js")));
  console.log("");
});

/* =============================================================
   EXEMPLO do arquivo local-secret.js (cole na mesma pasta):

   // local-secret.js
   module.exports = {
     LINA_OPENROUTER_KEY: "sk-or-v1-SUA-CHAVE",
     LINA_GEMINI_KEY: ""
   };
   ============================================================= */