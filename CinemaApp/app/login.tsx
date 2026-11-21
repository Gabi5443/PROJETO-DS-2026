import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';


export default function Login() {
  const router = useRouter();

  //para guardar oq o usuário digita
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  // 2. Função que envia os dados para a API C#
  async function handleLogin() {
    setMensagemErro('');

    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
      return;
    }

    setCarregando(true);

    try {
      // ⚠️ Confira se a rota e os nomes dos campos (emailUsers/passwordUsers)
      // são exatamente esses na sua UsersController do C#
      const resposta = await fetch(`${API_SERVIDOR}/api/Users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: senha,
        }),
      });

      if (resposta.ok) {
        const usuario = await resposta.json();

        // Salva no celular (igual ao localStorage.setItem do seu site)
        await AsyncStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        // Volta para a tela inicial (Index), que já vai carregar a foto do usuário!
        router.replace('/');
      } else {
        Alert.alert('Erro', 'E-mail ou senha inválidos.');
      }
    } catch (erro) {
      console.error('Erro no login:', erro);
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.');
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
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Campo de Senha */}
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          secureTextEntry // Esconde a senha com bolinhas
          value={senha}
          onChangeText={setSenha}
        />

        {mensagemErro ? (
          <Text style={{ color: '#EC696A', marginBottom: 10, textAlign: 'center' }}>
            {mensagemErro}
          </Text>
        ) : null}

        {/* Botão Entrar */}
        <TouchableOpacity
          style={styles.botao}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.textoBotao}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/cadastro')} style={styles.voltar}>
          <Text style={styles.textoVoltar}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>

        {/* Botão para voltar sem logar */}
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