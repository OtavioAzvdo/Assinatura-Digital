const API_URL = "https://script.google.com/macros/s/AKfycbzL2IBZXPKcfEwpiLgJzgkZjLlpuZQyB2moT70jpGoy6P2en84XQ-34wY7drLVa78-Q/exec";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let desenhando = false;
const salvarBtn = document.getElementById("salvar");
const limparBtn = document.getElementById("limpar");
const msg = document.getElementById("mensagem");

// === DESENHO DA ASSINATURA ===
canvas.addEventListener("mousedown", e => { desenhando = true; desenhar(e); });
canvas.addEventListener("mouseup", () => { desenhando = false; ctx.beginPath(); });
canvas.addEventListener("mousemove", desenhar);

canvas.addEventListener("touchstart", e => { desenhando = true; e.preventDefault(); });
canvas.addEventListener("touchend", () => { desenhando = false; ctx.beginPath(); });
canvas.addEventListener("touchmove", e => { desenhar(e.touches[0]); e.preventDefault(); });

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

// === LIMPAR ===
limparBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  msg.textContent = "🧹 Assinatura limpa!";
  msg.style.color = "gray";
});

// === SALVAR ===
salvarBtn.addEventListener("click", async () => {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!nome) {
    msg.textContent = "⚠️ Digite seu nome antes de salvar!";
    msg.style.color = "orange";
    return;
  }

  msg.textContent = "Enviando assinatura...";
  msg.style.color = "#007bff";

  const assinatura = canvas.toDataURL("image/png");
  const dados = { nome, email, assinatura };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!res.ok) throw new Error("Erro ao conectar ao servidor");
    const json = await res.json();

    if (json.status === "ok") {
      msg.textContent = "✅ Assinatura salva com sucesso!";
      msg.style.color = "green";
      document.getElementById("irProva").style.display = "block";
    } else {
      msg.textContent = "❌ Erro: " + (json.mensagem || "Falha ao salvar");
      msg.style.color = "red";
    }
  } catch (err) {
    msg.textContent = "❌ Falha ao salvar: " + err.message;
    msg.style.color = "red";
  }
});
