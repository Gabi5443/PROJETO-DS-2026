import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';

export default function FinalizarCompra() {
  const router = useRouter();
  const { idSession, assentos } = useLocalSearchParams(); //useLocalSearchParams: Lê os dois pacotes enviados pela tela assentos.tsx: o ID da sessão (idSession) e a lista de poltronas marcadas em texto JSON (assentos).

  const [usuario, setUsuario] = useState<any>(null);
  const [precoSessao, setPrecoSessao] = useState(0);
  const [ingressos, setIngressos] = useState<any[]>([]); //ingressos: Array de objetos que guarda cada poltrona junto com seu tipo (1 = Inteira, 2 = Meia) e preço calculado.
  const [formaPagamento, setFormaPagamento] = useState(''); //formaPagamento: Guarda qual botão o usuário escolheu ('Cartão', 'Pix' ou 'Dinheiro').
  const [carregando, setCarregando] = useState(true); //carregando vs. enviando: carregando controla o loading ao abrir a tela; enviando controla o loading do botão Confirmar compra ao enviar para a API.
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDadosSessao();
  }, []);

  //Bloqueio de usuário deslogado: Lê o AsyncStorage. Se não houver ninguém logado, redireciona imediatamente para /login antes de permitir a compra.
  async function carregarDadosSessao() {
    try {
      const dadosUsuario = await AsyncStorage.getItem('usuarioLogado');
      if (!dadosUsuario) {
        router.replace('/login');
        return;
      }
      setUsuario(JSON.parse(dadosUsuario));

      //JSON.parse(String(assentos)): Converte o texto ["I7", "I8"] vindo da rota de volta em um array JavaScript real.
      const listaAssentos: string[] = assentos ? JSON.parse(String(assentos)) : [];
      if (!idSession) {
        throw new Error('Sessão não informada.');
      }
      if (listaAssentos.length === 0) {
        throw new Error('Nenhum assento foi selecionado.');
      }

      //fetch(.../api/Session/${idSession}): Busca na API o valor oficial da sessão (priceSession) para não confiar em preços vindos da URL.
      const resposta = await fetch(`${API_SERVIDOR}/api/Session/${idSession}`);
      if (!resposta.ok) {
        throw new Error('Não foi possível carregar a sessão.');
      }

      const session = await resposta.json();
      const preco = Number(session.priceSession);
      setPrecoSessao(preco);

      // Gera os ingressos começando como Inteira (typeTicket: 1)
      // .map(): Transforma cada string de assento (ex: "I7") no objeto exato que o seu backend C# espera (seatNumberTicket, typeTicket: 1 e finalPriceTicket).
      const iniciais = listaAssentos.map((assento) => ({
        seatNumberTicket: assento,
        typeTicket: 1,
        finalPriceTicket: preco,
      }));
      setIngressos(iniciais);
    } catch (e: any) {
      console.error(e);
      setErro(e.message || 'Erro ao carregar dados da sessão.');
    } finally {
      setCarregando(false);
    }
  }

  //Atualização imutável: Percorre a lista ingressos. Se o índice i não for o card clicado (i !== index), devolve o item intacto; se for o card clicado, mantém a poltrona (...item), muda typeTicket para 1 ou 2 e divide precoSessao por 2 se for Meia (tipo === 2).
  function atualizarIngresso(index: number, tipo: number) {
    setIngressos((listaAtual) =>
      listaAtual.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          typeTicket: tipo,
          finalPriceTicket: tipo === 2 ? precoSessao / 2 : precoSessao,
        };
      })
    );
  }

  //.reduce(): Percorre todos os ingressos somando finalPriceTicket a partir de 0. Como fica direto no corpo do componente, o React recalcula o total automaticamente toda vez que você troca um ingresso entre Inteira e Meia.
  const valorTotal = ingressos.reduce(
    (soma, ingresso) => soma + ingresso.finalPriceTicket,
    0
  );

  //Impede o envio caso o usuário não tenha clicado em Cartão, Pix ou Dinheiro.
  async function finalizarCompra() {
    setErro('');

    if (!formaPagamento) {
      setErro('Selecione uma forma de pagamento.');
      return;
    }

    if (ingressos.length === 0) {
      setErro('Nenhum ingresso foi selecionado.');
      return;
    }

    setEnviando(true);

    //POST /api/Ticket: Envia o pacote JSON completo contendo o dono do pedido (idUsers), a sessão (idSessionFk), o método escolhido e a lista items com todas as poltronas e valores.
    try {
      const compra = {
        idUsers: usuario.idUsers,
        idSessionFk: Number(idSession),
        paymentMethod: formaPagamento,
        items: ingressos,
      };

      const resposta = await fetch(`${API_SERVIDOR}/api/Ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compra),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado.message || 'Erro ao finalizar compra.');
      }

      // Redireciona para a tela de confirmação com o ID do pedido
      //router.replace: Substitui a tela de checkout pela tela confirmada.tsx levando o número do pedido gerado pelo C# (resultado.orderId). Usar replace em vez de push evita que o usuário aperte "Voltar" e compre o mesmo ingresso duas vezes por engano.
      router.replace({
        pathname: '/confirmada' as any,
        params: { id: String(resultado.orderId) },
      });
    } catch (e: any) {
      console.error(e);
      setErro(e.message || 'Erro ao finalizar compra.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <View style={[styles.container, styles.centralizado]}>
        <ActivityIndicator size="large" color="#CE47A2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.textoVoltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Finalizar compra</Text>

      {/* Seção Resumo dos Ingressos */}
      <View style={styles.secao}>
        <Text style={styles.subtituloSecao}>Resumo dos ingressos</Text>

        {/*ingressos.map((item, index) => ...): Percorre cada ingresso escolhido e desenha um cartão individual. */}
        {ingressos.map((item, index) => (
          //key={item.seatNumberTicket}: Usa o código da poltrona (ex: "I7") como identificador único para o React rastrear cada card.
          <View key={item.seatNumberTicket} style={styles.cardIngresso}>
            <Text style={styles.tituloAssento}>
              Assento {item.seatNumberTicket}
            </Text>

            <Text style={styles.label}>Tipo de ingresso:</Text>
            {/*Substituição do <select> HTML: Como o React Native não tem <select> nativo igual ao navegador, usamos dois botões lado a lado (styles.rowOpcoes). */}
            <View style={styles.rowOpcoes}>
              <TouchableOpacity
                style={[
                  styles.opcaoBtn,
                  //item.typeTicket === 1 && styles.opcaoBtnAtivo: Se o ingresso estiver marcado como 1 (Inteira), aplica o fundo rosa (opcaoBtnAtivo) no botão Inteira; se estiver 2, pinta o botão Meia.
                  item.typeTicket === 1 && styles.opcaoBtnAtivo,
                ]}
                //item.typeTicket === 1 && styles.opcaoBtnAtivo: Se o ingresso estiver marcado como 1 (Inteira), aplica o fundo rosa (opcaoBtnAtivo) no botão Inteira; se estiver 2, pinta o botão Meia.
                onPress={() => atualizarIngresso(index, 1)}
              >
                <Text style={styles.textoOpcao}>Inteira</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.opcaoBtn,
                  item.typeTicket === 2 && styles.opcaoBtnAtivo,
                ]}
                onPress={() => atualizarIngresso(index, 2)}
              >
                <Text style={styles.textoOpcao}>Meia</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.valorItem}>
              {/*{' '}: Garante um espaço em branco explícito entre "Valor:" e o <Text> interno rosa que exibe o preço formatado. */}
              Valor:{' '}
              <Text style={styles.destaquePreco}>
                R$ {item.finalPriceTicket.toFixed(2).replace('.', ',')}
              </Text>
            </Text>
          </View>
        ))}
      </View>

      {/* Seção Forma de Pagamento */}
      <View style={styles.secao}>
        <Text style={styles.subtituloSecao}>Forma de pagamento</Text>

        {/*['Cartão', 'Pix', 'Dinheiro'].map(...): Gera os três botões de pagamento automaticamente a partir da lista. */}
        <View style={styles.rowOpcoes}>
          {['Cartão', 'Pix', 'Dinheiro'].map((metodo) => (
            <TouchableOpacity
              key={metodo}
              style={[
                styles.opcaoBtn,
                //formaPagamento === metodo && styles.opcaoBtnAtivo: Pinta de rosa o botão que corresponder ao valor salvo no estado formaPagamento
                formaPagamento === metodo && styles.opcaoBtnAtivo,
              ]}
              onPress={() => setFormaPagamento(metodo)}
            >
              <Text style={styles.textoOpcao}>{metodo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Seção Total */}
      {/*[styles.secao, styles.secaoTotal]: Reutiliza o estilo base de caixa (secao) e adiciona por cima a borda rosa e o alinhamento horizontal (justifyContent: 'space-between') do secaoTotal. */}
      <View style={[styles.secao, styles.secaoTotal]}>
        <Text style={styles.labelTotal}>Total:</Text>
        <Text style={styles.valorTotal}>
          R$ {valorTotal.toFixed(2).replace('.', ',')}
        </Text>
      </View>

      {/*{erro ? ... : null}: Renderização condicional — só exibe o texto de erro em vermelho se houver alguma falha (ex: esqueceu de escolher o pagamento). */}
      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}

      {/* Botão Confirmar Compra */}
      <TouchableOpacity
        style={styles.btnConfirmar}
        activeOpacity={0.85}
        onPress={finalizarCompra}
        disabled={enviando}
        //disabled={enviando}: Trava o botão enquanto a requisição POST /api/Ticket está em andamento e troca o texto "Confirmar compra" pelo ícone girando (<ActivityIndicator>), evitando compras duplicadas por clique duplo.
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoConfirmar}>Confirmar compra</Text>
        )}
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
    paddingHorizontal: 20,
    maxWidth: 750,
    width: '100%',
    alignSelf: 'center',
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
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 28,
    textAlign: 'center',
  },
  secao: {
    backgroundColor: '#1C142B',
    borderWidth: 1,
    borderColor: '#352342',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  subtituloSecao: {
    fontSize: 18,
    fontWeight: '700',
    color: '#CE47A2',
    marginBottom: 16,
  },
  cardIngresso: {
    backgroundColor: '#251B35',
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#44304F',
    borderRadius: 9,
  },
  tituloAssento: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  rowOpcoes: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  opcaoBtn: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#352342',
    borderWidth: 1,
    borderColor: '#594064',
    borderRadius: 7,
    alignItems: 'center',
  },
  opcaoBtnAtivo: {
    backgroundColor: '#CE47A2',
    borderColor: '#CE47A2',
  },
  textoOpcao: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  valorItem: {
    marginTop: 14,
    color: '#CCCCCC',
    fontSize: 14,
  },
  destaquePreco: {
    color: '#CE47A2',
    fontWeight: 'bold',
  },
  secaoTotal: {
    borderColor: '#CE47A2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  valorTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#CE47A2',
  },
  textoErro: {
    color: '#e92f3b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: '600',
  },
  btnConfirmar: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#CE47A2',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoConfirmar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
