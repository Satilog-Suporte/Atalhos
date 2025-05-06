const API_URL = "https://script.google.com/macros/s/AKfycbybMEZsRH6-2cFDdbUgs3JnCA2WvCxApBaSDFlFxsQnoPYZ1OhXECG1af8e6xelw5pM/exec";

async function carregarAtalhos() {
  const res = await fetch(API_URL);
  const dados = await res.json();

  const listaBrudam = document.getElementById("lista-brudam");
  const listaSSW = document.getElementById("lista-ssw");

  listaBrudam.innerHTML = "";
  listaSSW.innerHTML = "";

  dados.forEach(({ sistema, codigo, descricao }) => {
    const el = document.createElement("div");
    el.className = "atalho";
    
    // Cria o texto do atalho
    const textoAtalho = document.createElement("span");
    textoAtalho.className = "texto-atalho";
    textoAtalho.textContent = `${codigo} - ${descricao}`;
    
    // Cria o botão de cópia
    const botaoCopia = document.createElement("button");
    botaoCopia.className = "botao-copiar";
    botaoCopia.innerHTML = "📋"; // Ou use um ícone ou texto "Copiar"
    botaoCopia.title = "Copiar código";
    botaoCopia.addEventListener("click", () => {
      navigator.clipboard.writeText(codigo).then(() => {
        // Feedback visual temporário
        botaoCopia.textContent = "✔";
        setTimeout(() => {
          botaoCopia.innerHTML = "📋";
        }, 2000);
      });
    });
    
    // Adiciona ambos ao elemento do atalho
    el.appendChild(textoAtalho);
    el.appendChild(botaoCopia);
    
    if (sistema.toLowerCase() === "brudam") {
      listaBrudam.appendChild(el);
    } else if (sistema.toLowerCase() === "ssw") {
      listaSSW.appendChild(el);
    }
  });
}

document.getElementById("form-atalho").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const sistema = form.sistema.value.trim().toLowerCase();
  const codigo = form.codigo.value.trim();
  const descricao = form.descricao.value.trim();

  if (!sistema || !codigo || !descricao) return;

  const body = { sistema, codigo, descricao };

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  form.reset();
  carregarAtalhos();
});

carregarAtalhos();
