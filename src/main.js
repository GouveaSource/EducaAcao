import "./style.css";

const app = document.querySelector("#app");

app.innerHTML = `
  <h1>EducaAcao</h1>
  <p>Status da API: <strong id="status">verificando...</strong></p>
`;

async function verificarApi() {
  const status = document.querySelector("#status");

  try {
    const resposta = await fetch("/api/health");
    const dados = await resposta.json();
    const dataHora = new Date(dados.hora).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    status.textContent = `${dados.status} (${dataHora})`;
  } catch {
    status.textContent = "API fora do ar";
  }
}

verificarApi();
