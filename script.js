// Configurações globais
const API_URL = "https://script.google.com/macros/s/AKfycbybMEZsRH6-2cFDdbUgs3JnCA2WvCxApBaSDFlFxsQnoPYZ1OhXECG1af8e6xelw5pM/exec";
let estaCarregando = false;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  inicializarAplicacao();
});

async function inicializarAplicacao() {
  try {
    await carregarEExibirAtalhos();
    configurarFormulario();
    configurarBotoesCopiar();
  } catch (error) {
    console.error("Falha na inicialização:", error);
    mostrarFeedback('error', 'Erro ao iniciar a aplicação');
  }
}

// Sistema de carregamento de dados
async function carregarEExibirAtalhos() {
  if (estaCarregando) return;
  estaCarregando = true;
  
  const loader = mostrarLoader();
  
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const dados = await response.json();
    renderizarAtalhosNaTela(dados);
    
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    mostrarFeedback('error', 'Falha ao carregar os atalhos');
  } finally {
    loader.remove();
    estaCarregando = false;
  }
}

// Renderização dos atalhos
function renderizarAtalhosNaTela(dados) {
  const containers = {
    brudam: document.getElementById("lista-brudam"),
    ssw: document.getElementById("lista-ssw")
  };

  // Limpar conteúdo anterior
  Object.values(containers).forEach(container => container.innerHTML = '');

  // Adicionar novos itens
  dados.forEach(atalho => {
    const sistema = atalho.sistema.toLowerCase();
    if (containers[sistema]) {
      containers[sistema].appendChild(criarElementoAtalho(atalho));
    }
  });
}

function criarElementoAtalho(atalho) {
  const elemento = document.createElement('div');
  elemento.className = 'atalho';
  elemento.innerHTML = `
    <span class="texto-atalho">${atalho.codigo} - ${atalho.descricao}</span>
    <button class="botao-copiar" data-codigo="${atalho.codigo}" aria-label="Copiar código">
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"/>
      </svg>
    </button>
  `;
  return elemento;
}

// Sistema de formulário
function configurarFormulario() {
  const formulario = document.getElementById("form-atalho");
  const botaoEnviar = formulario.querySelector('button[type="submit"]');

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (botaoEnviar.disabled) return;

    const dadosFormulario = {
      sistema: formulario.sistema.value.trim(),
      codigo: formulario.codigo.value.trim(),
      descricao: formulario.descricao.value.trim()
    };

    if (!validarDadosFormulario(dadosFormulario)) return;

    botaoEnviar.disabled = true;
    botaoEnviar.innerHTML = '<div class="spinner"></div> Enviando...';

    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosFormulario)
      });

      const resultado = await processarResposta(resposta);
      
      if (resultado.status === 'success') {
        formulario.reset();
        await carregarEExibirAtalhos();
        mostrarFeedback('success', 'Atalho adicionado com sucesso!');
      } else {
        throw new Error(resultado.message);
      }
      
    } catch (error) {
      console.error("Erro no envio:", error);
      mostrarFeedback('error', error.message || "Erro ao adicionar atalho");
    } finally {
      botaoEnviar.disabled = false;
      botaoEnviar.textContent = "Adicionar";
    }
  });
}

// Validação avançada
function validarDadosFormulario(dados) {
  let valido = true;
  const erros = {
    sistema: !dados.sistema && "Selecione um sistema",
    codigo: !dados.codigo ? "Digite um código" : 
           !/^\d+$/.test(dados.codigo) ? "Código deve conter apenas números" :
           null,
    descricao: !dados.descricao && "Digite uma descrição"
  };

  // Remover erros anteriores
  document.querySelectorAll('.erro-formulario').forEach(el => el.remove());

  // Exibir novos erros
  Object.entries(erros).forEach(([campo, mensagem]) => {
    const input = document.querySelector(`[name="${campo}"]`);
    if (mensagem) {
      valido = false;
      const divErro = document.createElement('div');
      divErro.className = 'erro-formulario';
      divErro.textContent = mensagem;
      input.insertAdjacentElement('afterend', divErro);
    }
  });

  return valido;
}

// Sistema de cópia
function configurarBotoesCopiar() {
  document.addEventListener('click', async (e) => {
    const botao = e.target.closest('.botao-copiar');
    if (!botao) return;

    try {
      await navigator.clipboard.writeText(botao.dataset.codigo);
      mostrarFeedback('success', 'Código copiado!', 1500);
      botao.classList.add('copiado');
      setTimeout(() => botao.classList.remove('copiado'), 2000);
    } catch (error) {
      console.error("Falha ao copiar:", error);
      mostrarFeedback('error', 'Falha ao copiar código');
    }
  });
}

// Sistema de feedback
function mostrarFeedback(tipo, mensagem, duracao = 3000) {
  const feedback = document.createElement('div');
  feedback.className = `feedback ${tipo}`;
  feedback.textContent = mensagem;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => feedback.remove(), 500);
  }, duracao);
}

// Utilitários
function mostrarLoader() {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = `
    <div class="spinner"></div>
    <p>Carregando...</p>
  `;
  document.body.appendChild(loader);
  return loader;
}

async function processarResposta(resposta) {
  if (!resposta.ok) {
    const textoErro = await resposta.text();
    throw new Error(textoErro || "Erro na comunicação com o servidor");
  }
  return resposta.json();
}

// Ferramentas de desenvolvimento (acessíveis via console)
window.ferramentasDev = {
  testarConexao: async () => {
    try {
      const resposta = await fetch(API_URL);
      console.log("Status:", resposta.status, "Dados:", await resposta.json());
    } catch (error) {
      console.error("Erro no teste de conexão:", error);
    }
  },
  
  simularEnvio: async (dadosTeste = {}) => {
    const dadosPadrao = {
      sistema: 'brudam',
      codigo: Math.floor(Math.random() * 1000),
      descricao: 'Teste de envio'
    };
    
    try {
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dadosPadrao, ...dadosTeste })
      });
      console.log("Resposta do servidor:", await resposta.json());
    } catch (error) {
      console.error("Erro no envio simulado:", error);
    }
  }
};
