const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Movie`;

// 1. Pega o ID da URL (ex: detalhes.html?id=1 -> pega "1")
const params = new URLSearchParams(window.location.search);
const filmeId = params.get('id'); //define a variavel filmeId o valor que que vier depois de id= na url




// 2. Busca os detalhes do filme na API
async function carregarDetalhes() {
  if (!filmeId) { // se o id não vier
    document.getElementById('detalhe-filme').innerHTML = '<p>Filme não encontrado.</p>'; //retorna uma msg de erro
    return;
  }

  try {
   
    const resposta = await fetch(`${API_URL}/${filmeId}`); // A resposta da requisição à api (que tambem deve mandar o is do filme) vai ser atribuido á variável resposta
    const filme = await resposta.json(); //transforma a resposta em json

    mostrarDetalhes(filme); //se dentro do try ele achar algum erro (try é um laço de tratamento de erros)
  } catch (erro) {
    console.error('Erro ao buscar detalhes:', erro); //mostra a mensagem de erro
  }
}




// 3
function mostrarDetalhes(filme) { // a função de mostrar os detalhes virá a partr do elemento html cujo id é o nome entre parenteses
  const container = document.getElementById('detalhe-filme');

  
  const urlImagem = `${API_BASE}${filme.photoMovie}`; //a foto do filme é armazenada
//o container acima aplicará um cód html com oconteudo da pagina (mostrando as foto, o titulo, a duração e a sinopse)
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

carregarDetalhes(); //chama a função


const parametros = new URLSearchParams(window.location.search); //localizar do parametros
const idFilme = parametros.get("id");  //o parametro a ser encontrado é o id

document.getElementById("comprarIngresso").addEventListener("click", () => { //adicione ume vento ao elemento html cujo id é igual á comprar ingresso
    window.location.href = `selecionarSession.html?id=${idFilme}`; //o evento é um on click que nos levará à pagina selecionarSession.html levando o id como parametro
});
