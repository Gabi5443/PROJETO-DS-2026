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
  const { idSession, assentos } = useLocalSearchParams();

  const [usuario, setUsuario] = useState<any>(null);
  const [precoSessao, setPrecoSessao] = useState(0);
  const [ingressos, setIngressos] = useState<any[]>([]);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDadosSessao();
  }, []);

  async function carregarDadosSessao() {
    try {
      const dadosUsuario = await AsyncStorage.getItem('usuarioLogado');
      if (!dadosUsuario) {
        router.replace('/login');
        return;
      }
      setUsuario(JSON.parse(dadosUsuario));

      const listaAssentos: string[] = assentos ? JSON.parse(String(assentos)) : [];
      if (!idSession) {
        throw new Error('Sessão não informada.');
      }
      if (listaAssentos.length === 0) {
        throw new Error('Nenhum assento foi selecionado.');
      }

      const resposta = await fetch(`${API_SERVIDOR}/api/Session/${idSession}`);
      if (!resposta.ok) {
        throw new Error('Não foi possível carregar a sessão.');
      }

      const session = await resposta.json();
      const preco = Number(session.priceSession);
      setPrecoSessao(preco);

      // Gera os ingressos começando como Inteira (typeTicket: 1)
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

  const valorTotal = ingressos.reduce(
    (soma, ingresso) => soma + ingresso.finalPriceTicket,
    0
  );

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

        {ingressos.map((item, index) => (
          <View key={item.seatNumberTicket} style={styles.cardIngresso}>
            <Text style={styles.tituloAssento}>
              Assento {item.seatNumberTicket}
            </Text>

            <Text style={styles.label}>Tipo de ingresso:</Text>
            <View style={styles.rowOpcoes}>
              <TouchableOpacity
                style={[
                  styles.opcaoBtn,
                  item.typeTicket === 1 && styles.opcaoBtnAtivo,
                ]}
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

        <View style={styles.rowOpcoes}>
          {['Cartão', 'Pix', 'Dinheiro'].map((metodo) => (
            <TouchableOpacity
              key={metodo}
              style={[
                styles.opcaoBtn,
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
      <View style={[styles.secao, styles.secaoTotal]}>
        <Text style={styles.labelTotal}>Total:</Text>
        <Text style={styles.valorTotal}>
          R$ {valorTotal.toFixed(2).replace('.', ',')}
        </Text>
      </View>

      {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}

      {/* Botão Confirmar Compra */}
      <TouchableOpacity
        style={styles.btnConfirmar}
        activeOpacity={0.85}
        onPress={finalizarCompra}
        disabled={enviando}
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
