
// ─────────────────────────────────────────────────────────────
// [ 1 ] VÍDEO — FADE + BLUR CONFORME O SCROLL
// ─────────────────────────────────────────────────────────────
window.addEventListener("scroll", function () {
  let scroll   = window.scrollY;
  let video    = document.getElementById("bgVideo");
  video.style.opacity = 1 - scroll / 600;
});


// ─────────────────────────────────────────────────────────────
// [ 5 ] FAIXA DE TEXTO CORRIDO — DIREÇÃO MUDA COM O SCROLL
// ─────────────────────────────────────────────────────────────
(function () {
  const track    = document.querySelector('.faixa-track');
  let position   = 0;
  let direction  = -1;
  let lastScroll = window.scrollY;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    const delta   = current - lastScroll;
    lastScroll    = current;
    if (delta > 0) direction = -1;
    if (delta < 0) direction = +1;
  });

  function animar() {
    position += direction * 1.2;
    const half = track.scrollWidth / 2;
    if (position < -half) position += half;
    if (position > 0)     position -= half;
    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(animar);
  }
  animar();
})();


// ─────────────────────────────────────────────────────────────
// [ 7.2 ] FLIP CARD — VIRA AO CLICAR / TOCAR
// ─────────────────────────────────────────────────────────────
document.getElementById('cardFlip').addEventListener('click', function () {
  this.classList.toggle('virado');
});


// ─────────────────────────────────────────────────────────────
// [ 7.4 ] BOTÃO WHATSAPP — MONTA MENSAGEM DE SUGESTÃO DE SABOR
// ─────────────────────────────────────────────────────────────
const mensagemIdeia = [
  "Olá, Capitão! Tudo bem?",
  "",
  "Tenho uma sugestão de sabor para os cookies:",
  "",
  "Nome:",
  "Massa: Tradicional / Black / Red Velvet",
  "Recheio:",
  "Extras (opcional):",
  "",
  "Acho que essa combinação ficaria incrível no cardápio.",
  "Espero que vá pro forno e que eu tenha sido o primeiro(a) a sugerir!"
].join("\n");

document.getElementById("btnWhatsapp").href =
  "https://wa.me/5551998372079?text=" + encodeURIComponent(mensagemIdeia);


// ─────────────────────────────────────────────────────────────
// [ 8 ] CARRINHO — LÓGICA COMPLETA
// ─────────────────────────────────────────────────────────────
const carrinho = {}; // { NOME: { QTY, PRECO } }

function formatarPreco(valor) {
  return "R$" + valor.toFixed(2).replace(".", ",");
}

