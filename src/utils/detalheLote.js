document.addEventListener("DOMContentLoaded", ()=> {
    const params = new URLSearchParams(window.location.search);
    const idLote = params.get("id");

    const lotes = {
        "1": {
            produto: "Tomate e tomate cereja",
            quantidade: "5kg",
            local: "Supermercado da Lontra",
            validade: null,
            entrega: "Retirada",
            imagem: "../images/tomate.png",
            codigo: "LOT-001"
        },
        "2": {
            produto: "Feijão carioca, feijão preto, arroz branco",
            quantidade: "50kg",
            local: "Mercado do Zé",
            validade: "20/07/3000",
            entrega: "Envio ao destinatário",
            imagem: "../images/grãos.png",
            codigo: "LOT-002"
        }
    };
    const loteSelecionado = lotes[idLote];
    const cardLote = document.querySelector(".card-lote");

    if (!loteSelecionado) {
        document.body.innerHTML = "<p>Lote não encontrado.</p>";
        return;
    }

    //adiciona a imagem
    const addImg = document.querySelector(".foto img");
    if (addImg) {
        addImg.src = loteSelecionado.imagem;
        addImg.alt = loteSelecionado.alt || loteSelecionado.produto;
    }

    //adiciona o endereço
    const addLocal = document.querySelector(".local-lote");
    if (addLocal){
        addLocal.innerHTML = `<b>Local</b>: ${loteSelecionado.local}`;
    }

    //adiciona todas as informações no card
    const addInfo = document.querySelector(".informacoes");
    if(addInfo) {
        const linhaDaValidade = loteSelecionado.validade ? `Data de validade: ${loteSelecionado.validade}<br>`: "";
        addInfo.innerHTML = `
        Endereço: ${loteSelecionado.endereco}<br>
        Produto: ${loteSelecionado.produto}<br>
        Quantidade: ${loteSelecionado.quantidade}<br>
        ${linhaDaValidade}Tipo de entrega: ${loteSelecionado.entrega}<br>
        Código do lote: ${loteSelecionado.codigo}`
    }

    //Botão detalhe, desativa de o item estiver no carrinho
    const btnAdd = document.querySelector(".add");
    const boxBotao = document.querySelector(".card-botao");

    function itemNoCarrinho(){
        const meulote = JSON.parse(localStorage.getItem("meulote")) || [];
        return meulote.some((item) => String(item.id) === String(idLote));
    }

    function atualizarBotaoVisivel (){
        const noCarrinho = itemNoCarrinho();
        if(btnAdd) {
            btnAdd.style.display = noCarrinho ? "none":"";
        }
        if(boxBotao){
            boxBotao.style.display = noCarrinho ? "none":"";
        }
    }

    atualizarBotaoVisivel();

    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            let meulote = JSON.parse(localStorage.getItem("meulote")) || [];
            if (meulote.some((item) => String(item.id) === String(idLote))) {
                atualizarBotaoVisivel();
                return;
            }

            meulote.push({ id: String(idLote), quantidade: 1 });
            localStorage.setItem("meulote", JSON.stringify(meulote));
            atualizarBotaoVisivel();
            alert("Lote adicionado ao carrinho!");
        });
    }

    // Caso o usuário remova o lote em outra aba e volte para esta
    window.addEventListener("storage", (event) => {
        if (event.key === "meulote") {
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
