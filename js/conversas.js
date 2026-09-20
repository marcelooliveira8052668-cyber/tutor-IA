/* =============================================================
   Lina — Tutor de Inglês IA
   conversas.js
   Persona, níveis, cenários, temas de aula e o motor offline (plano B).
   ============================================================= */

window.NIVEIS = [
  { id: "A1", desc: "Iniciante · palavras e frases básicas",      pt: 0.94, en: 0.06, icone: "🌱" },
  { id: "A2", desc: "Básico · sobrevive no dia a dia",            pt: 0.82, en: 0.18, icone: "🌿" },
  { id: "B1", desc: "Intermediário · conversa de verdade",        pt: 0.50, en: 0.50, icone: "🌳" },
  { id: "B2", desc: "Intermediário-avançado · trabalho e debate", pt: 0.30, en: 0.70, icone: "🔥" },
  { id: "C1", desc: "Avançado · fluência e naturalidade",         pt: 0.10, en: 0.90, icone: "🚀" },
  { id: "C2", desc: "Fluente · nível de nativo",                  pt: 0.00, en: 1.00, icone: "👑" }
];

window.GOALS = [
  { id: "trabalho", nome: "Trabalho",        icone: "💼" },
  { id: "escola",   nome: "Escola / Estudos", icone: "🎓" },
  { id: "amigos",   nome: "Amigos / Social",  icone: "🧑‍🤝‍🧑" },
  { id: "viagem",   nome: "Viagem",           icone: "✈️" },
  { id: "familia",  nome: "Família / Casa",   icone: "👨‍👩‍👧" },
  { id: "provas",   nome: "Provas (IELTS/TOEFL)", icone: "🎯" }
];

