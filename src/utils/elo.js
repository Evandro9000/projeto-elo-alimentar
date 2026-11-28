/* =========================================================
   ELO ALIMENTAR
   Armazenamento e funções compartilhadas das doações
   Padrão unificado com criar-doacao.js ("eloAlimentar_doacoes")
   ========================================================= */

const Elo = (() => {
  const CHAVE = "eloAlimentar_doacoes";

  /* ---------------- STATUS ---------------- */
  const STATUS = {
    disponivel: {
      texto: "Disponível",
      classe: "status--disponivel",
    },
    coleta: {
      texto: "Em coleta",
      classe: "status--em-coleta",
    },
    pendente: {
      texto: "Pendente",
      classe: "status--pendente",
    },
  };

  /* ---------------- LER DOAÇÕES ---------------- */
  function ler() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
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
      : doacao.imagem
      ? [doacao.imagem]
      : [];

    return {
      ...doacao,
      id: String(doacao.id),
      imagens,
      imagem: imagens[0] || doacao.imagem || "",
      status: doacao.status || "disponivel",
      ong: doacao.ong || null,
    };
  }

  /* ---------------- LISTAR ---------------- */
  function listar() {
    const lista = ler()
      .map(normalizar)
      .sort((a, b) => String(b.criadoEm || "").localeCompare(String(a.criadoEm || "")));

    return Promise.resolve(lista);
  }

  /* ---------------- SALVAR ---------------- */
  function salvar(doacao) {
    const lista = ler().map(normalizar);
    const novaDoacao = normalizar(doacao);
    const indice = lista.findIndex((item) => String(item.id) === String(novaDoacao.id));

    if (indice >= 0) {
      lista[indice] = novaDoacao;
    } else {
      lista.push(novaDoacao);
    }

    localStorage.setItem(CHAVE, JSON.stringify(lista));

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CHAVE,
        newValue: JSON.stringify(lista),
      })
    );

    return Promise.resolve(novaDoacao);
  }

  /* ---------------- REMOVER ---------------- */
  function remover(id) {
    const lista = ler().filter((doacao) => String(doacao.id) !== String(id));

    localStorage.setItem(CHAVE, JSON.stringify(lista));

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CHAVE,
        newValue: JSON.stringify(lista),
      })
    );

    return Promise.resolve();
  }

  /* ---------------- OBSERVAR ALTERAÇÕES ---------------- */
  function aoMudar(callback) {
    window.addEventListener("storage", (evento) => {
      if (evento.key === CHAVE) {
        callback();
      }
    });
  }

  /* ---------------- ESCAPAR HTML ---------------- */
  function escapeHtml(valor = "") {
    return String(valor).replace(
      /[&<>"']/g,
      (caractere) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[caractere])
    );
  }

  /* ---------------- FORMATAR DATA ---------------- */
  function formatarValidade(valor = "") {
    const partes = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!partes) return valor;
    return `${partes[3]}/${partes[2]}/${partes[1]}`;
  }

  /* ---------------- CONVERTER QUANTIDADE PARA KG ---------------- */
  function quantidadeEmKg(valor = "") {
    const texto = String(valor).toLowerCase().replace(",", ".");
    const m = texto.match(/(\d+(?:\.\d+)?)\s*(t|ton|toneladas?|kg|quilos?|g|gr|gramas?|ml|l|lt|litros?)\b/);

    if (!m) {
      const numeroSolto = parseFloat(texto);
      return Number.isFinite(numeroSolto) ? numeroSolto : 0;
    }

    const numero = parseFloat(m[1]);
    const unidade = m[2];

    if (/^(t|ton|toneladas?)$/.test(unidade)) return numero * 1000;
    if (/^(g|gr|gramas?)$/.test(unidade)) return numero / 1000;
    if (unidade === "ml") return numero / 1000000;
    return numero; // kg, quilos, l, lt, litros
  }

  return {
    CHAVE,
    STATUS,
    listar,
    salvar,
    remover,
    aoMudar,
    escapeHtml,
    formatarValidade,
    quantidadeEmKg,
  };
})();