//Importa o componente Stack (pilha de navegação) do expo-router. Ele gerencia todas as suas telas (index, login, perfil, detalhes) como uma pilha de cartas: quando você abre uma tela nova, ela entra por cima da anterior; quando volta, ela sai.
import { Stack } from 'expo-router';
//Importa o componente StatusBar, que controla a barrinha bem no topo do celular onde ficam a hora, o sinal do Wi-Fi e a bateria.
import { StatusBar } from 'expo-status-bar';

//Cria e exporta o componente principal de layout do aplicativo (export default é obrigatório para o Expo Router reconhecer o arquivo). Tudo o que você colocar aqui dentro vai envolver todas as telas do seu app.
export default function RootLayout() {
  //Inicia o retorno visual (JSX) que será desenhado na tela.
  return (
    //É um Fragmento React (<> ... </>). No React, um componente não pode retornar dois elementos soltos lado a lado (<StatusBar> e <Stack>). O fragmento serve como uma "caixa invisível" para agrupar os dois sem criar uma <View> desnecessária.
    <>
      {/* Deixa os ícones da bateria/hora do celular brancos para combinar com o fundo escuro */}
      <StatusBar style="light" />
      
      {/*Renderiza o navegador em pilha configurando regras globais (screenOptions) para todas as telas do projeto: */}
      <Stack
        screenOptions={{
          // headerShown: false: Esconde aquela barra branca padrão que o celular cria automaticamente no topo de cada tela com o nome do arquivo (ex: "index" ou "login"), deixando aparecer apenas o seu cabeçalho personalizado do Movieing.
          headerShown: false,
          //Define a cor de fundo padrão (#0F0A1C) de todas as telas
          contentStyle: { backgroundColor: '#0F0A1C' },
        }}
      />
    </>
  );
}
