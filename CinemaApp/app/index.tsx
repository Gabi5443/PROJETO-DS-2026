import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

//a rota da api no arquivo .env
const API_SERVIDOR = process.env.EXPO_PUBLIC_API_URL;
const FOTO_PADRAO = `${API_SERVIDOR}/uploads/users/default-avatar.jpg`;

interface Usuario {
  idUsers: number;
  nameUsers: string;
  photoUsers?: string;
}

export default function Index() {
    //aqui é pra chamar a foto certa lá no header.No react a gnt n mexe nas fotos, ele só atualiza elas. O nome 'fotoPerfil' é uma variavel de memória, e o setFotoPerfil é pra atualizar ela (caso o usuário tenha mudado)
    //o useRouter, pra navegar nas paginas
  const router = useRouter();
  const [fotoPerfil, setFotoPerfil] = useState(FOTO_PADRAO);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  //Os colchetes vazios [] no final significam: "Rode essa função uma única vez assim que o usuário abrir essa tela"
  useEffect(() => {
    //setFotoPerfil(...) → Se achou alguém salvo no celular, já mostra a foto antiga imediatamente para o usuário não ficar olhando para uma bolinha vazia enquanto a internet carrega.
    atualizarFotoHeader();
  }, []);

  async function atualizarFotoHeader() {
    try {
      // await fetch(...) → Bate na sua API C# (/api/Users/{id}) em segundo plano. Se o usuário mudou a foto recentemente, ele baixa o dado novo, atualiza a tela (setFotoPerfil) e salva no celular de novo (AsyncStorage.setItem).
      const dadosSalvos = await AsyncStorage.getItem('usuarioLogado');

      if (!dadosSalvos) {
        setFotoPerfil(FOTO_PADRAO);
        setUsuario(null);
        return;
      }

      const userCache = JSON.parse(dadosSalvos);
      setUsuario(userCache);

      // 2. Mostra imediatamente a foto que estava salva no cache
      if (userCache.photoUsers) {
        setFotoPerfil(`${API_SERVIDOR}${userCache.photoUsers}`);
      }

      // 3. Busca na API pelo ID para pegar a foto mais atual
      const resposta = await fetch(`${API_SERVIDOR}/api/Users/${userCache.idUsers}`);
      
      if (resposta.ok) {
        const usuarioAtualizado = await resposta.json();
        setUsuario(usuarioAtualizado);

        if (usuarioAtualizado.photoUsers) {
          setFotoPerfil(`${API_SERVIDOR}${usuarioAtualizado.photoUsers}`);
        }

        // Atualiza o AsyncStorage com os dados novos
        await AsyncStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
      }
    } catch (erro) {
      console.warn('Não foi possível atualizar a foto pela API, mantendo a do cache:', erro);
    }
  }

  // 4. Equivalente ao imgPerfil.addEventListener("click")
  function handleCliquePerfil() {
    if (usuario) {
      // Navega para a tela de perfil passando o idUsers
      router.push({ pathname: '/perfil', params: { id: usuario.idUsers } });
    } else {
      // Navega para a tela de login
      router.push('/login');
    }
  }

  return (
    <ScrollView style={styles.all}>
      <View style={styles.header}>
        {/* Logo MOVIEING */}
        <View style={styles.logo}>
          <Text style={[styles.logoText, { color: '#5B2C6F' }]}>M</Text>
          <Text style={[styles.logoText, { color: '#76327E' }]}>O</Text>
          <Text style={[styles.logoText, { color: '#92388C' }]}>V</Text>
          <Text style={[styles.logoText, { color: '#B03E98' }]}>I</Text>
          <Text style={[styles.logoText, { color: '#CE47A2' }]}>E</Text>
          <Text style={[styles.logoText, { color: '#E25583' }]}>I</Text>
          <Text style={[styles.logoText, { color: '#EC696A' }]}>N</Text>
          <Text style={[styles.logoText, { color: '#F27D52' }]}>G</Text>
        </View>

        {/* Foto de Perfil */}
        {/*onPress={handleCliquePerfil}: é o antigo addEventListener("click"). Quando toca na foto, ele checa se usuario existe; se existir manda para /perfil, senão manda para /login.*/}
        <TouchableOpacity onPress={handleCliquePerfil} activeOpacity={0.7}>
          <Image
          //em source={{ uri: fotoPerfil }}: a imagem está "amarrada" à variável de estado fotoPerfil.
            source={{ uri: fotoPerfil }}
            style={styles.avatar}
            // onError={...}: se o link da foto quebrar, volta para a FOTO_PADRAO.
            onError={() => setFotoPerfil(FOTO_PADRAO)}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  all: {
    flex: 1,
    backgroundColor: '#0F0A1C',
  },
  header: {
    height: 100,
    paddingHorizontal: '4%',
    paddingTop: 25,
    backgroundColor: '#0F0A1C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#CE47A2',
  },
  logo: {
    flexDirection: 'row',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#CE47A2',
  },
});
