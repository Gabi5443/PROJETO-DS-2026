import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';

export default function SelecionarSessao() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // id do filme vindo de detalhes.tsx

  const [sessoes, setSessoes] = useState<any[]>([]);
  const [salas, setSalas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarSessoes();
  }, [id]);

  async function carregarSessoes() {
    try {
      // Busca sessões e salas em paralelo
      const [respSessoes, respSalas] = await Promise.all([
        fetch(`${API_SERVIDOR}/api/Session`),
        fetch(`${API_SERVIDOR}/api/Room`),
      ]);

      if (!respSessoes.ok || !respSalas.ok) {
        throw new Error('Erro ao buscar sessões.');
      }

      const todasSessoes = await respSessoes.json();
      const todasSalas = await respSalas.json();

      // Filtra somente as sessões do filme selecionado
      const sessoesFilme = todasSessoes.filter(
        (session: any) => Number(session.idMovieFk) === Number(id)
      );

      setSessoes(sessoesFilme);
      setSalas(todasSalas);
    } catch (e: any) {
      console.error(e);
      setErro(e.message || 'Erro ao carregar sessões.');
    } finally {
      setCarregando(false);
    }
  }

  function selecionarAssentos(idSession: number) {
    router.push({
      pathname: '/assentos' as any,
      params: { id: idSession },
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botão Voltar */}
      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.textoVoltar}>← Voltar</Text>
      </TouchableOpacity>

      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Escolha sua sessão</Text>
        <Text style={styles.subtitulo}>
          Confira os horários disponíveis e escolha a melhor opção para você.
        </Text>
      </View>

      {/* Lista de Sessões */}
      {carregando ? (
        <ActivityIndicator size="large" color="#CE47A2" style={{ marginTop: 40 }} />
      ) : erro ? (
        <Text style={styles.mensagemErro}>{erro}</Text>
      ) : sessoes.length === 0 ? (
        <Text style={styles.mensagemVazia}>Nenhuma sessão disponível.</Text>
      ) : (
        <View style={styles.listaSessoes}>
          {sessoes.map((session) => {
            // Procura a sala correspondente à sessão
            const sala = salas.find(
              (room) => Number(room.idRoom) === Number(session.idRoomFk)
            );

            const data = new Date(session.showTimeSession);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            const horarioFormatado = data.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <View key={session.idSession} style={styles.cardSessao}>
                <Text style={styles.dataSessao}>{dataFormatada}</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Horário</Text>
                  <Text style={styles.infoValor}>{horarioFormatado}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Sala</Text>
                  <Text style={styles.infoValor}>
                    {sala ? sala.nameRoom : 'Não encontrada'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Preço</Text>
                  <Text style={styles.infoValor}>
                    R$ {Number(session.priceSession).toFixed(2).replace('.', ',')}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.btnAssentos}
                  activeOpacity={0.85}
                  onPress={() => selecionarAssentos(session.idSession)}
                >
                  <Text style={styles.textoBtnAssentos}>Escolher assentos</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1C',
  },
  content: {
    paddingTop: 45,
    paddingBottom: 50,
    paddingHorizontal: 20,
    maxWidth: 1150,
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
    marginBottom: 24,
  },
  textoVoltar: {
    color: '#CE47A2',
    fontWeight: '600',
  },
  cabecalho: {
    marginBottom: 30,
  },
  titulo: {
    fontSize: 30,
    fontWeight: '800',
    color: '#CE47A2',
    marginBottom: 8,
  },
  subtitulo: {
    color: '#AAAAAA',
    fontSize: 15,
    lineHeight: 22,
  },
  mensagemVazia: {
    color: '#c2c1c1',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  mensagemErro: {
    color: '#e92f3b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  listaSessoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  cardSessao: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1C142B',
    borderWidth: 1,
    borderColor: '#352342',
    borderRadius: 14,
    padding: 24,
  },
  dataSessao: {
    fontSize: 21,
    fontWeight: '700',
    color: '#CE47A2',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  infoValor: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  btnAssentos: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#CE47A2',
    alignItems: 'center',
    marginTop: 12,
  },
  textoBtnAssentos: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
