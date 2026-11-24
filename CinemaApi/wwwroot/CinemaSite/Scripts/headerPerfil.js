(function () {
    const API_SERVIDOR = "http://localhost:5252";
    const FOTO_PADRAO = `${API_SERVIDOR}/uploads/users/default-avatar.jpg`;
    const imgPerfil = document.getElementById("FotoPerfilHeader");

    if (!imgPerfil) return;

    async function atualizarFotoHeader() {
        // Verifica se existe alguém logado salvo no navegador
        const dadosSalvos = localStorage.getItem("usuarioLogado");

        if (!dadosSalvos) {
            // Ninguém logado: mantém a foto cinza padrão
            imgPerfil.src = FOTO_PADRAO;
            imgPerfil.title = "Clique para fazer login";
            return;
        }

        const usuario = JSON.parse(dadosSalvos);
        imgPerfil.title = `Olá, ${usuario.nameUsers}`;

        // Mostra imediatamente a foto que estava salva no login
        if (usuario.photoUsers) {
            imgPerfil.src = `${API_SERVIDOR}${usuario.photoUsers}`;
        }

        // Busca na API pelo ID para garantir que, se ele editou a foto, apareça a mais atual
        try {
            const resposta = await fetch(`${API_SERVIDOR}/api/Users/${usuario.idUsers}`);
            if (resposta.ok) {
                const usuarioAtualizado = await resposta.json();
                imgPerfil.src = `${API_SERVIDOR}${usuarioAtualizado.photoUsers}`;
                // Atualiza o localStorage com os dados novos
                localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));
            }
        } catch (erro) {
            console.warn("Não foi possível atualizar a foto pela API, mantendo a do cache.");
        }
    }

    // Ao clicar na foto: se estiver logado vai pro perfil/editar, se não estiver vai pro login
    imgPerfil.addEventListener("click", () => {
        const usuarioLogado = localStorage.getItem("usuarioLogado");
        if (usuarioLogado) {
            const user = JSON.parse(usuarioLogado);
            window.location.href = `Perfil/IndexPerfil.html?id=${user.idUsers}`;
        } else {
            // Ajuste para o caminho da sua futura página de login
            window.location.href = "login.html";
        }
    });

    // Se a imagem falhar ao carregar por qualquer motivo, volta para a padrão
    imgPerfil.onerror = () => {
        imgPerfil.src = FOTO_PADRAO;
    };

    atualizarFotoHeader();
})();