/* Cenários de conversa — simulação de papel real */
window.CENAS = [
  { id: "apresentacao", nome: "Se apresentar",      icone: "👋",  nivel: "A1",
    papel: "um colega simpático que acabou de conhecer o aluno",
    situacao: "Vocês dois se conheceram agora e estão trocando apresentações, perguntas sobre o nome, cidade, onde mora e o que gosta de fazer." },
  { id: "cafe",        nome: "Pedir comida / café", icone: "☕",  nivel: "A1",
    papel: "o atendente de uma cafeteria",
    situacao: "O aluno chega para pedir comida e bebida. Ofereça opções, pergunte o tamanho e o acompanhamento, e diga o preço total." },
  { id: "familia",     nome: "Jantar em família",  icone: "🍽️", nivel: "A1",
    papel: "um parente acolhedor em um jantar em família",
    situacao: "Conversa descontraída de mesa de jantar: comida, trabalho, planos do fim de semana e elogios à comida da vó." },
  { id: "visa",        nome: "Aeroporto / imigração", icone: "🛫", nivel: "A2",
    papel: "o oficial da imigração", 
    situacao: "Seguir o voo, apresentar documentos, dizer o motivo da visita, quanto tempo vai ficar e onde vai se hospedar." },
  { id: "hotel",       nome: "Hotel",               icone: "🏨",  nivel: "A2",
    papel: "o recepcionista de um hotel",
    situacao: "O aluno faz o check-in, pergunta sobre o café da manhã, Wi-Fi e pede informações sobre a cidade." },
  { id: "restaurante", nome: "Restaurante",         icone: "🍔",  nivel: "A2",
    papel: "o garçom de um restaurante",
    situacao: "O aluno pede a mesa, pede o cardápio, pergunta sobre pratos, pede a conta e reclama de um item (o garçom oferece solução)." },
  { id: "compras",     nome: "Fazer compras",       icone: "🛍️", nivel: "A2",
    papel: "um vendedor de loja de roupas",
    situacao: "O aluno procura uma peça de roupa, pede tamanho e cor, pergunta o preço, negocia um desconto e paga." },
  { id: "escola",      nome: "Escola / aula",       icone: "🎓",  nivel: "A2",
    papel: "um professor de inglês em sala de aula",
    situacao: "O aluno participa da aula, se apresenta à turma, pergunta algo em inglês e faz uma atividade simples." },
  { id: "saude",       nome: "Médico / farmácia",   icone: "💊",  nivel: "A2",
    papel: "um médico bastante paciente",
    situacao: "O aluno está com um problema de saúde (dor, resfriado, febre), descreve os sintomas e recebe orientações." },
  { id: "rua",         nome: "Pedir informações",   icone: "🗺️", nivel: "A1",
    papel: "um morador local muito atencioso",
    situacao: "O aluno está perdido na rua e precisa de direções para um lugar (metrô, banco, supermercado, praça)." },
  { id: "telefone",    nome: "Ligar por telefone",  icone: "📞",  nivel: "B1",
    papel: "atendente de uma empresa de telefonia",
    situacao: "O aluno liga para resolver um problema com a conta, aguardar, explicar o problema e agendar uma visita técnica." },
  { id: "amigos",      nome: "Papo entre amigos",   icone: "🍻",  nivel: "B1",
    papel: "um amigo descontraído",
    situacao: "Bate-papo informal: gírias, planos de fim de semana, fofoca leve, séries, música e brincadeiras." },
  { id: "trabalho",    nome: "Reunião de trabalho", icone: "💻",  nivel: "B1",
    papel: "seu colega de trabalho em uma reunião virtual",
    situacao: "Vocês estão numa reunião: cumprimentar, apresentar o status do projeto, marcar a próxima reunião." },
  { id: "entrevista",  nome: "Entrevista de emprego", icone: "💼", nivel: "B2",
    papel: "o recrutador de uma empresa internacional",
    situacao: "Entrevista de emprego: apresentação profissional, experiência, pontos fortes e fracos, salário esperado e perguntas do candidato." },
  { id: "negocios",    nome: "Negócios / barganha", icone: "🤝", nivel: "B2",
    papel: "um gerente de outra empresa fechando parceria",
    situacao: "Reunião de negócios: apresentar a empresa, discutir prazos, valor, condições e fechar um acordo." },
  { id: "netflix",     nome: "Séries e cultura",    icone: "🎬", nivel: "B2",
    papel: "um amigo que adora séries e cultura",
    situacao: "Papo sobre séries, filmes e música. Use gírias e expressões modernas como em conversas de jovens adultos." }
];

/* Temas de aula rápida pedidos pela Lina */
window.TEMAS = [
  { id: "perguntas",   nome: "Como fazer perguntas", icone: "❓" },
  { id: "passado",     nome: "Falar do passado",     icone: "⏪" },
  { id: "futuro",      nome: "Planos (futuro)",      icone: "🔮" },
  { id: "comida",      nome: "Comida e pedidos",     icone: "🍕" },
  { id: "trabalhoVoc", nome: "Vocabulário de trabalho", icone: "💼" },
  { id: "phrasal",     nome: "Phrasal verbs",        icone: "🔗" },
  { id: "giRia",       nome: "Gírias de nativo",     icone: "😎" },
  { id: "numeros",     nome: "Números e preços",     icone: "🔢" },
  { id: "horas",       nome: "Horas e datas",        icone: "🕒" },
  { id: "viagemVoc",   nome: "Sobreviver na viagem", icone: "🧳" },
  { id: "entrevEmpr",  nome: "Entrevista em inglês", icone: "🎯" },
  { id: "confianca",   nome: "Perder a vergonha",    icone: "💪" }
];

/* =============================================================
   CONSTRUÇÃO DO PROMPT DA LINA
   ============================================================= */
