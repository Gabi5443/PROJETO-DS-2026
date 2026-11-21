
const API_BASE = "http://localhost:5252";

const parametros = new URLSearchParams(window.location.search); //achador de parametros
const idSession = parametros.get("id"); // oparametro a ser encontrado é o id

//pega a  array sessionStorage que guarda as escolhas do  user da pagina anterior ou (||) a array vazia e converte para um objeto java script
const assentosSelecionados = JSON.parse(
    sessionStorage.getItem("assentosSelecionados") || "[]"
);

const dadosUsuario = localStorage.getItem("usuarioLogado"); //pega os dados do usuário logado do localstorage ("bd" do navegador e guarda nu const)

if (!dadosUsuario) {
    alert("Você precisa estar logado para continuar.");
    window.location.href = "login.html";
} //se o os dados não vierem ativa um erro e me manda para fazer login

const usuario = dadosUsuario ? JSON.parse(dadosUsuario) : null; //pega a const de dados OU a conversão da mesma em json e coloca numa outra const. Caso não venha nenhum adas opção deixa vazio


//pega os elemntos html cujo id bate com esses entre parenteses e guarda em consts
const listaIngressos = document.getElementById("listaIngressos");
const formaPagamento = document.getElementById("formaPagamento");
const valorTotal = document.getElementById("valorTotal");
const botaoFinalizar = document.getElementById("finalizarCompra");

// Guarda os dados da sessão
let precoSessao = 0; // inicialmente como 0

// Guarda os ingressos que serão enviados para a API
let ingressos = []; //inicialmente como uma array vazia


// CARREGAR DADOS DA SESSÃO
async function carregarDadosSessao() {
    try {
        if (!idSession) {
            throw new Error("Sessão não informada.");
        } //se o id da sessao (que deveria ter vindo da ultima pagina) não vier mostra um erro

        if (assentosSelecionados.length === 0) {
            throw new Error("Nenhum assento foi selecionado.");
        } //se o tamanho da array de assentos selecionados for zero (se a array estiver vazia) mostra um erro

        const resposta = await fetch(
            `${API_BASE}/api/Session/${idSession}`
        ); //guarda a resposta da requisição de um getAll para a session controller numa const

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar a sessão.");
        } //se a resposta for diferente de ok mostra um erro

        const session = await resposta.json(); //converte a resposta em json

        precoSessao = Number(session.priceSession); //o preco do ingresso naquela sessao é armazenado

        gerarIngressos(); //roa a função

    } catch (erro) {
        console.error(erro);
        listaIngressos.innerHTML = `<p>${erro.message}</p>`;
    } //fechamento do tratamento de erros = se achar um erro no caminho, mostra
}


// GERAR OS CAMPOS DE CADA INGRESSO
function gerarIngressos() {
    listaIngressos.innerHTML = ""; //limpa a lista
    ingressos = []; // cria uma array vazia chamada ingressos

    assentosSelecionados.forEach((assento, index) => { //percorre a array assentosSelecionados levando assento (uma const que receerá  o valor do assento atual a ser percorrido e index a posição do assento no array)

        // Em uma const ingresso o assento a ser percorrido será englobado na var seatNumberTicket, o tipo de ingresso sempre começará como inteiro e o preçoSessao seá englobado por uma var chamada finalPriceTicket
        const ingresso = {
            seatNumberTicket: assento,
            typeTicket: 1,
            finalPriceTicket: precoSessao
        };

        ingressos.push(ingresso); // a array chamada ingresso englobará a const ao fim da array


        //cria um elemto html e da uma classe para ele
        const card = document.createElement("div"); 
        card.classList.add("card-ingresso");
//dentro dele aplica todo esse cod html

// todos os ids dos elementos adicionados contarao com o index (o indice da array de assentos selecionados)como parametro
        card.innerHTML = `
            <h3>Assento ${assento}</h3>

            <label for="tipoIngresso${index}">
                Tipo de ingresso:
            </label>

            <select id="tipoIngresso${index}">
                <option value="1">Inteira</option>
                <option value="2">Meia</option>
            </select>

            <p>
                Valor: 
                <strong id="precoIngresso${index}">
                    R$ ${precoSessao.toFixed(2)}
                </strong>
            </p>
        `;

        //adiciona esse card dentro da lista de ingressos
        listaIngressos.appendChild(card);
//dentro do card, procura um elemento select
        const selectTipo = card.querySelector("select");
//em caso de mudança na ption dese select, (se usuario mudar o ingresso de inteira para meia), chama a função de atualizar ingresso levando a posição do ingresso na array de assentos selecionados e a mudança
        selectTipo.addEventListener("change", () => {
            atualizarIngresso(index, selectTipo.value);
        });
    });

    atualizarTotal(); //chama a função
}


// ATUALIZAR O TIPO E O PREÇO DO INGRESSO
function atualizarIngresso(index, tipo) {

    const ingresso = ingressos[index]; // a const ingresso recebe a array de ingressos com a posição de cada ingresso

    ingresso.typeTicket = Number(tipo); //
//logica para a meia entrada
    if (ingresso.typeTicket === 2) { //se o tipo de ingressofor 2 
        ingresso.finalPriceTicket = precoSessao / 2;//o preço dele é dividido por doi
    } else {
        ingresso.finalPriceTicket = precoSessao; //senao o preco permanece os mesmo
    }

    document.getElementById(`precoIngresso${index}`).textContent =
        `R$ ${ingresso.finalPriceTicket.toFixed(2)}`;

    atualizarTotal(); //chama a função
}


// CALCULAR O VALOR TOTAL
function atualizarTotal() {

    //soma o preço final e mantem o decimal até dois digitos
    const total = ingressos.reduce(
        (soma, ingresso) => soma + ingresso.finalPriceTicket,
        0
    );

    valorTotal.textContent = `R$ ${total.toFixed(2)}`;
}


// INICIAR
carregarDadosSessao();


async function finalizarCompra() {
    try {
        // Verifica se existe uma forma de pagamento selecionada
        if (!formaPagamento.value) {
            alert("Selecione uma forma de pagamento.");
            return;
        }

        // Verifica se existem ingressos
        if (ingressos.length === 0) {
            alert("Nenhum ingresso foi selecionado.");
            return;
        }

        // Monta o objeto que será enviado para a API
        const compra = {
            idUsers: usuario.idUsers,
            idSessionFk: Number(idSession),
            paymentMethod: formaPagamento.value,
            items: ingressos
        };

        // Envia a compra para a API (cria um ticket)
        const resposta = await fetch(`${API_BASE}/api/Ticket`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(compra)
        });

        const resultado = await resposta.json();// transforma a resp em json

        if (!resposta.ok) {
            throw new Error(resultado.message || "Erro ao finalizar compra.");
        } // se a resposta for <> ok retorna um erro

        alert("Compra realizada com sucesso!"); // senao manda essa msg

        // Limpa os assentos selecionados
        sessionStorage.removeItem("assentosSelecionados");

        // Redireciona para a página de confirmação
        window.location.href = `CompraConfirmada.html?id=${resultado.orderId}`;

    } catch (erro) {
        console.error(erro);
        alert(erro.message);
    }
}

// Evento do botão
botaoFinalizar.addEventListener("click", finalizarCompra);
