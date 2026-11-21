
const API_BASE = "http://localhost:5252";

const parametros = new URLSearchParams(window.location.search);
const idSession = parametros.get("id");

const mapaAssentos = document.getElementById("mapaAssentos");
const informacoesSessao = document.getElementById("informacoesSessao");
const quantidadeSelecionada = document.getElementById("quantidadeSelecionada");
const botaoContinuar = document.getElementById("continuar");

// Guarda os assentos escolhidos pelo usuário
const assentosSelecionados = new Set();

async function carregarAssentos() {

    

    
    try {

        console.log("JavaScript iniciado!");
        console.log("ID da sessão:", idSession);

        if (!idSession) {
            throw new Error("ID da sessão não informado.");
        }

        // 1. Busca a sessão escolhida
        const respostaSession = await fetch(
            `${API_BASE}/api/Session/${idSession}`
        );

        if (!respostaSession.ok) {
            throw new Error("Não foi possível encontrar a sessão.");
        }

        const session = await respostaSession.json();

        // 2. Busca a sala vinculada à sessão
        const respostaRoom = await fetch(
            `${API_BASE}/api/Room/${session.idRoomFk}`
        );

        if (!respostaRoom.ok) {
            throw new Error("Não foi possível encontrar a sala.");
        }

        const room = await respostaRoom.json();

        // 3. Busca os assentos já ocupados
        const respostaOcupados = await fetch(
            `${API_BASE}/api/Ticket/occupied-seats/${idSession}`
        );

        if (!respostaOcupados.ok) {
            throw new Error("Não foi possível buscar os assentos ocupados.");
        }

        const assentosOcupados = await respostaOcupados.json();
        console.log("Dados da sala:", room);

        // 4. Exibe as informações da sessão
        informacoesSessao.innerHTML = `
            <h3>${room.nameRoom}</h3>
            <p>Preço por ingresso: R$ ${Number(session.priceSession).toFixed(2)}</p>
        `;

        // 5. Gera o mapa de assentos
        gerarAssentos(
            room.totalRowsRoom,
            room.seatsPerRowRoom,
            assentosOcupados
        );

    } catch (erro) {
        console.error(erro);
        informacoesSessao.innerHTML = `<p>${erro.message}</p>`;
    }
}

function gerarAssentos(totalFileiras, assentosPorFileira, assentosOcupados) {

    mapaAssentos.innerHTML = "";

    const ocupados = new Set(
        assentosOcupados.map(assento => String(assento).toUpperCase())
    );

    for (let linha = 0; linha < totalFileiras; linha++) {

        const letra = String.fromCharCode(65 + linha);

        // Cria uma fileira
        const fileira = document.createElement("div");
        fileira.classList.add("fileira");

        // Mostra a letra da fileira
        const identificacao = document.createElement("span");
        identificacao.classList.add("letra-fileira");
        identificacao.textContent = letra;

        fileira.appendChild(identificacao);

        for (let numero = 1; numero <= assentosPorFileira; numero++) {

            const nomeAssento = `${letra}${numero}`;

            const botao = document.createElement("button");

            botao.type = "button";
            botao.classList.add("assento");
            botao.textContent = numero;
            botao.title = nomeAssento;

            if (ocupados.has(nomeAssento)) {
                botao.disabled = true;
            } else {
                botao.addEventListener("click", () => {
                    selecionarAssento(nomeAssento, botao);
                });
            }

            fileira.appendChild(botao);
        }

        mapaAssentos.appendChild(fileira);
    }
}

function selecionarAssento(nomeAssento, botao) {

    if (assentosSelecionados.has(nomeAssento)) {

        // Remove da seleção
        assentosSelecionados.delete(nomeAssento);
        botao.classList.remove("selecionado");

    } else {

        // Adiciona à seleção
        assentosSelecionados.add(nomeAssento);
        botao.classList.add("selecionado");
    }

    // Atualiza a quantidade de assentos escolhidos
    quantidadeSelecionada.textContent =
        `${assentosSelecionados.size} assento(s) selecionado(s): ${
            [...assentosSelecionados].join(", ")
        }`;

    // Só permite continuar se houver pelo menos um assento
    botaoContinuar.disabled = assentosSelecionados.size === 0;
}

// 6. Guarda os assentos e avança para a próxima página
botaoContinuar.addEventListener("click", () => {

    const assentos = [...assentosSelecionados];

    sessionStorage.setItem("assentosSelecionados", JSON.stringify(assentos));

    window.location.href = `FinalizarCompra.html?id=${idSession}`;
});

carregarAssentos();
