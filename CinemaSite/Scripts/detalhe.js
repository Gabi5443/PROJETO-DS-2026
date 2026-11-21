const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Movie`;

// 1. Pega o ID da URL (ex: detalhes.html?id=1 -> pega "1")
const params = new URLSearchParams(window.location.search);
const filmeId = params.get('id');




// 2. Busca os detalhes do filme na API
async function carregarDetalhes() {
  if (!filmeId) {
    document.getElementById('detalhe-filme').innerHTML = '<p>Filme não encontrado.</p>';
    return;
  }

  try {
    // Corrigido: usando filmeId em vez de movieId
    const resposta = await fetch(`${API_URL}/${filmeId}`);
    const filme = await resposta.json();

    mostrarDetalhes(filme);
  } catch (erro) {
    console.error('Erro ao buscar detalhes:', erro);
  }
}




// 3. Monta o HTML estilo Ingresso.com na tela
function mostrarDetalhes(filme) {
  const container = document.getElementById('detalhe-filme');


   

  
  // A urlImagem fica aqui dentro, onde "filme" já existe
  const urlImagem = `${API_BASE}${filme.photoMovie}`;

  container.innerHTML = `
    <div class="conteudo-detalhe">
      <img class="poster-detalhe" src="${urlImagem}" alt="${filme.titleMovie}">
      
      <div class="info-detalhe">
        <h1>${filme.titleMovie}</h1>
        <p class="meta-info">${filme.durationMovie} min • ${filme.genreMovie}</p>
        <h3>Sinopse</h3>
        <p class="sinopse">${filme.synopsisMovie || 'Sinopse não disponível.'}</p>
      </div>
    </div>
  `;
}

carregarDetalhes();


const parametros = new URLSearchParams(window.location.search);
const idFilme = parametros.get("id");

document.getElementById("comprarIngresso").addEventListener("click", () => {
    window.location.href = `selecionarSession.html?id=${idFilme}`;
});
