// Redirecionar para os detalhes do lote específico
const botoesDetalhes = document.querySelectorAll(".detalhes");
botoesDetalhes.forEach((botaoDetalhe, idx) => {
    botaoDetalhe.addEventListener("click", () => {
        const idLote = botaoDetalhe.dataset.id || String(idx + 1);
        window.location.href = `detalhes-do-lote.html?id=${encodeURIComponent(idLote)}`;
    });
});