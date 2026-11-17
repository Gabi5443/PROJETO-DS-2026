const API_URL = "http://localhost:5252/Movie";


async function createMovie() {
  // 1. Pega os valores digitados nos inputs do seu HTML
  const novoFilme = {
    title: document.getElementById('titulo').value,
    duration: Number(document.getElementById('duracao').value)
    // coloque aqui os outros campos do seu Model Movie
  };

  try {
    // 2. Faz o POST enviando o JSON para a controller
    const resposta = await fetch('http://localhost:5252/api/Movie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoFilme)
    });

    // 3. Lê a resposta (seja o Ok ou o BadRequest/500 da sua controller)
    const dados = await resposta.json();

    if (resposta.ok) {
      alert(dados.message); // Exibe: "Filme cadastrado com sucesso!"
    } else {
      alert('Erro: ' + dados.message);
    }

  } catch (erro) {
    console.error('Erro de conexão com a API:', erro);
  }
}
