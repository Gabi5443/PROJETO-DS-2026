const API_BASE = "http://localhost:5252";
const API_URL = `${API_BASE}/api/Users`;

// 1. CADASTRO
const formCreate = document.getElementById("CreateUsers");
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
            alert("Erro ao cadastrar usuário: " + erro.message);
        }
    });
}

// 2. LISTAGEM NA TABELA
const tabelaBody = document.getElementById("lista-usuarios");
if (tabelaBody) {
    carregarUsuarios();
}

async function carregarUsuarios() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error("Não foi possível carregar os usuários.");

        const usuarios = await resposta.json();

        if (usuarios.length === 0) {
            tabelaBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum usuário cadastrado.</td></tr>`;
            return;
        }

        tabelaBody.innerHTML = "";

        usuarios.forEach(usuarios => {
            const urlImagem = `${API_BASE}${usuarios.photoUsers}`;

            const linha = document.createElement("tr");
            linha.innerHTML = `
                <td>${usuarios.nameUsers}</td>
                <td>${usuarios.emailUsers}</td>
                <td>${usuarios.roleUsers}</td>
                <td><img src="${urlImagem}" alt="${usuarios.nameUsers}" class="foto-usuarios"></td>
                <td>
                    <div class="botoes">
                        <a href="../EditarPages/EditarUser.html?id=${usuarios.idUsers}" class="botaoAlter">Alterar</a>
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

// 3. EDIÇÃO
const formEdit = document.getElementById("EditarUsers");
if (formEdit) {
    // Pega o ID que veio na URL (ex: ?id=3)
    const params = new URLSearchParams(window.location.search);
    const usersId = params.get("id");

    // Busca os dados atuais do filme para preencher os inputs
    async function carregarDadosParaEdicao() {
        try {
            const resposta = await fetch(`${API_URL}/${usersId}`);
            if (!resposta.ok) throw new Error("Usuário não encontrado.");

            const usuarios = await resposta.json();

            document.getElementById("NameUsers").value = usuarios.nameUsers;
            document.getElementById("EmailUsers").value = usuarios.emailUsers;
            document.getElementById("RoleUsers").value = usuarios.roleUsers;
            document.getElementById("PreviewFoto").src = `${API_BASE}${usuarios.photoUsers}`;
        } catch (erro) {
            alert("Erro ao carregar usuário: " + erro.message);
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
            const resposta = await fetch(`${API_URL}/${usersId}`, {
                method: "PUT",
                body: dados
            });

            const resultado = await resposta.json();
            if (!resposta.ok) throw new Error(resultado.message);

            alert(resultado.message);
            window.location.href = "../ListarPages/listarUsers.html";
        } catch (erro) {
            alert("Erro ao atualizar: " + erro.message);
        }
    });
}