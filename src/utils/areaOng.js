document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

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