import React, { useState } from 'react';
//TextInput: Campo para digitar texto (o antigo <input> do HTML).
//ActivityIndicator: Aquela bolinha girando de carregamento enquanto a API responde.
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator, } from 'react-native';
import { useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';


export default function Cadastro() {
    const router = useRouter();

    //Criam as variáveis de memória para cada campo do formulário, começando vazias (''). Cada letra digitada atualiza essas variáveis.
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    //Controla se o botão está carregando (true) ou livre (false), evitando que o usuário clique 5 vezes seguidas enquanto a internet envia os dados.
    const [carregando, setCarregando] = useState(false);
    //Guarda a mensagem de erro em vermelho (se o usuário esquecer um campo ou colocar um e-mail já cadastrado).
    const [mensagemErro, setMensagemErro] = useState('');

    //Cria a função assíncrona (async) disparada ao clicar em "Cadastrar".
    async function handleCadastro() {
        //Limpa qualquer erro antigo que estivesse aparecendo na tela.
        setMensagemErro('');

        //Validação básica: se nome, email ou senha estiverem vazios, mostra o aviso e encerra a função (return) antes de chamar a API.
        if (!nome || !email || !senha) {
            setMensagemErro('Preencha todos os campos.');
            return;
        }

        //Liga o estado de carregamento (true), trocando o texto "Cadastrar" pela bolinha girando e travando o botão.
        setCarregando(true);

        try {
            // Cria um pacote FormData (exigido pelo [FromForm] da sua UsersController.cs porque ela também aceita foto) e anexa os 4 campos exatos do seu UserRequest:
            const formData = new FormData();
            formData.append('NameUsers', nome.trim()); //.trim() remove espaços em branco acidentais antes ou depois do nome e do e-mail.
            formData.append('EmailUsers', email.trim());
            formData.append('PasswordUsers', senha);
            formData.append('RoleUsers', 'Client');//'Client' define o cargo padrão do usuário no seu EnumRoleUsers.

            const resposta = await fetch(`${API_SERVIDOR}/api/Users`, {
                method: 'POST',//Envia uma requisição POST para /api/Users levando o formData no corpo (body).
                body: formData, 
            });

            if (resposta.ok) {
                // Se a API respondeu status 200 OK, usa router.replace('/login') para mandar o usuário direto para a tela de login (o replace substitui a tela atual para que ele não volte para o formulário de cadastro ao apertar "Voltar").
                router.replace('/login');
            } else {
                const erroApi = await resposta.json(); //Se a API recusou (ex: e-mail duplicado no MySQL = erro 400), lê a mensagem de erro devolvida pelo C# e exibe na tela.
                console.log('Detalhe do erro 400:', erroApi);
                setMensagemErro(erroApi.message || erroApi.title || 'Erro ao cadastrar.');
            }
        } catch (erro) { //O catch captura falhas de rede (ex: API desligada ou Wi-Fi desconectado).
            console.error('Erro no cadastro:', erro);
            setMensagemErro('Não foi possível conectar ao servidor.');
            //O finally roda no final de tudo para desligar o carregamento (setCarregando(false)).
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
                    //value={nome}: Mostra dentro da caixinha o que está guardado na variável nome.
                    value={nome}
                    //onChangeText={setNome}: Toda vez que o usuário digita uma letra, passa o texto novo para setNome, mantendo o campo sincronizado.
                    onChangeText={setNome}
                />

                {/* Campo de E-mail */}
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu e-mail"
                    placeholderTextColor="#888"
                    //keyboardType="email-address" abre o teclado com @ no celular, e autoCapitalize="none" impede a primeira letra maiúscula automática.
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

                {/*Se mensagemErro tiver algum texto, desenha o aviso em vermelho; se estiver vazia, não renderiza nada (null). */}
                {mensagemErro ? (
                    <Text style={{ color: '#EC696A', marginBottom: 10, textAlign: 'center' }}>
                        {mensagemErro}
                    </Text>
                ) : null}

                {/* Botão Entrar */}
                <TouchableOpacity
                    style={styles.botao}
                    //onPress={handleCadastro}: Chama a função de cadastro ao tocar.
                    onPress={handleCadastro}
                    //disabled={carregando}: Trava o toque enquanto está enviando.
                    disabled={carregando}

                >   
                {/*Dentro do botão, alterna entre a bolinha girando (<ActivityIndicator>) e o texto "Cadastrar". */}
                    {carregando ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.textoBotao}>Cadastrar</Text>
                    )}
                </TouchableOpacity>

                {/* Botão para voltar sem logar, botão secundário que usa router.back() para voltar para a tela anterior. */}
                <TouchableOpacity onPress={() => router.back()} style={styles.voltar}>
                    <Text style={styles.textoVoltar}>Voltar</Text>
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
        padding: 24,
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