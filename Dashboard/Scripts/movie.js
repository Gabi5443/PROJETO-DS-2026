const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Movie`;

// 1. CADASTRO DE FILME (CreateMovie.html)
const formCreate = document.getElementById("CreateMovie");
if (formCreate) {
    formCreate.addEventListener("submit", async (event) => {
        event.preventDefault();
        const dados = new FormData(event.target);

        try {
            const resposta = await fetch(API_URL, {
                method: "POST",
                body: dados
            });

            const resultado = await resposta.json();
            if (!resposta.ok) throw new Error(resultado.message);

            alert(resultado.message);
            event.target.reset();
        } catch (erro) {
            console.error(erro);
            alert("Erro ao cadastrar filme: " + erro.message);
        }
    });
}

// 2. LISTAGEM NA TABELA (listarMovies.html)
const tabelaBody = document.getElementById("lista-filmes");
if (tabelaBody) {
    carregarFilmes();
}

async function carregarFilmes() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error("Não foi possível carregar os filmes.");

        const filmes = await resposta.json();

        if (filmes.length === 0) {
            tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum filme cadastrado.</td></tr>`;
            return;
        }

        tabelaBody.innerHTML = "";

        filmes.forEach(filme => {
            const urlImagem = `${API_BASE}${filme.photoMovie}`;

            const linha = document.createElement("tr");
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

            tabelaBody.appendChild(linha);
        });
    } catch (erro) {
        console.error(erro);
        tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #e92f3b;">Erro: ${erro.message}</td></tr>`;
    }
}

// 3. EDIÇÃO DE FILME (EditMovie.html)
const formEdit = document.getElementById("EditarMovie");
if (formEdit) {
    // Pega o ID que veio na URL (ex: ?id=3)
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    // Busca os dados atuais do filme para preencher os inputs
    async function carregarDadosParaEdicao() {
        try {
            const resposta = await fetch(`${API_URL}/${movieId}`);
            if (!resposta.ok) throw new Error("Filme não encontrado.");

            const filme = await resposta.json();

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
            const resposta = await fetch(`${API_URL}/${movieId}`, {
                method: "PUT",
                body: dados
            });

            const resultado = await resposta.json();
            if (!resposta.ok) throw new Error(resultado.message);

            alert(resultado.message);
            window.location.href = "../ListarPages/listarMovies.html";
        } catch (erro) {
            alert("Erro ao atualizar: " + erro.message);
        }
    });
}

// 4. EXCLUSÃO DE FILME
async function deletarFilme(id) {
    if (!confirm("Tem certeza que deseja excluir este filme?")) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.message);

        alert(resultado.message);
        carregarFilmes();
    } catch (erro) {
        alert("Erro ao excluir: " + erro.message);
    }
}