window.montarPrompt = function (perfil) {
  var nivel = null;
  (window.NIVEIS || []).forEach(function (n) { if (n.id === perfil.nivel) nivel = n; });
  if (!nivel) nivel = window.NIVEIS[0];

  var metas = (perfil.metas || []).map(function (m) {
    var g = null;
    (window.GOALS || []).forEach(function (x) { if (x.id === m) g = x; });
    return g ? (g.icone + " " + g.nome) : m;
  }).join(", ") || "conversar com confiança";

  var regraIdioma;
  if (perfil.imersao) {
    regraIdioma = "MODO MERGULHO TOTAL: responda SEMPRE em inglês natural e completo. Use português SOMENTE na parte de correção (🔧) e em dicas rápidas quando o aluno travar.";
  } else {
    regraIdioma = "Misture os idiomas assim: " + Math.round(nivel.pt * 100) + "% português + " + Math.round(nivel.en * 100) + "% inglês, sempre mantendo as explicações claras.";
  }

  var cena = "";
  if (perfil.cena) {
    var c = null;
    (window.CENAS || []).forEach(function (x) { if (x.id === perfil.cena) c = x; });
    if (c) {
      cena = [
        "",
        "CENÁRIO ATIVO: " + c.nome + ".",
        "Agora você interpreta " + c.papel + ". " + c.situacao,
        "Regras da cena: 1) Comece a cena com uma fala curta e natural do personagem. 2) Fale quase tudo em inglês (no nível do aluno, em frases curtas). 3) Se o aluno travar ou errar feio, dê uma dica em português. 4) Reaja de forma realista ao que ele disser. 5) Complete o objetivo da cena (pedido feito, problema resolvido, conversa finalizada) e aí pergunte se quer repetir ou trocar de cena."
      ].join("\n");
    }
  }

  var voc = "";
  if (perfil.palavras && perfil.palavras.length) {
    voc = "\nVOCABULÁRIO DO ALUNO (já aprendeu, pode usar e reforçar): " + perfil.palavras.slice(-60).join(", ") + ".";
  }

  return [
    "Você é a Lina, uma professora de inglês de verdade, brasileira, morando nos EUA há 10 anos. Você ensina inglês real, do jeito que os nativos falam de verdade — com contrações, phrasal verbs, gírias e naturalidade.",
    "",
    "PERFIL DO ALUNO:",
    "Nome: " + (perfil.nome || "aluno(a)"),
    "Nível: " + nivel.id + " — " + nivel.desc,
    "Metas: " + metas,
    "Foco dos exemplos: usar situações reais da vida dele(a) (" + metas + ").",
    "Idioma: " + regraIdioma,
    voc,
    cena,
    "",
    "REGRAS DE OURO:",
    "1. PERSONALIZE. Use a vida real do(a) aluno(a) nos exemplos e nas perguntas. Nunca deixe a aula genérica.",
    "2. CORRIJA SEMPRE quando ele(a) escrever ou falar inglês:",
    "   ✅ O que acertou (elogie de verdade)",
    "   🔧 O erro corrigido (→ forma certa)",
    "   💬 Como um nativo diria de forma mais natural (com gíria/expressão do dia a dia)",
    "3. Ensine inglês REAL: contrações (I'm, don't, gonna), phrasal verbs, expressões usuais e gírias, sempre no nível certo.",
    "4. UMA pergunta por vez no final, para a conversa continuar. Não encho o aluno de perguntas.",
    "5. Ao ensinar palavras novas, liste cada uma em sua própria linha começando com ★ e a tradução:",
    "   ★ hungry — com fome",
    "6. Seja humana: empática, paciente, com um humor leve. Nunca robótica. Poucos emojis, mas que acolham.",
    "7. Se o aluno escrever em português, responda em português e ensine o inglês correspondente. Se escrever em inglês, aplique a regra 2 e continue a conversa rica em inglês.",
    "8. Nunca traduza palavra por palavra: mostre o jeito NATURAL de dizer.",
    "9. Respostas curtas e focadas: máximo 3 a 5 pontos por mensagem, explicações simples e exemplos práticos.",
    "10. Em cenários (REGRAS DE CENA acima), mantenha o personagem o tempo todo."
  ].join("\n");
};

/* =============================================================
   MENSAGENS DO PLANO B (sem chave de IA)
   ============================================================= */
