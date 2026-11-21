//useRef: Cria uma referência direta ao componente <FlatList> para conseguirmos dar comandos nele via código (como mandar ele rolar para o próximo slide).
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList, //FlatList: Componente de lista otimizada do React Native, usado aqui na horizontal (horizontal) para fazer o carrossel.
    useWindowDimensions, //useWindowDimensions: Hook que descobre em tempo real a largura exata (width) da tela do celular ou navegador, garantindo que cada slide ocupe 100% da largura.
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';

//MovieBannerProps: Define que quem chamar <MovieBanner filmes={...} /> precisa passar a lista filmes como propriedade (prop).
interface MovieBannerProps {
    filmes: any[];
}

//flatListRef e indiceAtual: Guardam o controle da lista e qual slide (0, 1, 2...) está visível no momento.
export function MovieBanner({ filmes }: MovieBannerProps) {
    const router = useRouter();
    const { width } = useWindowDimensions(); // Pega a largura exata da tela atual
    const flatListRef = useRef<FlatList>(null);
    const [indiceAtual, setIndiceAtual] = useState(0);

    //moviesList: Percorre o array vindo da API e padroniza os nomes dos campos (usando ?? para aceitar tanto letra minúscula quanto maiúscula).
    const moviesList = filmes.map((item) => ({
        id: item.idMovie ?? item.IdMovie,
        title: item.titleMovie ?? item.TitleMovie,
        synopsis: item.synopsisMovie ?? item.SynopsisMovie,
        duration: item.durationMovie ?? item.DurationMovie,
        genre: item.genreMovie ?? item.GenreMovie,
        ageRating: item.ageRatingMovie ?? item.AgeRatingMovie ?? 0,
        photo: item.photoMovie ?? item.PhotoMovie,
    }));

    // Equivalente ao setInterval de 6 segundos
    useEffect(() => {
        //if (moviesList.length <= 1) return;: Se só existir 1 filme, não inicia o temporizador.
        if (moviesList.length <= 1) return;

        const intervalo = setInterval(() => { //setInterval(..., 6000): A cada 6 segundos:
            setIndiceAtual((prev) => {
                const proximo = (prev + 1) % moviesList.length; //(prev + 1) % moviesList.length: Soma 1 ao índice atual e, quando chega no último filme, o operador % (resto da divisão) faz voltar para 0 automaticamente (loop infinito!).
                flatListRef.current?.scrollToIndex({ index: proximo, animated: true }); //flatListRef.current?.scrollToIndex(...): Ordena que o FlatList deslize suavemente (animated: true) até o próximo slide.
                return proximo; 
            });
        }, 6000);

        return () => clearInterval(intervalo); //return () => clearInterval(intervalo);: Limpa o relógio quando o usuário sai da tela para não gastar memória.
    }, [moviesList.length]);

    if (moviesList.length === 0) return null; //if (moviesList.length === 0) return null;: Enquanto os filmes não carregam da API, não desenha nada.

    //formatDuration: Converte minutos totais (ex: 135) em horas e minutos ("2h 15m").
    function formatDuration(minutes: number) {
        if (!minutes) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    // Mesma função getAgeColor do script
    function getAgeColor(age: number) {
        if (age <= 0) return '#00a859';  // Livre
        if (age <= 10) return '#0088cc'; // 10 anos
        if (age <= 12) return '#f5c518'; // 12 anos
        if (age <= 14) return '#f37021'; // 14 anos
        if (age <= 16) return '#cc0000'; // 16 anos
        return '#111111';                // 18 anos
    }

    return (
        <View style={styles.heroBanner}>
            <FlatList
                ref={flatListRef}
                data={moviesList}
                extraData={indiceAtual}
                keyExtractor={(item) => String(item.id)}
                horizontal //horizontal e pagingEnabled: Coloca os itens lado a lado e faz a rolagem "travar" de página em página (sem parar no meio de dois filmes).
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({ //getItemLayout: Informa o tamanho exato (width) e a posição (width * index) de cada slide, permitindo que scrollToIndex funcione tanto no celular quanto na Web.
                    length: width,
                    offset: width * index,
                    index,
                })}
                onMomentumScrollEnd={(e) => {
                    //onMomentumScrollEnd: Se o usuário arrastar o banner manualmente com o dedo, calcula a posição parada (contentOffset.x / width) e atualiza indiceAtual para a bolinha acompanhar.
                    const novoIndice = Math.round(e.nativeEvent.contentOffset.x / width);
                    setIndiceAtual(novoIndice);
                }}
                renderItem={({ item }) => { //Dentro do renderItem: Desenha cada slide como um <TouchableOpacity> (que leva para /detalhes ao tocar) contendo 3 camadas empilhadas:
                    const ageLabel = item.ageRating <= 0 ? 'L' : item.ageRating;
                    const ageColor = getAgeColor(item.ageRating);
                    const formattedDuration = formatDuration(item.duration);
                    const photoUrl = item.photo?.startsWith('http')
                        ? item.photo
                        : `${API_SERVIDOR}${item.photo}`;

                    return (
                        <TouchableOpacity
                            activeOpacity={0.95}
                            style={[styles.slide, { width }]}
                            onPress={() =>
                                router.push({ pathname: '/detalhes', params: { id: item.id } })
                            }
                        >
                            {/* Fundo desfocado cobrindo tudo (slide-bg-blur) */}
                            <Image
                                source={{ uri: photoUrl }}
                                style={styles.slideBgBlur} //slideBgBlur: A foto do filme esticada com blurRadius={20} no fundo.
                                blurRadius={20}
                            />

                            {/* Imagem principal inteira sem cortes (slide-bg-contain) */}
                            <Image
                                source={{ uri: photoUrl }}
                                style={styles.slideBgContain} //slideBgContain: A mesma foto inteira sem cortes (resizeMode="contain") no centro.
                                resizeMode="contain"
                            />

                            {/* Camada escura para dar leitura ao texto */}
                            <View style={styles.overlayEscuro} /> {/*overlayEscuro + slideContent: Uma máscara escura para dar contraste e os textos por cima (EM CARTAZ, título, badge colorido de idade, duração, gênero e sinopse cortada em 3 linhas com numberOfLines={3}). */}

                            {/* Conteúdo do slide */}
                            <View style={styles.slideContent}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>EM CARTAZ</Text>
                                </View>

                                <Text style={styles.movieTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>

                                <View style={styles.movieMeta}>
                                    <View style={[styles.ageBadge, { backgroundColor: ageColor }]}>
                                        <Text style={styles.ageText}>{ageLabel}</Text>
                                    </View>
                                    <Text style={styles.metaText}>•</Text>
                                    <Text style={styles.metaText}>{formattedDuration}</Text>
                                    <Text style={styles.metaText}>•</Text>
                                    <Text style={styles.metaText}>{item.genre}</Text>
                                </View>

                                <Text style={styles.movieDesc} numberOfLines={3}>
                                    {item.synopsis}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Bolinhas indicadoras na base */}
            {/*Desenha uma bolinha para cada filme da lista. Quando o índice da bolinha (idx) for igual ao indiceAtual, aplica o estilo pontoAtivo (alonga e pinta de rosa #E25583). */}
            <View style={styles.indicadores}>
                {moviesList.map((_, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.ponto,
                            indiceAtual === idx && styles.pontoAtivo,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    heroBanner: {
        width: '100%',
        height: 460,
        backgroundColor: '#090a0f',
        position: 'relative',
    },
    slide: {
        height: 460,
        justifyContent: 'flex-end',
        padding: 24,
        position: 'relative',
    },
    slideBgBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.45,
    },
    slideBgContain: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlayEscuro: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(9, 10, 15, 0.65)',
    },
    slideContent: {
        zIndex: 3,
        maxWidth: 650,
        marginBottom: 16,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E25583',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 4,
        marginBottom: 12,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    movieTitle: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 10,
    },
    movieMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    ageBadge: {
        minWidth: 26,
        height: 24,
        paddingHorizontal: 6,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    ageText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 12,
    },
    metaText: {
        color: '#A799C7',
        fontSize: 14,
        fontWeight: '500',
    },
    movieDesc: {
        color: '#e0e0e0',
        fontSize: 14,
        lineHeight: 20,
    },
    indicadores: {
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    ponto: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    pontoAtivo: {
        width: 22,
        backgroundColor: '#E25583',
    },
});
