    const sidebar = document.querySelector('.sidebar');
    const toggle = sidebar.querySelector('.sidebar__toggle');
    const desktop = window.matchMedia('(min-width: 960px)');

        function definirMenu(aberto) {
            sidebar.classList.toggle('is-open', aberto);
            toggle.setAttribute('aria-expanded', aberto);
            toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        }

        definirMenu(desktop.matches);
        desktop.addEventListener('change', (e) => definirMenu(e.matches));
        toggle.addEventListener('click', () => definirMenu(!sidebar.classList.contains('is-open')));

        /* Busca e filtro por status */
        const busca = document.getElementById('busca');
        const filtro = document.getElementById('filtro');
        const linhas = document.querySelectorAll('tbody tr[data-status]');
        const semResultados = document.getElementById('sem-resultados');

        function filtrar() {
            const termo = busca.value.trim().toLowerCase();
            let visiveis = 0;

            linhas.forEach((linha) => {
                const combina = linha.textContent.toLowerCase().includes(termo)
                    && (!filtro.value || linha.dataset.status === filtro.value);
                linha.hidden = !combina;
                if (combina) visiveis++;
            });

            semResultados.hidden = visiveis > 0;
        }

        busca.addEventListener('input', filtrar);
        filtro.addEventListener('change', filtrar);
        document.querySelector('.busca').addEventListener('submit', (e) => e.preventDefault());
  