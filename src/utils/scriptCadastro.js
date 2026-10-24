document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cadastro");
    const btnEnviar = document.getElementById("btn-enviar");
    const msgSucesso = document.getElementById("mensagem-sucesso");
    const resumoErros = document.getElementById("resumo-erros");

    // Campos do formulário
    const campoCnpj = document.getElementById("cnpj");
    const campoNome = document.getElementById("nome");
    const campoTipo = document.getElementById("tipo");
    const campoEmail = document.getElementById("email");
    const campoSenha = document.getElementById("senha");

    // Elementos de mensagem de erro
    const erroCnpj = document.getElementById("erro-cnpj");
    const erroNome = document.getElementById("erro-nome");
    const erroTipo = document.getElementById("erro-tipo");
    const erroEmail = document.getElementById("erro-email");
    const erroSenha = document.getElementById("erro-senha");

    // Indicador de força da senha
    const forcaBarra = document.getElementById("forca-barra");
    const forcaTexto = document.getElementById("forca-texto");

    // Máscara e formatação automática do CNPJ (apenas números, com pontos, barra e traço)
    function formatarCnpj(valor) {
        let apenasNumeros = valor.replace(/\D/g, "").slice(0, 14);
        return apenasNumeros
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    // Validação matemática real de CNPJ
    function validarCnpjReal(cnpj) {
        let numeros = cnpj.replace(/\D/g, "");
        
        if (numeros.length !== 14) return false;
        
        // Rejeita sequências de dígitos iguais conhecidas (ex: 000.000.000/0000-00)
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

    const validarNome = (nome) => nome.trim().length >= 3;
    const validarEmailRegex = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Função de Debounce para suavizar a validação em tempo real
    function debounce(func, delay = 400) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Cálculo da força da senha (0 a 100)
    function calcularForcaSenha(senha) {
        let score = 0;
        if (senha.length >= 6) score += 20;
        if (senha.length >= 8) score += 20;
        if (/[A-Z]/.test(senha)) score += 20;
        if (/[a-z]/.test(senha)) score += 20;
        if (/[0-9]/.test(senha)) score += 10;
        if (/[^A-Za-z0-9]/.test(senha)) score += 10;
        return score;
    }

    // Altera o estado visual dos campos (válido ou inválido)
    function setEstadoCampo(campo, msgEl, valido, msgErro = "") {
        msgEl.style.color = ""; 

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

    // Verifica se o campo já recebeu foco/interação
    const foiVisitado = (campo) => campo.hasAttribute("data-touched") || String(campo.value).trim().length > 0;

    // Função de revalidação geral do formulário
    function revalidarFormulario() {
        let formValido = true;
        let arrayErros = []; 

        // 1. Validação CNPJ Real
        const cnpjValido = validarCnpjReal(campoCnpj.value);
        if (!cnpjValido) formValido = false;
        if (foiVisitado(campoCnpj)) {
            setEstadoCampo(campoCnpj, erroCnpj, cnpjValido, "CNPJ inválido ou incompleto.");
            if (!cnpjValido) arrayErros.push("CNPJ");
        }

        // 2. Validação Nome
        const nomeValido = validarNome(campoNome.value);
        if (!nomeValido) formValido = false;
        if (foiVisitado(campoNome)) {
            setEstadoCampo(campoNome, erroNome, nomeValido, "O nome deve ter pelo menos 3 caracteres.");
            if (!nomeValido) arrayErros.push("Nome");
        }

        // 3. Validação Tipo
        const tipoValido = campoTipo.value !== "";
        if (!tipoValido) formValido = false;
        if (foiVisitado(campoTipo)) {
            setEstadoCampo(campoTipo, erroTipo, tipoValido, "Selecione uma opção de cadastro.");
            if (!tipoValido) arrayErros.push("Tipo");
        }

        // 4. Validação E-mail
        const emailValido = validarEmailRegex(campoEmail.value);
        if (!emailValido) formValido = false;
        if (foiVisitado(campoEmail)) {
            setEstadoCampo(campoEmail, erroEmail, emailValido, "Formato de e-mail inválido.");
            if (!emailValido) arrayErros.push("E-mail");
        }

        // 5. Validação Senha (Mínimo Média -> score >= 50)
        const score = calcularForcaSenha(campoSenha.value);
        const senhaValida = score >= 50; 
        if (!senhaValida) formValido = false;
        if (foiVisitado(campoSenha)) {
            setEstadoCampo(campoSenha, erroSenha, senhaValida, "Senha fraca. Use letras maiúsculas, minúsculas e números.");
            if (!senhaValida) arrayErros.push("Senha");
        }

        // Resumo geral de erros no topo
        if (arrayErros.length > 0) {
            resumoErros.classList.remove("oculto");
            resumoErros.innerHTML = `<strong>Atenção:</strong> Verifique os campos: ${arrayErros.join(", ")}.`;
        } else {
            resumoErros.classList.add("oculto");
        }

        btnEnviar.disabled = !formValido;
        return formValido;
    }

    const revalidarDebounced = debounce(revalidarFormulario, 600);

    // Evento específico para formatar e filtrar o CNPJ em tempo real
    campoCnpj.addEventListener("input", (e) => {
        e.target.value = formatarCnpj(e.target.value);
        revalidarDebounced();
    });

    campoCnpj.addEventListener("blur", () => {
        campoCnpj.setAttribute("data-touched", "true");
        revalidarFormulario();
    });

    // Eventos disparados nos demais campos
    [campoNome, campoTipo, campoEmail, campoSenha].forEach(campo => {
        campo.addEventListener("blur", () => {
            campo.setAttribute("data-touched", "true");
            revalidarFormulario();
        });
        campo.addEventListener("input", revalidarDebounced);
        campo.addEventListener("change", () => {
            campo.setAttribute("data-touched", "true");
            revalidarFormulario();
        });
    });

    // Comportamento interativo da barra de força da senha
    campoSenha.addEventListener("input", (e) => {
        const senha = e.target.value;
        const score = calcularForcaSenha(senha);
        
        forcaBarra.classList.remove("forca-fraca", "forca-media", "forca-forte");
        forcaTexto.classList.remove("texto-fraco", "texto-medio", "texto-forte");
        
        if (senha.length === 0) {
            forcaTexto.textContent = "Aguardando senha...";
            forcaBarra.style.width = "0%";
        } else if (score < 50) {
            forcaBarra.classList.add("forca-fraca");
            forcaTexto.classList.add("texto-fraco");
            forcaTexto.textContent = "Fraca";
        } else if (score < 80) {
            forcaBarra.classList.add("forca-media");
            forcaTexto.classList.add("texto-medio");
            forcaTexto.textContent = "Média";
        } else {
            forcaBarra.classList.add("forca-forte");
            forcaTexto.classList.add("texto-forte");
            forcaTexto.textContent = "Forte";
        }
    });

    // Submissão do Formulário
    form.addEventListener("submit", (e) => {
        e.preventDefault(); 
        
        if (revalidarFormulario()) {
            msgSucesso.classList.remove("oculto");
            resumoErros.classList.add("oculto");
            
            form.reset();
            forcaBarra.style.width = "0%";
            forcaTexto.textContent = "Aguardando senha...";
            
            // Remove classes de validação e atributos de toque
            document.querySelectorAll(".input-valido, .input-invalido").forEach(el => {
                el.classList.remove("input-valido", "input-invalido");
            });
            document.querySelectorAll("[data-touched]").forEach(el => {
                el.removeAttribute("data-touched");
            });
            document.querySelectorAll(".erro-msg").forEach(el => {
                el.textContent = "";
                el.style.display = "none";
            });
            
            setTimeout(() => {
                msgSucesso.classList.add("oculto");
            }, 4000);
            
            btnEnviar.disabled = true;
        }
    });

    revalidarFormulario();
});