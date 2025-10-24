// ✅ URL do seu App Script (API)
const API_URL = "https://script.google.com/macros/s/AKfycbzL2IBZXPKcfEwpiLgJzgkZjLlpuZQyB2moT70jpGoy6P2en84XQ-34wY7drLVa78-Q/exec";

const form = document.getElementById("form-assinatura");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let desenhando = false;

// === DESENHO DA ASSINATURA ===
canvas.addEventListener("mousedown", () => desenhando = true);
canvas.addEventListener("mouseup", () => {
  desenhando = false;
  ctx.beginPath();
});
canvas.addEventListener("mousemove", desenhar);

canvas.addEventListener("touchstart", e => { 
  desenhando = true; 
  e.preventDefault(); 
});
canvas.addEventListener("touchend", () => {
  desenhando = false;
  ctx.beginPath();
});
canvas.addEventListener("touchmove", e => {
  desenhar(e.touches[0]);
  e.preventDefault();
});

function desenhar(e) {
  if (!desenhando) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// === LIMPAR ASSINATURA ===
document.getElementById("limpar").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
});

// === ENVIAR ASSINATURA ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const assinatura = canvas.toDataURL("image/png");

  if (!nome) {
    alert("Por favor, preencha o nome completo!");
    return;
  }

  const dados = { nome, email, assinatura };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!res.ok) throw new Error("Erro ao conectar com o servidor.");

    const json = await res.json();
    if (json.status === "ok") {
      alert("✅ Assinatura salva com sucesso!");
      document.getElementById("irProva").style.display = "block";
    } else {
      alert("❌ Erro ao salvar: " + json.mensagem);
    }
  } catch (err) {
    alert("❌ Falha ao salvar: " + err.message);
  }
});
