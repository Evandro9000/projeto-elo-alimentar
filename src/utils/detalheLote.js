document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idLote = params.get("id");

  const CHAVE_DOACOES = "eloAlimentar_doacoes";
  const CHAVE_CARRINHO = "meulote";

  function normalizarDoacao(item) {
    const endereco = item.endereco || {};
    const partesEndereco = [
      endereco.rua ? `${endereco.rua}${endereco.numero ? `, ${endereco.numero}` : ""}` : "",
      endereco.complemento || "",
      endereco.bairro || "",
      endereco.cidade && endereco.estado
        ? `${endereco.cidade} - ${endereco.estado}`
        : endereco.cidade || endereco.estado || "",
      endereco.cep ? `CEP: ${endereco.cep}` : "",
    ].filter(Boolean);

    const enderecoResumo =
      item.local ||
      [endereco.bairro, endereco.cidade, endereco.estado].filter(Boolean).join(" - ") ||
      "Local não informado";

    const codigoGerado =
      item.codigo || `LOT-${String(item.id || "").slice(0, 6).toUpperCase()}`;

    return {
      id: String(item.id),
      produto: item.produto || "Produto não informado",
      categoria: item.categoria || "",
      quantidade: item.quantidade || "Não informada",
      local: item.local || "Não informado",
      endereco:
        partesEndereco.length > 0
          ? partesEndereco.join(" | ")
          : "Endereço não informado",
      validade: item.validadeFormatada || item.validade || null,
      entrega: item.entrega || "Retirada",
      descricao: item.descricao || "",
      imagem: item.imagem || "",
      codigo: codigoGerado,
    };
  }

  function buscarDoacaoPorId(id) {
    if (!id) return null;

    try {
      const salvas = JSON.parse(localStorage.getItem(CHAVE_DOACOES) || "[]");
      if (!Array.isArray(salvas)) return null;

      const encontrada = salvas.find((doacao) => doacao && String(doacao.id) === String(id));
      return encontrada ? normalizarDoacao(encontrada) : null;
    } catch (erro) {
      console.error("Erro ao carregar lote do localStorage:", erro);
      return null;
    }
  }

  function escapeHTML(texto = "") {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const loteSelecionado = buscarDoacaoPorId(idLote);

  if (!loteSelecionado) {
    document.body.innerHTML = "<p>Lote não encontrado.</p>";
    return;
  }

  // Adiciona a imagem (se houver)
  const addImg = document.querySelector(".foto img");
  if (addImg) {
    if (loteSelecionado.imagem) {
      addImg.src = loteSelecionado.imagem;
      addImg.alt = loteSelecionado.produto;
      addImg.style.display = "";
    } else {
      addImg.removeAttribute("src");
      addImg.style.display = "none";
    }
  }

  // Adiciona o local
  const addLocal = document.querySelector(".local-lote");
  if (addLocal) {
    addLocal.innerHTML = `<b>Local</b>: ${escapeHTML(loteSelecionado.local)}`;
  }

  // Adiciona todas as informações no card
  const addInfo = document.querySelector(".informacoes");
  if (addInfo) {
    const linhaCategoria = loteSelecionado.categoria
      ? `Categoria: ${escapeHTML(loteSelecionado.categoria)}<br>`
      : "";
    const linhaValidade = loteSelecionado.validade
      ? `Data de validade: ${escapeHTML(loteSelecionado.validade)}<br>`
      : "";
    const linhaDescricao = loteSelecionado.descricao
      ? `Descrição: ${escapeHTML(loteSelecionado.descricao)}<br>`
      : "";

    addInfo.innerHTML = `
      <strong>Endereço: ${escapeHTML(loteSelecionado.endereco)}</strong>
      Produto: ${escapeHTML(loteSelecionado.produto)}<br>
      ${linhaCategoria}
      Quantidade: ${escapeHTML(loteSelecionado.quantidade)}<br>
      ${linhaValidade}
      ${linhaDescricao}
      Tipo de entrega: ${escapeHTML(loteSelecionado.envio)}<br>
      Código do lote: ${escapeHTML(loteSelecionado.codigo)}
    `;
  }

  // Botão adicionar lote, oculta se já estiver no carrinho
  const btnAdd = document.querySelector(".add");
  const boxBotao = document.querySelector(".card-botao");

  function itemNoCarrinho() {
    const meulote = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
    return meulote.some((item) => String(item.id) === String(idLote));
  }

  function atualizarBotaoVisivel() {
    const noCarrinho = itemNoCarrinho();
    if (btnAdd) {
      btnAdd.style.display = noCarrinho ? "none" : "";
    }
    if (boxBotao) {
      boxBotao.style.display = noCarrinho ? "none" : "";
    }
  }

  atualizarBotaoVisivel();

  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      let meulote = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
      if (meulote.some((item) => String(item.id) === String(idLote))) {
        atualizarBotaoVisivel();
        return;
      }

      meulote.push({
        id: String(loteSelecionado.id),
        produto: loteSelecionado.produto,
        quantidade: 1,
        quantidadeLote: loteSelecionado.quantidade,
        imagem: loteSelecionado.imagem,
        local: loteSelecionado.local,
      });
      localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(meulote));
      atualizarBotaoVisivel();
      alert("Lote adicionado ao carrinho!");
    });
  }

  // Caso o usuário remova o lote em outra aba e volte para esta
  window.addEventListener("storage", (event) => {
    if (event.key === CHAVE_CARRINHO || event.key === CHAVE_DOACOES) {
      atualizarBotaoVisivel();
    }
  });

  // Botão de Logout
  const btnLogout = document.querySelector(".logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }
});