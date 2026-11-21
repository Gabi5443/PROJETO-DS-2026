import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';


export default function Cadastro() {
    const router = useRouter();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    async function handleCadastro() {
        setMensagemErro('');

        if (!nome || !email || !senha) {
            setMensagemErro('Preencha todos os campos.');
            return;
        }

        setCarregando(true);

        try {
            // A sua UsersController usa [FromForm], então usamos FormData (não JSON!)
            const formData = new FormData();
            formData.append('NameUsers', nome.trim());
            formData.append('EmailUsers', email.trim());
            formData.append('PasswordUsers', senha);
            formData.append('RoleUsers', 'Client');

            const resposta = await fetch(`${API_SERVIDOR}/api/Users`, {
                method: 'POST',
                body: formData, // Não coloque 'Content-Type' manual aqui, o fetch faz sozinho
            });

            if (resposta.ok) {
                // Cadastro feito! Manda para o login
                router.replace('/login');
            } else {
                const erroApi = await resposta.json();
                console.log('Detalhe do erro 400:', erroApi);
                setMensagemErro(erroApi.message || erroApi.title || 'Erro ao cadastrar.');
            }
        } catch (erro) {
            console.error('Erro no cadastro:', erro);
            setMensagemErro('Não foi possível conectar ao servidor.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <View style={styles.all}>
            <View style={styles.box}>
                <Text style={styles.titulo}>Cadastre-se</Text>

                {/* Campo de Nome */}
                <Text style={styles.label}>Nome</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu nome"
                    placeholderTextColor="#888"
                    value={nome}
                    onChangeText={setNome}
                />

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
                    onPress={handleCadastro}
                    disabled={carregando}
                >
                    {carregando ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.textoBotao}>Cadastrar</Text>
                    )}
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