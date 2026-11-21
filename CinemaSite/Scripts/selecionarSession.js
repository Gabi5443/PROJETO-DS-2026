
const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Session`;

const parametros = new URLSearchParams(window.location.search); //localizador de parametros
const idFilme = parametros.get("id"); // o parametro a aser localizado é o id

async function carregarSessoes() { //função assincrona para carregar as sessões disponniveis áquele filme
    try {
        // Busca todas as sessões
        const resposta = await fetch(API_URL); // quarda a resposta da requisição em uma const

        if (!resposta.ok) {
            throw new Error("Erro ao buscar sessões."); // se a resposta for negativa à "ok" exibe uma mensagem de erro
        }

        const sessoes = await resposta.json(); //transforma a mensagem em json

        // Filtra somente as sessões do filme selecionado
        const sessoesFilme = sessoes.filter(
            session => Number(session.idMovieFk) === Number(idFilme) //se o campo da tabela session "idMovieFk" for igual ao id do filme que foi trazido como parametro da pagina de detalhe, a sesssao é armazenada como sessoesFilme. (quer dizer que a sessão contempla o fime escolhido)
        );

        // Busca as salas
        const respostaSalas = await fetch(`${API_BASE}/api/Room`); // chama o list all de salas e guarda em uma const
        const salas = await respostaSalas.json(); /// transforma em json

        const listaSessoes = document.getElementById("listaSessoes"); //aploca o eemento html cujo id é igual ao que esta entre parenteses

        listaSessoes.innerHTML = ""; // e aplica dentro dele um código html (no caso, vazio)

        if (sessoesFilme.length === 0) { //se a lista de sessões qe corresponem ao filme estiver vazia
            listaSessoes.innerHTML = "<p>Nenhuma sessão disponível.</p>"; // avisa ao usuario por meio de uma mensagem
            return;
        }

        // Cria um card para cada sessão
        sessoesFilme.forEach(session => { //lalo de repetição
        //para cada sessão correspondente ao filme escolhido

            // Procura a sala correspondente à sessão
            const sala = salas.find( //  "achador  -> se o idroom da tabela room bater com a foreign key idroomfk da tabela session, a const sala recebe as salas correspondentes a cada sessão"            
                 room => Number(room.idRoom) === Number(session.idRoomFk) 
            );

            const data = new Date(session.showTimeSession); //a data da sessão é armazenada em uma const

            const dataFormatada = data.toLocaleDateString("pt-BR"); //tal data é formatada posteriormente
            const horarioFormatado = data.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            }); //tal como o horário

            const card = document.createElement("div"); //cria um elemto html do tipo div

card.classList.add("card-sessao"); //adiciona uma classe a essa div

//aplica a essa div o seguinte valor html
card.innerHTML = ` 
    <h3>${dataFormatada}</h3>

    <div class="info-sessao">
        <span>Horário</span>
        <strong>${horarioFormatado}</strong>
    </div>

    <div class="info-sessao">
        <span>Sala</span>
        <strong>${sala ? sala.nameRoom : "Não encontrada"}</strong>
    </div>

    <div class="info-sessao">
        <span>Preço</span>
        <strong>R$ ${Number(session.priceSession).toFixed(2)}</strong>
    </div>

    <button class="btn-assentos"
        onclick="selecionarAssentos(${session.idSession})">
        Escolher assentos
    </button>
`;

listaSessoes.appendChild(card);
        }); //coloca uma coisa dentro da outra

    } catch (erro) {
        console.error(erro);
    }
}//se o bloco de gratament de erros achar algo, exibe o errp

// Redireciona para a seleção de assentos a partir do botão criado acima cujo possui uum ocvlicl que chama essa função
function selecionarAssentos(idSession) {
    window.location.href = `selecionarAssentos.html?id=${idSession}`;
}

carregarSessoes();