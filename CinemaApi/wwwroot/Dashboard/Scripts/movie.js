console.log("ARQUIVO MOVIE.JS FOI CARREGADO!");
const API_BASE = "http://localhost:5252"; //coloca o endereço da api em uma varável que não será reatribuida (const)
const API_URL = `${API_BASE}/api/Movie`; //define a url da api como o endereço + api/o nome da endpoint responsável pelos filmes (requisição)

// 1. CADASTRO DE FILME (CreateMovie.html)
const formCreate = document.getElementById("CreateMovie"); //adiciona o elemento cujo id é igual ao que esta entre parenteses que vem de document (document representa o html) em uma variável 
console.log("Formulário encontrado:", formCreate);
if (formCreate) { // se a variavel existir, executa o que está dentro das chaves
    formCreate.addEventListener("submit", async (event) => { //adiciona um evento a um elemento cujo id é o que está entre parenteses
        console.log("EVENTO SUBMIT EXECUTADO!");
        event.preventDefault(); //previne que o navegador execute o comportamento padrão daquele elemento (ex: se o elemento que esta sendo modificado for uma tag de botão, essa função impede que depois de acionado a pagina reinicie, o que é padrão)
        const dados = new FormData(event.target); //a variavel dados será preenchida com um novo objeto de coleta de dados que recebe por parametro os dados enviados após o paramentro evento definido acima

        try { //inicia um bloco de tratamento de erros, caso aconteça algum erro o catch o captura
            const resposta = await fetch(API_URL, { // uma variavel recebe a resposta de uma requisição http enviada para a  api (representada pela url). Essa variavel espera a resposta chegar antes de continuar o try
                method: "POST", //define  tal requisição como post (criação)
                body: dados // define o conteudo enviado na requisição
            });

            const resultado = await resposta.json();  //converte o conteúdo da variavel como um objeto java script
            if (!resposta.ok) throw new Error(resultado.message); // se a resposta foi mal sucedida: diferente de status http: entre 200 e 299, cria um objeto de erro utilizando a mensagem mandada pela api

            alert(resultado.message);  // exibe uma janela de alerta com essa mensagem de erro
            console.log("CHEGOU AQUI: vai redirecionar!");

          window.location.replace("/Dashboard/ListarPages/listarMovies.html");
        } catch (erro) { // captura qualquer erro do try
            console.error(erro);
            alert("Erro ao cadastrar filme: " + erro.message); //exibe o erro na web
        }
    });
}

// 2. LISTAGEM NA TABELA (listarMovies.html)
const tabelaBody = document.getElementById("lista-filmes"); //adiciona a uma variavel o elemento html cujo id é igual ao que esta entre parenteses
if (tabelaBody) { // se essa variavel existir
    carregarFilmes(); //carrega tal função
}


//Qual função? Essa aqui:

