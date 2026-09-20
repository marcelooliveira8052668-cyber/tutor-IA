/* =============================================================
   Lina — Tutor de Inglês IA
   app.js
   Chat, voz, microfone, cenários, XP e progresso.
   ============================================================= */
( function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var LS_PERFIL = "lina_ia_perfil_v1";
  var LS_HIST   = "lina_ia_hist_v1";
  var LS_XP     = "lina_ia_xp_v1";
  var LS_TEMA   = "lina_ia_tema_v1";
  var LS_STREAK = "lina_ia_streak_v1";
  var LS_AUTO   = "lina_ia_auto_v1";

  var NIVEIS = window.NIVEIS || [];
  var GOALS  = window.GOALS  || [];
  var CENAS  = window.CENAS  || [];
  var TEMAS  = window.TEMAS  || [];

  /* ---------------- ESTADO ---------------- */
  var perfil = carregarPerfil();
  var historico = carregarHist();
  var xp = carregarXp();
  var pendente = false;
  var autoVoz = carregarAuto();
  var vozEn = null, vozPt = null;

  /* ---------------- UTILITÁRIOS DE ARMAZENAMENTO ---------------- */
  function carregarPerfil() {
    try {
      var p = JSON.parse(localStorage.getItem(LS_PERFIL));
      if (p && typeof p === "object") return p;
    } catch (e) {}
    return null;
  }
  function salvarPerfil() {
    try { localStorage.setItem(LS_PERFIL, JSON.stringify(perfil)); } catch (e) {}
  }
  function carregarHist() {
    try {
      var h = JSON.parse(localStorage.getItem(LS_HIST));
      if (Array.isArray(h)) return h;
    } catch (e) {}
    return [];
  }
  function salvarHist() {
    try { localStorage.setItem(LS_HIST, JSON.stringify(historico.slice(-120))); } catch (e) {}
  }
  function carregarXp() {
    var n = parseInt(localStorage.getItem(LS_XP), 10);
    return isNaN(n) ? 0 : n;
  }
  function salvarXp() {
    try { localStorage.setItem(LS_XP, String(xp)); } catch (e) {}
  }
  function carregarAuto() {
    return localStorage.getItem(LS_AUTO) !== "0";
  }
  function salvarAuto() {
    try { localStorage.setItem(LS_AUTO, autoVoz ? "1" : "0"); } catch (e) {}
  }

  /* ---------------- STREAK (dias seguidos) ---------------- */
  function atualizarStreak() {
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var hojeStr = hoje.toDateString();
    try {
      var info = JSON.parse(localStorage.getItem(LS_STREAK)) || {};
      if (info.dia === hojeStr) return info.n || 0;
      var ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
      var n = (info.dia === ontem.toDateString()) ? (info.n || 0) : 0;
      n++;
      localStorage.setItem(LS_STREAK, JSON.stringify({ dia: hojeStr, n: n }));
      return n;
    } catch (e) { return 0; }
  }

  /* ---------------- X P ---------------- */
  function somarXp(n, motivos) {
    if (!n) return;
    xp += n;
    salvarXp();
    atualizarBadges();
    if (motivos && motivos.length) {
      toast("+" + n + " XP " + motivos.join(" · "));
    }
  }

  /* ---------------- TEXTOS ---------------- */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function marcarTexto(s) {
    var out = escapeHtml(s);
    out = out.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    out = out.replace(/^★ (.+)$/gm, '<span class="novaPalavra">★ $1</span>');
    return out;
  }
  function limparMarcadores(s) {
    return String(s).replace(/[*_`#]/g, "").replace(/\*\*/g, "").trim();
  }

  /* heurística: trechos em inglês para treinar pronúncia */
  function extrairIngles(texto) {
    var alvo = /\b(?:i\b|i'm|you|the|and|to|of|is|are|my|me|do|have|for|with|at|on|in|it|this|that|can|will|would|please|thank|what|how|where|when|let's|gonna|want|like|good|hello|hi|bye|yes|no)\b/gi;
    var linhas = String(texto).split(/\n+/);
    var res = [];
    for (var i = 0; i < linhas.length && res.length < 2; i++) {
      var l = limparMarcadores(linhas[i]).trim();
      if (!l || l.length > 150) continue;
      var en = (l.match(alvo) || []).length;
      var letras = (l.match(/[a-zA-Z]/g) || []).length;
      if (en >= 2 && letras >= 6) res.push(l);
    }
    return res;
  }
  function coletarPalavras(texto) {
    var re = /★\s*([A-Za-z][A-Za-z'’-]*)/g;
    var m, novas = [];
    while ((m = re.exec(texto))) {
      var p = m[1];
      if (p.length > 1) novas.push(p);
    }
    return novas;
  }
  window._extrairIngles = extrairIngles;

  /* ---------------- VOZ ---------------- */
  function carregarVozes() {
    try {
      var vs = window.speechSynthesis.getVoices() || [];
      vozEn = null; vozPt = null;
      for (var i = 0; i < vs.length; i++) {
        var v = vs[i];
        if (/^en/i.test(v.lang || "") && !vozEn) vozEn = v;
        if (/^pt/i.test(v.lang || "") && !vozPt) vozPt = v;
      }
    } catch (e) {}
  }
  function falar(texto, lang) {
    var SS = window.speechSynthesis;
    if (!SS) return;
    carregarVozes();
    try { SS.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(String(texto));
    u.lang = lang || "pt-BR";
    if (lang === "en-US" && vozEn) u.voice = vozEn;
    else if (lang !== "en-US" && vozPt) u.voice = vozPt;
    u.rate = lang === "en-US" ? 0.9 : 1;
    u.pitch = 1.05;
    SS.speak(u);
  }
  function falarLote(lista, lang) {
    if (!lista || !lista.length) return;
    var frase = lista.slice(0, 2).join(". ");
    falar(frase, lang);
  }

  /* ---------------- MIC ---------------- */
  function iniciarMic() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast("🎤 Microfone não suportado neste navegador. Use o Chrome ou Edge, ou digite.");
      return;
    }
    if (pendente) return;
    var rec = new SR();
    rec.lang = $("micLang").value || "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    var btn = $("btnMic");
    btn.classList.add("gravando");
    toast("🎤 Ouvindo em " + (rec.lang === "en-US" ? "inglês" : "português") + "... fale agora");

    rec.onresult = function (ev) {
      var t = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        t += ev.results[i][0].transcript;
      }
      if (t) $("entrada").value = t;
    };
    rec.onend = function () {
      btn.classList.remove("gravando");
      var t = $("entrada").value.trim();
      if (t) enviar(t, true);
      else toast("Não ouvi nada. Vamos tentar de novo?");
    };
    rec.onerror = function (ev) {
      btn.classList.remove("gravando");
      if (ev.error === "not-allowed") toast("🎤 Permita o microfone para praticar a fala.");
      else if (ev.error !== "aborted") toast("🎤 Erro no microfone: " + ev.error);
    };
    try { rec.start(); } catch (e) {}
  }

  /* ---------------- RENDER ---------------- */
  var MSGS = $("msgs");

  function rolarFundo() {
    var pai = MSGS.parentElement;
    pai.scrollTop = pai.scrollHeight;
  }
  function bolhaAcoes() {
    var div = document.createElement("div");
    div.className = "bolhaAcoes";
    return div;
  }
  function adicionarMsg(reg, suave) {
    var artigo = document.createElement("div");
    artigo.className = "msg" + (reg.role === "user" ? " eu" : "") + (reg.sys ? " sistema" : "");

    var ava = document.createElement("div");
    ava.className = "msgAvatar";
    ava.textContent = reg.role === "user" ? "🧑" : "👩‍🏫";

    var bolha = document.createElement("div");
    bolha.className = "bolha";
    if (reg.sys) {
      bolha.innerHTML = "<span class='fonte'>Lina</span>" + marcarTexto(reg.pts);
    } else {
      var conteudo = marcarTexto(reg.pts);
      if (reg.role === "user") bolha.innerHTML = conteudo;
      else bolha.innerHTML = "<span class='fonte'>Lina</span>" + conteudo;
    }

    var acoes = bolhaAcoes();
    if (reg.role === "model" && !reg.sys) {
      var en = extrairIngles(reg.pts);
      var b1 = document.createElement("button");
      b1.className = "btnMin";
      b1.textContent = "🔊 Ouvir";
      b1.onclick = function () { falar(limparMarcadores(reg.pts), "pt-BR"); };
      acoes.appendChild(b1);
      if (en.length) {
        var b2 = document.createElement("button");
        b2.className = "btnMin btnSave";
        b2.textContent = "🇺🇸 Treinar pronúncia";
        b2.onclick = function () { falarLote(en, "en-US"); };
        acoes.appendChild(b2);
      }
    }
    bolha.appendChild(acoes);
    artigo.appendChild(ava);
    artigo.appendChild(bolha);
    MSGS.appendChild(artigo);

    if (!suave) {
      MSGS.children[MSGS.children.length - 1].scrollIntoView({ behavior: "smooth", block: "end" });
    }
    rolarFundo();
  }
  function renderizarTudo() {
    MSGS.innerHTML = "";
    historico.forEach(function (r) { adicionarMsg(r, true); });
    rolarFundo();
  }

  /* ---------------- PROMPT + IA ---------------- */
  function regraImersao() {
    return perfil.imersao ? "true" : "false";
  }
  function contextoIA() {
    return historico.slice(-50);
  }
  function pedirLina(extras) {
    var sys = window.montarPrompt(perfil);
    var ctx = contextoIA();
    if (window.IA.temChave()) {
      return window.IA.gemini(ctx, sys).then(function (r) {
        return r.texto;
      }).catch(function (err) {
        toast("⚠️ " + err.message + " (usando modo básico)");
        return window.IA.planoB(ultimoUsuario(), perfil);
      });
    }
    return new Promise(function (res) {
      setTimeout(function () {
        res(window.IA.planoB(ultimoUsuario(), perfil));
      }, 450);
    });
  }
  function ultimoUsuario() {
    for (var i = historico.length - 1; i >= 0; i--) {
      if (historico[i].role === "user") return historico[i].pts;
    }
    return "";
  }

  /* ---------------- ENVIAR ---------------- */
  function enviar(texto, viaMic) {
    texto = String(texto || "").trim();
    if (!texto || pendente) return;
    pendente = true;
    setBusy(true);

    var ehEN = window.IA.pareceIngles(texto);
    historico.push({ role: "user", pts: texto });
    adicionarMsg({ role: "user", pts: texto });
    salvarHist();

    somarXp(6, []);
    if (ehEN) somarXp(10, ["🇺🇸 praticou inglês!"]);
    if (perfil.cena) somarXp(4, ["🎭 treino de cena!"]);

    $("pulsando").hidden = false;
    rolarFundo();

    pedirLina().then(function (resposta) {
      historico.push({ role: "model", pts: resposta });
      adicionarMsg({ role: "model", pts: resposta });
      salvarHist();

      var nov = coletarPalavras(resposta);
      var bonus = [];
      if (nov.length) {
        var quantas = 0;
        nov.forEach(function (p) {
          var ja = (perfil.palavras || []).some(function (x) {
            return x.toLowerCase() === p.toLowerCase();
          });
          if (!ja) { perfil.palavras.push(p); quantas++; }
        });
        if (quantas) {
          if (perfil.palavras.length > 120) perfil.palavras = perfil.palavras.slice(-120);
          salvarPerfil();
          bonus.push("📚 +" + quantas + " palavra(s)!");
        }
      }
      if (/🔧/.test(resposta)) bonus.push("✏️ erro corrigido!");
      if (bonus.length) somarXp(8, bonus);
      renderPalavras();

      if (autoVoz && !perfil.imersao && !perfil.cena) {
        var en2 = extrairIngles(resposta);
        if (en2.length) setTimeout(function () { falarLote(en2, "en-US"); }, 500);
      }
    }).finally(function () {
      pendente = false;
      setBusy(false);
      $("pulsando").hidden = true;
      rolarFundo();
    });
  }
  function setBusy(estado) {
    $("btnEnviar").disabled = estado;
    $("btnMic").disabled = estado;
  }

  function adicionarSys(pts) {
    historico.push({ role: "user", pts: pts, sys: true });
    adicionarMsg({ role: "model", pts: pts, sys: true });
    salvarHist();
  }

  /* ---------------- CENAS ---------------- */
  function entrarCena(id) {
    if (pendente) { toast("Aguarde a Lina terminar de falar 🙂"); return; }
    var c = null;
    CENAS.forEach(function (x) { if (x.id === id) c = x; });
    if (!c) return;
    if (perfil.cena === id) { sairCena(); return; }
    if (perfil.cena) sairCena(true);
    perfil.cena = id;
    perfil.cenaNome = c.nome;
    salvarPerfil();
    $("btnSairCena").hidden = false;
    pintarCenas();
    adicionarSys("🧭 ENTREI NA CENA: " + c.nome + ". " + c.situacao + " — " + c.papel + ". Comece a cena agora.");
    responderaoSys();
  }
  function sairCena(silencioso) {
    perfil.cena = null;
    perfil.cenaNome = "";
    salvarPerfil();
    $("btnSairCena").hidden = true;
    pintarCenas();
    if (!silencioso) {
      adicionarSys("🧭 Encerrei a cena. Volte a ser a Lina professora e retome a aula normalmente.");
      responderaoSys();
    }
  }
  function responderaoSys() {
    if (pendente) return;
    pendente = true;
    setBusy(true);
    $("pulsando").hidden = false;
    pedirLina().then(function (resposta) {
      historico.push({ role: "model", pts: resposta });
      adicionarMsg({ role: "model", pts: resposta });
      salvarHist();
    }).finally(function () {
      pendente = false;
      setBusy(false);
      $("pulsando").hidden = true;
      rolarFundo();
    });
  }

  /* ---------------- AULAS RÁPIDAS ---------------- */
  function aulaRapida(id) {
    if (pendente) { toast("Aguarde a Lina terminar 🙂"); return; }
    var t = null;
    TEMAS.forEach(function (x) { if (x.id === id) t = x; });
    if (!t) return;
    adicionarSys("🎯 AULA RÁPIDA sobre: " + t.nome + ". Ensine em poucos passos: 1) explique de forma simples, 2) liste 5 palavras/expressões com ★ e tradução, 3) dê 1 exercício curto para eu fazer, 4) pergunte só uma coisa no final.");
    responderaoSys();
  }

  /* ---------------- PAINEL ---------------- */
  function pintarCenas() {
    var box = $("listaCenas");
    box.innerHTML = "";
    CENAS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cenaBtn" + (perfil.cena === c.id ? " ativo" : "");
      b.innerHTML = "<span class='cemoji'>" + c.icone + "</span><span>" + escapeHtml(c.nome) + "</span><span class='clv'>" + c.nivel + "</span>";
      b.onclick = function () { entrarCena(c.id); };
      box.appendChild(b);
    });
  }
  function pintarTemas() {
    var box = $("listaTemas");
    box.innerHTML = "";
    TEMAS.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cenaBtn";
      b.innerHTML = "<span class='cemoji'>" + t.icone + "</span><span>" + escapeHtml(t.nome) + "</span>";
      b.onclick = function () { aulaRapida(t.id); };
      box.appendChild(b);
    });
  }
  function renderPalavras() {
    var box = $("listaPalavras");
    $("palCont").textContent = (perfil.palavras || []).length;
    box.innerHTML = "";
    (perfil.palavras || []).slice().reverse().forEach(function (p, i) {
      var s = document.createElement("span");
      s.className = "pal";
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "✕";
      b.title = "Remover";
      b.onclick = function () {
        perfil.palavras.splice(perfil.palavras.indexOf(p), 1);
        salvarPerfil();
        renderPalavras();
      };
      s.textContent = "★ " + p + "  ";
      s.appendChild(b);
      box.appendChild(s);
    });
  }

  /* ---------------- BADGES / BARRA ---------------- */
  function atualizarBadges() {
    $("xpVal").textContent = xp;
    $("streakVal").textContent = atualizarStreak();
    var niv = $("nivelBadge");
    niv.textContent = perfil ? perfil.nivel : "A1";
    if (perfil) {
      var meta = encont(niveis());
      var dentro = xp % 500;
      $("barraNivelPre").style.width = (dentro / 5) + "%";
      $("barraNivelRot").textContent = "⭐ " + xp + " XP";
      if (meta) niv.title = meta.desc + " | " + xp + " XP";
    }
    $("pnivel").textContent = perfil ? perfil.nivel : "A1";
    $("btnImersao").textContent = perfil && perfil.imersao ? "🌊🎧 Sair do mergulho" : "Mergulho total 🎧";
    $("btnImersao").style.fontWeight = perfil && perfil.imersao ? "700" : "400";

    var rot = $("modoRotulo");
    var av = $("avisoIA");
    if (window.IA.temChave()) {
      rot.textContent = "🤖 IA ativa";
      rot.className = "rotuloChip bom";
      av.hidden = true;
    } else {
      rot.textContent = "🟡 modo básico — ativar IA";
      rot.className = "rotuloChip aviso";
      av.hidden = false;
    }
  }
  function niveis() { return NIVEIS; }
  function encont(lista) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === perfil.nivel) return lista[i];
    return lista[0];
  }

  /* ---------------- TOAST ---------------- */
  var timerToast = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { t.hidden = true; }, 3400);
  }

  /* ---------------- SETUP ---------------- */
  function mostrarSetup() {
    $("overlaySetup").hidden = false;
    var nivelBox = $("setNiveis");
    nivelBox.innerHTML = "";
    NIVEIS.forEach(function (n) {
      var o = document.createElement("button");
      o.type = "button";
      o.className = "opcao" + (n.id === "A1" ? " selecionada" : "");
      o.dataset.id = n.id;
      o.innerHTML = "<b>" + n.icone + " " + n.id + "</b><small>" + escapeHtml(n.desc.split("·")[0].trim()) + "</small>";
      o.onclick = function () {
        nivelBox.querySelectorAll(".opcao").forEach(function (x) { x.classList.remove("selecionada"); });
        o.classList.add("selecionada");
      };
      nivelBox.appendChild(o);
    });
    var metaBox = $("setMetas");
    metaBox.innerHTML = "";
    GOALS.forEach(function (g) {
      var o = document.createElement("button");
      o.type = "button";
      o.className = "opcao";
      o.dataset.id = g.id;
      o.innerHTML = g.icone + " " + escapeHtml(g.nome);
      o.onclick = function () {
        o.classList.toggle("selecionada");
      };
      metaBox.appendChild(o);
    });
  }
  function iniciar() {
    var nome = $("setNome").value.trim();
    if (!nome) { toast("Me conta seu nome primeiro 🙂"); return; }
    var nivelSel = null;
    $("setNiveis").querySelectorAll(".opcao").forEach(function (o) {
      if (o.classList.contains("selecionada")) nivelSel = o.dataset.id;
    });
    var metas = [];
    $("setMetas").querySelectorAll(".opcao").forEach(function (o) {
      if (o.classList.contains("selecionada")) metas.push(o.dataset.id);
    });
    if (!metas.length) metas = ["viagem"];

    perfil = {
      nome: nome,
      nivel: nivelSel || "A1",
      metas: metas,
      cena: null,
      cenaNome: "",
      imersao: false,
      palavras: []
    };
    salvarPerfil();
    $("overlaySetup").hidden = true;
    pintarCenas();
    pintarTemas();
    renderPalavras();
    atualizarBadges();

    if (historico.length === 0) {
      historico.push({
        role: "model",
        pts: "Oi, " + escapeNome(nome) + "! Eu sou a Lina 👩‍🏫 Vou te ensinar inglês de verdade — o inglês que os nativos falam na rua, no trabalho, na escola, na viagem e em família.\n\nPara começar de um jeito gostoso: **What's your name?** *(Qual é o seu nome?)* — me responde em inglês ou me conta em português o que você mais quer aprender. 😊"
      });
      adicionarMsg({ role: "model", pts: historico[historico.length - 1].pts });
      salvarHist();
      setTimeout(function () {
        var ej = extrairIngles(historico[historico.length - 1].pts);
        if (autoVoz && ej.length) falarLote(ej, "en-US");
      }, 600);
    }
    renderizarTudo();
    if (!window.IA.temChave()) {
      adicionarSys("💡 IMPORTANTE: neste aparelho ainda estou em MODO BÁSICO (respostas prontas). Para virar uma IA de verdade, que te entende e te ensina do seu jeito, toque no botão **🔌 Ativar IA** aqui de cima (ou ⚙️) e cole sua chave grátis. Basta 1 vez por aparelho.");
      setTimeout(function () {
        toast("🔌 Toque em \u201cAtivar IA\u201d e cole sua chave grátis!");
      }, 1200);
    }
  }
  function escapeNome(n) {
    return String(n).replace(/[<>]/g, "").slice(0, 24);
  }

  /* ---------------- CONFIG ---------------- */
  function abrirConfig() {
    $("cfgChave").value = window.IA.getChave();
    $("cfgModelo").value = window.IA.getModelo();
    var st = $("cfgStatus");
    if (window.IA.temChave()) {
      st.className = "cfgStatus ok";
      st.innerHTML = "✅ Chave configurada (começa com <b>" + window.IA.getChave().slice(0, 5) + "</b>). Modelo: <b>" + escapeHtml(window.IA.getModelo()) + "</b>. Você fala com a Lina de verdade!";
    } else {
      st.className = "cfgStatus";
      st.innerHTML = "Sem chave ainda. A Lina funciona em <b>modo básico</b> (frases prontas). Para conversar de verdade, pegue sua chave grátis em <b>aistudio.google.com/apikey</b>.";
    }
    $("overlayConfig").hidden = false;
  }
  function salvarConfig() {
    var chave = $("cfgChave").value.trim();
    var modelo = $("cfgModelo").value.trim();
    window.IA.setChave(chave);
    window.IA.setModelo(modelo);
    toast(window.IA.temChave() ? "✅ Chave salva! Agora a Lina é de verdade." : "Chave vazia — Lina segue em modo básico.");
    abrirConfig();
  }
  function testarChave() {
    var chave = $("cfgChave").value.trim();
    window.IA.setChave(chave);
    var st = $("cfgStatus");
    st.className = "cfgStatus";
    st.innerHTML = "🔌 Testando conexão com a Gemini... aguarde.";
    window.IA.gemini(
      [{ role: "user", pts: "Responda apenas com a palavra OK." }],
      "Você é um assistente de teste. Responda em uma única palavra.",
      0
    ).then(function (r) {
      st.className = "cfgStatus ok";
      st.innerHTML = "✅ Chave <b>VÁLIDA</b>! A Gemini respondeu: <b>" + escapeHtml(r.texto.slice(0, 60)) + "</b>.<br><br>Agora feche esta janela e converse comigo de verdade — sem modo básico!";
      toast("✅ Chave válida! Lina é IA de verdade agora.");
    }).catch(function (e) {
      st.className = "cfgStatus erro";
      st.innerHTML = "❌ " + escapeHtml(e.message) + "<br><br>Confira se a chave foi copiada inteira (começa com AIza) e se o modelo <b>" + escapeHtml(window.IA.getModelo()) + "</b> existe em ai.google.dev/gemini-api/docs/models.";
      toast("Erro ao testar a chave.");
    });
  }
  function zerarTudo() {
    if (!confirm("Zerar todo o progresso, vocabulário e conversa?")) return;
    try {
      ["lina_ia_perfil_v1", "lina_ia_hist_v1", "lina_ia_xp_v1", "lina_ia_streak_v1", "lina_ia_chave_v1", "lina_ia_modelo_v1", "lina_ia_auto_v1"].forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    location.reload();
  }

  /* ---------------- TEMA ---------------- */
  function aplicarTema(t) {
    document.documentElement.setAttribute("data-tema", t);
    $("btnTema").textContent = t === "escuro" ? "☀️" : "🌙";
    try { localStorage.setItem(LS_TEMA, t); } catch (e) {}
  }
  function carregarTema() {
    var t = "claro";
    try { t = localStorage.getItem(LS_TEMA) || "claro"; } catch (e) {}
    aplicarTema(t);
  }

  /* ---------------- TTS prontidão ---------------- */
  if (window.speechSynthesis) {
    carregarVozes();
    window.speechSynthesis.onvoiceschanged = carregarVozes;
  }

  /* ---------------- EVENTOS ---------------- */
  function ligar() {
    $("btnEnviar").onclick = function () { enviar($("entrada").value); $("entrada").value = ""; };
    $("entrada").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { enviar($("entrada").value); $("entrada").value = ""; }
    });
    $("btnMic").onclick = iniciarMic;
    $("btnConfig").onclick = abrirConfig;
    $("modoRotulo").onclick = abrirConfig;
    $("avisoIA").onclick = abrirConfig;
    $("btnSalvarCfg").onclick = salvarConfig;
    $("btnTestarChave").onclick = testarChave;
    $("btnFechaCfg").onclick = function () { $("overlayConfig").hidden = true; };
    $("overlayConfig").addEventListener("click", function (ev) {
      if (ev.target === this) this.hidden = true;
    });
    $("btnZerar").onclick = zerarTudo;
    $("btnLimparChat").onclick = function () {
      if (!confirm("Apagar só a conversa (mantém XP e vocabulário)?")) return;
      historico = [];
      salvarHist();
      MSGS.innerHTML = "";
      toast("Conversa limpa. Fala com a Lina! 🙂");
    };
    $("btnTema").onclick = function () {
      var novo = document.documentElement.getAttribute("data-tema") === "escuro" ? "claro" : "escuro";
      aplicarTema(novo);
    };
    $("btnIniciar").onclick = iniciar;
    $("setNome").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") iniciar();
    });
    $("btnFechaPainel").onclick = function () { $("painel").classList.remove("aberto"); };
    $("btnPainel").onclick = function () { $("painel").classList.toggle("aberto"); };
    $("btnImersao").onclick = function () {
      perfil.imersao = !perfil.imersao;
      salvarPerfil();
      atualizarBadges();
      if (perfil.imersao) {
        toast("🎧 Mergulho total: agora a Lina fala só inglês!");
        adicionarSys("🌊 Iniciei o MERGULHO TOTAL: mantenha TODO o diálogo em inglês agora. Use português apenas na parte de correção de erros (🔧/💬).");
        responderaoSys();
      } else {
        toast("Modo misto de volta (português + inglês).");
        adicionarSys("🌊 Encerrei o mergulho total: volte ao misto de idiomas normal para o meu nível.");
        responderaoSys();
      }
    };
    $("btnSairCena").onclick = function () { sairCena(); };
  }

  /* ---------------- INICIO ---------------- */
  carregarTema();
  if (perfil) {
    ligar();
    pintarCenas();
    pintarTemas();
    renderPalavras();
    atualizarBadges();
    if (historico.length) {
      renderizarTudo();
    } else {
      var nome = escapeNome(perfil.nome || "");
      historico.push({
        role: "model",
        pts: "Oi, " + nome + "! Tô de volta! Estamos no nível **" + perfil.nivel + "**, treinando: " + (perfil.metas.map(function (m) { var g = GOALS.filter(function (x) { return x.id === m; })[0]; return g ? g.icone + " " + g.nome : m; }).join(", ")) + ".\n\nBora 💪 Me conta em inglês: **\"What's your name?\"** *(Qual é o seu nome?)* — ou me diz em português o que você quer praticar hoje."
      });
      adicionarMsg({ role: "model", pts: historico[historico.length - 1].pts });
      salvarHist();
      setTimeout(function () {
        var ej = extrairIngles(historico[historico.length - 1].pts);
        if (autoVoz && ej.length) falarLote(ej, "en-US");
      }, 600);
    }
    $("entrada").focus();
  } else {
    ligar();
    mostrarSetup();
    $("overlaySetup").hidden = false;
  }
})();