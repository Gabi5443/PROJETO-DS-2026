import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      {/* Deixa os ícones da bateria/hora do celular brancos para combinar com o fundo escuro */}
      <StatusBar style="light" />
      
      <Stack
        screenOptions={{
          // Esconde o cabeçalho nativo branco para aparecer só o seu Header personalizado
          headerShown: false,
          contentStyle: { backgroundColor: '#0F0A1C' },
        }}
      />
    </>
  );
}
