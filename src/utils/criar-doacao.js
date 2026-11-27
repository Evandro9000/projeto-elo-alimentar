
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Menu lateral (sidebar) ---------- */
  const sidebar = document.querySelector(".sidebar");
  const toggle = sidebar ? sidebar.querySelector(".sidebar__toggle") : null;
  const desktop = window.matchMedia("(min-width: 960px)");

  function definirMenu(aberto) {
    if (!sidebar || !toggle) return;
    sidebar.classList.toggle("is-open", aberto);
    toggle.setAttribute("aria-expanded", String(aberto));
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  }

  if (sidebar && toggle) {
    definirMenu(desktop.matches);
    desktop.addEventListener("change", (e) => definirMenu(e.matches));
    toggle.addEventListener("click", () => {
      definirMenu(!sidebar.classList.contains("is-open"));
    });
  }

  /* ---------- Formulário ---------- */
  const form = document.getElementById("form-doacao");
  const cadastrar = document.querySelector(".btn.btn--principal");
  const limpar = document.querySelector(".btn");

  // Campos do formulário
  const campoProduto = document.getElementById("produto");
  const campoCategoria = document.getElementById("categoria");
  const campoQuant = document.getElementById("quantidade");
  const campoData = document.getElementById("validade");

  const campoEstabelecimento = document.getElementById("local");

  const campoCEP = document.getElementById("cep");
  const campoRua = document.getElementById("rua");
  const campoNum = document.getElementById("numero");
  const campoBairro = document.getElementById("bairro");
  const campoCidade = document.getElementById("cidade");
  const campoEstado = document.getElementById("estado");

  const campoImagem = document.getElementById("imagem");
  const areaPreviewImagem = document.getElementById("area-preview-imagem");
  const previewImagem = document.getElementById("preview-imagem");
  const btnRemoverImagem = document.getElementById("btn-remover-imagem");
  const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
  const TAMANHO_MAX_MB = 5;
  const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024;

  const campoEntrega = document.getElementById("entrega");

  if (form) {
    form.noValidate = true}

// Função para exibir erro e limpar
function definirErro(campo, mensagem) {
    if (!campo) return false;
    const container = campo.closest(".campo");
    if (!container) return false;

    let erroEl = container.querySelector(".erro-campo");

    if (!mensagem) {
      campo.classList.remove("invalido");
      if (erroEl) erroEl.remove();
      return true;
    }

    campo.classList.add("invalido");
    if (!erroEl) {
      erroEl = document.createElement("span");
      erroEl.className = "erro-campo";
      container.appendChild(erroEl);
    }
    erroEl.textContent = mensagem;
    return false;
  }

// Validação Produto
function validarProduto() {
    if (!campoProduto) return false;
    if (!campoProduto.value.trim()) {
      return definirErro(campoProduto, "Informe o nome do produto.");
    }
    return definirErro(campoProduto, "");
  }

  if (campoProduto) {
    campoProduto.addEventListener("input", () => {
      if (campoProduto.value.trim()) definirErro(campoProduto, "");
    });
    campoProduto.addEventListener("blur", validarProduto);
  }

// Validação Categoria
function validarCategoria() {
    if (!campoCategoria) return false;
    if (!campoCategoria.value) {
      return definirErro(campoCategoria, "Selecione uma categoria.");
    }
    return definirErro(campoCategoria, "");
  }

  if (campoCategoria) {
    campoCategoria.addEventListener("change", validarCategoria);
  }

// Validar Quantidade

function validarQuant() {
    if (!campoQuant) return false;
    const valor = campoQuant.value.trim();

    if (!valor) {
      return definirErro(campoQuant, "Informe a quantidade.");
    }

    if (!/\d/.test(valor)) {
      return definirErro(campoQuant, "Inclua um número. Ex.: 10kg ou 500g.");
    }

    const temUnidade = /\b(kg|g|gr|gramas?|quilos?|l|lt|ml|un|unid|unidades?|cx|pct|fd)\b/i.test(valor);
    if (!temUnidade) {
      return definirErro(campoQuant, "Especifique a unidade (ex.: kg, g, unid, L).");
    }

    return definirErro(campoQuant, "");
  }

  if (campoQuant) {
    campoQuant.addEventListener("input", () => {
      if (campoQuant.value.trim()) definirErro(campoQuant, "");
    });
    campoQuant.addEventListener("blur", validarQuant);
  }

