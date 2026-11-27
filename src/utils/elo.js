/* Elo Alimentar - armazenamento e utilidades compartilhadas
   Carregue ESTE arquivo antes de criar-doacao.js, gerenciar-doacao.js e dashboard.js */

const Elo = (() => {
  const CHAVE = "elo_doacoes";

  const STATUS = {
    disponivel: { texto: "Disponível", classe: "status--disponivel" },
    coleta: { texto: "Em coleta", classe: "status--em-coleta" },
    pendente: { texto: "Pendente", classe: "status--pendente" },
  };

  function ler() {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE));
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  }

  function gravar(lista) {
    // Se estourar o limite do navegador, lança erro e o criar-doacao.js mostra o alerta
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  }

  async function listar() {
    return ler(); // mais nova primeiro
  }

  async function salvar(doacao) {
    const lista = ler();
    const i = lista.findIndex((d) => d.id === doacao.id);

    if (i >= 0) {
      lista[i] = doacao;
    } else {
      lista.unshift(doacao);
    }

    gravar(lista);
    return doacao;
  }

  async function remover(id) {
    gravar(ler().filter((d) => d.id !== id));
  }

  function criarId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Aceita DD/MM/AAAA ou AAAA-MM-DD. Devolve Date ou null.
  function parseData(valor) {
    const s = String(valor || "").trim();
    let dia, mes, ano;
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (m) {
      [, ano, mes, dia] = m;
    } else {
      m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) return null;
      [, dia, mes, ano] = m;
    }

    const d = new Date(Number(ano), Number(mes) - 1, Number(dia));

    const valida =
      d.getFullYear() === Number(ano) &&
      d.getMonth() === Number(mes) - 1 &&
      d.getDate() === Number(dia);

    return valida ? d : null;
  }

  function formatarValidade(valor) {
    const d = parseData(valor);
    if (!d) return valor || "";

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  // Converte "10kg", "500g", "15L" em kg. Unidades (un, unid) não contam.
  function quantidadeEmKg(texto) {
    const m = String(texto || "")
      .toLowerCase()
      .replace(",", ".")
      .match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)?/);

    if (!m) return 0;

    const n = parseFloat(m[1]);

    switch (m[2]) {
      case "kg": return n;
      case "g": return n / 1000;
      case "l": return n;        // 1 L ≈ 1 kg
      case "ml": return n / 1000;
      default: return 0;
    }
  }

  function mostrarErro(el, mensagem) {
    if (!el) return;

    const proximo = el.nextElementSibling;
    if (proximo && proximo.classList.contains("erro-campo")) proximo.remove();

    el.classList.remove("invalido");
    el.removeAttribute("aria-invalid");

    if (!mensagem) return;

    el.classList.add("invalido");
    el.setAttribute("aria-invalid", "true");

    const aviso = document.createElement("span");
    aviso.className = "erro-campo";
    aviso.setAttribute("role", "alert");
    aviso.style.cssText = "display:block;color:#c0392b;font-size:0.8rem;margin-top:4px;";
    aviso.textContent = mensagem;
    el.insertAdjacentElement("afterend", aviso);
  }

  // Reduz a imagem para caber no localStorage (máx. 800px, JPEG 70%)
  function comprimirImagem(arquivo, maxLado = 800, qualidade = 0.7) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();

      leitor.onerror = () => reject(new Error("leitura"));
      leitor.onload = () => {
        const img = new Image();

        img.onerror = () => reject(new Error("imagem"));
        img.onload = () => {
          const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);

          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL("image/jpeg", qualidade));
        };

        img.src = leitor.result;
      };

      leitor.readAsDataURL(arquivo);
    });
  }

  // Avisa quando outra aba altera as doações
  function aoMudar(callback) {
    window.addEventListener("storage", (e) => {
      if (e.key === CHAVE || e.key === null) callback();
    });
  }

  return {
    STATUS,
    PAGINA_GERENCIAR: "gerenciar-doacoes.html",
    listar,
    salvar,
    remover,
    criarId,
    escapeHtml,
    parseData,
    formatarValidade,
    quantidadeEmKg,
    mostrarErro,
    comprimirImagem,
    aoMudar,
  };
})();