
// ─────────────────────────────────────────────────────────────
// [ 1 ] VÍDEO — FADE CONFORME O SCROLL
// QUANTO MAIS O USUÁRIO DESCE, MAIS O VÍDEO SOME.
// A 600PX DE SCROLL O VÍDEO CHEGA A OPACITY 0 (INVISÍVEL).
// ─────────────────────────────────────────────────────────────
window.addEventListener("scroll", function () {
let scroll = window.scrollY;
let video  = document.getElementById("bgVideo");
  video.style.opacity = 1 - scroll / 600;
});


// ─────────────────────────────────────────────────────────────
// [ 7.2 ] FLIP CARD — VIRA AO CLICAR / TOCAR
// ADICIONA OU REMOVE A CLASSE "VIRADO", QUE DISPARA
// A ANIMAÇÃO CSS DE ROTAÇÃO 3D E REVELA O VERSO DO CARD.
// ─────────────────────────────────────────────────────────────
document.getElementById('cardFlip').addEventListener('click', function () {
this.classList.toggle('virado');
});