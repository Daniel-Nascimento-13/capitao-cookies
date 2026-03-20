
window.addEventListener("scroll", function(){

let scroll = window.scrollY

let video = document.getElementById("bgVideo")

video.style.opacity = 1 - scroll / 600

})

// Flip card no toque mobile
document.getElementById('cardFlip').addEventListener('click', function () {
  this.classList.toggle('virado');

});