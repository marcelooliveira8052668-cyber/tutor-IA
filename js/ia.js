/* =============================================================
   Lina — Tutor de Inglês IA
   ia.js
   Integração com a API Gemini (Google) + modo plano B offline.
   ============================================================= */
( function () {
  "use strict";

  var LS_CHAVE = "lina_ia_chave_v1";
  var LS_MODELO = "lina_ia_modelo_v1";
  var MODELO_PADRAO = "gemini-3.5-flash";

  function getChave() {
    try {
      var k = localStorage.getItem(LS_CHAVE) || "";
      if (k.trim().length > 8) return k;
    } catch (e) {}
    return window.CHAVE_IA || "";
  }

  /* ---- Modo servidor: a chave fica na API (função `lina`), não no navegador ---- */
  function urlServidor() {
    var url = (typeof window.LINA_API === "string" && window.LINA_API.trim()) ?
      window.LINA_API.trim() : "";
    if (!url) return "";
    /* Quando o app é aberto como arquivo local (file://), não usa o
       servidor — cai no modo básico ou na chave local. */
    try {
      var p = window.location.protocol || "";
      if (p && p !== "http:" && p !== "https:") return "";
    } catch (e) {}
    return url;
  }
  function temServidor() {
    return !!urlServidor();
  }
  function setChave(k) {
    try { localStorage.setItem(LS_CHAVE, String(k || "").trim()); } catch (e) {}
  }
  /* Em modo servidor, a IA "está ativa" sempre (a chave fica na API). */
  function temChave() {
    if (temServidor()) return true;
    var k = getChave();
    return typeof k === "string" && k.trim().length > 8;
  }
  function getModelo() {
    try { return localStorage.getItem(LS_MODELO) || MODELO_PADRAO; } catch (e) { return MODELO_PADRAO; }
  }
  function setModelo(m) {
    try { localStorage.setItem(LS_MODELO, String(m || "").trim() || MODELO_PADRAO); } catch (e) {}
  }

  /* Modelo usado quando a chave é do OpenRouter */
  var LS_MODELO_OR = "lina_ia_modelo_or_v1";
  var MODELO_OR_PADRAO = "openai/gpt-4o-mini";
  function getModeloOR() {
    try { return localStorage.getItem(LS_MODELO_OR) || MODELO_OR_PADRAO; } catch (e) { return MODELO_OR_PADRAO; }
  }
  function setModeloOR(m) {
    try { localStorage.setItem(LS_MODELO_OR, String(m || "").trim() || MODELO_OR_PADRAO); } catch (e) {}
  }

  /* Detecta o provedor pelo começo da chave:
     AIza... ou AQ... = Gemini | sk-... = OpenRouter */
  function provedor(chave) {
    var k = String(chave || "").trim();
    if (!k) k = getChave();
    if (/^AIza/i.test(k) || /^AQ/i.test(k)) return "gemini";
    if (/^sk-/i.test(k)) return "openrouter";
    return "";
  }

  /* Monta o corpo da conversa no formato do Gemini */
  function montarConteudo(historico) {
    var contents = [];
    for (var i = 0; i < historico.length; i++) {
      var item = historico[i];
      var papel = item.role === "model" ? "model" : "user";
      contents.push({ role: papel, parts: [{ text: item.pts }] });
    }
    return contents;
  }

  /* Chamada à API Gemini (REST) */
  async function gemini(historico, systemPrompt, temperatura) {
    var modelo = getModelo();
    var url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(modelo) + ":generateContent?key=" + encodeURIComponent(getChave());

    var corpo = {
      contents: montarConteudo(historico),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: typeof temperatura === "number" ? temperatura : 0.9 }
    };

    var res;
    var ctrl = {};
    if (typeof AbortController === "function") {
      ctrl = new AbortController();
      setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 30000);
    }
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
        signal: ctrl.signal || undefined
      });
    } catch (e) {
      var motivo = "Sem resposta da IA. Verifique sua internet ou sua chave.";
      if (e && e.name === "AbortError") motivo = "A IA demorou demais. Tente de novo em instantes.";
      throw new Error(motivo);
    }

    if (!res.ok) {
      var statusHTTP = res.status;
      var detalhe = "";
      try { var j = await res.json(); if (j && j.error) { detalhe = j.error.message || detalhe; } } catch (e) {}
      if (statusHTTP === 403 && /disabled|not been used|SERVICE_DISABLED/i.test(detalhe)) {
        throw new Error(
          "Sua chave VALE, mas a API Gemini esta DESATIVADA neste projeto Google.\n" +
          "Clique em https://aistudio.google.com/apikey , clique em \u201cCriar chave de API\u201d e use a nova chave.\n" +
          "(Feito isso, cole a nova chave aqui.)"
        );
      }
      var mensagem = "Erro " + statusHTTP;
      if (detalhe) mensagem += " \u2014 " + detalhe;
      throw new Error(mensagem.slice(0, 220));
    }

    var dados = await res.json();
    var texto = "";
    if (dados.candidates && dados.candidates[0]) {
      var conteudo = dados.candidates[0].content;
      if (conteudo && conteudo.parts) {
        for (var i = 0; i < conteudo.parts.length; i++) {
          if (conteudo.parts[i].text) texto += conteudo.parts[i].text;
        }
      }
    }
    var xc = (dados.usageMetadata && dados.usageMetadata.promptTokenCount) || 0;
    if (!texto) throw new Error("A IA retornou vazio. Tente de novo.");
    return { texto: texto.trim(), tokens: xc };
  }

  /* Converte o histórico para o formato de mensagens de chat (OpenAI/OpenRouter) */
  function montarMensagens(historico, systemPrompt) {
    var mensagens = [{ role: "system", content: systemPrompt }];
    for (var i = 0; i < historico.length; i++) {
      var item = historico[i];
      if (!item || !item.pts) continue;
      var papel = (item.role === "model" && !item.sys) ? "assistant" : "user";
      mensagens.push({ role: papel, content: item.pts });
    }
    return mensagens;
  }

  /* Chamada à API OpenRouter (formato compatível com OpenAI) */
  async function openRouter(historico, systemPrompt, temperatura) {
    var modelo = getModeloOR();
    var url = "https://openrouter.ai/api/v1/chat/completions";
    var corpo = {
      model: modelo,
      messages: montarMensagens(historico, systemPrompt),
      temperature: typeof temperatura === "number" ? temperatura : 0.9
    };

    var res;
    var ctrl = {};
    if (typeof AbortController === "function") {
      ctrl = new AbortController();
      setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 30000);
    }
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + getChave()
        },
        body: JSON.stringify(corpo),
        signal: ctrl.signal || undefined
      });
    } catch (e) {
      var motivo = "Sem resposta da IA. Verifique sua internet ou sua chave.";
      if (e && e.name === "AbortError") motivo = "A IA demorou demais. Tente de novo em instantes.";
      throw new Error(motivo);
    }

    if (!res.ok) {
      var statusHTTP = res.status;
      var detalhe = "";
      try { var j = await res.json(); if (j && j.error) { detalhe = j.error.message || detalhe; } } catch (e) {}
      if (detalhe && detalhe.length > 140) detalhe = detalhe.slice(0, 140) + "…";
      throw new Error("Erro " + statusHTTP + (detalhe ? " — " + detalhe : ""));
    }

    var dados = await res.json();
    var texto = "";
    if (dados.choices && dados.choices[0] && dados.choices[0].message) {
      texto = dados.choices[0].message.content || "";
    }
    if (!texto) throw new Error("A IA retornou vazio. Tente de novo.");
    return { texto: texto.trim(), tokens: (dados.usage && dados.usage.prompt_tokens) || 0 };
  }

  /* Escolhe: 1º API local (modo servidor, chave protegida),
     senão provedor conforme o tipo da chave salva. */
  async function responder(historico, systemPrompt, temperatura) {
    if (temServidor()) {
      return servidor(historico, systemPrompt, temperatura);
    }
    if (provedor() === "openrouter") {
      return openRouter(historico, systemPrompt, temperatura);
    }
    return gemini(historico, systemPrompt, temperatura);
  }

  /* Chamada à nossa API (função `lina`). A chave fica no servidor. */
  async function servidor(historico, systemPrompt, temperatura) {
    var url = urlServidor();

    var ctrl = {};
    if (typeof AbortController === "function") {
      ctrl = new AbortController();
      setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 60000);
    }
    var corpo = {
      history: historico,
      systemPrompt: systemPrompt || "",
      temperature: typeof temperatura === "number" ? temperatura : 0.9
    };

    var res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
        signal: ctrl.signal || undefined
      });
    } catch (e) {
      var motivo = "Sem resposta do servidor. Verifique sua internet.";
      if (e && e.name === "AbortError") motivo = "O servidor demorou demais. Tente de novo.";
      var err = new Error(motivo);
      err.modo = "rede";
      throw err;
    }

    var dados = null;
    try { dados = await res.json(); } catch (e) {}
    if (!res.ok) {
      var msgApi = (dados && dados.erro) ? dados.erro : ("Erro " + res.status);
      var e2 = new Error(msgApi.slice(0, 220));
      e2.modo = "api";
      throw e2;
    }
    var texto = (dados && dados.texto) ? dados.texto : "";
    if (!texto) throw new Error("A IA retornou vazio. Tente de novo.");
    return { texto: texto.trim(), tokens: (dados && dados.tokens) || 0 };
  }

  /* Detecção de erros fáceis de entender no plano B */
  function pareceIngles(texto) {
    var t = " " + String(texto || "").toLowerCase().replace(/[.!?]/g, ";") + " ";
    var marcadores = [" i ", " i'm ", " im ", " you ", " the ", " is ", " am ", " are ",
      " my ", " me ", " to ", " and ", " please ", " thanks ", " thank ", " hello ",
      " hi ", " what ", " how ", " where ", " do ", " don't ", " have ", " i'd ", " gonna "];
    for (var i = 0; i < marcadores.length; i++) {
      if (t.indexOf(marcadores[i]) !== -1 && t.replace(/\s/g, "").length > 5) return true;
    }
    return false;
  }

  /* Resposta do plano B (sem chave). Sempre ensina algo. */
  function planoB(ultimoTexto, perfil) {
    if (!perfil || !perfil.cena || !window.OFFLINE) {
      return window.OFFLINE.responder(ultimoTexto, perfil);
    }
    var frases = window.OFFLINE.cena(perfil.cena);
    if (!frases || !frases.length) {
      return window.OFFLINE.responder(ultimoTexto, perfil);
    }
    var parte = [
      "Estamos no cenário **" + perfil.cenaNome + "** (modo básico, sem chave de IA). Aqui estão as frases-passe para você usar:",
      frases.join("\n"),
      "Repita em voz alta 🎤 (ou digite) a primeira frase para praticar. Quando colar uma chave de IA em ⚙️ Configurações, eu viro a outra pessoa de verdade nesse cenário! 😄",
      "★ " + "repeat" + " — repetir"
    ];
    return parte.join("\n\n");
  }

  /* Interface pública */
  window.IA = {
    getChave: getChave,
    setChave: setChave,
    temChave: temChave,
    getModelo: getModelo,
    setModelo: setModelo,
    getModeloOR: getModeloOR,
    setModeloOR: setModeloOR,
    provedor: provedor,
    gemini: gemini,
    openRouter: openRouter,
    responder: responder,
    servidor: servidor,
    temServidor: temServidor,
    urlServidor: urlServidor,
    planoB: planoB,
    pareceIngles: pareceIngles
  };
})();