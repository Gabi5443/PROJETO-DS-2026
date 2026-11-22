
const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Session`;

// 1. CADASTRO DE SESSÃO
const formCreate = document.getElementById("CreateSession"); //adiciona o elemento cujo id é igual ao q esta entre parentese s numa const

if (formCreate) { // se a const existir, carrega as funções abaixo
    carregarFilmes();
    carregarSalas();

    formCreate.addEventListener("submit", async (event) => { //cria um evento, quando o elemto html submit for clicado, ativa o preventDefault = função para evitar q o botão faça o que é definido por padrão (atualizar a pagina)
     
        event.preventDefault();

        const formulario = event.target; // a const formulario q vai carregar o evento

        const dados = {
            ShowTimeSession: `${formulario.dataSession.value}T${formulario.timeSession.value}:00`,
            PriceSession: parseFloat(formulario.PriceSession.value),
            idMovieFk: parseInt(formulario.idMovieFk.value),
            idRoomFk: parseInt(formulario.idRoomFk.value)
        }; //define uma const com todos esses dados (formatados). Esses dados são um objeto jS até aqui

        try { //tratamento de erros
            const resposta = await fetch(API_URL, { //chama a função que contem o método post da controller
                method: "POST",
                headers: {
                    "Content-Type": "application/json" //avisa a controller que os dados enviados serão do tipo jso
                },
                body: JSON.stringify(dados) //esse é o conteúdo propriamente dito. Antes de ser enviado "dados" é transformado em json
            });

            const resultado = await resposta.json(); //guarda a resposta

            if (!resposta.ok) throw new Error(resultado.message); //se a resposta for diferente de ok, cria um erro obj

            alert(resultado.message); //mostra uma msg de erro
            event.target.reset(); //e reseta o evento

        } catch (erro) {
            console.error(erro);
            alert("Erro ao cadastrar sessão: " + erro.message);
        }//se o tratamento de erros captorou algo, mostra os erros
    });


}

const tabelaBody = document.getElementById("lista-sessoes"); //o conteudo do elemento cujo id é igual ao que esta dentro dos parenteses será armazenado por uma variável

if (tabelaBody) { //se esse conteudo existir
    carregarSession(); //carrega essa função
}

//qual função? Essa aqui!
async function carregarFilmes() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Movie`);//chama a get all de movies

        if (!resposta.ok) { //se a resposta for diferente de ok, carrega um erro
            throw new Error("Não foi possível carregar os filmes.");
        }

        const filmes = await resposta.json();//transforma a resp em json

        const selectFilmes = document.getElementById("idMovieFk"); //o elemnto html cujo possui esse id será atribuido a essa const

        filmes.forEach(filme => { //para cada filme do get all
            const option = document.createElement("option"); //atribua o elemto html cujo tem o id igual a option a uma const

            option.value = filme.idMovie; //essa const receberá o id do filme
            option.textContent = filme.titleMovie; // e mostra-la o nome dele

            selectFilmes.appendChild(option); //coloca as options dentro do select
        });

    } catch (erro) {
        console.error(erro);
    } //mostra possiveis erros
}

