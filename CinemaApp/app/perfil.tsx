import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, Platform, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_SERVIDOR } from '../services/api';

const FOTO_PADRAO = `${API_SERVIDOR}/uploads/users/default-avatar.jpg`;

export default function Perfil() {
  const router = useRouter();

  // Controla qual "iframe" está visível na tela
  const [abaAtiva, setAbaAtiva] = useState<'perfil' | 'editar' | 'historico'>('perfil');

  // Dados do usuário
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  // Estados da aba Editar Perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaFoto, setNovaFoto] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState('');

  // Estados da aba Histórico
  const [ingressos, setIngressos] = useState<any[]>([]);
  const [carregandoIngressos, setCarregandoIngressos] = useState(false);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  // Quando clicar na aba Histórico, busca os ingressos
  useEffect(() => {
    if (abaAtiva === 'historico' && usuario) {
      carregarHistorico(usuario.idUsers);
    }
  }, [abaAtiva]);

  async function carregarDadosUsuario() {
    try {
      const dadosSalvos = await AsyncStorage.getItem('usuarioLogado');
      if (!dadosSalvos) {
        router.replace('/login');
        return;
      }

      const userCache = JSON.parse(dadosSalvos);
      const resposta = await fetch(`${API_SERVIDOR}/api/Users/${userCache.idUsers}`);
      const dados = resposta.ok ? await resposta.json() : userCache;

      setUsuario(dados);
      setNome(dados.nameUsers || '');
      setEmail(dados.emailUsers || '');
      await AsyncStorage.setItem('usuarioLogado', JSON.stringify(dados));
    } catch (erro) {
      console.error('Erro ao carregar perfil:', erro);
    } finally {
      setCarregando(false);
    }
  }

  // Abre a galeria para escolher a nova foto
  async function escolherFoto() {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setNovaFoto(resultado.assets[0]);
    }
  }

  // Equivalente ao submit do EditarPerfil.html
  async function salvarEdicao() {
    setAviso('');
    setSalvando(true);

    try {
      const formData = new FormData();
      formData.append('NameUsers', nome.trim());
      formData.append('EmailUsers', email.trim());
      formData.append('RoleUsers', String(usuario.roleUsers ?? 'Client'));

      if (novaFoto) {
        if (Platform.OS === 'web') {
          const respBlob = await fetch(novaFoto.uri);
          const blob = await respBlob.blob();
          formData.append('PhotoUsers', blob, 'perfil.jpg');
        } else {
          formData.append('PhotoUsers', {
            uri: novaFoto.uri,
            name: 'perfil.jpg',
            type: 'image/jpeg',
          } as any);
        }
      }

      const resposta = await fetch(`${API_SERVIDOR}/api/Users/${usuario.idUsers}`, {
        method: 'PUT',
        body: formData,
      });

      const resultado = await resposta.json();
      if (!resposta.ok) throw new Error(resultado.message || 'Erro ao atualizar');

      setNovaFoto(null);
      await carregarDadosUsuario();
      setAviso('Perfil atualizado com sucesso!');
      setAbaAtiva('perfil');
    } catch (erro: any) {
      setAviso(`Erro: ${erro.message}`);
    } finally {
      setSalvando(false);
    }
  }

  // Equivalente ao carregarHistorico() do HistoricoIngressos.html
  async function carregarHistorico(userId: number) {
    setCarregandoIngressos(true);
    try {
      const resposta = await fetch(`${API_SERVIDOR}/api/Ticket/user/${userId}`);
      if (resposta.ok) {
        const lista = await resposta.json();
        setIngressos(lista);
      }
    } catch (erro) {
      console.error('Erro ao buscar ingressos:', erro);
    } finally {
      setCarregandoIngressos(false);
    }
  }

  // Equivalente ao cancelarPedido()
  async function cancelarPedido(orderId: number) {
    try {
      const resposta = await fetch(
        `${API_SERVIDOR}/api/Ticket/cancelar/${orderId}/${usuario.idUsers}`,
        { method: 'DELETE' }
      );
      if (resposta.ok) {
        carregarHistorico(usuario.idUsers);
      }
    } catch (erro) {
      console.error('Erro ao cancelar:', erro);
    }
  }

  // Equivalente ao sairDaConta()
  async function sairDaConta() {
    await AsyncStorage.removeItem('usuarioLogado');
    router.replace('/');
  }

  if (carregando || !usuario) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#CE47A2" />
      </View>
    );
  }

  const uriFotoAtual = novaFoto
    ? novaFoto.uri
    : usuario.photoUsers
      ? `${API_SERVIDOR}${usuario.photoUsers}`
      : FOTO_PADRAO;
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Topo com botão Voltar e Foto */}
      <View style={styles.topo}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.replace('/')}>
          <Text style={styles.textoVoltar}>← Voltar</Text>
        </TouchableOpacity>

        <Image source={{ uri: uriFotoAtual }} style={styles.fotoGrande} />
        <Text style={styles.nomeTopo}>{usuario.nameUsers}</Text>
      </View>

      {/* Menu de Abas (substitui os links do sidebar + iframe) */}
      <View style={styles.menuAbas}>
        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'perfil' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('perfil')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'perfil' && styles.textoAbaAtiva]}>
            Meu Perfil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'editar' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('editar')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'editar' && styles.textoAbaAtiva]}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'historico' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('historico')}
        >
          <Text style={[styles.textoAba, abaAtiva === 'historico' && styles.textoAbaAtiva]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

      {/* CONTEÚDO 1: MEU PERFIL */}
      {abaAtiva === 'perfil' && (
        <View style={styles.box}>
          <Text style={styles.tituloBox}>Informações da Conta</Text>
          <Text style={styles.dado}>
            <Text style={styles.destaque}>Nome: </Text>
            {usuario.nameUsers}
          </Text>
          <Text style={styles.dado}>
            <Text style={styles.destaque}>E-mail: </Text>
            {usuario.emailUsers}
          </Text>

          <View style={styles.rodapePerfil}>
            <View style={styles.badge}>
              <Text style={styles.textoBadge}>Cliente Estrela ★</Text>
            </View>

            <TouchableOpacity style={styles.btnSair} onPress={sairDaConta}>
              <Text style={styles.textoSair}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CONTEÚDO 2: EDITAR PERFIL */}
      {abaAtiva === 'editar' && (
        <View style={styles.box}>
          <Text style={styles.tituloBox}>Editar Perfil</Text>

          <TouchableOpacity style={styles.btnFoto} onPress={escolherFoto}>
            <Text style={styles.textoBtnFoto}>Escolher Nova Foto</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarEdicao} disabled={salvando}>
            {salvando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.textoSalvar}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* CONTEÚDO 3: HISTÓRICO DE INGRESSOS */}
      {abaAtiva === 'historico' && (
        <View style={{ paddingHorizontal: 20 }}>
          {carregandoIngressos ? (
            <ActivityIndicator color="#CE47A2" />
          ) : ingressos.length === 0 ? (
            <Text style={{ color: '#c2c1c1', textAlign: 'center', marginTop: 20 }}>
              Você ainda não comprou nenhum ingresso.
            </Text>
          ) : (
            ingressos.map((ticket, index) => {
              const orderId = ticket.idOrder ?? ticket.orderIdFk;
              const dataFormatada = ticket.dateTimeSession
                ? new Date(ticket.dateTimeSession).toLocaleString('pt-BR')
                : '';

              return (
                <View key={index} style={[styles.box, { marginHorizontal: 0, marginBottom: 14 }]}>
                  <Text style={styles.tituloBox}>{ticket.titleMovie ?? 'Filme'}</Text>
                  <Text style={styles.dado}>
                    <Text style={styles.destaque}>Pedido: </Text>#{orderId}
                  </Text>
                  <Text style={styles.dado}>
                    <Text style={styles.destaque}>Sala: </Text>
                    {ticket.nameRoom ?? ticket.idRoomFk} |{' '}
                    <Text style={styles.destaque}>Poltrona: </Text>
                    {ticket.seatTicket}
                  </Text>
                  <Text style={styles.dado}>
                    <Text style={styles.destaque}>Data/Hora: </Text>
                    {dataFormatada}
                  </Text>
                  <Text style={styles.dado}>
                    <Text style={styles.destaque}>Valor: </Text>R$ {ticket.priceTicket}
                  </Text>

                  <TouchableOpacity
                    style={[styles.btnSair, { marginTop: 12, alignSelf: 'flex-start' }]}
                    onPress={() => cancelarPedido(orderId)}
                  >
                    <Text style={styles.textoSair}>Cancelar Pedido</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
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
  topo: {
    backgroundColor: '#160F29',
    paddingTop: 45,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#B22282',
  },
  btnVoltar: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e92f3b',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  textoVoltar: {
    color: '#e92f3b',
    fontWeight: '600',
  },
  fotoGrande: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#CE47A2',
  },
  nomeTopo: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  menuAbas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#160F29',
    width: '90%',        
    maxWidth: 600,       
    alignSelf: 'center', 
    marginVertical: 20,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#302158',
  },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  abaAtiva: {
    backgroundColor: '#B22282',
  },
  textoAba: {
    color: '#c2c1c1',
    fontWeight: '600',
  },
  textoAbaAtiva: {
    color: '#FFF',
  },
  aviso: {
    color: '#CE47A2',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  box: {
    width: '90%',        
    maxWidth: 600,       
    alignSelf: 'center', 
    backgroundColor: '#160F29',
    borderWidth: 1,
    borderColor: '#B22282',
    borderRadius: 10,
    padding: 22,
  },
  tituloBox: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dado: {
    color: '#FFF',
    fontSize: 15,
    marginBottom: 10,
  },
  destaque: {
    color: '#B22282',
    fontWeight: 'bold',
  },
  rodapePerfil: {
    borderTopWidth: 1,
    borderTopColor: '#302158',
    paddingTop: 16,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#302158',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  textoBadge: {
    color: '#E25583',
    fontSize: 13,
  },
  btnSair: {
    borderWidth: 1,
    borderColor: '#e92f3b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  textoSair: {
    color: '#e92f3b',
    fontWeight: '600',
  },
  btnFoto: {
    borderWidth: 1,
    borderColor: '#CE47A2',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  textoBtnFoto: {
    color: '#CE47A2',
    fontWeight: 'bold',
  },
  label: {
    color: '#DDD',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#0F0A1C',
    borderWidth: 1,
    borderColor: '#2D1E54',
    borderRadius: 6,
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  btnSalvar: {
    backgroundColor: '#B22282',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  textoSalvar: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});