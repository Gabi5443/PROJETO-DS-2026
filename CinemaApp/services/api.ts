//Esse arquivo services/api.ts foi criado para resolver dois grandes problemas de uma só vez: a diferença de rede entre um site e um aplicativo de celular, e o trabalho em equipe / troca de computadores (casa, PC da escola e computador(julia) no Git).


//1- Por que localhost quebra no celular?
//No seu site (CinemaSite): O navegador e a API C# rodam dentro do mesmo computador. Quando o site chama http://localhost:5252, ele encontra a API ali mesmo.

//No aplicativo (CinemaApp): O app roda dentro do celular (via Expo Go), que é um aparelho separado na sua rede Wi-Fi. Para o celular, localhost significa "procure dentro de mim mesmo". Como a API não está instalada no celular, a conexão falha na hora.

//A solução: O celular precisa chamar o endereço IPv4 do computador na rede Wi-Fi (ex: http://192.168.0.110:5252).


//2- O Problema de Equipe e Escola: Por que não deixar o IP fixo?

//Se você escrevesse "http://192.168.0.110:5252" direto no código:
//• No PC da escola, o IP seria outro (ex: 10.87.x.x) e o app quebraria.
//• No PC da sua dupla no Git, o IP também seria diferente e vocês teriam conflito de código toda vez que subissem alterações.
//• Além disso, você teria que ficar mudando esse número em 5 arquivos diferentes (index.tsx, login.tsx, cadastro.tsx, perfil.tsx, MovieBanner.tsx).



//3. Como essas 4 linhas resolvem tudo sozinhas

//1. import Constants from 'expo-constants';
	//• Importa uma ferramenta nativa do Expo que enxerga as configurações de rede da sessão atual. Quando você roda npx expo start, o próprio Expo já descobre o IP do computador para gerar o QR Code.
import Constants from 'expo-constants';

//2. const hostUri = Constants.expoConfig?.hostUri;
	//• Pega o endereço completo que o Expo está usando para se comunicar com o celular (algo como "192.168.0.110:8081", onde 8081 é a porta do React Native).
const hostUri = Constants.expoConfig?.hostUri;

//3. const ipDoComputador = hostUri ? hostUri.split(':')[0] : 'localhost';
	//• Faz duas coisas inteligentes:
		//• Se estiver no celular (hostUri existe): O .split(':')[0] corta o texto nos dois pontos e pega só a primeira parte — transformando "192.168.0.110:8081" apenas em "192.168.0.110".
		//• Se estiver testando no navegador do próprio PC (hostUri vem vazio): Ele cai no plano B e usa 'localhost'.
const ipDoComputador = hostUri ? hostUri.split(':')[0] : 'localhost';

//4. export const API_SERVIDOR = \http://${ipDoComputador}:5252`;`
	//• Junta o IP descoberto automaticamente com a porta 5252 da sua API C# e exporta essa constante. Assim, todas as telas do app importam um único lugar centralizado e funcionam em qualquer computador sem você precisar digitar ipconfig(codigo pra pegar ip) nunca mais.
export const API_SERVIDOR = `http://${ipDoComputador}:5252`;
