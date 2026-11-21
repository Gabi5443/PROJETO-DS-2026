import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CompraConfirmada() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Recebe o número do pedido (orderId) vindo do finalizar.tsx

  return (
    <View style={styles.body}>
      <View style={styles.container}>
        <View style={styles.iconeSucesso}>
          <Text style={styles.textoIcone}>✓</Text>
        </View>

        <Text style={styles.titulo}>Compra realizada com sucesso!</Text>

        {id ? <Text style={styles.numeroPedido}>Pedido #{id}</Text> : null}

        <Text style={styles.descricao}>
          Seu pedido foi confirmado e seus ingressos já foram registrados.
          Aproveite o filme!
        </Text>

        <TouchableOpacity
          style={styles.botao}
          activeOpacity={0.85}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.textoBotao}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#0F0A1C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 550,
    paddingVertical: 45,
    paddingHorizontal: 30,
    backgroundColor: '#1C142B',
    borderWidth: 1,
    borderColor: '#352342',
    borderRadius: 16,
    alignItems: 'center',
  },
  iconeSucesso: {
    width: 85,
    height: 85,
    marginBottom: 25,
    borderRadius: 42.5,
    backgroundColor: '#352342',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoIcone: {
    color: '#CE47A2',
    fontSize: 45,
    fontWeight: 'bold',
  },
  titulo: {
    color: '#CE47A2',
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  numeroPedido: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  descricao: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  botao: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#CE47A2',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
