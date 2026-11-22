 const sidebar = document.querySelector('.sidebar');
        const toggle = sidebar.querySelector('.sidebar__toggle');
        const desktop = window.matchMedia('(min-width: 960px)');

        function definirMenu(aberto) {
            sidebar.classList.toggle('is-open', aberto);
            toggle.setAttribute('aria-expanded', aberto);
            toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        }

        definirMenu(desktop.matches);
        desktop.addEventListener('change', (e) => definirMenu(e.matches));
        toggle.addEventListener('click', () => definirMenu(!sidebar.classList.contains('is-open')));

        const descricao = document.getElementById('descricao');
        const contador = document.getElementById('contador');
        const atualizarContador = () => { contador.textContent = descricao.value.length + '/500'; };

        descricao.addEventListener('input', atualizarContador);
        document.querySelector('form').addEventListener('reset', () => setTimeout(atualizarContador));

        /* Elo Alimentar – criar-doacao.js
 * Tela "Criar doação": validação do formulário, imagens e cadastro.
 * Precisa de armazenamento.js carregado antes.
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-doacao") || document.querySelector(".painel form");
  if (!form) return;

  const campo = (id) => document.getElementById(id);
  form.noValidate = true; // usamos nossas mensagens, não as do navegador

  /* ---------- Máscaras e extras ---------- */
  const validade = campo("validade");
  if (validade && validade.type === "date") {
    const hojeLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    validade.min = hojeLocal.toISOString().slice(0, 10);
  }
  if (validade && validade.type === "text") {
    validade.addEventListener("input", () => {
      let v = validade.value.replace(/\D/g, "").slice(0, 8);
      if (v.length > 4) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      else if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
      validade.value = v;
    });
  }

  const descricao = campo("descricao");
  const contador = document.getElementById("contador-descricao") || document.getElementById("contador");
  if (descricao && contador) {
    descricao.addEventListener("input", () => {
      contador.textContent = `${descricao.value.length}/500`;
    });
  }

  const cep = campo("cep");
  if (cep) {
    cep.addEventListener("input", () => {
      const v = cep.value.replace(/\D/g, "").slice(0, 8);
      cep.value = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
    });
    // Preenche bairro/cidade/estado pelo CEP (ViaCEP). Se falhar, digita manualmente.
    cep.addEventListener("blur", async () => {
      const numeros = cep.value.replace(/\D/g, "");
      if (numeros.length !== 8) return;
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
        const dados = await resp.json();
        if (dados.erro) return;
        if (campo("bairro")) campo("bairro").value = dados.bairro || "";
        if (campo("cidade")) campo("cidade").value = dados.localidade || "";
        if (campo("estado")) campo("estado").value = dados.uf || "";
      } catch {
        /* sem internet: segue manual */
      }
    });
  }

  /* ---------- Validação ---------- */
  const obrigatorio = (msg) => (v) => (v ? "" : msg);

  const REGRAS = [
    ["produto", (v) => (v.length < 2 ? "Informe o nome do produto." : v.length > 80 ? "Máximo de 80 caracteres." : "")],
    ["categoria", obrigatorio("Selecione uma categoria.")],
    ["quantidade", (v) => (!v ? "Informe a quantidade." : /\d/.test(v) ? "" : "Inclua um número. Ex.: 10kg ou 20 unid.")],
    [
      "validade",
      (v) => {
        if (!v) return "Informe a data de validade.";
        const d = Elo.parseData(v);
        if (!d) return "Data inválida. Use DD/MM/AAAA.";
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return d < hoje ? "Este produto já está vencido." : "";
      },
    ],
    ["cep", (v) => (v.replace(/\D/g, "").length === 8 ? "" : "CEP inválido (8 dígitos).")],
    ["complemento", obrigatorio("Informe o complemento (casa, apartamento...).")],
    ["numero", obrigatorio("Informe o número.")],
    ["bairro", obrigatorio("Informe o bairro.")],
    ["cidade", obrigatorio("Informe a cidade.")],
    ["estado", (v) => (v.length >= 2 ? "" : "Informe o estado.")],
  ];

  REGRAS.forEach(([id, regra]) => {
    const el = campo(id);
    if (!el) return;
    el.addEventListener("change", () => Elo.mostrarErro(el, regra(el.value.trim())));
    el.addEventListener("input", () => Elo.mostrarErro(el, "")); // some enquanto corrige
  });

  /* ---------- Imagens: quantas quiser, adicionar e remover ---------- */
  const TIPOS = ["image/jpeg", "image/png", "image/webp"];
  const MAX_MB = 15; // limite por arquivo (cada um é reduzido antes de salvar)

  const inputImagens = document.getElementById("imagens");
  const previa = document.getElementById("previa-imagens");
  const contadorImagens = document.getElementById("contador-imagens");
  let imagens = [];
  let processando = false;

  function desenharPrevia() {
    if (contadorImagens) {
      contadorImagens.textContent =
        imagens.length === 0 ? "Nenhuma imagem" : `${imagens.length} imagem(ns)`;
    }
    if (!previa) return;
    previa.innerHTML = imagens
      .map(
        (src, i) => `
        <div class="previa-item">
          <img src="${src}" alt="Foto ${i + 1} do alimento">
          <button type="button" class="remover-imagem" data-i="${i}" aria-label="Remover imagem ${i + 1}">×</button>
        </div>`
      )
      .join("");
  }

  async function adicionarArquivos(arquivos) {
    if (!inputImagens) return;
    let erro = "";
    processando = true;

    for (const arquivo of arquivos) {
      if (!TIPOS.includes(arquivo.type)) {
        erro = "Use apenas imagens JPG, PNG ou WEBP.";
        continue;
      }
      if (arquivo.size > MAX_MB * 1024 * 1024) {
        erro = `"${arquivo.name}" passa de ${MAX_MB}MB.`;
        continue;
      }
      try {
        imagens.push(await Elo.comprimirImagem(arquivo));
        desenharPrevia(); // mostra cada imagem assim que fica pronta
      } catch {
        erro = `Não foi possível ler "${arquivo.name}".`;
      }
    }

    processando = false;
    Elo.mostrarErro(inputImagens, erro);
  }

  if (inputImagens) {
    // Cada seleção ADICIONA às imagens que já estão na lista
    inputImagens.addEventListener("change", () => {
      const arquivos = Array.from(inputImagens.files);
      inputImagens.value = ""; // permite escolher o mesmo arquivo de novo
      adicionarArquivos(arquivos);
    });
  }

  // Remover uma imagem pelo ×
  if (previa) {
    previa.addEventListener("click", (e) => {
      const botao = e.target.closest(".remover-imagem");
      if (!botao) return;
      imagens.splice(Number(botao.dataset.i), 1);
      desenharPrevia();
    });
  }

  // Remover todas de uma vez (botão opcional)
  const btnRemoverTodas = document.getElementById("btn-remover-imagens");
  if (btnRemoverTodas) {
    btnRemoverTodas.addEventListener("click", () => {
      imagens = [];
      desenharPrevia();
    });
  }

  // Arrastar e soltar (área opcional)
  const areaImagens = document.getElementById("area-imagens");
  if (areaImagens) {
    areaImagens.addEventListener("dragover", (e) => {
      e.preventDefault();
      areaImagens.classList.add("arrastando");
    });
    areaImagens.addEventListener("dragleave", () => areaImagens.classList.remove("arrastando"));
    areaImagens.addEventListener("drop", (e) => {
      e.preventDefault();
      areaImagens.classList.remove("arrastando");
      adicionarArquivos(Array.from(e.dataTransfer.files));
    });
  }

  desenharPrevia();

  /* ---------- Limpar ---------- */
  function limparTudo() {
    form.reset();
    imagens = [];
    desenharPrevia();
    if (contador) contador.textContent = "0/500";
    form.querySelectorAll(".erro-campo").forEach((el) => el.remove());
    form.querySelectorAll(".invalido").forEach((el) => el.classList.remove("invalido"));
  }

  const btnLimpar = document.getElementById("btn-limpar") || form.querySelector('button[type="reset"]');
  if (btnLimpar) btnLimpar.addEventListener("click", limparTudo);

  /* ---------- Cadastrar doação ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (processando) {
      alert("Aguarde o processamento das imagens.");
      return;
    }

    let primeiroInvalido = null;
    REGRAS.forEach(([id, regra]) => {
      const el = campo(id);
      if (!el) return;
      const msg = regra(el.value.trim());
      Elo.mostrarErro(el, msg);
      if (msg && !primeiroInvalido) primeiroInvalido = el;
    });

    if (primeiroInvalido) {
      primeiroInvalido.focus();
      primeiroInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const doacao = {
      id: Elo.criarId(),
      produto: campo("produto").value.trim(),
      categoria: campo("categoria").selectedOptions[0].textContent.trim(),
      quantidade: campo("quantidade").value.trim(),
      validade: campo("validade").value.trim(),
      descricao: descricao ? descricao.value.trim() : "",
      imagens: [...imagens],
      endereco: {
        cep: campo("cep").value.trim(),
        complemento: campo("complemento") ? campo("complemento").value.trim() : "",
        numero: campo("numero").value.trim(),
        bairro: campo("bairro").value.trim(),
        cidade: campo("cidade").value.trim(),
        estado: campo("estado").value.trim(),
      },
      ong: null, // nenhuma ONG pegou ainda
      status: "disponivel", // toda doação nova começa Disponível
      criadoEm: new Date().toISOString(),
    };

    try {
      await Elo.salvar(doacao);
    } catch {
      alert("Não foi possível salvar a doação. Verifique o espaço do navegador e tente de novo.");
      return;
    }

    limparTudo();
    window.location.href = Elo.PAGINA_GERENCIAR; // mostra a doação no mural
  });
});