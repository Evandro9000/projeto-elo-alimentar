
// Imagem cinza usada quando a doação não tem foto
const FOTO_PADRAO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="#e5e7eb"/></svg>'
  );

function dataCompleta(valor = "") {
  const m = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

document.addEventListener("DOMContentLoaded", () => {

  // 1. Recupera e verifica o token
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Acesso negado. Faça login para continuar.");
    window.location.href = "login.html";
    return;
  }

  let usuario;

  try {
    // 2. Separa as partes do JWT
    const partes = token.split(".");

    if (partes.length !== 3 || !partes[1]) {
      throw new Error("Formato de token inválido.");
    }

    // 3. Decodifica o Payload
    const payloadBase64 = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const base64Completo = payloadBase64.padEnd(
      Math.ceil(payloadBase64.length / 4) * 4,
      "="
    );

    const bytes = Uint8Array.from(
      atob(base64Completo),
      c => c.charCodeAt(0)
    );

    const payloadJson = new TextDecoder().decode(bytes);
    usuario = JSON.parse(payloadJson);

    console.log("Usuário autenticado:", usuario.name);
    console.log("Perfil:", usuario.role);

  } catch (error) {
    console.error("Token inválido:", error);
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  // 4. Confere se o usuário é uma empresa
  if (usuario.role !== "empresa") {
    alert("Acesso permitido apenas para empresas.");
    window.location.href = "login.html";
    return;
  }

  // 5. Exibe o nome do usuário, caso exista o elemento
  const elementoNome = document.getElementById("nome-usuario");

  if (elementoNome) {
    elementoNome.textContent = usuario.name;
  }

  // 6. Elementos do dashboard
  const totalEl = document.getElementById("total-doacoes");
  const ongsEl = document.getElementById("ongs-atendidas");
  const coletaEl = document.getElementById("em-coleta");

  const listaEl =
    document.getElementById("lista-coletas") ||
    document.getElementById("todas-coletas");

  if (!totalEl && !ongsEl && !coletaEl && !listaEl) return;

  async function desenhar() {
    const lista = await Elo.listar();

    if (totalEl) {
      const kg = lista.reduce(
        (soma, d) => soma + Elo.quantidadeEmKg(d.quantidade),
        0
      );

      totalEl.textContent = `${kg.toLocaleString("pt-BR")}KG`;
    }

    if (ongsEl) {
      const ongs = new Set(
        lista.filter(d => d.ong).map(d => d.ong)
      );

      ongsEl.textContent = ongs.size;
    }

    if (coletaEl) {
      coletaEl.textContent = lista.filter(
        d => d.status === "coleta"
      ).length;
    }

    if (listaEl) {
      // Remove os itens antigos, preservando o link "Ver todas"
      listaEl.querySelectorAll(
        ".collection-item, .vazio"
      ).forEach(el => el.remove());

      const ultimas = lista.slice(0, 4);

      const html = ultimas.length
        ? ultimas
            .map(d => {
              const foto =
                d.imagens && d.imagens[0]
                  ? d.imagens[0]
                  : FOTO_PADRAO;

              return `
                <article class="collection-item">
                  <img
                    src="${Elo.escapeHtml(foto)}"
                    alt="${Elo.escapeHtml(d.produto)}"
                  >
                  <div class="collection-info">
                    <h3>${Elo.escapeHtml(d.produto)}</h3>
                    <p>
                      ${Elo.escapeHtml(d.categoria)}
                      - val.: ${dataCompleta(d.validade)}
                    </p>
                  </div>
                </article>`;
            })
            .join("")
        : `<p class="vazio">Nenhuma coleta ainda.</p>`;

      const link = listaEl.querySelector(".view-all");

      if (link) {
        link.insertAdjacentHTML("beforebegin", html);
      } else {
        listaEl.insertAdjacentHTML("beforeend", html);
      }
    }
  }

  Elo.aoMudar(desenhar);
  desenhar();
});
