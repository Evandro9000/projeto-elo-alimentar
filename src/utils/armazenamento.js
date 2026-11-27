/* Elo Alimentar – armazenamento.js
 * Carregue este arquivo ANTES dos outros em todas as páginas.
 * Guarda as doações no IndexedDB (cabe muito mais que o localStorage,
 * então dá para anexar quantas imagens quiser) e reúne as funções
 * que as 3 telas usam.
 */
const Elo = (() => {
  const NOME_BD = "elo_alimentar";
  const LOJA = "doacoes";
  const CHAVE_ANTIGA = "elo_doacoes"; // versão anterior (localStorage)

  // Ajuste para o nome real da sua página do mural
  const PAGINA_GERENCIAR = "gerenciar-doacoes.html";

  const STATUS = {
    disponivel: { texto: "Disponível", classe: "status--disponivel" },
    pendente: { texto: "Pendente", classe: "status--pendente" },
    coleta: { texto: "Em coleta", classe: "status--em-coleta" },
  };

  /* ---------- IndexedDB ---------- */
  let bdPromessa = null;
  let migrado = false;

  function abrirBD() {
    if (bdPromessa) return bdPromessa;
    bdPromessa = new Promise((resolve, reject) => {
      const req = indexedDB.open(NOME_BD, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(LOJA, { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return bdPromessa;
  }

  async function transacao(modo, fn) {
    const bd = await abrirBD();
    return new Promise((resolve, reject) => {
      const tx = bd.transaction(LOJA, modo);
      const req = fn(tx.objectStore(LOJA));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  // Avisa as outras abas/páginas quando algo muda
  const canal = "BroadcastChannel" in window ? new BroadcastChannel("elo_doacoes") : null;
  const avisar = () => canal && canal.postMessage("mudou");
  const aoMudar = (callback) => {
    if (canal) canal.onmessage = callback;
  };

  // Traz doações salvas na versão antiga (localStorage), uma única vez
  async function migrarAntigo() {
    if (migrado) return;
    migrado = true;
    try {
      const bruto = localStorage.getItem(CHAVE_ANTIGA);
      if (!bruto) return;
      for (const doacao of JSON.parse(bruto)) {
        await transacao("readwrite", (l) => l.put(doacao));
      }
      localStorage.removeItem(CHAVE_ANTIGA);
    } catch {
      /* ignora dados antigos corrompidos */
    }
  }

  async function listar() {
    await migrarAntigo();
    const todas = await transacao("readonly", (l) => l.getAll());
    return todas.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)); // mais recentes primeiro
  }

  async function salvar(doacao) {
    await transacao("readwrite", (l) => l.put(doacao));
    avisar();
  }

  async function remover(id) {
    await transacao("readwrite", (l) => l.delete(id));
    avisar();
  }

  /* ---------- Utilidades ---------- */
  function criarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function escapeHtml(texto = "") {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }

  // "2026-09-20" ou "20/09/2026" -> Date válido, ou null
  function parseData(valor) {
    let a, mes, d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      [a, mes, d] = valor.split("-").map(Number);
    } else {
      const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) return null;
      [, d, mes, a] = m.map(Number);
    }
    const data = new Date(a, mes - 1, d);
    const ok = data.getFullYear() === a && data.getMonth() === mes - 1 && data.getDate() === d;
    return ok ? data : null;
  }

  // "2026-09-20" ou "20/09/2026" -> "20/09"
  function formatarValidade(valor) {
    if (!valor) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      const [, m, d] = valor.split("-");
      return `${d}/${m}`;
    }
    return valor.slice(0, 5);
  }

  // "10kg", "500 g", "2,5kg" -> kg. Outras unidades (unid, L) não entram na soma.
  function quantidadeEmKg(texto = "") {
    const m = texto.toLowerCase().replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/);
    if (!m) return 0;
    return m[2] === "kg" ? parseFloat(m[1]) : parseFloat(m[1]) / 1000;
  }

  // Reduz a imagem (máx. 1000px) e converte para JPEG, para o banco não crescer demais
  function comprimirImagem(arquivo, maxLado = 1000, qualidade = 0.75) {
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
          ctx.fillStyle = "#fff"; // PNG transparente não vira fundo preto
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", qualidade));
        };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }

  // Mostra (ou remove, se a mensagem for vazia) o erro logo abaixo do campo
  function mostrarErro(campo, mensagem) {
    let aviso = campo.parentElement.querySelector(`.erro-campo[data-para="${campo.id}"]`);
    if (!mensagem) {
      campo.classList.remove("invalido");
      campo.removeAttribute("aria-invalid");
      if (aviso) aviso.remove();
      return;
    }
    campo.classList.add("invalido");
    campo.setAttribute("aria-invalid", "true");
    if (!aviso) {
      aviso = document.createElement("small");
      aviso.className = "erro-campo";
      aviso.dataset.para = campo.id;
      aviso.setAttribute("role", "alert");
      campo.insertAdjacentElement("afterend", aviso);
    }
    aviso.textContent = mensagem;
  }

  return {
    STATUS,
    PAGINA_GERENCIAR,
    listar,
    salvar,
    remover,
    aoMudar,
    criarId,
    escapeHtml,
    parseData,
    formatarValidade,
    quantidadeEmKg,
    comprimirImagem,
    mostrarErro,
  };
})();