
const API_BASE = "http://localhost:5252";

const parametros = new URLSearchParams(window.location.search); //achador de paramentros
const idSession = parametros.get("id"); // o parametro a r encontrado é o id vindo com o on click que chamou a pagina Selecionar acentos

//aplica todos os elementos da pagina html á const segundo seus respectivos ids
const mapaAssentos = document.getElementById("mapaAssentos");
const informacoesSessao = document.getElementById("informacoesSessao");
const quantidadeSelecionada = document.getElementById("quantidadeSelecionada");
const botaoContinuar = document.getElementById("continuar");

// Guarda os assentos escolhidos pelo usuário
const assentosSelecionados = new Set();//essa const recebe um construtor criado a seguir

async function carregarAssentos() {
 //função assincrona de mostrar os assentos
    
    try {
//se o id session não vier, avisa
        if (!idSession) {
            throw new Error("ID da sessão não informado.");
        }

        // 1. Busca a sessão escolhida por meio de uma requisição getByID ao session
        const respostaSession = await fetch(
            `${API_BASE}/api/Session/${idSession}`
        );
        //se a resposta for diferente de ok, aplica uma mensagem de erro

        if (!respostaSession.ok) {
            throw new Error("Não foi possível encontrar a sessão.");
        }

        const session = await respostaSession.json(); // transforma a resposta em json

        // 2. Busca a sala vinculada à sessão chamando o getById d room com a foreign key como parametro e aplica a uma variável
        const respostaRoom = await fetch(
            `${API_BASE}/api/Room/${session.idRoomFk}`
        );
         //se a resposta for diferente de ok aplica um erro
        if (!respostaRoom.ok) {
            throw new Error("Não foi possível encontrar a sala.");
        }

        const room = await respostaRoom.json(); //tranforma a resp em json e aplica aá variavel room

        // 3. Busca os assentos já ocupados por meio da enddpoint de listagem de occupied seats da ticket controller
        const respostaOcupados = await fetch( 
            `${API_BASE}/api/Ticket/occupied-seats/${idSession}`
        );

        if (!respostaOcupados.ok) { //se o resultado for diferente de ok
            throw new Error("Não foi possível buscar os assentos ocupados.");//aplica um erro
        }

        const assentosOcupados = await respostaOcupados.json(); // transforma a resp em json
        console.log("Dados da sala:", room); //mostra as salas vinculadas á sessão

        // 4. Exibe as informações da sessão por mieo de uma inserção html

         //mostra o nome da sala 
        informacoesSessao.innerHTML = `
          <h3>${room.nameRoom}</h3> 
            <p>Preço por ingresso: R$ ${Number(session.priceSession).toFixed(2)}</p>
        `;
//mosta o preço da session com no max 2 dig depois da virgula (é um campo decimal)
        // 5. Gera o mapa de assentos

        gerarAssentos( //
            room.totalRowsRoom,
            room.seatsPerRowRoom,
            assentosOcupados
        ); // aqui chamamos a função passando esses dados como parametro (eles subtistuirão os valores atribuidos `zfunção lá em baixo)

    } catch (erro) {
        console.error(erro);
        informacoesSessao.innerHTML = `<p>${erro.message}</p>`;
    } //fechamento do tratamento de erros. Se tiver alguma coissa, mostra a mensagem
}

function gerarAssentos(totalFileiras, assentosPorFileira, assentosOcupados) {

    mapaAssentos.innerHTML = ""; //isso limpa a função caso algo ja tenha cido atribuido

    const ocupados = new Set( 
        assentosOcupados.map(assento => String(assento).toUpperCase())
    ); // uma variavel recebe um SET (uma estrutura que é capaz de verificar se determinado valor existe dentro dela).Esse seu vai mapear os assentos ocupados e transforma-los em maiusculos

    for (let linha = 0; linha < totalFileiras; linha++) { //laco de repetição: percorrer "linha" comeeçando por zero enquanto o numero de linhas (ou fileiras) for menor que o total de fileiras, passo 1 

        const letra = String.fromCharCode(65 + linha); //letra recebe a linha em formato de letra. 65 é o codig para a letra "A"

        // Cria uma fileira como uma div
        const fileira = document.createElement("div");
        fileira.classList.add("fileira"); //adiciona uma classe "fileira à div"

        // Mostra a letra da fileira
        const identificacao = document.createElement("span");
        identificacao.classList.add("letra-fileira");
        identificacao.textContent = letra;

        fileira.appendChild(identificacao);

        for (let numero = 1; numero <= assentosPorFileira; numero++) { //percorra numero enquanto numero for menor ou igual o nmero de acentos por fileira passo 1

            const nomeAssento = `${letra}${numero}`; //o nome do acento rece letra + o numero

            const botao = document.createElement("button"); //cria m elemento html botao
//adiciona especificações à esse elemento
            botao.type = "button";
            botao.classList.add("assento");
            botao.textContent = numero;
            botao.title = nomeAssento;

            if (ocupados.has(nomeAssento)) { //se a variavel ocupados (que é uma array que deve conter os assentos ocupados)o botao é desativado (para q o usuário não possa escolher um acento já reservado)
                botao.disabled = true;
            } else { //caso contrário, ao botao fica clicavel e on click chama a função de selecionar acentos, levando o nome do acento escolhido e o valor do botao  como parametro
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

    if (assentosSelecionados.has(nomeAssento)) { //se a const assentosSelecionados tiver um nome de acento

        // Remove da seleção de cadeiras
        assentosSelecionados.delete(nomeAssento); 
        botao.classList.remove("selecionado");

    } else {
//senao
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

    const assentos = [...assentosSelecionados]; //a const assentos guarda o set numa array

    sessionStorage.setItem("assentosSelecionados", JSON.stringify(assentos)); //sessionStorage rece  a conversão dessa array em json

    window.location.href = `FinalizarCompra.html?id=${idSession}`; //o clicavel nos leva ao ifnalizarcompra.html levando o id como parametro
});

carregarAssentos();
