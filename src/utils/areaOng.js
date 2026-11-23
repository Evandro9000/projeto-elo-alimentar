// TOKEN PARA CONFIRMAR LOGIN

document.addEventListener("DOMContentLoaded", () => {
    // INTERATIVIDADE DA PÁGINA

    // botão "Detalhes"
    const btnDetalhes = document.querySelector(".detalhes");
    btnDetalhes.addEventListener("click", (event)=> {
        window.location.href = "detalhes-do-lote.html";
    });


    // logout
    const btnLogout = document.querySelector(".logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }

    //adicionar lote no carrinho
    const addLotesBotao = document.querySelectorAll(".add");
    addLotesBotao.forEach((botaoAdd)=>{

        botaoAdd.addEventListener("click", ()=>{
            const idlote = botaoAdd.dataset.id;
            if (!idlote) {
            console.error("Botão .add sem atributo data-id.");
            return;
            }

            const lote = {
                id: idlote,
                quantidade: 1
            };

            let meulote = JSON.parse(localStorage.getItem("meulote")) || [];

            const existeNoCarrinho = meulote.some((item) => item.id === lote.id);

            if(existeNoCarrinho) {
                alert("Este lote já está no carrinho.");
                return;
            }
            meulote.push(lote);
            localStorage.setItem("meulote", JSON.stringify(meulote));
            alert("Lote adicionado ao carrinho!");
        });
    });

        // Redirecionar para os detalhes do lote específico
    const botoesDetalhes = document.querySelectorAll(".detalhes");
    botoesDetalhes.forEach((botaoDetalhe, idx) => {
        botaoDetalhe.addEventListener("click", () => {
            const idLote = botaoDetalhe.dataset.id || String(idx + 1);
            window.location.href = `detalhes-do-lote.html?id=${encodeURIComponent(idLote)}`;
        });
    });
});

