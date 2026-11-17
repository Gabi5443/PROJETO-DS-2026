const API_URL = "https://localhost:5252/api/Movie";

document.getElementById("CreateMovie").addEventListener("submit", async (event) => {

    event.preventDefault();

    const form = event.target;

    const dados = new FormData(form);

    try {

        const resposta = await fetch(API_URL, {
            method: "POST",
            body: dados
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.message);
        }

        alert(resultado.message);

        form.reset();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao cadastrar filme: " + erro.message);

    }

});