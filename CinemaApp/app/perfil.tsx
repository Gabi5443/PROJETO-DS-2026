import React, { useState, useEffect } from 'react';
//Platform: Permite detectar se o app está rodando no navegador ('web') ou no celular ('android' / 'ios'), pois o envio de arquivos no FormData funciona diferente nos dois.
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator, Platform, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
//ImagePicker: Biblioteca do Expo que abre a galeria de fotos do celular ou o seletor de arquivos do PC.
import * as ImagePicker from 'expo-image-picker';
import { API_SERVIDOR } from '../services/api';

const FOTO_PADRAO = `${API_SERVIDOR}/uploads/users/default-avatar.jpg`;

export default function Perfil() {
  const router = useRouter();

  //abaAtiva: Substitui o antigo <iframe>. Só pode assumir um dos 3 valores ('perfil', 'editar' ou 'historico'), começando em 'perfil'.
  const [abaAtiva, setAbaAtiva] = useState<'perfil' | 'editar' | 'historico'>('perfil');

  //usuario / carregando: Guardam os dados do usuário logado e controlam o loading inicial da tela.
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  //use state explicação - > imagina que eu quero anotar qnts porta eu abro em um dia, pra isso vc pode guardar em uma anotação qnts vc já abriu e adicionar 1 a cada nova porta que vc abre. O problema é ter que anotar toda a vez. Imagina que você tem uma caneta mágiga que vai lá no caderninho e atualiza o numero de portas. Isso é o use state = um hook que guarda o valor atual e atualiza (automaticamente) o valor quando ele mudar

  //o que vem entre parenteses -> use state() é o valor inicial

  //nome, email, novaFoto, salvando, aviso: Guardam os campos do formulário da aba Editar e a mensagem de sucesso/erro.
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaFoto, setNovaFoto] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState('');

  //ingressos / carregandoIngressos: Guardam a lista de compras da aba Histórico.
  const [ingressos, setIngressos] = useState<any[]>([]);
  const [carregandoIngressos, setCarregandoIngressos] = useState(false);

  //useEffect(..., []): Roda uma vez ao abrir a tela para buscar os dados do usuário logado.
  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  //useEffect(..., [abaAtiva]): Fica "vigiando" a variável abaAtiva. Toda vez que você toca na aba 'historico', ele dispara carregarHistorico automaticamente para buscar os ingressos atualizados na API.
  useEffect(() => {
    if (abaAtiva === 'historico' && usuario) {
      carregarHistorico(usuario.idUsers);
    }
  }, [abaAtiva]);

  async function carregarDadosUsuario() {
    try {
      //(!dadosSalvos): Se alguém tentar acessar /perfil sem estar logado, é redirecionado na hora para /login.
      const dadosSalvos = await AsyncStorage.getItem('usuarioLogado');
      if (!dadosSalvos) {
        router.replace('/login');
        return;
      }

      //Busca os dados mais recentes em GET /api/Users/{id}, preenche usuario, nome e email (para os inputs de edição já virem preenchidos) e atualiza o AsyncStorage.
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
    //launchImageLibraryAsync: Abre a galeria aceitando apenas imagens (['images']), libera o recorte quadrado (aspect: [1, 1]) e reduz levemente o tamanho do arquivo (quality: 0.8) para subir rápido. Se o usuário não cancelar, guarda a foto escolhida em novaFoto.
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
      //FormData: Prepara os campos exatamente como o UpdateUser da sua UsersController.cs espera.
      const formData = new FormData();
      formData.append('NameUsers', nome.trim());
      formData.append('EmailUsers', email.trim());
      formData.append('RoleUsers', String(usuario.roleUsers ?? 'Client'));

      //Na Web, o fetch precisa converter o link da imagem em um arquivo binário real (blob()); no celular (Android/iOS), basta passar o objeto { uri, name, type }.
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

      //Limpa novaFoto, recarrega os dados do usuário (carregarDadosUsuario()), mostra o aviso verde/rosa e volta para a aba 'perfil'
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

  //carregarHistorico: Bate em GET /api/Ticket/user/{userId} e salva a lista no estado ingressos.
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

  //cancelarPedido: Envia DELETE /api/Ticket/cancelar/{orderId}/{userId} e, se der certo, recarrega a lista de ingressos.
  async function cancelarTodosPedidos() {
    // Pega apenas os números únicos de pedidos (ex: idOrderFk)
    const pedidosUnicos = [...new Set(ingressos.map((t) => t.idOrderFk))];

    try {
      for (const orderId of pedidosUnicos) {
        if (!orderId) continue;

        const resposta = await fetch(
          `${API_SERVIDOR}/api/Ticket/cancelar/${orderId}/${usuario.idUsers}`,
          { method: 'DELETE' }
        );

        if (!resposta.ok) {
          const erro = await resposta.json();
          setAviso(erro.message || `Erro ao cancelar pedido #${orderId}`);
          return;
        }
      }

      setAviso('Pedidos cancelados com sucesso!');
      carregarHistorico(usuario.idUsers);
    } catch (erro) {
      console.error('Erro ao cancelar:', erro);
      setAviso('Erro de conexão ao cancelar pedidos.');
    }
  }

  //sairDaConta: Apaga 'usuarioLogado' do AsyncStorage e manda o usuário de volta para a Home (router.replace('/')).
  async function sairDaConta() {
    await AsyncStorage.removeItem('usuarioLogado');
    router.replace('/');
  }

  //Enquanto carregando for true, mostra apenas a bolinha girando centralizada.
  if (carregando || !usuario) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#CE47A2" />
      </View>
    );
  }

  //uriFotoAtual: Decide qual imagem mostrar no círculo grande do topo em ordem de prioridade:
  //1. Se acabou de escolher uma novaFoto na galeria (mesmo antes de clicar em Salvar), já mostra a prévia dela!
  //2. Senão, mostra a foto atual do usuário vinda da API.
  //3. Senão, mostra a FOTO_PADRAO.
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

      {/*PARA ENTENDER O RESTO DO CÓDIGO: Troca de Abas ({abaAtiva === 'perfil' && (...)}): É o if visual do React. Apenas o bloco correspondente à aba selecionada no menu é desenhado na tela. */}
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
        <View style={{ width: '90%', maxWidth: 600, alignSelf: 'center' }}>
          {carregandoIngressos ? (
            <ActivityIndicator color="#CE47A2" />
          ) : ingressos.length === 0 ? (
            <Text style={{ color: '#c2c1c1', textAlign: 'center', marginTop: 20 }}>
              Você ainda não comprou nenhum ingresso.
            </Text>
          ) : (
            <>
              {ingressos.map((ticket, index) => {
                const tipoIngresso = ticket.typeTicket === 2 ? 'Meia-Entrada' : 'Inteira';
                const valorFormatado = Number(ticket.finalPriceTicket || 0)
                  .toFixed(2)
                  .replace('.', ',');

                return (
                  <View key={index} style={[styles.box, { width: '100%', marginBottom: 14 }]}>
                    <Text style={styles.tituloBox}>
                      Ingresso #{ticket.idTicket} (Pedido #{ticket.idOrderFk})
                    </Text>
                    <Text style={styles.dado}>
                      <Text style={styles.destaque}>Sessão: </Text>#{ticket.idSessionFk} |{' '}
                      <Text style={styles.destaque}>Poltrona: </Text>
                      {ticket.seatNumberTicket}
                    </Text>
                    <Text style={styles.dado}>
                      <Text style={styles.destaque}>Tipo: </Text>
                      {tipoIngresso}
                    </Text>
                    <Text style={styles.dado}>
                      <Text style={styles.destaque}>Valor Pago: </Text>R$ {valorFormatado}
                    </Text>
                  </View>
                );
              })}

              {/* Botão único lá embaixo */}
              <TouchableOpacity
                style={[styles.btnSair, { alignSelf: 'center', marginTop: 10, paddingHorizontal: 24, paddingVertical: 12 }]}
                onPress={cancelarTodosPedidos}
              >
                <Text style={styles.textoSair}>Cancelar Pedidos</Text>
              </TouchableOpacity>
            </>
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