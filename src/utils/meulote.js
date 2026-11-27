document.addEventListener("DOMContentLoaded", () => {
    const CHAVE_DOACOES = "eloAlimentar_doacoes";
    const CHAVE_CARRINHO = "meulote";

    const cards = document.querySelector(".cards");
    const btnCheckout = document.querySelector(".checkout");

    if (!cards) return;

    function lerDoacoes() {
        try {
            const dados = JSON.parse(localStorage.getItem(CHAVE_DOACOES) || "[]");
            return Array.isArray(dados) ? dados : [];
        } catch (erro) {
            console.error("Erro ao ler doações:", erro);
            return [];
        }
    }

    const doacoesCadastradas = lerDoacoes();

    function escapeHTML(texto = "") {
        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    let meulote = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");

   function grupoLoteCarrinho(item) {
        const origem =
            doacoesCadastradas.find((d) => String(d.id) === String(item.id)) || {};

        const nomeEstabelecimento =
            item.local ||
            origem.local ||
            item.mercado ||
            "Estabelecimento não informado";

        const nomeProduto = item.produto || origem.produto || item.nome || "Produto";
        const imagemSrc = item.imagem || origem.imagem || "../images/tomate.png";

        return {
            id: String(item.id || origem.id || ""),
            nome: nomeProduto,
            local: nomeEstabelecimento,
            imagem: imagemSrc,
        };
    }

    function salvarLotes() {
        localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(meulote));
    }

    function renderizarLote() {
        cards.innerHTML = "";

        if (meulote.length === 0) {
            const aviso = document.createElement("p");
            aviso.classList.add("mensagem-vazio");
            aviso.textContent = "Nenhum lote adicionado!";
            cards.appendChild(aviso);
            return;
        }

        meulote.forEach((rawItem, index) => {
            const lote = grupoLoteCarrinho(rawItem);
            const grupocard = document.createElement("div");
            grupocard.classList.add("grupo-card");

            grupocard.innerHTML = `
                <a href="detalhes-do-lote.html?id=${encodeURIComponent(lote.id)}">
                    <article class="card">
                        <figure class="foto">
                            <img src="${escapeHTML(lote.imagem)}" alt="${escapeHTML(lote.nome)}">
                        </figure>
                        <p class="info">${escapeHTML(lote.local)}</p>
                    </article>
                </a>
                <button type="button" class="remove" data-index="${index}">Excluir</button>
            `;

            cards.appendChild(grupocard);
        });

        cards.querySelectorAll(".remove").forEach((botao) => {
            botao.addEventListener("click", () => {
                const indice = Number(botao.dataset.index);
                meulote.splice(indice, 1);
                salvarLotes();
                renderizarLote();
            });
        });
    }

 function salvarDoacoesAtualizadas(lista) {
     localStorage.setItem(CHAVE_DOACOES, JSON.stringify(lista));
    }

    if (btnCheckout) {
        btnCheckout.addEventListener("click", () => {
            if (meulote.length === 0) {
                alert("Não possui lotes para finalizar o pedido.");
                return;
            }

            const idsFinalizados = new Set(meulote.map((item) => String(item.id)));
            const doacoesRestantes = lerDoacoes().filter(
                (doacao) => !idsFinalizados.has(String(doacao.id))
            );

            salvarDoacoesAtualizadas(doacoesRestantes);
            meulote = [];
            localStorage.removeItem(CHAVE_CARRINHO);
            renderizarLote();
            alert("Pedido finalizado com sucesso!!");
        });
    }

    const btnLogout = document.querySelector(".logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }

    renderizarLote();
});