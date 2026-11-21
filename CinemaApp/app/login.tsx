//Trazem o useState (memória)
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, } from 'react-native';
//o AsyncStorage (para salvar os dados do usuário no celular após o login)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
//API_SERVIDOR (endereço automático da API)
import { API_SERVIDOR } from '../services/api';


export default function Login() {
  const router = useRouter();

  //email / senha: Guardam em tempo real o que o usuário digita nos dois campos.
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  //carregando: Começa false; vira true enquanto a API verifica a senha para travar o botão e mostrar o ícone girando.
  const [carregando, setCarregando] = useState(false);
  //mensagemErro: Guarda o texto de erro que aparece em vermelho acima do botão Entrar.
  const [mensagemErro, setMensagemErro] = useState('');

  // 2. Função que envia os dados para a API C#
  async function handleLogin() {
    //Limpa qualquer erro antigo antes de tentar logar de novo.
    setMensagemErro('');

    //Verifica se os campos estão vazios.
    if (!email || !senha) {
      setMensagemErro('Preencha o e-mail e a senha.');
      return;
    }
    //Liga o indicador de carregamento (true).
    setCarregando(true);

    try {
      //Faz uma requisição POST para /api/Users/login
      const resposta = await fetch(`${API_SERVIDOR}/api/Users/login`, {
        method: 'POST',
        //headers: Avisa a API C# que estamos enviando um texto no formato JSON (diferente do cadastro, que usou FormData).
        headers: {
          'Content-Type': 'application/json',
        },
        //body: Converte o objeto { email, password } em texto JSON (JSON.stringify) usando exatamente os nomes esperados pelo LoginRequest da sua UsersController.cs. O .trim() remove espaços acidentais no e-mail.
        body: JSON.stringify({
          email: email.trim(),
          password: senha,
        }),
      });

      //Se a API devolveu status 200 OK
      if (resposta.ok) {
        //Lê o objeto usuario retornado (idUsers, nameUsers, photoUsers, etc.).
        const usuario = await resposta.json();

        // Salva esse objeto no AsyncStorage com a chave 'usuarioLogado' (igual ao localStorage.setItem do site), para que o Header do 'index.tsx' e a tela de 'perfil.tsx' saibam quem está logado.
        await AsyncStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        //  redireciona para a tela inicial substituindo o histórico (assim o botão "Voltar" do celular não volta para a tela de login).
        router.replace('/');
        //Se a API devolveu 401 Unauthorized (else) ou se a rede caiu (catch), exibe a mensagem de erro.
      } else {
        Alert.alert('Erro', 'E-mail ou senha inválidos.');
      }
    } catch (erro) {
      console.error('Erro no login:', erro);
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.');
      //O finally sempre desliga o carregamento (setCarregando(false)).
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.all}>
      <View style={styles.box}>
        <Text style={styles.titulo}>Entrar no Movieing</Text>
        {/* Campo de E-mail */}
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#888"
          //Liga o campo ao estado email (value + onChangeText), ativa o teclado com @ (keyboardType="email-address") e desliga a primeira letra maiúscula (autoCapitalize="none").
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Campo de Senha */}
        <Text style={styles.label}>Senha</Text>
        {/*Liga o campo ao estado senha*/}
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          secureTextEntry // Esconde a senha com bolinhas
          value={senha}
          onChangeText={setSenha}
        />

        {/*Renderiza o <Text> vermelho somente se houver alguma mensagem de erro guardada. */}
        {mensagemErro ? (
          <Text style={{ color: '#EC696A', marginBottom: 10, textAlign: 'center' }}>
            {mensagemErro}
          </Text>
        ) : null}

        {/* Botão Entrar */}
        <TouchableOpacity
          style={styles.botao}
          //Chama handleLogin ao clicar, bloqueia cliques repetidos (disabled={carregando}) e alterna entre <ActivityIndicator> e o texto "Entrar".
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.textoBotao}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/*router.push('/cadastro'): Empilha a tela de cadastro por cima do login. */}
        <TouchableOpacity onPress={() => router.push('/cadastro')} style={styles.voltar}>
          <Text style={styles.textoVoltar}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>

        {/* Botão para voltar sem logar, para o index */}
        <TouchableOpacity onPress={() => router.back()} style={styles.voltar}>
          <Text style={styles.textoVoltar}>Voltar para o início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  all: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  box: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#B22282',
    borderRadius: 10,
    backgroundColor: '#160F29',
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    elevation: 10,
  },

  titulo: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#DDD',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#0F0A1C',
    borderWidth: 1,
    borderColor: '#5B2C6F',
    borderRadius: 6,
    color: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  botao: {
    backgroundColor: '#CE47A2',
    paddingVertical: 12,

    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBotao: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  voltar: {
    marginTop: 16,
    alignItems: 'center',
  },
  textoVoltar: {
    color: '#E25583',
    fontSize: 14,
  },
});