function atualizarCarrinho() {
  const lista      = document.getElementById("carrinhoLista");
  const vazio      = document.getElementById("carrinhoVazio");
  const totalBadge = document.getElementById("carrinhoTotal");
  const totalLinha = document.getElementById("carrinhoTotalLinha");
  const totalValor = document.getElementById("carrinhoTotalValor");
  const btnFin     = document.getElementById("btnFinalizar");

  // REMOVE ITENS ANTIGOS (MANTÉM O PARÁGRAFO DE VAZIO)
  lista.querySelectorAll(".carrinho-item").forEach(el => el.remove());

  let totalQty   = 0;
  let totalReais = 0;
  const itens = Object.entries(carrinho).filter(([, v]) => v.qty > 0);

  itens.forEach(([nome, { qty, preco }]) => {
    totalQty   += qty;
    totalReais += qty * preco;

    const item = document.createElement("div");
    item.className = "carrinho-item";
    item.innerHTML = `
      <span class="item-nome">${nome}</span>
      <div class="item-qty-ctrl">
        <button class="btn-item-qty" data-nome="${nome}" data-acao="menos">−</button>
        <span class="item-qty-num">${qty}x</span>
        <button class="btn-item-qty" data-nome="${nome}" data-acao="mais">+</button>
      </div>
      <span class="item-preco">${formatarPreco(qty * preco)}</span>
    `;
    lista.appendChild(item);
  });

  // ESTADO VAZIO
  vazio.style.display = itens.length === 0 ? "block" : "none";

  // BADGE COM ANIMAÇÃO DE PULSO
  const badgeAnterior = parseInt(totalBadge.textContent) || 0;
  totalBadge.textContent = totalQty;
  if (totalQty !== badgeAnterior) {
    totalBadge.classList.remove("pulsa");
    void totalBadge.offsetWidth; // FORÇA REFLOW PARA REINICIAR ANIMAÇÃO
    totalBadge.classList.add("pulsa");
  }

  // LINHA DE TOTAL
  totalLinha.style.display = itens.length > 0 ? "flex" : "none";
  totalValor.textContent = formatarPreco(totalReais);

  // SELETOR DE ENTREGA
  document.getElementById('entregaBox').style.display = itens.length > 0 ? "flex" : "none";

  // BOTÃO FINALIZAR — SÓ LIBERA COM ITENS E TIPO DE ENTREGA ESCOLHIDO
  if (itens.length > 0 && tipoEntrega) {
    btnFin.classList.remove("desabilitado");
    btnFin.removeAttribute("disabled");
  } else {
    btnFin.classList.add("desabilitado");
    btnFin.setAttribute("disabled", "true");
  }

  // SINCRONIZA CONTADORES DOS CARDS NORMAIS
  document.querySelectorAll(".card:not([data-multi])").forEach(card => {
    const nome = card.dataset.nome;
    const qty  = (carrinho[nome] && carrinho[nome].qty) || 0;
    const disp = card.querySelector(".qty-display");
    if (disp) disp.textContent = qty;
  });

  // SINCRONIZA CONTADORES DAS SABOR-LINHAS (CARDS MULTI)
  document.querySelectorAll(".sabor-linha").forEach(linha => {
    const nome = linha.dataset.sabor;
    const qty  = (carrinho[nome] && carrinho[nome].qty) || 0;
    const disp = linha.querySelector(".qty-display");
    if (disp) disp.textContent = qty;
  });
}

// DELEGAÇÃO: BOTÕES +/− NO GRID DE PRODUTOS
document.getElementById("menu").addEventListener("click", function (e) {
  const btn  = e.target.closest(".btn-qty");
  if (!btn) return;

  const card  = btn.closest(".card");
  const linha = btn.closest(".sabor-linha");
  const preco = parseFloat(card.dataset.preco);
  const nome  = linha ? linha.dataset.sabor : card.dataset.nome;
  if (!nome) return;

  if (!carrinho[nome]) carrinho[nome] = { qty: 0, preco };

  if (btn.classList.contains("btn-mais"))  carrinho[nome].qty++;
  if (btn.classList.contains("btn-menos") && carrinho[nome].qty > 0) carrinho[nome].qty--;

  if (linha) linha.querySelector(".qty-display").textContent = carrinho[nome].qty;

  atualizarCarrinho();
});

// DELEGAÇÃO: BOTÕES +/− NA LISTA DO CARRINHO
document.getElementById("carrinhoLista").addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-item-qty");
  if (!btn) return;

  const nome = btn.dataset.nome;
  const acao = btn.dataset.acao;
  if (!carrinho[nome]) return;

  if (acao === "mais")  carrinho[nome].qty++;
  if (acao === "menos" && carrinho[nome].qty > 0) carrinho[nome].qty--;

  atualizarCarrinho();
});


// ─────────────────────────────────────────────────────────────
// [ 8.5 ] SELETOR RETIRADA / ENTREGA
// ─────────────────────────────────────────────────────────────
let tipoEntrega = null;

document.querySelectorAll('.btn-entrega').forEach(btn => {
  btn.addEventListener('click', function () {
    tipoEntrega = this.dataset.tipo;

    document.querySelectorAll('.btn-entrega').forEach(b => b.classList.remove('ativo'));
    this.classList.add('ativo');

    const enderecoBox = document.getElementById('enderecoBox');
    if (tipoEntrega === 'entrega') {
      enderecoBox.style.display = 'block';
    } else {
      enderecoBox.style.display = 'none';
      document.getElementById('enderecoInput').value = '';
    }

    // LIBERA BOTÃO FINALIZAR
    const btnFin = document.getElementById('btnFinalizar');
    btnFin.classList.remove('desabilitado');
    btnFin.removeAttribute('disabled');
  });
});


