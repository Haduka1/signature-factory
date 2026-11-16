(() => {
  "use strict";
  const options = window.signatureFactoryPublicacao || {};
  const repository = options.repositorio || "";
  const validRepo = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?\/[a-z\d_.-]{1,100}$/i.test(repository)
    && ![".", ".."].includes(repository.split("/")[1]);
  if (validRepo) {
    const base = "https://github.com/" + repository;
    for (const link of document.querySelectorAll("[data-support]")) link.href = base + "/issues/new";
  }
  const issuesReady = validRepo && options.issuesAtivos === true;
  for (const block of document.querySelectorAll("[data-support-block]")) block.hidden = !issuesReady;
  for (const note of document.querySelectorAll("[data-support-pending]")) note.hidden = issuesReady;

  const sheet = document.querySelector("#folha");
  if (!sheet) return;
  const signature = document.querySelector("#rubrica");
  const minus = document.querySelector("#reduzir");
  const plus = document.querySelector("#ampliar");
  const status = document.querySelector("#demo-status");
  const clamp = (value, lower, upper) => Math.min(Math.max(value, lower), upper);
  let width = 45, x = 26, y = 59;
  let pointer = null;
  function redraw() {
    signature.style.setProperty("--sig-width", width + "%");
    x = clamp(x, 2, 98 - width);
    y = clamp(y, 3, 97 - 100 * signature.offsetHeight / sheet.clientHeight);
    signature.style.setProperty("--sig-left", x + "%");
    signature.style.setProperty("--sig-top", y + "%");
    minus.disabled = width <= 30;
    plus.disabled = width >= 65;
  }
  function announce() {
    status.textContent = "Largura de " + width + "% da página. Posição horizontal " + Math.round(x)
      + "%, vertical " + Math.round(y) + "%.";
  }
  function size(delta) {
    width = clamp(width + delta, 30, 65);
    redraw();
    announce();
  }
  minus.addEventListener("click", () => size(-5));
  plus.addEventListener("click", () => size(5));
  signature.addEventListener("keydown", (event) => {
    const directions = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]};
    const delta = directions[event.key];
    if (!delta) return;
    event.preventDefault();
    const step = event.shiftKey ? .5 : 2.5;
    x += step * delta[0];
    y += step * delta[1];
    redraw();
    announce();
  });
  signature.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || pointer) return;
    pointer = {id:event.pointerId, px:event.clientX, py:event.clientY, x, y};
    signature.setPointerCapture(event.pointerId);
  });
  signature.addEventListener("pointermove", (event) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    x = pointer.x + 100 * (event.clientX - pointer.px) / sheet.clientWidth;
    y = pointer.y + 100 * (event.clientY - pointer.py) / sheet.clientHeight;
    redraw();
  });
  signature.addEventListener("lostpointercapture", () => {pointer = null; announce();});
  window.addEventListener("resize", redraw);
  redraw();
})();
