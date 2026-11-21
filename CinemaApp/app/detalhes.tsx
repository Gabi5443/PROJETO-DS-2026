import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';

export default function DetalhesFilme() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Equivalente ao params.get('id')
  const { width } = useWindowDimensions();

  const [filme, setFilme] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Define se a tela é larga (PC/Tablet) ou estreita (Celular)
  const telaGrande = width >= 650;

  useEffect(() => {
    carregarDetalhes();
  }, [id]);

  // Mesma função formatarDuracao do seu script
  function formatarDuracao(minutos: number) {
    if (!minutos) return '';
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas === 0) return `${minutosRestantes} min`;
    if (minutosRestantes === 0) return `${horas}h`;
    return `${horas}h ${minutosRestantes}min`;
  }

  async function carregarDetalhes() {
    if (!id) {
      setErro('Filme não encontrado.');
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch(`${API_SERVIDOR}/api/Movie/${id}`);
      if (!resposta.ok) {
        throw new Error('Não foi possível encontrar o filme.');
      }

      const dados = await resposta.json();
      setFilme(dados);
    } catch (e: any) {
      console.error('Erro ao buscar detalhes:', e);
      setErro('Erro ao carregar os detalhes do filme.');
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return (
      <View style={[styles.container, styles.centralizado]}>
        <ActivityIndicator size="large" color="#CE47A2" />
      </View>
    );
  }

  if (erro || !filme) {
    return (
      <View style={[styles.container, styles.centralizado]}>
        <Text style={styles.textoErro}>{erro || 'Filme não encontrado.'}</Text>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Text style={styles.textoVoltar}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const urlImagem = filme.photoMovie
    ? `${API_SERVIDOR}${filme.photoMovie}`
    : `${API_SERVIDOR}/uploads/movies/default.jpg`;

  const duracaoFormatada = formatarDuracao(filme.durationMovie);
  const filmeId = filme.idMovie ?? filme.IdMovie;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Botão Voltar no topo */}
      <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
        <Text style={styles.textoVoltar}>← Voltar para filmes</Text>
      </TouchableOpacity>

      {/* Conteúdo principal (lado a lado no PC, empilhado no celular) */}
      <View style={[styles.conteudoDetalhe, telaGrande && styles.conteudoDetalheRow]}>
        <Image
          source={{ uri: urlImagem }}
          style={[styles.posterDetalhe, telaGrande && styles.posterDetalheGrande]}
        />

        <View style={[styles.infoDetalhe, telaGrande && { flex: 1 }]}>
          <Text style={[styles.titulo, telaGrande && { fontSize: 36 }]}>
            {filme.titleMovie}
          </Text>

          <Text style={styles.metaInfo}>
            {duracaoFormatada} • {filme.genreMovie}
          </Text>

          <Text style={styles.subtituloSinopse}>Sinopse</Text>
          <Text style={styles.sinopse}>
            {filme.synopsisMovie || 'Sinopse não disponível.'}
          </Text>

          <TouchableOpacity
            style={styles.btnComprar}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/sessoes' as any,
                params: { id: filmeId },
              })
            }
          >
            <Text style={styles.textoBtnComprar}>Comprar ingresso</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  scrollContent: {
    paddingTop: 45,
    paddingBottom: 50,
    paddingHorizontal: 20,
    maxWidth: 1100,
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
  conteudoDetalhe: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  },
  conteudoDetalheRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 40,
  },
  posterDetalhe: {
    width: 220,
    height: 330,
    borderRadius: 12,
    backgroundColor: '#160F29',
  },
  posterDetalheGrande: {
    width: 300,
    height: 440,
  },
  infoDetalhe: {
    width: '100%',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metaInfo: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 28,
  },
  subtituloSinopse: {
    color: '#CE47A2',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sinopse: {
    color: '#DDDDDD',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
  },
  btnComprar: {
    marginTop: 30,
    backgroundColor: '#CE47A2',
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  textoBtnComprar: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  textoErro: {
    color: '#e92f3b',
    fontSize: 16,
    marginBottom: 16,
  },
});
