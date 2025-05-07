const API_URL = "https://script.google.com/macros/s/AKfycbybMEZsRH6-2cFDdbUgs3JnCA2WvCxApBaSDFlFxsQnoPYZ1OhXECG1af8e6xelw5pM/exec";
let isOnline = true;

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const button = form.querySelector("button");
  
  try {
    // Obter e validar dados
    const formData = {
      sistema: form.sistema.value.trim().toLowerCase(),
      codigo: form.codigo.value.trim(),
      descricao: form.descricao.value.trim()
    };

    if (!formData.sistema || !formData.codigo || !formData.descricao) {
      showFeedback(button, "Preencha todos campos!", "error");
      return;
    }

    // Enviar dados
    showFeedback(button, "Enviando...", "loading");
    
    if (isOnline) {
      await sendToAPI(formData);
    } else {
      await saveLocal(formData);
    }

    // Sucesso
    form.reset();
    await carregarAtalhos();
    showFeedback(button, "Adicionado!", "success");
    
  } catch (error) {
    console.error("Erro:", error);
    showFeedback(button, "Erro ao enviar", "error");
    isOnline = false; // Tenta modo offline
  }
}

// Funções auxiliares
async function sendToAPI(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) throw new Error("API failed");
}

function showFeedback(button, text, type) {
  button.textContent = text;
  button.className = type; // Adicione estilos CSS para .loading, .success, .error
  setTimeout(() => {
    button.textContent = "Adicionar";
    button.className = "";
  }, 2000);
}

// Inicialização
document.getElementById("form-atalho").addEventListener("submit", handleSubmit);
carregarAtalhos();
