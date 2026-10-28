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

        const descricao = document.getElementById('descricao');
        const contador = document.getElementById('contador');
        const atualizarContador = () => { contador.textContent = descricao.value.length + '/500'; };

        descricao.addEventListener('input', atualizarContador);
        document.querySelector('form').addEventListener('reset', () => setTimeout(atualizarContador));