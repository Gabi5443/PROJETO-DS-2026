import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';

//importa as coisitas -> Entre elas o "encontrador" de parametros que utilizaremos para chamar a api

export default function SelecionarAssentos() {
    const router = useRouter();
    const { id } = useLocalSearchParams(); // idSession vindo de sessoes.tsx
    const { width } = useWindowDimensions();

    const [session, setSession] = useState<any>(null); //session e room: Guardam os detalhes da sessão (preço/horário) e da sala (quantas fileiras e cadeiras por fileira ela tem).
    const [room, setRoom] = useState<any>(null);
    const [assentosOcupados, setAssentosOcupados] = useState<string[]>([]); //assentosOcupados: Lista de poltronas que já foram vendidas (ex: ["I7", "I8"]).
    const [assentosSelecionados, setAssentosSelecionados] = useState<string[]>([]); //assentosSelecionados: Lista de poltronas que o usuário clicou agora na tela.

    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarAssentos();
    }, [id]);

    async function carregarAssentos() {
        try {
            if (!id) {
                throw new Error('ID da sessão não informado.');
            }

            // 1. Busca a sessão escolhida, para descobrir qual é o idRoomFk (o ID da sala vinculada a ela).
            const respostaSession = await fetch(`${API_SERVIDOR}/api/Session/${id}`);
            if (!respostaSession.ok) {
                throw new Error('Não foi possível encontrar a sessão.');
            }
            const dadosSession = await respostaSession.json();

            // 2. Busca a sala vinculada à sessão e os assentos ocupados em paralelo
            //promise -> aguarda a finalização de funções assincronas
            const [respostaRoom, respostaOcupados] = await Promise.all([
                fetch(`${API_SERVIDOR}/api/Room/${dadosSession.idRoomFk}`),
                fetch(`${API_SERVIDOR}/api/Ticket/occupied-seats/${id}`),
            ]);

            if (!respostaRoom.ok) {
                throw new Error('Não foi possível encontrar a sala.');
            }
            if (!respostaOcupados.ok) {
                throw new Error('Não foi possível buscar os assentos ocupados.');
            }

            const dadosRoom = await respostaRoom.json();
            const dadosOcupados = await respostaOcupados.json();

            //Salva os dados nos estados e converte todos os assentos ocupados para letras maiúsculas (toUpperCase()) para evitar erro de comparação (ex: "a1" vs "A1").
            setSession(dadosSession);
            setRoom(dadosRoom);
            setAssentosOcupados(
                dadosOcupados.map((a: any) => String(a).toUpperCase())
            );
        } catch (e: any) {
            console.error(e);
            setErro(e.message || 'Erro ao carregar mapa de assentos.');
        } finally {
            setCarregando(false);
        }
    }

    // Equivalente ao selecionarAssento(nomeAssento)
    //• Se listaAtual.includes(nomeAssento) for verdadeiro (a cadeira já estava selecionada), o .filter(...) cria uma nova lista removendo aquela cadeira.
    //• Senão, [...listaAtual, nomeAssento] copia as cadeiras anteriores e adiciona a nova no final.
    function alternarAssento(nomeAssento: string) {
        setAssentosSelecionados((listaAtual) => {
            if (listaAtual.includes(nomeAssento)) {
                return listaAtual.filter((item) => item !== nomeAssento);
            } else {
                return [...listaAtual, nomeAssento];
            }
        });
    }

    // Avança para app/finalizar.tsx enviando idSession e assentos
    function handleContinuar() {
        router.push({
            pathname: '/finalizar' as any,
            params: {
                idSession: String(id),
                assentos: JSON.stringify(assentosSelecionados),
            },
        });
    }

    if (carregando) {
        return (
            <View style={[styles.container, styles.centralizado]}>
                <ActivityIndicator size="large" color="#CE47A2" />
            </View>
        );
    }

    if (erro || !room || !session) {
        return (
            <View style={[styles.container, styles.centralizado]}>
                <Text style={styles.textoErro}>{erro || 'Dados não encontrados.'}</Text>
                <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
                    <Text style={styles.textoVoltar}>← Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Gera arrays auxiliares com base no totalRowsRoom para desenhar as fileiras (A, B, C...) e colunas (1, 2, 3...)
    const fileiras = Array.from({ length: room.totalRowsRoom || 0 }, (_, idx) =>
        String.fromCharCode(65 + idx)
    );
    //colunas: Cria um array numerado de 1 até seatsPerRowRoom (ex: [1, 2, 3, ..., 15]).
    const colunas = Array.from(
        { length: room.seatsPerRowRoom || 0 },
        (_, idx) => idx + 1
    );

    //totalColunas: Soma o número de cadeiras por fila + 1 espaço para a letra da fileira (A, B, C...).
    const totalColunas = (room.seatsPerRowRoom || 10) + 1; // +1 da letra da fileira
    //larguraDisponivel: Pega a largura da tela descontando 32px de margem (travando no máximo em 950px no PC).
    const larguraDisponivel = Math.min(width - 32, 950);
    //tamanhoCadeira: Divide a largura disponível pelo número de colunas (descontando 4px de espaço entre cada botão) para que todas as poltronas caibam na tela sem cortar, limitando a no máximo 34px no PC.
    const tamanhoCadeira = Math.min(34, Math.floor((larguraDisponivel - totalColunas * 4) / totalColunas));


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Botão Voltar */}
            <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
                <Text style={styles.textoVoltar}>← Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.titulo}>Escolha seus assentos</Text>

            {/* Informações da Sessão */}
            <View style={styles.infoSessao}>
                <Text style={styles.nomeSala}>{room.nameRoom}</Text>
                <Text style={styles.precoSessao}>
                    Preço por ingresso: R${' '}
                    {Number(session.priceSession).toFixed(2).replace('.', ',')}
                </Text>
            </View>

            {/* Legenda */}
            <View style={styles.legenda}>
                <View style={styles.itemLegenda}>
                    <View style={[styles.quadradoLegenda, { backgroundColor: '#352342' }]} />
                    <Text style={styles.textoLegenda}>Disponível</Text>
                </View>
                <View style={styles.itemLegenda}>
                    <View style={[styles.quadradoLegenda, { backgroundColor: '#CE47A2' }]} />
                    <Text style={styles.textoLegenda}>Selecionado</Text>
                </View>
                <View style={styles.itemLegenda}>
                    <View style={[styles.quadradoLegenda, { backgroundColor: '#555555' }]} />
                    <Text style={styles.textoLegenda}>Ocupado</Text>
                </View>
            </View>

            {/* Tela do Cinema */}
            <View style={styles.telaCinema}>
                <Text style={styles.textoTela}>TELA</Text>
            </View>

            {/* Mapa de Assentos com rolagem horizontal para salas largas */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mapaScroll}
            >
                <View style={styles.mapaAssentos}>
                    {/* Laço externo (fileiras.map): Para cada letra (A, B, C...), cria uma linha horizontal (styles.fileira) e escreve a letra na ponta esquerda. */}
                    {fileiras.map((letra) => (
                        <View key={letra} style={styles.fileira}>
                            <Text style={styles.letraFileira}>{letra}</Text>

                            {/*Laço interno (colunas.map): Dentro dessa mesma linha, percorre os números (1, 2, 3...) e monta o código da poltrona (nomeAssento, ex: "A1"). */}
                            {colunas.map((numero) => {
                                const nomeAssento = `${letra}${numero}`;
                                {/*Checagem instantânea (.includes): Antes de desenhar cada cadeira, verifica nas duas listas se "A1" já foi vendida (estaOcupado) ou se você clicou nela agora (estaSelecionado). */}
                                const estaOcupado = assentosOcupados.includes(nomeAssento);
                                const estaSelecionado = assentosSelecionados.includes(nomeAssento);

                                return (
                                    <TouchableOpacity
                                        key={nomeAssento}
                                        //disabled={estaOcupado}: Trava fisicamente o toque na cadeira se ela estiver ocupada, impedindo que onPress seja disparado.
                                        disabled={estaOcupado}
                                        activeOpacity={0.7}
                                        onPress={() => alternarAssento(nomeAssento)}
                                        //Array de estilos ([estilo1, estilo2, ...]): No React Native, quando você passa uma lista de estilos, os últimos sobrescrevem os primeiros:
                                        style={[
                                            //Começa com a cor padrão roxa (styles.assento) e aplica a largura/altura calculada para caber na tela.
                                            styles.assento,
                                            { width: tamanhoCadeira, height: tamanhoCadeira },
                                            //2. Se estaSelecionado for true, pinta de rosa (assentoSelecionado).
                                            estaSelecionado && styles.assentoSelecionado,
                                            //Se estaOcupado for true, pinta de cinza (assentoOcupado).
                                            estaOcupado && styles.assentoOcupado,
                                        ]}
                                    >
                                        {/*Fonte adaptativa (tamanhoCadeira < 24 ? 9 : 12): Se a sala tiver muitas colunas e a cadeira ficar menor que 24px, reduz o número para tamanho 9 para não quebrar em duas linhas. */}
                                        <Text
                                            style={[
                                                styles.textoAssento,
                                                { fontSize: tamanhoCadeira < 24 ? 9 : 12 },
                                                estaOcupado && { color: '#999999' },
                                            ]}
                                        >
                                            {numero}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Resumo da seleção */}
            {/*.join(', '): Junta todos os itens do array em um único texto separado por vírgula e espaço (ex: ["I7", "I8"] vira "I7, I8"). */}
            <Text style={styles.quantidadeSelecionada}>
                {assentosSelecionados.length === 0
                    ? 'Nenhum assento selecionado.'
                    : `${assentosSelecionados.length} assento(s) selecionado(s): ${assentosSelecionados.join(', ')}`}
            </Text>

            {/* Botão Continuar */}
            {/*disabled={assentosSelecionados.length === 0}: Mantém o botão Continuar apagado (btnContinuarDesabilitado) e bloqueado até que o usuário escolha pelo menos 1 assento. */}
            <TouchableOpacity
                disabled={assentosSelecionados.length === 0}
                onPress={handleContinuar}
                activeOpacity={0.85}
                style={[
                    styles.btnContinuar,
                    assentosSelecionados.length === 0 && styles.btnContinuarDesabilitado,
                ]}
            >
                <Text
                    style={[
                        styles.textoContinuar,
                        assentosSelecionados.length === 0 && { color: '#AAAAAA' },
                    ]}
                >
                    Continuar
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0A1C',
    },
    centralizado: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        paddingTop: 45,
        paddingBottom: 50,
        paddingHorizontal: 16,
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    btnVoltar: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#CE47A2',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 20,
    },
    textoVoltar: {
        color: '#CE47A2',
        fontWeight: '600',
    },
    titulo: {
        color: '#CE47A2',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 14,
        textAlign: 'center',
    },
    infoSessao: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nomeSala: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    precoSessao: {
        color: '#DDDDDD',
        fontSize: 15,
    },
    legenda: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginVertical: 16,
        flexWrap: 'wrap',
    },
    itemLegenda: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quadradoLegenda: {
        width: 17,
        height: 17,
        borderRadius: 5,
    },
    textoLegenda: {
        color: '#CCCCCC',
        fontSize: 13,
    },
    telaCinema: {
        width: '90%',
        maxWidth: 500,
        marginTop: 24,
        marginBottom: 30,
        paddingVertical: 12,
        backgroundColor: '#CE47A2',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        alignItems: 'center',
    },
    textoTela: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 5,
    },
    mapaScroll: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    mapaAssentos: {
        gap: 10,
    },
    fileira: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    letraFileira: {
        width: 22,
        fontWeight: '700',
        color: '#CE47A2',
        fontSize: 14,
        textAlign: 'center',
    },
    assento: {
        width: 34,
        height: 34,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: '#352342',
        justifyContent: 'center',
        alignItems: 'center',
    },
    assentoSelecionado: {
        backgroundColor: '#CE47A2',
    },
    assentoOcupado: {
        backgroundColor: '#555555',
        opacity: 0.7,
    },
    textoAssento: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    quantidadeSelecionada: {
        marginTop: 28,
        marginBottom: 20,
        color: '#CCCCCC',
        fontSize: 14,
        textAlign: 'center',
    },
    btnContinuar: {
        paddingVertical: 14,
        paddingHorizontal: 45,
        backgroundColor: '#CE47A2',
        borderRadius: 8,
        alignItems: 'center',
    },
    btnContinuarDesabilitado: {
        backgroundColor: '#514052',
    },
    textoContinuar: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    textoErro: {
        color: '#e92f3b',
        fontSize: 16,
        marginBottom: 16,
    },
});