
const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Session`;

// 1. CADASTRO DE SESSÃO
const formCreate = document.getElementById("CreateSession");

if (formCreate) {
    carregarFilmes();
    carregarSalas();

    formCreate.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formulario = event.target;

        const dados = {
            ShowTimeSession: `${formulario.dataSession.value}T${formulario.timeSession.value}:00`,
            PriceSession: parseFloat(formulario.PriceSession.value),
            idMovieFk: parseInt(formulario.idMovieFk.value),
            idRoomFk: parseInt(formulario.idRoomFk.value)
        };

        try {
            const resposta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) throw new Error(resultado.message);

            alert(resultado.message);
            event.target.reset();

        } catch (erro) {
            console.error(erro);
            alert("Erro ao cadastrar sessão: " + erro.message);
        }
    });


}

const tabelaBody = document.getElementById("lista-sessoes");

if (tabelaBody) {
    carregarSession();
}


async function carregarFilmes() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Movie`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os filmes.");
        }

        const filmes = await resposta.json();

        const selectFilmes = document.getElementById("idMovieFk");

        filmes.forEach(filme => {
            const option = document.createElement("option");

            option.value = filme.idMovie;
            option.textContent = filme.titleMovie;

            selectFilmes.appendChild(option);
        });

    } catch (erro) {
        console.error(erro);
    }
}

// 3. CARREGAR SALAS NO SELECT
async function carregarSalas() {
    try {
        const resposta = await fetch(`${API_BASE}/api/Room`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as salas.");
        }

        const salas = await resposta.json();

        const selectSalas = document.getElementById("idRoomFk");

        salas.forEach(sala => {
            const option = document.createElement("option");

            option.value = sala.idRoom;
            option.textContent = sala.nameRoom;

            selectSalas.appendChild(option);
        });

    } catch (erro) {
        console.error(erro);
    }
}




async function carregarSession() {
    try {
        // Busca as sessões
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as sessões.");
        }

        const sessions = await resposta.json();

        // Busca os filmes
        const respostaFilmes = await fetch(`${API_BASE}/api/Movie`);

        if (!respostaFilmes.ok) {
            throw new Error("Não foi possível carregar os filmes.");
        }

        const filmes = await respostaFilmes.json();

        // Busca as salas
        const respostaSalas = await fetch(`${API_BASE}/api/Room`);

        if (!respostaSalas.ok) {
            throw new Error("Não foi possível carregar as salas.");
        }

        const salas = await respostaSalas.json();

        if (sessions.length === 0) {
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

        sessions.forEach(session => {

            // Procura o filme que possui o mesmo ID da FK
            const filme = filmes.find(f => f.idMovie === session.idMovieFk);

            // Procura a sala que possui o mesmo ID da FK
            const sala = salas.find(s => s.idRoom === session.idRoomFk);

            const linha = document.createElement("tr");

            const dataFormatada = new Date(session.showTimeSession).toLocaleString("pt-BR");

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
        console.error(erro);

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

const formEdit = document.getElementById("EditSession");

if (formEdit) {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    carregarDadosSession(id);

    formEdit.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formulario = event.target;

        const dados = {
            ShowTimeSession: `${formulario.elements["dataSession"].value}T${formulario.elements["timeSession"].value}:00`,
            PriceSession: parseFloat(formulario.elements["PriceSession"].value),
            idMovieFk: parseInt(formulario.elements["idMovieFk"].value),
            idRoomFk: parseInt(formulario.elements["idRoomFk"].value)
        };

        try {
            const resposta = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(resultado.message);
            }

            alert(resultado.message);
            window.location.href = "../ListarPages/ListarSession.html";

        } catch (erro) {
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
        alert("Erro ao carregar sessão: " + erro.message);
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
        alert("Erro ao excluir sessão: " + erro.message);
    }
}