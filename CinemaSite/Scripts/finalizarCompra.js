
const API_BASE = "http://localhost:5252";

const parametros = new URLSearchParams(window.location.search);
const idSession = parametros.get("id");

const assentosSelecionados = JSON.parse(
    sessionStorage.getItem("assentosSelecionados") || "[]"
);

const dadosUsuario = localStorage.getItem("usuarioLogado");

if (!dadosUsuario) {
    alert("Você precisa estar logado para continuar.");
    window.location.href = "login.html";
}

const usuario = dadosUsuario ? JSON.parse(dadosUsuario) : null;

const listaIngressos = document.getElementById("listaIngressos");
const formaPagamento = document.getElementById("formaPagamento");
const valorTotal = document.getElementById("valorTotal");
const botaoFinalizar = document.getElementById("finalizarCompra");

// Guarda os dados da sessão
let precoSessao = 0;

// Guarda os ingressos que serão enviados para a API
let ingressos = [];


// CARREGAR DADOS DA SESSÃO
async function carregarDadosSessao() {
    try {
        if (!idSession) {
            throw new Error("Sessão não informada.");
        }

        if (assentosSelecionados.length === 0) {
            throw new Error("Nenhum assento foi selecionado.");
        }

        const resposta = await fetch(
            `${API_BASE}/api/Session/${idSession}`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar a sessão.");
        }

        const session = await resposta.json();

        precoSessao = Number(session.priceSession);

        gerarIngressos();

    } catch (erro) {
        console.error(erro);
        listaIngressos.innerHTML = `<p>${erro.message}</p>`;
    }
}


// GERAR OS CAMPOS DE CADA INGRESSO
function gerarIngressos() {
    listaIngressos.innerHTML = "";
    ingressos = [];

    assentosSelecionados.forEach((assento, index) => {

        const ingresso = {
            seatNumberTicket: assento,
            typeTicket: 1,
            finalPriceTicket: precoSessao
        };

        ingressos.push(ingresso);

        const card = document.createElement("div");
        card.classList.add("card-ingresso");

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

        listaIngressos.appendChild(card);

        const selectTipo = card.querySelector("select");

        selectTipo.addEventListener("change", () => {
            atualizarIngresso(index, selectTipo.value);
        });
    });

    atualizarTotal();
}


// ATUALIZAR O TIPO E O PREÇO DO INGRESSO
function atualizarIngresso(index, tipo) {

    const ingresso = ingressos[index];

    ingresso.typeTicket = Number(tipo);

    if (ingresso.typeTicket === 2) {
        ingresso.finalPriceTicket = precoSessao / 2;
    } else {
        ingresso.finalPriceTicket = precoSessao;
    }

    document.getElementById(`precoIngresso${index}`).textContent =
        `R$ ${ingresso.finalPriceTicket.toFixed(2)}`;

    atualizarTotal();
}


// CALCULAR O VALOR TOTAL
function atualizarTotal() {

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

        // Envia a compra para a API
        const resposta = await fetch(`${API_BASE}/api/Ticket`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(compra)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.message || "Erro ao finalizar compra.");
        }

        alert("Compra realizada com sucesso!");

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
