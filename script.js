const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing = false;
let points = [];

function initCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

initCanvas();
window.addEventListener("resize", initCanvas);

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  if (e.touches && e.touches.length) {
    return {
      x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width) / ratio,
      y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height) / ratio
    };
  } else {
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width) / ratio,
      y: (e.clientY - rect.top) * (canvas.height / rect.height) / ratio
    };
  }
}

function drawSmoothLine() {
  if (points.length < 3) {
    const p = points[0];
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI*2, true);
    ctx.fill();
    ctx.closePath();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length-2; i++) {
    const xc = (points[i].x + points[i+1].x)/2;
    const yc = (points[i].y + points[i+1].y)/2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.quadraticCurveTo(
    points[points.length-2].x,
    points[points.length-2].y,
    points[points.length-1].x,
    points[points.length-1].y
  );
  ctx.stroke();
}

function startDraw(e) { drawing = true; points = [getPos(e)]; ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); e.preventDefault(); }
function moveDraw(e) { if (!drawing) return; points.push(getPos(e)); drawSmoothLine(); e.preventDefault(); }
function endDraw(e) { if (!drawing) return; drawSmoothLine(); drawing = false; points = []; e.preventDefault(); }

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", moveDraw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);
canvas.addEventListener("touchstart", startDraw, {passive:false});
canvas.addEventListener("touchmove", moveDraw, {passive:false});
canvas.addEventListener("touchend", endDraw);

const salvarBtn = document.getElementById("salvarBtn");
const limparBtn = document.getElementById("limpar");
const mensagem = document.getElementById("mensagem");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");

limparBtn.addEventListener("click", () => {
  initCanvas();
  nomeInput.value = "";
  emailInput.value = "";
  mensagem.innerText = "Campos limpos";
  mensagem.style.color = "#6c757d";
});

salvarBtn.addEventListener("click", async () => {
  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();

  if (!nome || !email) {
    mensagem.innerText = "⚠️ Preencha nome e e-mail.";
    mensagem.style.color = "orange";
    return;
  }

  const dataURL = canvas.toDataURL("image/png");
  mensagem.innerText = "Enviando... ⏳";
  mensagem.style.color = "#007bff";
  salvarBtn.disabled = true;

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxDZU9vJxxvdaFtIuMFVBZXk9TEab9-dJogDhkyWrgCT00Y2Umb_n8Pv6DoJuEeV0D8/exec", {
      method: "POST",
      body: JSON.stringify({ nome, email, assinatura: dataURL }),
      headers: { "Content-Type": "application/json" }
    });
    const res = await response.json();

    if (res.status === "ok") {
      mensagem.innerHTML = '✅ Salvo com sucesso!<br><a class="forms" href="https://forms.gle/BB2kqyct9orq7AQX6" target="_blank"><strong>📖 Ir para a prova!</strong></a>';
      mensagem.style.color = "green";
    } else {
      throw new Error(res.message || "Erro desconhecido");
    }
  } catch (err) {
    mensagem.innerText = "❌ Erro ao salvar: " + err.message;
    mensagem.style.color = "red";
    console.error(err);
  } finally {
    salvarBtn.disabled = false;
  }
});