// ─────────────────────────────────────────────────────────────
// [ 8.6 ] BOTÃO FINALIZAR — MONTA E ENVIA PEDIDO VIA WHATSAPP
// ─────────────────────────────────────────────────────────────
document.getElementById("btnFinalizar").addEventListener("click", function () {
  const itens = Object.entries(carrinho).filter(([, v]) => v.qty > 0);
  if (itens.length === 0) return;

  if (!tipoEntrega) {
    document.getElementById('entregaBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (tipoEntrega === 'entrega') {
    const endereco = document.getElementById('enderecoInput').value.trim();
    if (!endereco) {
      document.getElementById('enderecoInput').focus();
      document.getElementById('enderecoInput').style.borderColor = '#C68B4A';
      return;
    }
  }

  let totalReais = 0;
  const linhas = itens.map(([nome, { qty, preco }]) => {
    totalReais += qty * preco;
    return `• ${qty}x ${nome} — ${formatarPreco(qty * preco)}`;
  });

  const ENDERECO_LOJA = "Rua Dona Leopoldina, nº 370, ap 103 — Florestal, Lajeado";

  const linhaEntrega = tipoEntrega === 'retirada'
    ? `*Retirada no local:* ${ENDERECO_LOJA}`
    : `*Entrega no endereço:* ${document.getElementById('enderecoInput').value.trim()}`;

  const mensagem = [
    "Olá, Capitão! Tudo bem?",
    "",
    "Quero fazer o seguinte pedido:",
    "",
    ...linhas,
    "",
    `*Total: ${formatarPreco(totalReais)}*`,
    "",
    linhaEntrega,
    "",
    "Poderia confirmar disponibilidade e prazo? Obrigado(a)!"
  ].join("\n");

  window.open(
    "https://wa.me/5551998372079?text=" + encodeURIComponent(mensagem),
    "_blank"
  );
});


// ─────────────────────────────────────────────────────────────
// [ 8 ] CHUVA DE COOKIES — ANIMAÇÃO NO CANVAS DO CARRINHO
// ─────────────────────────────────────────────────────────────
(function () {
  const canvas  = document.getElementById('chuva-canvas');
  const ctx     = canvas.getContext('2d');
  const cookies = [];
  const QTD     = 28;

  function resize() {
    const section  = document.getElementById('carrinho');
    canvas.width   = section.offsetWidth;
    canvas.height  = section.offsetHeight;
  }

  function criarCookie(espalhar) {
    return {
      x:         Math.random() * canvas.width,
      y:         espalhar ? Math.random() * canvas.height : -60 - Math.random() * 300,
      tamanho:   18 + Math.random() * 28,
      vel:       0.6 + Math.random() * 1.2,
      rotacao:   Math.random() * Math.PI * 2,
      velRot:    (Math.random() - 0.5) * 0.04,
      oscFreq:   0.003 + Math.random() * 0.005,
      oscOff:    Math.random() * Math.PI * 2,
      opacidade: 0.4 + Math.random() * 0.5,
    };
  }

  function iniciar() {
    resize();
    cookies.length = 0;
    for (let i = 0; i < QTD; i++) cookies.push(criarCookie(true));
    animar();
  }

  function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cookies.forEach((c, i) => {
      c.y       += c.vel;
      c.rotacao += c.velRot;
      c.x       += Math.sin(c.y * c.oscFreq + c.oscOff) * 0.6;

      ctx.save();
      ctx.globalAlpha  = c.opacidade;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotacao);
      ctx.font         = `${c.tamanho}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍪', 0, 0);
      ctx.restore();

      if (c.y > canvas.height + 60) cookies[i] = criarCookie(false);
    });

    requestAnimationFrame(animar);
  }

  window.addEventListener('resize', resize);

  if (document.readyState === 'complete') {
    iniciar();
  } else {
    window.addEventListener('load', iniciar);
  }
})();