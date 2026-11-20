const API_BASE = "http://localhost:5252"; //coloca o endereço da api em uma varável que não será reatribuida (const)
const API_URL = `${API_BASE}/api/Movie`; //define a url da api como o endereço + api/o nome da endpoint responsável pelos filmes (requisição)



// 2. LISTAGEM NA TABELA (listarMovies.html)
const gridBody = document.getElementById("GridFilmes"); //adiciona a uma variavel o elemento html cujo id é igual ao que esta entre parenteses
if (gridBody) { // se essa variavel existir
    carregarFilmes(); //carrega tal função
}


//Qual função? Essa aqui:

async function carregarFilmes() { //cria uma função assincrona (função que espera a conclusão de uma operação demorada para dar retorno). Ela permite com que o sistema continue carregando outras coisas enquanto aguarda uma resposta para sí
    try { // cria um bloco de erro
        const resposta = await fetch(API_URL); // atribui a requisição http mandada à api denro de uma variável
        if (!resposta.ok) throw new Error("Não foi possível carregar os filmes."); // se a resposta não for bem sucedida, retorna um objeto de erro com uma mensagem

        const filmes = await resposta.json(); // transforma o conteúdo da variável de resposta em uma array em json

        if (filmes.length === 0) { // se essa array estiver vazia (com zero atribuições a essa lista)
            gridBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum filme cadastrado.</td></tr>`;
            return; //retorna um elemento html com uma mensagem
        }

        gridBody.innerHTML = "";//limpa o conteúdo da tabela

        filmes.forEach(filme => { //laçõ de repetição do elemento
             const urlImagem = filme.photoMovie 
                ? `${API_BASE}${filme.photoMovie}` 
                : `${API_BASE}/uploads/movies/default.jpg`;
           // adiciona a url de uma imagem a uma variável

            const card = document.createElement("div"); //cria variavel "linha cujo o valor é literalmente uma tag de linha em uma tabela em html}${"
            card.classList.add("cardFilme"); // Boa prática para estilizar via CSS
            //define o conteúdo que será inserido nessa linha
            card.innerHTML = ` 
            <div class = "card">
                <img src="${urlImagem}" alt="${filme.titleMovie}" class="foto-filme">
                
                </div>
                <div class ="title"> ${filme.titleMovie} </div>
            `;
            const filmeId = filme.idMovie ?? filme.IdMovie;

            // Adiciona o evento de clique no card
            card.addEventListener('click', () => {
                // Redireciona para a página de detalhes enviando o ID na URL
                window.location.href = `detalhes.html?id=${filmeId}`;
            });
           

            gridBody.appendChild(card);   //adiciona um elemento dentro do outro
        
        });
    } catch (erro) { // fechamento do try 
        console.error(erro);
        gridBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #e92f3b;">Erro: ${erro.message}</td></tr>`;
    }// captura um erro dentro desse try e mostra uma mensagem 
}