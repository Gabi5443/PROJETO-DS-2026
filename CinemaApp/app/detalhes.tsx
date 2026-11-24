import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions, //useWindowDimensions: Pega a largura (width) e altura atuais da tela em tempo real, permitindo adaptar o layout para celular ou PC.
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; //useLocalSearchParams: Hook do Expo Router que lê os parâmetros enviados pela rota anterior (substitui o new URLSearchParams(window.location.search) do site).
import { API_SERVIDOR } from '../services/api';

export default function DetalhesFilme() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Equivalente ao params.get('id')/ const { id }: Extrai exatamente o id do filme que foi passado quando você tocou no card da tela inicial ou no banner.
  const { width } = useWindowDimensions();

  const [filme, setFilme] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Define se a tela é larga (PC/Tablet) ou estreita (Celular)
  const telaGrande = width >= 650; //const telaGrande = width >= 650: Substitui o @media (max-width: 650px) do CSS. Se a tela tiver 650px ou mais (como no PC), telaGrande vira true.

  useEffect(() => {
    carregarDetalhes(); //useEffect(..., [id]): Executa carregarDetalhes() assim que a tela abre ou sempre que o id do filme mudar.
  }, [id]);

  // Mesma função formatarDuracao do seu script
  function formatarDuracao(minutos: number) {
    if (!minutos) return '';
    const horas = Math.floor(minutos / 60);//Math.floor(minutos / 60): Divide os minutos totais por 60 e arredonda para baixo para achar as horas inteiras.
    const minutosRestantes = minutos % 60; //minutos % 60: Pega o resto da divisão para saber quantos minutos sobraram.

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
      const resposta = await fetch(`${API_SERVIDOR}/api/Movie/${id}`); //fetch(.../api/Movie/${id}): Busca no backend C# os dados apenas daquele filme específico.
      if (!resposta.ok) {
        throw new Error('Não foi possível encontrar o filme.');
      }

      const dados = await resposta.json();
      setFilme(dados);
    } catch (e: any) {
      console.error('Erro ao buscar detalhes:', e);
      setErro('Erro ao carregar os detalhes do filme.');
      //finally: Roda sempre ao final (com sucesso ou erro) para desligar o indicador de carregamento (setCarregando(false)).
    } finally {
      setCarregando(false);
    }
  }

  //Enquanto carregando for true, desenha apenas a bolinha rosa girando. Se der erro ou o filme vier vazio, desenha a mensagem de erro com o botão de voltar.
  if (carregando) {
    return (
      <View style={[styles.container, styles.centralizado]}>
        <ActivityIndicator size="large" color="#CE47A2" />
      </View>
    );
  }

  //aqui a msg do erro, e o btn de voltar
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

  //Monta a URL completa do pôster (com fallback para uma imagem padrão caso o filme não tenha foto) e padroniza o filmeId.
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

      {/*  (telaGrande && ...): No celular, usa apenas styles.conteudoDetalhe (empilhado em coluna). Se telaGrande for true, soma o estilo conteudoDetalheRow (colocando pôster e texto lado a lado) e aumenta o tamanho da imagem.*/}
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

        {/*router.push(...): Ao tocar no botão Comprar ingresso, abre a tela app/sessoes.tsx levando o id do filme na bagagem (params). */}
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
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-Regular',
  },
  metaInfo: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 28,
    fontFamily: 'Montserrat-Regular',
  },
  subtituloSinopse: {
    color: '#CE47A2',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular',
  },
  sinopse: {
    color: '#DDDDDD',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'justify',
    fontFamily: 'Montserrat-Regular',
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
    fontFamily: 'Montserrat-Regular',
  },
  textoErro: {
    color: '#e92f3b',
    fontSize: 16,
    marginBottom: 16,
    fontFamily: 'Montserrat-Regular',
  },
});
