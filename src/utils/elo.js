/* =========================================================
   ELO ALIMENTAR
   Armazenamento e funções compartilhadas das doações
   ========================================================= */

const Elo = (() => {

  const CHAVE = "elo_doacoes";

  /* ---------------- STATUS ---------------- */

  const STATUS = {
    disponivel: {
      texto: "Disponível",
      classe: "status--disponivel"
    },

    coleta: {
      texto: "Em coleta",
      classe: "status--coleta"
    },

    pendente: {
      texto: "Pendente",
      classe: "status--pendente"
    }
  };


  /* ---------------- LER DOAÇÕES ---------------- */

  function ler() {
    try {
      const dados = JSON.parse(
        localStorage.getItem(CHAVE) || "[]"
      );

      return Array.isArray(dados) ? dados : [];

    } catch (erro) {

      console.error("Erro ao ler as doações:", erro);

      return [];
    }
  }


  /* ---------------- NORMALIZAR ---------------- */

  function normalizar(doacao) {

    const imagens = Array.isArray(doacao.imagens)
      ? doacao.imagens
      : (doacao.imagem ? [doacao.imagem] : []);

    return {
      ...doacao,

      imagens: imagens,

      // Mantém compatibilidade com códigos antigos
      imagem: imagens[0] || "",

      // Toda nova doação começa disponível
      status: doacao.status || "disponivel",

      // ONG ainda não definida
      ong: doacao.ong || null
    };
  }


  /* ---------------- LISTAR ---------------- */

  function listar() {

    const lista = ler().map(normalizar);

    return Promise.resolve(lista);
  }


  /* ---------------- SALVAR ---------------- */

  function salvar(doacao) {

    const lista = ler().map(normalizar);

    const novaDoacao = normalizar(doacao);

    const indice = lista.findIndex(
      item => item.id === novaDoacao.id
    );

    if (indice >= 0) {

      // Atualiza uma doação existente
      lista[indice] = novaDoacao;

    } else {

      // Cria uma nova doação
      lista.push(novaDoacao);
    }

    localStorage.setItem(
      CHAVE,
      JSON.stringify(lista)
    );

    // Atualiza a página caso outro código esteja observando
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CHAVE,
        newValue: JSON.stringify(lista)
      })
    );

    return Promise.resolve(novaDoacao);
  }


  /* ---------------- REMOVER ---------------- */

  function remover(id) {

    const lista = ler().filter(
      doacao => doacao.id !== id
    );

    localStorage.setItem(
      CHAVE,
      JSON.stringify(lista)
    );

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CHAVE,
        newValue: JSON.stringify(lista)
      })
    );

    return Promise.resolve();
  }


  /* ---------------- OBSERVAR ALTERAÇÕES ---------------- */

  function aoMudar(callback) {

    window.addEventListener("storage", evento => {

      if (evento.key === CHAVE) {
        callback();
      }

    });
  }


  /* ---------------- ESCAPAR HTML ---------------- */

  function escapeHtml(valor = "") {

    return String(valor).replace(
      /[&<>"']/g,
      caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[caractere])
    );
  }


  /* ---------------- FORMATAR DATA ---------------- */

  function formatarValidade(valor = "") {

    const partes = String(valor).match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!partes) {
      return valor;
    }

    return `${partes[3]}/${partes[2]}/${partes[1]}`;
  }


  /* ---------------- CONVERTER QUANTIDADE PARA KG ---------------- */

  function quantidadeEmKg(valor = "") {

    const texto = String(valor)
      .toLowerCase()
      .replace(",", ".");

    const numero = parseFloat(texto);

    if (!Number.isFinite(numero)) {
      return 0;
    }

    // Toneladas
    if (
      /\b(t|ton|tonelada|toneladas)\b/.test(texto)
    ) {
      return numero * 1000;
    }

    // Gramas
    if (
      /\b(g|gr|grama|gramas)\b/.test(texto)
    ) {
      return numero / 1000;
    }

    // Mililitros
    if (
      /\b(ml)\b/.test(texto)
    ) {
      return numero / 1000000;
    }

    // Litros
    if (
      /\b(l|lt|litro|litros)\b/.test(texto)
    ) {
      return numero;
    }

    // Se não houver unidade,
    // considera o número como kg
    return numero;
  }


  /* =========================================================
     FUNÇÕES DISPONÍVEIS PARA OS OUTROS ARQUIVOS
     ========================================================= */

  return {

    CHAVE,

    STATUS,

    listar,

    salvar,

    remover,

    aoMudar,

    escapeHtml,

    formatarValidade,

    quantidadeEmKg

  };

})();