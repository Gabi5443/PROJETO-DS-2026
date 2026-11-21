
const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Movie`;

// 1. Pega o ID da URL (ex: detalhes.html?id=1 -> pega "1")
const params = new URLSearchParams(window.location.search);
const filmeId = params.get('id'); // Define a variável filmeId com o valor que vier depois de id= na URL

// Função responsável por formatar a duração do filme
function formatarDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas === 0) {
        return `${minutosRestantes} min`;
    }

    if (minutosRestantes === 0) {
        return `${horas}h`;
    }

    return `${horas}h ${minutosRestantes}min`;
}


// 2. Busca os detalhes do filme na API
async function carregarDetalhes() {
    if (!filmeId) { // Se o ID não vier na URL
        document.getElementById('detalhe-filme').innerHTML = '<p>Filme não encontrado.</p>'; // Retorna uma mensagem de erro
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${filmeId}`); // A resposta da requisição à API é atribuída à variável resposta

        if (!resposta.ok) {
            throw new Error("Não foi possível encontrar o filme.");
        }

        const filme = await resposta.json(); // Transforma a resposta da API em um objeto JavaScript

        mostrarDetalhes(filme); // Chama a função responsável por mostrar os detalhes do filme

    } catch (erro) {
        console.error('Erro ao buscar detalhes:', erro); // Mostra a mensagem de erro no console
        document.getElementById('detalhe-filme').innerHTML = '<p>Erro ao carregar os detalhes do filme.</p>';
    }
}


// 3. Mostra os detalhes do filme
function mostrarDetalhes(filme) { // A função recebe o objeto filme como parâmetro
    const container = document.getElementById('detalhe-filme');

    const urlImagem = `${API_BASE}${filme.photoMovie}`; // A URL da foto do filme é armazenada

    const duracaoFormatada = formatarDuracao(filme.durationMovie); // Formata a duração do filme

    // O container recebe um código HTML com o conteúdo da página, mostrando a foto, o título, a duração e a sinopse
    container.innerHTML = `
        <div class="conteudo-detalhe">
            <img class="poster-detalhe" src="${urlImagem}" alt="${filme.titleMovie}">

            <div class="info-detalhe">
                <h1>${filme.titleMovie}</h1>
                <p class="meta-info">${duracaoFormatada} • ${filme.genreMovie}</p>
                <h3>Sinopse</h3>
                <p class="sinopse">${filme.synopsisMovie || 'Sinopse não disponível.'}</p>

                <button class="btn-comprar" id="comprarIngresso">
                    Comprar ingresso
                </button>
            </div>
        </div>
    `;

    // Adiciona um evento ao botão de comprar ingresso
    document.getElementById("comprarIngresso").addEventListener("click", () => {
        window.location.href = `selecionarSession.html?id=${filme.idMovie}`; // Redireciona para a página de seleção de sessões levando o ID do filme como parâmetro
    });
}

carregarDetalhes(); // Chama a função para buscar e mostrar os detalhes do filme
