import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    useWindowDimensions,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_SERVIDOR } from '../services/api';

interface MovieBannerProps {
    filmes: any[];
}

export function MovieBanner({ filmes }: MovieBannerProps) {
    const router = useRouter();
    const { width } = useWindowDimensions(); // Pega a largura exata da tela atual
    const flatListRef = useRef<FlatList>(null);
    const [indiceAtual, setIndiceAtual] = useState(0);

    // Mapeia os dados igual ao seu fetchMovies
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
        if (moviesList.length <= 1) return;

        const intervalo = setInterval(() => {
            setIndiceAtual((prev) => {
                const proximo = (prev + 1) % moviesList.length;
                flatListRef.current?.scrollToIndex({ index: proximo, animated: true });
                return proximo;
            });
        }, 6000);

        return () => clearInterval(intervalo); // Limpa memória ao sair da tela (disconnectedCallback)
    }, [moviesList.length]);

    if (moviesList.length === 0) return null;

    // Mesma função formatDuration do seu script
    function formatDuration(minutes: number) {
        if (!minutes) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    // Mesma função getAgeColor do seu script
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
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                onMomentumScrollEnd={(e) => {
                    // Atualiza o índice se o usuário arrastar com o dedo
                    const novoIndice = Math.round(e.nativeEvent.contentOffset.x / width);
                    setIndiceAtual(novoIndice);
                }}
                renderItem={({ item }) => {
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
                                style={styles.slideBgBlur}
                                blurRadius={20}
                            />

                            {/* Imagem principal inteira sem cortes (slide-bg-contain) */}
                            <Image
                                source={{ uri: photoUrl }}
                                style={styles.slideBgContain}
                                resizeMode="contain"
                            />

                            {/* Camada escura para dar leitura ao texto */}
                            <View style={styles.overlayEscuro} />

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
