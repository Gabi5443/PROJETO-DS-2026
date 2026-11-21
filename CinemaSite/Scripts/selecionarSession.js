
const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Session`;

const parametros = new URLSearchParams(window.location.search);
const idFilme = parametros.get("id");

async function carregarSessoes() {
    try {
        // Busca todas as sessões
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar sessões.");
        }

        const sessoes = await resposta.json();

        // Filtra somente as sessões do filme selecionado
        const sessoesFilme = sessoes.filter(
            session => Number(session.idMovieFk) === Number(idFilme)
        );

        // Busca as salas
        const respostaSalas = await fetch(`${API_BASE}/api/Room`);
        const salas = await respostaSalas.json();

        const listaSessoes = document.getElementById("listaSessoes");

        listaSessoes.innerHTML = "";

        if (sessoesFilme.length === 0) {
            listaSessoes.innerHTML = "<p>Nenhuma sessão disponível.</p>";
            return;
        }

        // Cria um card para cada sessão
        sessoesFilme.forEach(session => {

            // Procura a sala correspondente à sessão
            const sala = salas.find(
                room => Number(room.idRoom) === Number(session.idRoomFk)
            );

            const data = new Date(session.showTimeSession);

            const dataFormatada = data.toLocaleDateString("pt-BR");
            const horarioFormatado = data.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });

            const card = document.createElement("div");

card.classList.add("card-sessao");

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
        });

    } catch (erro) {
        console.error(erro);
    }
}

// Redireciona para a seleção de assentos
function selecionarAssentos(idSession) {
    window.location.href = `selecionarAssentos.html?id=${idSession}`;
}

carregarSessoes();