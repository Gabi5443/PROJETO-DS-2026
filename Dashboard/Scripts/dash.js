const API_BASE = "http://localhost:5252"; //coloca o endereço da api em uma varável que não será reatribuida (const)

async function carregarTotalFilmes() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Movie`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar filmes.");
        }

        const filmes = await resposta.json();

        document.getElementById("MoviesDash").textContent = filmes.length;

    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalFilmes();



async function carregarTotalUsers() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Users`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar os usuários.");
        }

        const users = await resposta.json();

        document.getElementById("UsersDash").textContent = users.length;

    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalUsers();



async function carregarTotalTickets() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Ticket`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar os ingressos vendidos.");
        }

        const tickets = await resposta.json();

        document.getElementById("TicketsDash").textContent = tickets.length;

    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalTickets();




async function carregarTotalRooms() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Room`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar as salas existentes no cinema.");
        }

        const rooms = await resposta.json();

        document.getElementById("RoomsDash").textContent = rooms.length;

    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalRooms();


async function carregarTotalSessions() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Session`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar as salas existentes no cinema.");
        }

        const sessions = await resposta.json();

        document.getElementById("SessionsDash").textContent = sessions.length;

    } catch (erro) {
        console.error(erro);
    }
}

carregarTotalSessions();