window.OFFLINE = {
  /* cumprimentos simples */
  responder: function (texto, perfil) {
    var t = String(texto || "").toLowerCase().replace(/[.!?]/g, "").trim();

    var f = function (lista) {
      for (var i = 0; i < lista.length; i++) if (t.indexOf(lista[i]) !== -1) return true;
      return false;
    };

    var linhas = [];

    if (f(["olá", "ola", "oi", "bom dia", "boa tarde", "hey", "hello", "hi", "e ai", "e aí"])) {
      linhas.push("Oi! Que bom você estar aqui. 😊");
      linhas.push("Quando alguém te cumprimenta em inglês, você pode responder: **\"Hi! How are you?\"** — quer praticar agora?");
    } else if (f(["me chamo", "meu nome", "sou o", "sou a", "sou ", "my name", "i am"])) {
      linhas.push("Prazer! Agora escute: para se apresentar em inglês você diz **\"My name is …\"**, e para perguntar ao outro: **\"What's your name?\"**.");
      linhas.push("★ name — nome");
      linhas.push("Tente me responder em inglês: **\"My name is …\"** 🙂");
    } else if (f(["como voce esta", "como você está", "como vai", "how are you", "tudo bem", "tudo bom"])) {
      linhas.push("Tudo ótimo por aqui! E você? Para responder, use **\"I'm fine, thanks. And you?\"** (Estou bem, obrigada. E você?).");
      linhas.push("★ fine — bem");
    } else if (f(["de onde", "onde voce", "onde você", "where are you from", "where do you"])) {
      linhas.push("Eu moro nos Estados Unidos, mas sou brasileira. Para falar de onde você é: **\"I'm from Brazil.\"**");
      linhas.push("★ from — de (lugar de origem)");
      linhas.push("Me conta: **\"I'm from …\"** onde você nasceu?");
    } else if (f(["anos", "idade", "old", "tenho 2", "tenho 3", "tenho 4", "tenho 5", "tenho 1"])) {
      linhas.push("Atenção que essa é a pegadinha clássica do brasileiro! Em português você diz “tenho X anos”, mas em inglês é **\"I AM X years old\"**, com o verbo “to be”, nunca “to have”.");
      linhas.push("🔧 I have 25 years → **I am 25** ✅");
      linhas.push("★ old — velho(a) / anos de idade (years old)");
      linhas.push("Testa pra mim: você tem quantos anos?");
    } else if (f(["obrigad", "thanks", "thank you", "valeu", "brigad"])) {
      linhas.push("De nada! **\"You're welcome!\"**");
      linhas.push("★ welcome — de nada / bem-vindo(a)");
      linhas.push("Em conversa com amigos você também pode ouvir **\"No problem!\"** ou **\"Any time!\"**. Quer ver um exemplo de amigo? 🙂");
    } else if (f(["fome", "hungry", "sede", "thirsty", "cansad", "cansada", "tired"])) {
      linhas.push("Mais uma pegadinha! “Estou com fome/sede” NÃO é “I have hungry”. Use **\"to be\"**:");
      linhas.push("🔧 I have hungry → **I'm hungry** (fome) / **I'm thirsty** (sede)");
      linhas.push("★ hungry — com fome");
      linhas.push("★ thirsty — com sede");
      linhas.push("Agora me conta em inglês: o que você come quando está com fome?");
    } else if (f(["como eu faço", "como faco", "how do i", "how do i", "como digo", "como falo"])) {
      linhas.push("Boa pergunta! Em inglês, para pedir como se diz algo, é só perguntar: **\"How do you say … in English?\"**");
      linhas.push("★ how — como");
      linhas.push("Escreve aqui o que você quer saber em português que eu te mostro o equivalente natural!");
    } else if (f(["gostaria de", "quero", "eu quero", "i want", "i would like", "queria"])) {
      linhas.push("Ótimo! Para pedir algo com educação, o nativo diz **\"I'd like …\"** (Eu gostaria) ou **\"Could I have …?\"** (Posso ter?).");
      linhas.push("★ I'd like — eu gostaria de");
      linhas.push("Pratica comigo: me pede algo “I'd like…” — pode ser comida, uma música, qualquer coisa! 😄");
    } else if (f(["perdao", "perdão", "desculpa", "com licenca", "com licença", "sorry", "excuse me"])) {
      linhas.push("Isso mesmo! **\"Excuse me\"** para chamar atenção com educação e **\"I'm sorry\"** para pedir desculpas.");
      linhas.push("★ sorry — desculpa");
      linhas.push("Dica de nativo: “Sorry?” com tom de pergunta significa “como foi?” quando você não entendeu. Quer testar numa cena de rua?");
    } else if (f(["estud", "aprender", "aula", "lesson", "study", "learn"])) {
      linhas.push("Adoro essa energia! 💪 Aqui vai a aula de hoje em 3 linhas:");
      linhas.push("1) **★ learn** — aprender; **★ study** — estudar (com livro/teoria). Nativos falam **“I'm learning English”** (tô aprendendo inglês).");
      linhas.push("2) Frase útil: **\"I'm learning English because…\"** (estou aprendendo inglês porque…).");
      linhas.push("3) Agora completa pra mim: *I'm learning English because ________.*");
    } else if (f(["viagem", "viagem", "travel", "trip", "turist", "passaporte"])) {
      linhas.push("Bora preparar sua viagem! 🧳 As 3 frases que salvam no aeroporto:");
      linhas.push("**\"Where is the gate?\"** — Onde é o portão de embarque?");
      linhas.push("**\"I have a connecting flight.\"** — Tenho um voo de conexão.");
      linhas.push("**\"What time does it depart?\"** — A que horas sai?");
      linhas.push("Que tal a gente treinar a cena do aeroporto? Abre o painel ➜ Cenários ➜ Aeroporto. 😉");
    } else if (f(["trabalho", "trabalho", "work", "emprego", "reuniao", "reunião", "meeting", "job"])) {
      linhas.push("No trabalho, o essencial é ser claro e educado. Três frases que você vai usar todo dia:");
      linhas.push("**\"Let's schedule a meeting.\"** — Vamos marcar uma reunião.");
      linhas.push("**\"Could you send me that by email?\"** — Você poderia me mandar isso por e-mail?");
      linhas.push("**\"I'll follow up with you.\"** — Eu retorno com você depois.");
      linhas.push("Treina a reunião de trabalho em ➜ Cenários. Quer essa agora ou prefere outro tema?");
    } else if (f(["treino", "praticar", "pratica", "prática", "practice", "conversar", "pap"])) {
      linhas.push("Excelente! Conversa é o caminho mais rápido para a fluência. 🎯");
      linhas.push("Para treinar comigo de verdade, cole sua chave grátis no ⚙️ Configurações (aistudio.google.com/apikey). Aí sou uma professora de verdade, do seu nível.");
      linhas.push("Enquanto isso: me conta em inglês — **\"What's your name?\"** 🙂");
    } else if (f(["boa noite", "boanoite", "dormir", "sleep"])) {
      linhas.push("Boa noite! 🌙 Para desejar: **\"Good night! Sleep well!\"** e uma variação carinhosa: **\"See you tomorrow!\"**");
      linhas.push("★ sleep — dormir");
    } else {
      /* resposta genérica que ainda ensina */
      linhas.push("Boa pergunta! Pra eu te responder melhor (com passei a usar a palavra certa e o jeito natural), cola sua chave grátis nas ⚙️ Configurações — aí tenho acesso total à mente de uma professora americana de verdade.");
      linhas.push("Enquanto isso, anota essa: para dizer isso em inglês, uma forma útil é começar com **\"I'd like to say…\"** ou **\"Could you explain…?\"**");
      linhas.push("★ could — poderia (pedido educado)");
      linhas.push("Me conta o que você queria dizer em português? 😊");
    }

    return linhas.join("\n\n");
  },

  /* frases por cenário (plano B) */
  cena: function (cenaId) {
    var frase = {
      apresentacao: ["**\"Hello! What's your name?\"** — Oi! Qual é o seu nome?", "**\"Where are you from?\"** — De onde você é?", "**\"Nice to meet you!\"** — Prazer em te conhecer!"],
      cafe: ["**\"I'd like a coffee, please.\"** — Quero um café, por favor.", "**\"Small or large?\"** — Pequeno ou grande?", "**\"How much is it?\"** — Quanto é?"],
      familia: ["**\"This is delicious!\"** — Isso está delicioso!", "**\"Could you pass the salt?\"** — Você pode passar o sal?", "**\"What are your plans this weekend?\"** — Quais seus planos neste fim de semana?"],
      visa: ["**\"Here is my passport.\"** — Aqui está meu passaporte.", "**\"I'm here on vacation.\"** — Estou aqui de férias.", "**\"I'm staying for two weeks.\"** — Vou ficar duas semanas."],
      hotel: ["**\"I have a reservation under the name…\"** — Tenho uma reserva no nome…", "**\"What time is breakfast?\"** — A que horas é o café da manhã?", "**\"Is there free Wi-Fi?\"** — Tem Wi-Fi grátis?"],
      restaurante: ["**\"Could I see the menu, please?\"** — Posso ver o cardápio?", "**\"I'll have the chicken, please.\"** — Vou querer o frango.", "**\"The bill, please.\"** — A conta, por favor."],
      compras: ["**\"I'm just looking, thanks.\"** — Só estou olhando, obrigado.", "**\"Do you have this in large?\"** — Tem esse no tamanho G?", "**\"Can you give me a discount?\"** — Dá pra dar um desconto?"],
      escola: ["**\"May I ask a question?\"** — Posso fazer uma pergunta?", "**\"I didn't understand.\"** — Não entendi.", "**\"Could you repeat that?\"** — Pode repetir?"],
      saude: ["**\"I'm not feeling well.\"** — Estou me sentindo mal.", "**\"I have a sore throat.\"** — Estou com dor de garganta.", "**\"It hurts here.\"** — Dói aqui."],
      rua: ["**\"Excuse me, where is the subway?\"** — Com licença, onde fica o metrô?", "**\"Is it far from here?\"** — É longe daqui?", "**\"Could you show me on the map?\"** — Pode me mostrar no mapa?"],
      telefone: ["**\"I need help with my bill.\"** — Preciso de ajuda com a minha conta.", "**\"Could I speak to a manager?\"** — Posso falar com um gerente?", "**\"Could you repeat that, please?\"** — Pode repetir, por favor?"],
      amigos: ["**\"What's up?\"** — E aí, beleza?", "**\"I'm down for that!\"** — Tô dentro!", "**\"No way! Really?\"** — Não acredito! Sério?"],
      trabalho: ["**\"Let me share my screen.\"** — Deixa eu compartilhar minha tela.", "**\"We're on track.\"** — Estamos no prazo.", "**\"Let's wrap up for today.\"** — Vamos finalizar por hoje."],
      entrevista: ["**\"I have five years of experience in…\"** — Tenho cinco anos de experiência em…", "**\"My main strength is…\"** — Meu principal ponto forte é…", "**\"I'd love to work for your company.\"** — Eu adoraria trabalhar na sua empresa."],
      negocios: ["**\"Let's discuss the budget.\"** — Vamos discutir o orçamento.", "**\"We can offer a better price.\"** — Podemos oferecer um preço melhor.", "**\"Let's shake on it.\"** — Vamos fechar assim."],
      netflix: ["**\"Have you seen the new series?\"** — Você viu a nova série?", "**\"It's a must-watch!\"** — É imperdível!", "**\"The soundtrack is amazing.\"** — A trilha sonora é incrível."]
    };
    return frase[cenaId] || [];
  }
};