// 3. CARREGAR SALAS NO SELECT
async function carregarSalas() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Room`); //chama o get all de rooms

        // tratamento de erros
        if (!resposta.ok) {  //se a resposta for diferente de ok, carrega um erro
            throw new Error("Não foi possível carregar as salas.");
        }

        const salas = await resposta.json(); //traansforma a resp em json

        const selectSalas = document.getElementById("idRoomFk");

        salas.forEach(sala => { //para cada sala do get all
            const option = document.createElement("option");  //atribua o elemto html cujo tem o id igual a option a uma const

            option.value = sala.idRoom; //essa const receberá o id da sala
            option.textContent = sala.nameRoom; //e seu nome

            selectSalas.appendChild(option);
        });

    } catch (erro) {
        console.error(erro); //mostra possiveis erros
    }
}




async function carregarSession() {
    try {
        // Busca as sessões
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {  //se a resposta for diferente de ok, carrega um erro
            throw new Error("Não foi possível carregar as sessões.");
        }

        const sessions = await resposta.json(); //traansforma a resp em json

        // Busca os filmes
        const respostaFilmes = await fetch(`${API_BASE}/api/Movie`);

        if (!respostaFilmes.ok) {  //se a resposta for diferente de ok, carrega um erro
            throw new Error("Não foi possível carregar os filmes.");
        }

        const filmes = await respostaFilmes.json(); //traansforma a resp em json

        // Busca as salas
        const respostaSalas = await fetch(`${API_BASE}/api/Room`);

        if (!respostaSalas.ok) {  //se a resposta for diferente de ok, carrega um erro
            throw new Error("Não foi possível carregar as salas.");
        }

        const salas = await respostaSalas.json(); //traansforma a resp em json

        if (sessions.length === 0) { // se o tamanho da array de sessions for igual a zero. mostra a seguinte linha na tabela
            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">
                        Nenhuma sessão cadastrada.
                    </td>
                </tr>
            `;
            return;
        }

        tabelaBody.innerHTML = "";

        sessions.forEach(session => { //para cada sessao na arrau sessions

            // Procura o filme que possui o mesmo ID da FK -> na tabela session tem um fk de movie, se essa fk bater com o id do filme buscado o get all, o filme é correspondente a session
            const filme = filmes.find(f => f.idMovie === session.idMovieFk);

            // Procura a sala que possui o mesmo ID da FK -> na tabela session tem um fk de room, se essa fk bater com o id da sala buscada pelo  get all,  a sala é correspondente a session
            const sala = salas.find(s => s.idRoom === session.idRoomFk);

            const linha = document.createElement("tr");

            const dataFormatada = new Date(session.showTimeSession).toLocaleString("pt-BR"); //formata o horario

            linha.innerHTML = `
                <td>${dataFormatada}</td>
                <td>R$ ${session.priceSession}</td>
                <td>${filme ? filme.titleMovie : "Filme não encontrado"}</td>
                <td>${sala ? sala.nameRoom : "Sala não encontrada"}</td>

                <td>
                    <div class="botoes">
                        <a href="../EditarPages/EditarSession.html?id=${session.idSession}"
                           class="botaoAlter">
                            Alterar
                        </a>

                        <div class="botaoDelete"
                             onclick="deletarSession(${session.idSession})">
                            Deletar
                        </div>
                    </div>
                </td>
            `;

            tabelaBody.appendChild(linha);
        });

    } catch (erro) {
        console.error(erro); //mostra possiveis erros

        tabelaBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #e92f3b;">
                    Erro: ${erro.message}
                </td>
            </tr>
        `;
    }
}



// 4. ALTERAR SESSÃO

const formEdit = document.getElementById("EditSession"); //o conteudo do elemento cujo id é igual ao que esta dentro dos parenteses será armazenado por uma const

if (formEdit) {
    const parametros = new URLSearchParams(window.location.search); //achador de parametros na url
    const id = parametros.get("id");// o parametro a ser encontrado é o id

    carregarDadosSession(id); //função

    formEdit.addEventListener("submit", async (event) => {
        event.preventDefault(); //previne que ao submitar a tela se atualize

        const formulario = event.target; //essa const que receberá um evento

        const dados = {
            ShowTimeSession: `${formulario.elements["dataSession"].value}T${formulario.elements["timeSession"].value}:00`,
            PriceSession: parseFloat(formulario.elements["PriceSession"].value),
            idMovieFk: parseInt(formulario.elements["idMovieFk"].value),
            idRoomFk: parseInt(formulario.elements["idRoomFk"].value)
        }; //coloca tudo isso na const de dados

        try {
            const resposta = await fetch(`${API_URL}/${id}`, { //chama o método edit da controller
                method: "PUT",
                headers: {
                    "Content-Type": "application/json" //avisa que os dados vão em json
                },
                body: JSON.stringify(dados) //converte em json os dados 
            });

            const resultado = await resposta.json(); //converte a resp em json

            if (!resposta.ok) {  //se a resposta for diferente de ok, carrega um erro
                throw new Error(resultado.message);
            }

            alert(resultado.message); //mostra  a msg de resultado na listarsession page
            window.location.href = "../ListarPages/ListarSession.html";

        } catch (erro) {  //se achou algum erro, carrega um erro
            console.error(erro);            
            alert("Erro ao alterar sessão: " + erro.message);
        }
    });
}

// CARREGAR DADOS DA SESSÃO

async function carregarDadosSession(id) {
    try {
        // Busca a sessão
        const resposta = await fetch(`${API_URL}/${id}`);

        if (!resposta.ok) {
            throw new Error("Não foi possível encontrar a sessão.");
        }

        const session = await resposta.json();

        // Carrega filmes e salas
        const respostaFilmes = await fetch(`${API_BASE}/api/Movie`);
        const filmes = await respostaFilmes.json();

        const respostaSalas = await fetch(`${API_BASE}/api/Room`);
        const salas = await respostaSalas.json();

        const selectFilmes = document.getElementById("idMovieFk");
        const selectSalas = document.getElementById("idRoomFk");

        // Preenche o select de filmes
        filmes.forEach(filme => {
            const option = document.createElement("option");
            option.value = filme.idMovie;
            option.textContent = filme.titleMovie;
            selectFilmes.appendChild(option);
        });

        // Preenche o select de salas
        salas.forEach(sala => {
            const option = document.createElement("option");
            option.value = sala.idRoom;
            option.textContent = sala.nameRoom;
            selectSalas.appendChild(option);
        });

        // Preenche os campos com os dados atuais
        const dataHora = session.showTimeSession;

        document.getElementById("dataSession").value = dataHora.substring(0, 10);
        document.getElementById("timeSession").value = dataHora.substring(11, 16);
        document.getElementById("PriceSession").value = session.priceSession;
        selectFilmes.value = session.idMovieFk;
        selectSalas.value = session.idRoomFk;

    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar sessão: " + erro.message); //mostra possiveis erros
    }
}


// 5. DELETAR SESSÃO

async function deletarSession(id) {

    if (!confirm("Tem certeza que deseja excluir esta sessão?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.message);
        }

        alert(resultado.message);

        // Atualiza a tabela
        carregarSession();

    } catch (erro) {
        console.error(erro);
        alert("Erro ao excluir sessão: " + erro.message); //mostra possiveis erros
    }
}