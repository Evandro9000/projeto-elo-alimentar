document.addEventListener("DOMContentLoaded",()=> {
    const cards = document.querySelector(".cards");
    const btnCheckout = document.querySelector(".checkout");

    if(!cards) return;

    const catalogoFallback = {
        "1": {
            id: "1",
            nome: "Tomate e tomate cereja",
            mercado: "Supermercado Lontra",
            imagem: "../images/tomate.png"
        },
        "2": {
            id: "2",
            nome: "Feijão Carioca, Feijão Preto, Arroz branco",
            mercado: "Mercado do Zé",
            imagem: "../images/grãos.png"
        }
    };

    let meulote = JSON.parse(localStorage.getItem("meulote")) || [];

    function grupoLoteCarrinho(item){
        const base = catalogoFallback[String(item.id)] || {};
        return {
            id: String(item.id || base.id || "1"),
            mercado: item.mercado || base. mercado || "Sem Local",
            imagem: item.imagem || base.imagem || "../images/tomate.png"
        };
    }

    function salvarLotes() {
        localStorage.setItem("meulote", JSON.stringify(meulote));
    }

    function renderizarLote(){
        cards.innerHTML = "";
        
        if(meulote.length === 0){
            const aviso = document.createElement("P");
            aviso.classList.add("mensagem-vazio");
            aviso.textContent = "Nenhum lote adicionado!";
            cards.appendChild(aviso);
            return;
        }
        // adição do lote no carrinho, no caso o formato
        meulote.forEach((rawItem, index)=>{
            const lote = grupoLoteCarrinho(rawItem);
            const grupocard = document.createElement("div");
            grupocard.classList.add("grupo-card");

            grupocard.innerHTML = `
            <a  href="detalhes-do-lote.html?id=${encodeURIComponent(lote.id)}" ><article class="card">
                        <figure class="foto">
                            <img src="${lote.imagem}" alt="${lote.nome}">
                        </figure>
                        <p class="info">${lote.mercado}</p>
                        
                    </article></a>
                    <button class="remove" data-index="${index}">Excluir</button> `;

            cards.appendChild(grupocard);
        });

        // Função do botão "excluir"
        cards.querySelectorAll(".remove").forEach(botao => {
            botao.addEventListener("click", ()=> {
                const indice = Number(botao.dataset.index);
                meulote.splice(indice, 1);
                salvarLotes();
                renderizarLote();
            });
        });

    }
    if(btnCheckout){
        btnCheckout.addEventListener("click", ()=>{
            if(meulote.length === 0){
                alert("Não possui lotes para finalizar o pedido.");
                return;
            }
            alert("Pedido finalizado com sucesso!!");
            meulote = [];
            localStorage.removeItem("meulote");
            renderizarLote();  
        });
    }
    renderizarLote();
});