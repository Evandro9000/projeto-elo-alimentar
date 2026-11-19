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

    // 4. Botão de Logout
    const btnLogout = document.getElementById("logout-btn");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }
});

// INTERATIVIDADE DA PÁGINA
document.addEventListener("DOMContentLoaded", ()=> {
    const addLotesBotao = document.getElementById("add");

    if(addLotesBotao){
        addLotesBotao.addEventListener("click", ()=>{
            const lote = {
                id: addLotesBotao.dataset.id || "1",
                quantidade: 1
            };
            let meulote = JSON.parse(localStorage.getItem("meulote")) || [];

            const existeNoCarrinho = meulote.findIndex(item => item.id === lote.id);

            if(existeNoCarrinho>=0) {
                alert("Este lote já está no carrinho.");
                return;1;
            }
            meulote.push(lote);
            localStorage.setItem("meulote", JSON.stringify(meulote));
        });
    }
});