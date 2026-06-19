
// ============================================================
//  CAPITÃO COOKIES — LÓGICA
//  TUDO ENCAPSULADO EM UMA IIFE COM 'USE STRICT'.
//  SELETORES CACHEADOS NO TOPO, SCROLL CONSOLIDADO EM 1 LISTENER,
//  ANIMAÇÕES PESADAS (FAIXA + CHUVA) PAUSAM FORA DA VIEWPORT,
//  E RESPEITAM PREFERS-REDUCED-MOTION.
// ============================================================
(function () {
  'use strict';

  const reduzMovim = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // ─── SELETORES GLOBAIS ───────────────────────────────────
  const bgVideo         = document.getElementById('bgVideo');
  const faixa           = document.querySelector('.faixa-corrida');
  const faixaTrack      = document.querySelector('.faixa-track');
  const cardFlip        = document.getElementById('cardFlip');
  const btnWpp          = document.getElementById('btnWhatsapp');
  const menu            = document.getElementById('menu');
  const lista           = document.getElementById('carrinhoLista');
  const carrinhoSection = document.getElementById('carrinho');
  const canvas          = document.getElementById('chuva-canvas');

  // ESTADO DE SCROLL COMPARTILHADO ENTRE VÍDEO E FAIXA
  let lastScroll = window.scrollY;
  let faixaDir   = -1;


  // ─────────────────────────────────────────────────────────
  // 1 SCROLL ÚNICO — FADE DO VÍDEO + DIREÇÃO DA FAIXA
  // ─────────────────────────────────────────────────────────
  let scrollTicking = false;
  window.addEventListener('scroll', function () {
    const y = window.scrollY;
    faixaDir   = y > lastScroll ? -1 : y < lastScroll ? 1 : faixaDir;
    lastScroll = y;

    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function () {
        if (bgVideo) bgVideo.style.opacity = Math.max(0, 1 - y / 600);
        scrollTicking = false;
      });
    }
  }, { passive: true });


  // ─────────────────────────────────────────────────────────
  // 5 FAIXA DE TEXTO CORRIDO — SÓ ANIMA QUANDO VISÍVEL
  // ─────────────────────────────────────────────────────────
  (function initFaixa() {
    if (!faixa || !faixaTrack || reduzMovim) return;

    let position = 0, rafId = null, rodando = false;

    function animar() {
      position += faixaDir * 1.2;
      const half = faixaTrack.scrollWidth / 2;
      if (position < -half) position += half;
      if (position > 0)     position -= half;
      faixaTrack.style.transform = 'translateX(' + position + 'px)';
      rafId = requestAnimationFrame(animar);
    }
    function iniciar() { if (!rodando) { rodando = true; animar(); } }
    function parar()   { rodando = false; cancelAnimationFrame(rafId); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { e.isIntersecting ? iniciar() : parar(); });
      }, { threshold: 0 }).observe(faixa);
    } else {
      iniciar();
    }
  })();


  // ─────────────────────────────────────────────────────────
  // 7.2 FLIP CARD — VIRA AO CLICAR / TOCAR
  // ─────────────────────────────────────────────────────────
  if (cardFlip) {
    cardFlip.addEventListener('click', function () {
      this.classList.toggle('virado');
    });
  }


  // ─────────────────────────────────────────────────────────
  // 7.4 WHATSAPP — MONTA MENSAGEM DE SUGESTÃO DE SABOR
  // ─────────────────────────────────────────────────────────
  if (btnWpp) {
    const mensagemIdeia = [
      'Olá, Capitão! Tudo bem?',
      '',
      'Tenho uma sugestão de sabor para os cookies:',
      '',
      'Nome:',
      'Massa: Tradicional / Black / Red Velvet',
      'Recheio:',
      'Extras (opcional):',
      '',
      'Acho que essa combinação ficaria incrível no cardápio.',
      'Espero que vá pro forno e que eu tenha sido o primeiro(a) a sugerir!'
    ].join('\n');
    btnWpp.href = 'https://wa.me/5551998372079?text=' + encodeURIComponent(mensagemIdeia);
  }


  // ─────────────────────────────────────────────────────────
  // 8 CARRINHO — LÓGICA COMPLETA
  // ─────────────────────────────────────────────────────────
  const carrinho = {};          // { NOME: { qty, preco } }
  let   tipoEntrega = null;

  function formatarPreco(valor) {
    return 'R$' + valor.toFixed(2).replace('.', ',');
  }

  function atualizarCarrinho() {
    const vazio      = document.getElementById('carrinhoVazio');
    const totalBadge = document.getElementById('carrinhoTotal');
    const totalLinha = document.getElementById('carrinhoTotalLinha');
    const totalValor = document.getElementById('carrinhoTotalValor');
    const entregaBox = document.getElementById('entregaBox');
    const btnFin     = document.getElementById('btnFinalizar');

    // REMOVE ITENS ANTIGOS (MANTÉM O PARÁGRAFO DE VAZIO)
    lista.querySelectorAll('.carrinho-item').forEach(function (el) { el.remove(); });

    let totalQty = 0, totalReais = 0;
    const itens = Object.entries(carrinho).filter(function (e) { return e[1].qty > 0; });

    itens.forEach(function (entry) {
      const nome  = entry[0];
      const qty   = entry[1].qty;
      const preco = entry[1].preco;
      totalQty   += qty;
      totalReais += qty * preco;

      const item = document.createElement('div');
      item.className = 'carrinho-item';
      item.innerHTML =
        '<span class="item-nome">' + nome + '</span>' +
        '<div class="item-qty-ctrl">' +
          '<button class="btn-item-qty" data-nome="' + nome + '" data-acao="menos">−</button>' +
          '<span class="item-qty-num">' + qty + 'x</span>' +
          '<button class="btn-item-qty" data-nome="' + nome + '" data-acao="mais">+</button>' +
        '</div>' +
        '<span class="item-preco">' + formatarPreco(qty * preco) + '</span>';
      lista.appendChild(item);
    });

    const vazioState = itens.length === 0;

    // ESTADO VAZIO
    vazio.style.display = vazioState ? 'block' : 'none';

    // BADGE COM PULSO (DESLIGADO EM REDUCED-MOTION)
    const badgeAnterior = parseInt(totalBadge.textContent, 10) || 0;
    totalBadge.textContent = totalQty;
    if (totalQty !== badgeAnterior && !reduzMovim) {
      totalBadge.classList.remove('pulsa');
      void totalBadge.offsetWidth; // FORÇA REFLOW PARA REINICIAR A ANIMAÇÃO
      totalBadge.classList.add('pulsa');
    }

    // LINHA DE TOTAL + SELETOR DE ENTREGA
    totalLinha.style.display = vazioState ? 'none' : 'flex';
    totalValor.textContent   = formatarPreco(totalReais);
    entregaBox.style.display  = vazioState ? 'none' : 'flex';

    // BUG FIX: AO ZERAR O CARRINHO, RESETA A ESCOLHA DE ENTREGA
    if (vazioState && tipoEntrega) {
      tipoEntrega = null;
      document.querySelectorAll('.btn-entrega').forEach(function (b) { b.classList.remove('ativo'); });
      const enderecoBox   = document.getElementById('enderecoBox');
      const enderecoInput = document.getElementById('enderecoInput');
      if (enderecoBox)   enderecoBox.style.display = 'none';
      if (enderecoInput) enderecoInput.value = '';
    }

    // BOTÃO FINALIZAR — SÓ LIBERA COM ITENS E TIPO DE ENTREGA ESCOLHIDO
    if (!vazioState && tipoEntrega) {
      btnFin.classList.remove('desabilitado');
      btnFin.removeAttribute('disabled');
    } else {
      btnFin.classList.add('desabilitado');
      btnFin.setAttribute('disabled', 'true');
    }

    // SINCRONIZA CONTADORES DOS CARDS NORMAIS
    document.querySelectorAll('.card:not([data-multi])').forEach(function (card) {
      const nome = card.dataset.nome;
      const qty  = (carrinho[nome] && carrinho[nome].qty) || 0;
      const disp = card.querySelector('.qty-display');
      if (disp) disp.textContent = qty;
    });

    // SINCRONIZA CONTADORES DAS SABOR-LINHAS (CARDS MULTI)
    document.querySelectorAll('.sabor-linha').forEach(function (linha) {
      const nome = linha.dataset.sabor;
      const qty  = (carrinho[nome] && carrinho[nome].qty) || 0;
      const disp = linha.querySelector('.qty-display');
      if (disp) disp.textContent = qty;
    });
  }

  // DELEGAÇÃO: BOTÕES +/− NO GRID DE PRODUTOS
  if (menu) {
    menu.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-qty');
      if (!btn) return;

      const card  = btn.closest('.card');
      const linha = btn.closest('.sabor-linha');
      const preco = parseFloat(card.dataset.preco);
      const nome  = linha ? linha.dataset.sabor : card.dataset.nome;
      if (!nome) return;

      if (!carrinho[nome]) carrinho[nome] = { qty: 0, preco: preco };
      if (btn.classList.contains('btn-mais'))  carrinho[nome].qty++;
      if (btn.classList.contains('btn-menos') && carrinho[nome].qty > 0) carrinho[nome].qty--;

      atualizarCarrinho();
    });
  }

  // DELEGAÇÃO: BOTÕES +/− NA LISTA DO CARRINHO
  if (lista) {
    lista.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-item-qty');
      if (!btn) return;

      const nome = btn.dataset.nome;
      if (!carrinho[nome]) return;

      if (btn.dataset.acao === 'mais')  carrinho[nome].qty++;
      if (btn.dataset.acao === 'menos' && carrinho[nome].qty > 0) carrinho[nome].qty--;

      atualizarCarrinho();
    });
  }


  // ─────────────────────────────────────────────────────────
  // 8.5 SELETOR RETIRADA / ENTREGA
  // ─────────────────────────────────────────────────────────
  document.querySelectorAll('.btn-entrega').forEach(function (btn) {
    btn.addEventListener('click', function () {
      tipoEntrega = this.dataset.tipo;

      document.querySelectorAll('.btn-entrega').forEach(function (b) { b.classList.remove('ativo'); });
      this.classList.add('ativo');

      const enderecoBox = document.getElementById('enderecoBox');
      if (tipoEntrega === 'entrega') {
        enderecoBox.style.display = 'block';
      } else {
        enderecoBox.style.display = 'none';
        document.getElementById('enderecoInput').value = '';
      }

      atualizarCarrinho(); // RECALCULA ESTADO DO BOTÃO FINALIZAR
    });
  });


  // ─────────────────────────────────────────────────────────
  // 8.6 FINALIZAR — MONTA E ENVIA O PEDIDO VIA WHATSAPP
  // ─────────────────────────────────────────────────────────
  const btnFinalizar = document.getElementById('btnFinalizar');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', function () {
      const itens = Object.entries(carrinho).filter(function (e) { return e[1].qty > 0; });
      if (itens.length === 0) return;

      if (!tipoEntrega) {
        document.getElementById('entregaBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const enderecoInput = document.getElementById('enderecoInput');
      if (tipoEntrega === 'entrega') {
        const endereco = enderecoInput.value.trim();
        if (!endereco) {
          enderecoInput.focus();
          enderecoInput.style.borderColor = '#C68B4A';
          return;
        }
      }

      let totalReais = 0;
      const linhas = itens.map(function (entry) {
        const nome  = entry[0];
        const qty   = entry[1].qty;
        const preco = entry[1].preco;
        totalReais += qty * preco;
        return '• ' + qty + 'x ' + nome + ' — ' + formatarPreco(qty * preco);
      });

      const ENDERECO_LOJA = 'Rua Dona Leopoldina, nº 370, ap 103 — Florestal, Lajeado';
      const linhaEntrega = tipoEntrega === 'retirada'
        ? '*Retirada no local:* ' + ENDERECO_LOJA
        : '*Entrega no endereço:* ' + enderecoInput.value.trim();

      const mensagem = [
        'Olá, Capitão! Tudo bem?',
        '',
        'Quero fazer o seguinte pedido:',
        ''
      ].concat(linhas).concat([
        '',
        '*Total: ' + formatarPreco(totalReais) + '*',
        '',
        linhaEntrega,
        '',
        'Poderia confirmar disponibilidade e prazo? Obrigado(a)!'
      ]).join('\n');

      window.open('https://wa.me/5551998372079?text=' + encodeURIComponent(mensagem), '_blank', 'noopener');
    });
  }


  // ─────────────────────────────────────────────────────────
  // 8 CHUVA DE COOKIES — SÓ ANIMA QUANDO O CARRINHO ESTÁ VISÍVEL
  // ─────────────────────────────────────────────────────────
  (function initChuva() {
    if (!canvas || !carrinhoSection || reduzMovim) return;

    const ctx     = canvas.getContext('2d');
    const cookies = [];
    const QTD     = 28;
    let rafId = null, rodando = false;

    function resize() {
      canvas.width  = carrinhoSection.offsetWidth;
      canvas.height = carrinhoSection.offsetHeight;
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
        opacidade: 0.4 + Math.random() * 0.5
      };
    }

    function animar() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cookies.forEach(function (c, i) {
        c.y       += c.vel;
        c.rotacao += c.velRot;
        c.x       += Math.sin(c.y * c.oscFreq + c.oscOff) * 0.6;

        ctx.save();
        ctx.globalAlpha  = c.opacidade;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotacao);
        ctx.font         = c.tamanho + 'px serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍪', 0, 0);
        ctx.restore();

        if (c.y > canvas.height + 60) cookies[i] = criarCookie(false);
      });
      rafId = requestAnimationFrame(animar);
    }

    function iniciar() {
      if (rodando) return;
      rodando = true;
      resize();
      if (!cookies.length) for (let i = 0; i < QTD; i++) cookies.push(criarCookie(true));
      animar();
    }
    function parar() { rodando = false; cancelAnimationFrame(rafId); }

    window.addEventListener('resize', function () { if (rodando) resize(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { e.isIntersecting ? iniciar() : parar(); });
      }, { threshold: 0.05 }).observe(carrinhoSection);
    } else {
      iniciar();
    }
  })();

  // PRIMEIRA PINTURA — GARANTE ESTADO CONSISTENTE DO CARRINHO
  atualizarCarrinho();

})();