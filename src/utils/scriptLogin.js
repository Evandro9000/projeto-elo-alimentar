document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-login");
    const btnEntrar = document.getElementById("btn-entrar");
    const msgSucesso = document.getElementById("mensagem-sucesso");
    const resumoErros = document.getElementById("resumo-erros");

    const campoCnpj = document.getElementById("cnpj-login");
    const campoSenha = document.getElementById("senha-login");

    const erroCnpj = document.getElementById("erro-cnpj-login");
    const erroSenha = document.getElementById("erro-senha-login");

    // Tokens simulados baseados na aula (com payloads diferentes para ONG e Empresa)
    // Payload ONG codificado em Base64 simulado: {"id":123,"name":"ONG Esperança","role":"ong"}
    const tokenOng = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJuYW1lIjoiT05HIEVzcGVyYW5cdTAwZTdhIiwicm9sZSI6Im9uZyIsImlhdCI6MTc1OTk4MTMxNywiZXhwIjoxNzU5OTg0OTE3f0.b1KfcSFInRwYnvRA0Ae5jYuL59KZmCsufPgISNGq0X0";
    
    // Payload Empresa codificado em Base64 simulado: {"id":456,"name":"Empresa Doadora","role":"empresa"}
    const tokenEmpresa = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDU2LCJuYW1lIjoiRW1wcmVzYSBEb2Fkb3JhIiwicm9sZSI6ImVtcHJlc2EiLCJpYXQiOjE3NTk5ODEzMTcsImV4cCI6MTc1OTk4NDE3f0.X0KfcSFInRwYnvRA0Ae5jYuL59KZmCsufPgISNGq0Ab1K";

    // Formatação automática de CNPJ
    function formatarCnpj(valor) {
        let apenasNumeros = valor.replace(/\D/g, "").slice(0, 14);
        return apenasNumeros
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    function validarCnpjReal(cnpj) {
        let numeros = cnpj.replace(/\D/g, "");
        if (numeros.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(numeros)) return false;

        let tamanho = numeros.length - 2;
        let numerosSemDv = numeros.substring(0, tamanho);
        let digitos = numeros.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numerosSemDv.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(0)) return false;

        tamanho = tamanho + 1;
        numerosSemDv = numeros.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numerosSemDv.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(1)) return false;

        return true;
    }

    function setEstadoCampo(campo, msgEl, valido, msgErro = "") {
        if (valido) {
            campo.classList.remove("input-invalido");
            campo.classList.add("input-valido");
            msgEl.textContent = "";
            msgEl.style.display = "none";
        } else {
            campo.classList.remove("input-valido");
            campo.classList.add("input-invalido");
            msgEl.textContent = msgErro;
            msgEl.style.display = "block";
        }
    }

    const foiVisitado = (campo) => campo.hasAttribute("data-touched") || String(campo.value).trim().length > 0;

    function revalidarFormulario() {
        let formValido = true;

        const cnpjValido = validarCnpjReal(campoCnpj.value);
        if (!cnpjValido) formValido = false;
        if (foiVisitado(campoCnpj)) {
            setEstadoCampo(campoCnpj, erroCnpj, cnpjValido, "CNPJ inválido.");
        }

        const senhaValida = campoSenha.value.trim().length >= 6;
        if (!senhaValida) formValido = false;
        if (foiVisitado(campoSenha)) {
            setEstadoCampo(campoSenha, erroSenha, senhaValida, "Mínimo de 6 caracteres.");
        }

        btnEntrar.disabled = !formValido;
        return formValido;
    }

    campoCnpj.addEventListener("input", (e) => {
        e.target.value = formatarCnpj(e.target.value);
        revalidarFormulario();
    });

    campoCnpj.addEventListener("blur", () => {
        campoCnpj.setAttribute("data-touched", "true");
        revalidarFormulario();
    });

    campoSenha.addEventListener("input", () => {
        revalidarFormulario();
    });
    
    campoSenha.addEventListener("blur", () => {
        campoSenha.setAttribute("data-touched", "true");
        revalidarFormulario();
    });

    // Submissão e Atribuição do Token JWT Conforme o Tipo
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (revalidarFormulario()) {
            // SIMULAÇÃO DO MVP: 
            // Para fins de demonstração no protótipo, podemos simular que CNPJs terminados em par são Empresas e ímpares são ONGs.
            const ultimosDigitosClean = campoCnpj.value.replace(/\D/g, "");
            const isOng = parseInt(ultimosDigitosClean.slice(-1)) % 2 !== 0;

            const tokenEscolhido = isOng ? tokenOng : tokenEmpresa;

            // [1] Armazena o token no LocalStorage (Conforme a aula do JWT)
            localStorage.setItem("token", tokenEscolhido);

            msgSucesso.classList.remove("oculto");
            resumoErros.classList.add("oculto");

            setTimeout(() => {
                // [2] Redirecionamento dinâmico baseado na role contida ou simulada
                if (isOng) {
                    window.location.href = "painel-ong.html"; // Página restrita da ONG
                } else {
                    window.location.href = "painel-empresa.html"; // Página restrita da Empresa
                }
            }, 1500);
        }
    });

    revalidarFormulario();
});