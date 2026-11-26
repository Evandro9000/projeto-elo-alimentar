// TOKEN PARA CONFIRMAR LOGIN
document.addEventListener("DOMContentLoaded", () => {
    // INTERATIVIDADE DA PÁGINA

    // botão "Detalhes"
    const btnDetalhes = document.querySelector(".detalhes");
    btnDetalhes.addEventListener("click", (event)=> {
        window.location.href = "detalhes-do-lote.html";
    });


    // logout
    const btnLogout = document.querySelector(".logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }
  const token = localStorage.getItem("token");
  console.log("Token lido do localStorage:", token);

  // 1. Bloqueia o acesso caso o token não exista
  if (!token) {
    alert("Acesso negado. Faça login para continuar.");
    window.location.href = "login.html";
    return;
  }

  try {
    // 2. Descodifica o Payload do JWT
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const usuario = JSON.parse(payloadJson);

    console.log("Usuário autenticado:", usuario.name, "Perfil:", usuario.role);

    const elementoNome = document.getElementById("nome-usuario");
    if (elementoNome) {
      elementoNome.textContent = usuario.name;
    }
  } catch (error) {
    console.error("Token inválido:", error);
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  // Logout
  const btnLogout = document.querySelector(".logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  // VITRINE E CARRINHO
  const CHAVE_DOACOES = "eloAlimentar_doacoes";
  const CHAVE_CARRINHO = "meulote";

  const vitrine = document.getElementById("vitrine");

  function lerDoacoes() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE_DOACOES) || "[]");
      return Array.isArray(dados) ? dados : [];
    } catch (erro) {
      console.error("Erro ao ler doações:", erro);
      return [];
    }
  }

  function escapeHTML(texto = "") {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatarCategoria(slug = "") {
    const mapa = {
      hortifruti: "In natura: Hortifruti",
      laticinios: "Laticínios",
      padaria: "Padaria",
      acougue: "Açougue",
      enlatados: "Enlatados e conservas",
      bebidas: "Bebidas",
      outros: "Outros",
    };
    return mapa[slug] || slug || "Doação";
  }

  function criarCardHTML(item) {
    const classeCategoria = escapeHTML(item.categoria || "outros");
    const tituloCategoria = escapeHTML(formatarCategoria(item.categoria));
    const nomeProduto = escapeHTML(item.produto || "Produto");
    const quantidade = escapeHTML(item.quantidade || "");
    const local = escapeHTML( item.local || "Local não informado");
    const imgSrc = item.imagem ? escapeHTML(item.imagem) : "../images/tomate.png";
    const legendaFoto = item.imagem
      ? "Foto do lote"
      : "Imagem meramente Ilustrativa";
    const idSegura = escapeHTML(item.id);
    const envio = escapeHTML(item.envio || "Não informado");

    return `
      <article class="card ${classeCategoria}" data-id="${idSegura}">
        <div class="cabecalho">
          <h3><i>${tituloCategoria}</i></h3>
          <a class="foto"><img src="${imgSrc}" alt="Foto de ${nomeProduto}" /></a>
          <p>${legendaFoto}</p>
        </div>
        <div class="card-content">
          <p class="info">Informações:</p>
          <p>Produto: ${nomeProduto}</p>
          <p>Quantidade: ${quantidade}</p>
          <p>Local: ${local}</p>
          <p class="info">Tipo de Entrega: ${envio}</p>
        </div>
        <div class="card-botao">
          <button type="button" class="add" data-id="${idSegura}">Adicionar Lote</button>
          <button type="button" class="detalhes" data-id="${idSegura}">Detalhes</button>
        </div>
      </article>
    `;
  }

  function renderizarVitrine() {
    if (!vitrine) {
      console.warn("Elemento #vitrine não encontrado no HTML.");
      return;
    }

    const doacoes = lerDoacoes();

    if (doacoes.length === 0) {
      vitrine.innerHTML = "<p>Nenhuma doação disponível na vitrine no momento.</p>";
      return;
    }

    vitrine.innerHTML = doacoes.map(criarCardHTML).join("");
  }

  function adicionarLoteAoCarrinho(idLote) {
    if (!idLote) return;

    const doacoes = lerDoacoes();
    const meulote = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");

    const existeNoCarrinho = meulote.some((item) => String(item.id) === String(idLote));
    if (existeNoCarrinho) {
      alert("Este lote já está no carrinho.");
      return;
    }

    const doacaoEncontrada = doacoes.find((d) => String(d.id) === String(idLote));
    const lote = doacaoEncontrada
      ? { ...doacaoEncontrada, quantidadeCarrinho: 1 }
      : { id: idLote, quantidade: 1 };

    meulote.push(lote);
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(meulote));
    alert("Lote adicionado ao carrinho!");
  }

  // Cliques nos botões "Adicionar Lote" (.add) e "Detalhes" (.detalhes)
  if (vitrine) {
    vitrine.addEventListener("click", (event) => {
      const botaoAdd = event.target.closest(".add");
      if (botaoAdd) {
        adicionarLoteAoCarrinho(botaoAdd.dataset.id);
        return;
      }

      const botaoDetalhe = event.target.closest(".detalhes");
      if (botaoDetalhe) {
        const idLote = botaoDetalhe.dataset.id;
        if (!idLote) return;
        window.location.href = `detalhes-do-lote.html?id=${encodeURIComponent(idLote)}`;
      }
    });
  }

  renderizarVitrine();
});