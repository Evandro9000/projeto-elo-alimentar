
document.addEventListener("DOMContentLoaded", () => {

        // logout
    const btnLogout = document.querySelector(".sair");

    if (btnLogout) {
        btnLogout.addEventListener("click", (event) => {
            event.preventDefault();

            localStorage.removeItem("token");

            window.location.href = "index.html";
        });
    }
    
    const tbody = document.getElementById("tabela-doacoes");
    if (!tbody) return;

    const busca = document.getElementById("busca");
    const filtro = document.getElementById("filtro");
    const formBusca = document.querySelector(".busca");
    const semResultados = document.getElementById("sem-resultados");

    let doacoes = [];

    // Linha vazia que o seu CSS estica para preencher o resto da tabela
    const LINHA_PREENCHIMENTO =
        '<tr class="preenchimento" aria-hidden="true"><td></td><td></td><td></td><td></td><td></td><td></td></tr>';

    async function carregar() {
        doacoes = await Elo.listar();
        desenhar();
    }

    function desenhar() {
        const termo = busca ? busca.value.trim().toLowerCase() : "";
        const status = filtro ? filtro.value : "";

        const lista = doacoes.filter((d) => {
            const bateBusca =
                !termo ||
                d.produto.toLowerCase().includes(termo) ||
                d.categoria.toLowerCase().includes(termo);

            return bateBusca && (!status || d.status === status);
        });

        if (semResultados) semResultados.hidden = lista.length > 0;

        const linhas = lista
            .map((d) => {
                const st = Elo.STATUS[d.status] || Elo.STATUS.disponivel;
                const produto = Elo.escapeHtml(d.produto);

                const opcoes = Object.entries(Elo.STATUS)
                    .map(
                        ([chave, info]) =>
                            `<option value="${chave}" ${chave === d.status ? "selected" : ""}>${info.texto}</option>`
                    )
                    .join("");

                const fotos = d.imagens || [];

                const miniatura = fotos.length
                    ? `<button type="button" class="ver-imagens" title="Ver imagens" aria-label="Ver imagens de ${produto}">
                        <img class="miniatura" src="${Elo.escapeHtml(fotos[0])}" alt="">
                        ${fotos.length > 1 ? `<span class="mais-fotos">+${fotos.length - 1}</span>` : ""}
                    </button>`
                    : "";

                return `
                    <tr data-id="${d.id}">
                        <th scope="row">${miniatura}${produto}</th>
                        <td>${Elo.escapeHtml(d.quantidade)}</td>
                        <td>${Elo.escapeHtml(d.categoria)}</td>
                        <td>${Elo.escapeHtml(Elo.formatarValidade(d.validade))}</td>
                        <td>${Elo.escapeHtml(d.ong || "—")}</td>
                        <td>
                            <div class="status-celula">
                                <span class="status ${st.classe}">${st.texto}</span>
                                <select class="trocar-status" aria-label="Alterar status de ${produto}">${opcoes}</select>
                                <button type="button" class="btn-remover" title="Remover" aria-label="Remover ${produto}">🗑</button>
                            </div>
                        </td>
                    </tr>`;
            })
            .join("");

        tbody.innerHTML = linhas + LINHA_PREENCHIMENTO;
    }

    // ---------- Galeria de imagens ----------
    function abrirGaleria(doacao) {
        let dlg = document.getElementById("galeria-doacao");

        if (!dlg) {
            dlg = document.createElement("dialog");
            dlg.id = "galeria-doacao";
            document.body.appendChild(dlg);

            dlg.addEventListener("click", (e) => {
                if (e.target === dlg || e.target.classList.contains("fechar-galeria")) {
                    dlg.close();
                }
            });
        }

        dlg.innerHTML = `
            <button type="button" class="fechar-galeria" aria-label="Fechar">×</button>
            <h3>${Elo.escapeHtml(doacao.produto)}</h3>
            <div class="galeria-grid">
                ${(doacao.imagens || [])
                    .map((src, i) => `<img src="${Elo.escapeHtml(src)}" alt="Foto ${i + 1} de ${Elo.escapeHtml(doacao.produto)}">`)
                    .join("")}
            </div>`;

        dlg.showModal();
    }

    // ---------- Eventos ----------
    tbody.addEventListener("change", async (e) => {
        if (!e.target.classList.contains("trocar-status")) return;

        const id = e.target.closest("tr").dataset.id;
        const doacao = doacoes.find((d) => d.id === id);

        if (!doacao) return;

        doacao.status = e.target.value;

        // Fora de "Disponível" precisa de uma ONG responsável
        if (doacao.status !== "disponivel" && !doacao.ong) {
            doacao.ong = prompt("Nome da ONG responsável:") || "ONG não informada";
        }

        if (doacao.status === "disponivel") {
            doacao.ong = null;
        }

        await Elo.salvar(doacao);
        desenhar();
    });

    tbody.addEventListener("click", async (e) => {
        const linha = e.target.closest("tr");

        if (!linha || !linha.dataset.id) return;

        const doacao = doacoes.find((d) => d.id === linha.dataset.id);

        if (!doacao) return;

        if (e.target.closest(".ver-imagens")) {
            abrirGaleria(doacao);
            return;
        }

        if (e.target.closest(".btn-remover")) {
            if (!confirm("Remover esta doação?")) return;

            await Elo.remover(doacao.id);

            doacoes = doacoes.filter((d) => d.id !== doacao.id);

            desenhar();
        }
    });

    // O campo de busca está dentro de um form: sem isto, o Enter recarregaria a página
    if (formBusca) {
        formBusca.addEventListener("submit", (e) => {
            e.preventDefault();
            desenhar();
        });
    }

    if (busca) busca.addEventListener("input", desenhar);
    if (filtro) filtro.addEventListener("change", desenhar);

    // Atualiza quando algo muda em outra aba
    Elo.aoMudar(carregar);

    carregar();
});
