const API_BASE = "http://localhost:5252"; //coloca o endereço da api em uma variavel que não será reatribuida (const)

async function carregarTotalFilmes() {
    try { //bloco de tratamento de erros
        const resposta = await fetch(`${API_BASE}/api/Movie`); //chama a endpoint get all da moivie controller

        if (!resposta.ok) { //se a resposta for diferente de ok joga um erro na sua cara
            throw new Error("Erro ao buscar filmes.");
        }

        const filmes = await resposta.json(); //transforma a resposta em uma array em json

        document.getElementById("MoviesDash").textContent = filmes.length; //no elemeto html cujo id é igua a "MoviesDash" acrescenta o valor do tamanho da array em json contendo a resposta da requisição get all

    } catch (erro) { // se encontrou algum erro pelo caminho, mostra pelo console log
        console.error(erro);
    }
}

carregarTotalFilmes(); //chama a function



async function carregarTotalUsers() { 
    try {
        const resposta = await fetch(`${API_BASE}/api/Users`); //chama a getAll de user e coloca em uma variavel resposta

        if (!resposta.ok) { //se a resposta for diferente de ok, joga um erro pra vc
            throw new Error("Erro ao buscar os usuários.");
        }

        const users = await resposta.json(); //transforma a resposta em uma array em json

        document.getElementById("UsersDash").textContent = users.length; //no elemeto html cujo id é igua a "UserDash" acrescenta o valor do tamanho da array em json contendo a resposta da requisição get all

    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalUsers();



async function carregarTotalTickets() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Ticket`); //chama a getAll de ticket e coloca em uma variavel resposta

        if (!resposta.ok) { //se a resposta for diferente de ok, joga um erro pra vc
            throw new Error("Erro ao buscar os ingressos vendidos.");
        }

        const tickets = await resposta.json();  //transforma a resposta em uma array em json

        document.getElementById("TicketsDash").textContent = tickets.length;  //no elemeto html cujo id é igua a "TicketDash" acrescenta o valor do tamanho da array em json contendo a resposta da requisição get all


    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalTickets();




async function carregarTotalRooms() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Room`); //chama a getAll de Room e coloca em uma variavel resposta

        if (!resposta.ok) { //se a resposta for diferente de ok, joga um erro pra vc
            throw new Error("Erro ao buscar as salas existentes no cinema.");
        }

        const rooms = await resposta.json(); //transforma a resposta em uma array em json

        document.getElementById("RoomsDash").textContent = rooms.length;  //no elemeto html cujo id é igua a "RoomsDash" acrescenta o valor do tamanho da array em json contendo a resposta da requisição get all


    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalRooms();


async function carregarTotalSessions() { //chama a getAll de session e coloca em uma variavel resposta
    try {
        const resposta = await fetch(`${API_BASE}/api/Session`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar as salas existentes no cinema.");
        }

        const sessions = await resposta.json(); //transforma a resposta em uma array em json

        document.getElementById("SessionsDash").textContent = sessions.length; //no elemeto html cujo id é igua a "SessionDash" acrescenta o valor do tamanho da array em json contendo a resposta da requisição get all


    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalSessions();


  document.getElementById("title").addEventListener("click", () => {
   
    window.location.href = "http://localhost:5252/CinemaSite/index.html";
  });