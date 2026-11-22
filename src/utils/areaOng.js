// TOKEN PARA CONFIRMAR LOGIN

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    console.log("Token lido do localStorage:", token); // Para saber se o token foi lido corretamente
    // 1. Bloqueia o acesso caso o token não exista
    if (!token) {
        alert("Acesso negado. Faça login para continuar.");
        window.location.href = "login.html";
        return;
    }

    try {
        // 2. Descodifica o Payload do JWT (parte central separada por pontos)
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const usuario = JSON.parse(payloadJson);

        // 3. Validação de Segurança do Perfil (Ex: se estiver na pág da ONG mas o token for de empresa)
        console.log("Usuário autenticado:", usuario.name, "Perfil:", usuario.role);
        
        // Exemplo de saudação na tela
        const elementoNome = document.getElementById("nome-usuario");
        if (elementoNome) {
            elementoNome.textContent = usuario.name;
        }

    } catch (error) {
        console.error("Token inválido:", error);
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }

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