// Validação da data de validade
function formatarDDMMYY(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}-${mes}-${ano.slice(-2)}`;
  }

  function validarData() {
    if (!campoData) return false;
    const valor = campoData.value;

    if (!valor) {
      return definirErro(campoData, "Informe a data de validade.");
    }

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    const hojeISO = `${ano}-${mes}-${dia}`;

    if (valor < hojeISO) {
      return definirErro(campoData, `A data não pode ser anterior a ${formatarDDMMYY(hojeISO)}.`);
    }

    return definirErro(campoData, "");
  }

  if (campoData) {
    campoData.addEventListener("change", validarData);
    campoData.addEventListener("blur", validarData);
  }

// Validação do Nome do Estabelecimento
function validarEstabelecimento() {
    if (!campoEstabelecimento) return false;
    if (!campoEstabelecimento.value.trim()) {
      return definirErro(campoEstabelecimento, "Informe o nome do Estabelecimento.");
    }
    return definirErro(campoEstabelecimento, "");
  }

  if (campoEstabelecimento) {
    campoEstabelecimento.addEventListener("input", () => {
      if (campoEstabelecimento.value.trim()) definirErro(campoEstabelecimento, "");
    });
    campoEstabelecimento.addEventListener("blur", validarEstabelecimento);
  }

// Validação do CEP + ViaCEP
  let cepValidoApi = false;
  let ultimoCepConsultado = "";

  function limparCamposEndereco() {
    if (campoRua) campoRua.value = "";
    if (campoBairro) campoBairro.value = "";
    if (campoCidade) campoCidade.value = "";
    if (campoEstado) campoEstado.value = "";
  }

  function preencherEndereco(dados) {
    if (campoRua && dados.logradouro) {
      campoRua.value = dados.logradouro;
      validarRua();
    }
    if (campoBairro && dados.bairro) {
      campoBairro.value = dados.bairro;
      validarBairro();
    }
    if (campoCidade && dados.localidade) {
      campoCidade.value = dados.localidade;
      validarCidade();
    }
    if (campoEstado && dados.uf) {
      campoEstado.value = dados.uf;
      validarEstado();
    }
  }

  function formatarCEP(digitos) {
    const limpo = digitos.replace(/\D/g, "").slice(0, 8);
    return limpo.length > 5 ? `${limpo.slice(0, 5)}-${limpo.slice(5)}` : limpo;
  }

  async function buscarCEP(digitos) {
    if (digitos.length !== 8) {
      cepValidoApi = false;
      return definirErro(campoCEP, "Digite um CEP válido com 8 números.");
    }

    if (digitos === ultimoCepConsultado && cepValidoApi) {
      return definirErro(campoCEP, "");
    }

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      if (!resposta.ok) throw new Error("Falha na consulta do CEP");

      const dados = await resposta.json();

      if (dados.erro) {
        cepValidoApi = false;
        ultimoCepConsultado = "";
        limparCamposEndereco();
        return definirErro(campoCEP, "CEP não encontrado.");
      }

      cepValidoApi = true;
      ultimoCepConsultado = digitos;
      preencherEndereco(dados);
      return definirErro(campoCEP, "");
    } catch (erro) {
      cepValidoApi = false;
      return definirErro(campoCEP, "Não foi possível consultar o CEP agora. Tente novamente.");
    }
  }

  function validarCEP() {
    if (!campoCEP) return false;
    const digitos = campoCEP.value.replace(/\D/g, "");

    if (!digitos) {
      cepValidoApi = false;
      return definirErro(campoCEP, "Informe o CEP para coleta.");
    }

    if (digitos.length !== 8) {
      cepValidoApi = false;
      return definirErro(campoCEP, "O CEP deve conter 8 números (ex.: 00000-000).");
    }

    if (!cepValidoApi || digitos !== ultimoCepConsultado) {
      buscarCEP(digitos);
      return false;
    }

    return definirErro(campoCEP, "");
  }

  if (campoCEP) {
    campoCEP.addEventListener("input", () => {
      campoCEP.value = formatarCEP(campoCEP.value);
      const digitos = campoCEP.value.replace(/\D/g, "");

      if (!digitos) {
        cepValidoApi = false;
        ultimoCepConsultado = "";
        definirErro(campoCEP, "");
        return;
      }

      if (digitos.length === 8) {
        buscarCEP(digitos);
      } else {
        cepValidoApi = false;
      }
    });

    campoCEP.addEventListener("blur", () => {
      validarCEP();
    });
  }

// Validações de endereço (Rua, Número, Bairro, Cidade, Estado)
  function validarRua() {
    if (!campoRua) return false;
    if (!campoRua.value.trim()) {
      return definirErro(campoRua, "Informe a rua.");
    }
    return definirErro(campoRua, "");
  }

  function validarNumero() {
    if (!campoNum) return false;
    const valor = campoNum.value.trim();

    if (!valor) {
      return definirErro(campoNum, "Informe o número (ou S/N).");
    }

    if (!/^(\d+[a-zA-Z0-9\-\/]*|s\/?n)$/i.test(valor)) {
      return definirErro(campoNum, "Número inválido (ex.: 120 ou S/N).");
    }

    return definirErro(campoNum, "");
  }

  function validarBairro() {
    if (!campoBairro) return false;
    if (!campoBairro.value.trim()) {
      return definirErro(campoBairro, "Informe o bairro.");
    }
    return definirErro(campoBairro, "");
  }

  function validarCidade() {
    if (!campoCidade) return false;
    if (!campoCidade.value.trim()) {
      return definirErro(campoCidade, "Informe a cidade.");
    }
    return definirErro(campoCidade, "");
  }

  const UFS_VALIDAS = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  function validarEstado() {
    if (!campoEstado) return false;
    const uf = campoEstado.value.trim().toUpperCase();
    campoEstado.value = uf;

    if (!uf) {
      return definirErro(campoEstado, "Informe o estado (UF).");
    }

    if (!UFS_VALIDAS.includes(uf)) {
      return definirErro(campoEstado, "UF inválida (ex.: SP, RJ, MG).");
    }

    return definirErro(campoEstado, "");
  }

  [
    [campoRua, validarRua],
    [campoNum, validarNumero],
    [campoBairro, validarBairro],
    [campoCidade, validarCidade],
    [campoEstado, validarEstado],
  ].forEach(([campo, validar]) => {
    if (!campo) return;
    campo.addEventListener("input", () => {
      if (campo.value.trim()) validar();
    });
    campo.addEventListener("blur", validar);
  });

// Validar Imagem
let imagemBase64 = "";

  function limparPreviewImagem() {
    imagemBase64 = "";
    if (previewImagem) {
      previewImagem.src = "";
    }
    if (areaPreviewImagem) {
      areaPreviewImagem.style.display = "none";
    }
  }

  function removerImagem() {
    if (campoImagem) {
      campoImagem.value = ""; 
    }
    limparPreviewImagem();
    definirErro(campoImagem, "");
  }

  function lerArquivoComoBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result || ""));
      leitor.onerror = () => reject(new Error("Erro ao ler a imagem"));
      leitor.readAsDataURL(arquivo);
    });
  }

  function validarImagem() {
    if (!campoImagem) return false;

    const arquivo = campoImagem.files && campoImagem.files[0];

    if (!arquivo) {
      limparPreviewImagem();
      return definirErro(campoImagem, "Selecione uma imagem do alimento.");
    }

    if (!TIPOS_IMAGEM_PERMITIDOS.includes(arquivo.type)) {
      limparPreviewImagem();
      return definirErro(campoImagem, "Use apenas imagens JPG, PNG ou WEBP.");
    }

    if (arquivo.size > TAMANHO_MAX_BYTES) {
      limparPreviewImagem();
      return definirErro(campoImagem, `A imagem deve ter no máximo ${TAMANHO_MAX_MB} MB.`);
    }

    return definirErro(campoImagem, "");
  }

  if (campoImagem) {
    campoImagem.addEventListener("change", async () => {
      const valida = validarImagem();
      if (!valida) return;

      const arquivo = campoImagem.files[0];
      try {
        imagemBase64 = await lerArquivoComoBase64(arquivo);
        if (previewImagem) {
          previewImagem.src = imagemBase64;
        }
        if (areaPreviewImagem) {
          areaPreviewImagem.style.display = "block";
        }
      } catch {
        limparPreviewImagem();
        definirErro(campoImagem, "Não foi possível carregar a prévia da imagem.");
      }
    });
  }

  if (btnRemoverImagem) {
    btnRemoverImagem.addEventListener("click", removerImagem);
  }

  // Validação do Tipo de entrega
function validarEntrega() {
    if (!campoEntrega) return false;
    if (!campoEntrega.value.trim()) {
      return definirErro(campoEntrega, "Informe o tipo de envio.");
    }
    return definirErro(campoEntrega, "");
  }

  if (campoEntrega) {
    campoEntrega.addEventListener("input", () => {
     if (campoEntrega.value.trim()) definirErro(campoEntrega, "");
    });
    campoEntrega.addEventListener("blur", validarEntrega);
  }

// Valida ao alterar e ao enviar o formulário
 const CHAVE_DOACOES = "eloAlimentar_doacoes";
  const URL_GERENCIAR_DOACOES = "gerenciar-doacoes.html"; // opcional, se quiser ir para a gestão do doador

  function salvarDoacao(novaDoacao) {
    const listaAtual = JSON.parse(localStorage.getItem(CHAVE_DOACOES) || "[]");
    listaAtual.push(novaDoacao);
    localStorage.setItem(CHAVE_DOACOES, JSON.stringify(listaAtual));
  }

  function mostrarAvisoSucesso(mensagem) {
    if (!form) return;
    let aviso = form.querySelector(".aviso-sucesso");
    if (!aviso) {
      aviso = document.createElement("p");
      aviso.className = "aviso-sucesso";
      aviso.setAttribute("role", "status");
      form.prepend(aviso);
    }
    aviso.textContent = mensagem;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let cepOk = validarCEP();
      const digitosCEP = campoCEP ? campoCEP.value.replace(/\D/g, "") : "";

      if (!cepOk && digitosCEP.length === 8) {
        cepOk = await buscarCEP(digitosCEP);
      }

      const campos = [
        [validarProduto(), campoProduto],
        [validarCategoria(), campoCategoria],
        [validarQuant(), campoQuant],
        [validarData(), campoData],
        [validarEstabelecimento(), campoEstabelecimento],
        [cepOk, campoCEP],
        [validarRua(), campoRua],
        [validarNumero(), campoNum],
        [validarBairro(), campoBairro],
        [validarCidade(), campoCidade],
        [validarEstado(), campoEstado],
        [validarImagem(), campoImagem],
        [validarEntrega(), campoEntrega],
      ];

      const primeiroInvalido = campos.find(([valido]) => !valido);

      if (primeiroInvalido) {
        primeiroInvalido[1]?.focus();
        return;
      }

      const campoDescricao = document.getElementById("descricao");
      const campoComplemento = document.getElementById("complemento");

      const novaDoacao = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        produto: campoProduto.value.trim(),
        categoria: campoCategoria.value,
        quantidade: campoQuant.value.trim(),
        validade: campoData.value,
        validadeFormatada: formatarDDMMYY(campoData.value),
        descricao: campoDescricao ? campoDescricao.value.trim() : "",
        imagem: imagemBase64,
        endereco: {
          cep: campoCEP.value.trim(),
          rua: campoRua.value.trim(),
          numero: campoNum.value.trim(),
          complemento: campoComplemento ? campoComplemento.value.trim() : "",
          bairro: campoBairro.value.trim(),
          cidade: campoCidade.value.trim(),
          estado: campoEstado.value.trim().toUpperCase(),
        },
        local: campoEstabelecimento.value.trim(),
        envio: campoEntrega.value.trim(),
        criadoEm: new Date().toISOString(),
      };

      try {
        salvarDoacao(novaDoacao);

        form.reset();
        limparPreviewImagem();
        cepValidoApi = false;
        ultimoCepConsultado = "";
        mostrarAvisoSucesso("Doação cadastrada com sucesso! Ela já está disponível para as ONGs.");

        // Opção B: se quiser redirecionar para a página de gestão do doador, descomente a linha abaixo:
        // window.location.href = URL_GERENCIAR_DOACOES;
      } catch (erro) {
        definirErro(
          campoImagem,
          "Não foi possível salvar a doação. A imagem pode ser grande demais para o armazenamento local."
        );
      }
    });
  }

});
