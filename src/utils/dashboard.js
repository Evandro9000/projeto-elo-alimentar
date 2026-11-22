
// Imagem cinza usada quando a doação não tem foto
const FOTO_PADRAO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="#e5e7eb"/></svg>'
  );

// "2026-09-20" -> "20/09/2026"
function dataCompleta(valor = "") {
  const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

document.addEventListener("DOMContentLoaded", () => {
  const totalEl = document.getElementById("total-doacoes");
  const ongsEl = document.getElementById("ongs-atendidas");
  const coletaEl = document.getElementById("em-coleta");
  const listaEl = document.getElementById("lista-coletas") || document.getElementById("todas-coletas");
  if (!totalEl && !ongsEl && !coletaEl && !listaEl) return;

  async function desenhar() {
    const lista = await Elo.listar();

    if (totalEl) {
      const kg = lista.reduce((soma, d) => soma + Elo.quantidadeEmKg(d.quantidade), 0);
      totalEl.textContent = `${kg.toLocaleString("pt-BR")}KG`;
    }

    if (ongsEl) {
      const ongs = new Set(lista.filter((d) => d.ong).map((d) => d.ong));
      ongsEl.textContent = ongs.size;
    }

    if (coletaEl) {
      coletaEl.textContent = lista.filter((d) => d.status === "coleta").length;
    }

    if (listaEl) {
      // remove os itens antigos, mas preserva o link "Ver todas"
      listaEl.querySelectorAll(".collection-item, .vazio").forEach((el) => el.remove());

      const ultimas = lista.slice(0, 4);
      const html = ultimas.length
        ? ultimas
            .map((d) => {
              const foto = d.imagens && d.imagens[0] ? d.imagens[0] : FOTO_PADRAO;
              return `
                <article class="collection-item">
                  <img src="${Elo.escapeHtml(foto)}" alt="${Elo.escapeHtml(d.produto)}">
                  <div class="collection-info">
                    <h3>${Elo.escapeHtml(d.produto)}</h3>
                    <p>${Elo.escapeHtml(d.categoria)} - val.: ${dataCompleta(d.validade)}</p>
                  </div>
                </article>`;
            })
            .join("")
        : `<p class="vazio">Nenhuma coleta ainda.</p>`;

      const link = listaEl.querySelector(".view-all");
      if (link) link.insertAdjacentHTML("beforebegin", html);
      else listaEl.insertAdjacentHTML("beforeend", html);
    }
  } // <-- fecha a função desenhar (era isto que faltava)

  Elo.aoMudar(desenhar); // atualiza se algo mudar em outra aba
  desenhar();
});