async function carregarFilmes() { //cria uma função assincrona (função que espera a conclusão de uma operação demorada para dar retorno). Ela permite com que o sistema continue carregando outras coisas enquanto aguarda uma resposta para sí
    try { // cria um bloco de erro
        const resposta = await fetch(API_URL); // atribui a requisição http mandada à api denro de uma variável
        if (!resposta.ok) throw new Error("Não foi possível carregar os filmes."); // se a resposta não for bem sucedida, retorna um objeto de erro com uma mensagem

        const filmes = await resposta.json(); // transforma o conteúdo da variável de resposta em uma array em json

        if (filmes.length === 0) { // se essa array estiver vazia (com zero atribuições a essa lista)
            tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum filme cadastrado.</td></tr>`;
            return; //retorna um elemento html com uma mensagem
        }

        tabelaBody.innerHTML = "";//limpa o conteúdo da tabela

        filmes.forEach(filme => { //laçõ de repetição do elemento
             const urlImagem = `${API_BASE}${filme.photoMovie}`; 
           // adiciona a url de uma imagem a uma variável

            const linha = document.createElement("tr"); //cria variavel "linha cujo o valor é literalmente uma tag de linha em uma tabela em html"

            //define o conteúdo que será inserido nessa linha
            linha.innerHTML = ` 
                <td>${filme.titleMovie}</td> 
                <td>${filme.synopsisMovie}</td>
                <td>${filme.durationMovie} min</td>
                <td>${filme.genreMovie}</td>
                <td>${filme.ageRatingMovie} anos</td>
                <td><img src="${urlImagem}" alt="${filme.titleMovie}" class="foto-filme"></td>
                <td>
                    <div class="botoes">
                        <a href="../EditarPages/EditarMovie.html?id=${filme.idMovie}" class="botaoAlter">Alterar</a>
                        <div class="botaoDelete" onclick="deletarFilme(${filme.idMovie})">Deletar</div>
                    </div>
                </td>
            `;

            tabelaBody.appendChild(linha);//adiciona um elemento dentro do outro
        });
    } catch (erro) { // fechamento do try 
        console.error(erro);
        tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #e92f3b;">Erro: ${erro.message}</td></tr>`;
    }// captura um erro dentro desse try e mostra uma mensagem 
}

// 3. EDIÇÃO DE FILME (EditMovie.html)
const formEdit = document.getElementById("EditarMovie"); //atribui o elemento vujo id é igual ao que esta entre parenteses a uma variável
if (formEdit) { //se essa variavel existir
    // Pega o ID que veio na URL (ex: ?id=3)
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    // Busca os dados atuais do filme para preencher os inputs
    async function carregarDadosParaEdicao() { //cria uma função assincrona
        try { // cria um bloco de verificação de erro
            const resposta = await fetch(`${API_URL}/${movieId}`); // atribui a uma variável a requisição mandada para a url
            if (!resposta.ok) throw new Error("Filme não encontrado.");// se não sucedido: objeto de erro com mensagem

            const filme = await resposta.json();// transforma a resposta em json
            // Capura todos os elementos pelos ids e preenche a api 
            document.getElementById("TitleMovie").value = filme.titleMovie;
            document.getElementById("SynopsisMovie").value = filme.synopsisMovie;
            document.getElementById("DurationMovie").value = filme.durationMovie;
            document.getElementById("GenreMovie").value = filme.genreMovie;
            document.getElementById("AgeRatingMovie").value = filme.ageRatingMovie;
            document.getElementById("PreviewFoto").src = `${API_BASE}${filme.photoMovie}`;
        } catch (erro) {
            alert("Erro ao carregar filme: " + erro.message);
        }
    }

    carregarDadosParaEdicao();

    // Envia as alterações (PUT) quando clicar em Salvar
    formEdit.addEventListener("submit", async (event) => {
        event.preventDefault();

        // O FormData captura automaticamente todos os campos com atributo "name",
        // incluindo o arquivo se o usuário tiver selecionado algum
        const dados = new FormData(event.target);

        try {
            const resposta = await fetch(`${API_URL}/${movieId}`, { // captura a requisição
                method: "PUT", //define o método como post
                body: dados // define os valores enviados como dados
            });

            const resultado = await resposta.json(); // tranforma o resiltado em json
            if (!resposta.ok) throw new Error(resultado.message); // caso der erro crie um objeto de erro

            alert(resultado.message);
            window.location.href = "../ListarPages/listarMovies.html"; //e crie um alerta na pagina definida
        } catch (erro) {
            alert("Erro ao atualizar: " + erro.message);
        }
    });
}

// 4. EXCLUSÃO DE FILME
async function deletarFilme(id) { // cria uma função assincrona
    if (!confirm("Tem certeza que deseja excluir este filme?")) return; // se o usuario confirmar a exclusão

    try { //cria um boco de tratamento de erros
        const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" }); //atribui a requisiçãoe  o método para a api a uma const
        const resultado = await resposta.json(); //transforma isso em json
        if (!resposta.ok) throw new Error(resultado.message);//se a resposta não for bem sucedida cria um objeto de erro

        alert(resultado.message); // e carrega uma mensagem
        carregarFilmes(); //senão, opera a função
    } catch (erro) {
        alert("Erro ao excluir: " + erro.message);
    }
}


