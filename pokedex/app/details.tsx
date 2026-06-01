import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { colorByType } from './colors'

const { width, height } = Dimensions.get('window')

const TYPE_EMOJI: Record<string, string> = {
    fire: '🔥', water: '💧', grass: '🌿', electric: '⚡',
    psychic: '🔮', ice: '❄️', dragon: '🐉', dark: '🌑',
    fairy: '✨', normal: '⭐', fighting: '🥊', flying: '🌬️',
    poison: '☠️', ground: '🌍', rock: '🪨', bug: '🐛',
    ghost: '👻', steel: '⚙️',
}

const STAT_COLORS: Record<string, string> = {
    hp: '#FF6B6B',
    attack: '#FF9B42',
    defense: '#4ECDC4',
    'special-attack': '#A78BFA',
    'special-defense': '#60A5FA',
    speed: '#FBBF24',
}

const STAT_LABELS: Record<string, string> = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPD',
}

const TABS = ['Stats', 'Moves', 'Info']

export default function Details() {
    const { name, type, image } = useLocalSearchParams()
    const router = useRouter()
    const [pokemon, setPokemon] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState(0)

    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current
    const imageAnim = useRef(new Animated.Value(0)).current
    const imageFloat = useRef(new Animated.Value(0)).current
    const statAnims = useRef<Animated.Value[]>([]).current

    const primaryColor = colorByType[(type as keyof typeof colorByType)] ?? '#7B5CFA'
    const lightColor = primaryColor + '22'

    useEffect(() => {
        fetchPokemonByName(name as string)

        // Floating image loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(imageFloat, { toValue: -10, duration: 1800, useNativeDriver: true }),
                Animated.timing(imageFloat, { toValue: 0, duration: 1800, useNativeDriver: true }),
            ])
        ).start()
    }, [])

    async function fetchPokemonByName(pokemonName: string) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
            const data = await res.json()
            setPokemon(data)

            data.stats.forEach((_: any, i: number) => {
                statAnims[i] = new Animated.Value(0)
            })

            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
                Animated.spring(imageAnim, { toValue: 1, tension: 45, friction: 7, delay: 150, useNativeDriver: true }),
            ]).start(() => {
                Animated.stagger(
                    70,
                    data.stats.map((stat: any, i: number) =>
                        Animated.timing(statAnims[i], {
                            toValue: stat.base_stat / 150,
                            duration: 700,
                            useNativeDriver: false,
                        })
                    )
                ).start()
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Text style={styles.loadingPokeball}>◎</Text>
                <Text style={styles.loadingText}>Loading…</Text>
            </View>
        )
    }

    const types: string[] = pokemon?.types?.map((t: any) => t.type.name) ?? [type]
    const abilities: string[] = pokemon?.abilities?.map((a: any) => a.ability.name) ?? []
    const stats = pokemon?.stats ?? []

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* ── HEADER ZONE (fixed height, no absolute image) ── */}
            <LinearGradient
                colors={[primaryColor, primaryColor + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                {/* Decorative circles */}
                <View style={[styles.decorCircle, styles.decorCircle1]} />
                <View style={[styles.decorCircle, styles.decorCircle2]} />
                <View style={[styles.decorCircle, styles.decorCircle3]} />

                {/* Back button */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                    <Text style={styles.backArrow}>‹</Text>
                    <Text style={styles.backLabel}>Pokédex</Text>
                </TouchableOpacity>

                {/* Two-column header: info left, image right */}
                <View style={styles.headerBody}>
                    <Animated.View
                        style={[
                            styles.headerInfo,
                            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                        ]}
                    >
                        <Text style={styles.pokemonId}>
                            #{String(pokemon?.id ?? '').padStart(3, '0')}
                        </Text>
                        <Text style={styles.pokemonName}>
                            {(name as string).charAt(0).toUpperCase() + (name as string).slice(1)}
                        </Text>
                        <View style={styles.typePills}>
                            {types.map((t) => (
                                <View key={t} style={styles.typePill}>
                                    <Text style={styles.typePillText}>
                                        {TYPE_EMOJI[t] ?? '⭐'}  {t}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* ✅ FIX: Image is in-flow inside a sized container, not absolutely positioned */}
                    <Animated.Image
                        source={{ uri: image as string }}
                        style={[
                            styles.pokemonImage,
                            {
                                opacity: imageAnim,
                                transform: [
                                    {
                                        translateY: Animated.add(
                                            imageFloat,
                                            imageAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })
                                        )
                                    },
                                    { scale: imageAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                                ],
                            },
                        ]}
                        resizeMode="contain"
                    />
                </View>
            </LinearGradient>

            {/* ── CARD ── */}
            <Animated.View
                style={[
                    styles.card,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* Quick stats */}
                <View style={styles.quickStatsRow}>
                    {[
                        ['⚖️', `${(pokemon?.weight / 10).toFixed(1)} kg`, 'Weight'],
                        ['📏', `${(pokemon?.height / 10).toFixed(1)} m`, 'Height'],
                        ['⚡', `${pokemon?.base_experience}`, 'Base XP'],
                    ].map(([icon, val, label], i) => (
                        <View key={label} style={styles.quickStatItem}>
                            {i > 0 && <View style={styles.quickStatDivider} />}
                            <Text style={styles.quickStatIcon}>{icon}</Text>
                            <Text style={styles.quickStatVal}>{val}</Text>
                            <Text style={styles.quickStatKey}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Tabs */}
                <View style={styles.tabRow}>
                    {TABS.map((tab, i) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === i && [styles.tabActive, { borderBottomColor: primaryColor }]]}
                            onPress={() => setActiveTab(i)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, activeTab === i && { color: primaryColor }]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* ── Stats Tab ── */}
                    {activeTab === 0 && (
                        <View>
                            <Text style={[styles.sectionTitle, { color: primaryColor }]}>Base Stats</Text>
                            {stats.map((s: any, i: number) => {
                                const key = s.stat.name as string
                                const color = STAT_COLORS[key] ?? primaryColor
                                const label = STAT_LABELS[key] ?? key
                                return (
                                    <View key={key} style={styles.statRow}>
                                        <Text style={styles.statLabel}>{label}</Text>
                                        <Text style={[styles.statNum, { color }]}>{s.base_stat}</Text>
                                        <View style={styles.statBarBg}>
                                            {statAnims[i] && (
                                                <Animated.View
                                                    style={[
                                                        styles.statBar,
                                                        {
                                                            backgroundColor: color,
                                                            width: statAnims[i].interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: ['0%', '100%'],
                                                            }),
                                                        },
                                                    ]}
                                                />
                                            )}
                                        </View>
                                    </View>
                                )
                            })}

                            <Text style={[styles.sectionTitle, { color: primaryColor, marginTop: 28 }]}>
                                Abilities
                            </Text>
                            <View style={styles.abilityRow}>
                                {abilities.map((ab) => (
                                    <View key={ab} style={[styles.abilityTag, { backgroundColor: lightColor, borderColor: primaryColor + '44' }]}>
                                        <Text style={[styles.abilityText, { color: primaryColor }]}>
                                            {ab.replace('-', ' ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── Moves Tab ── */}
                    {activeTab === 1 && (
                        <View>
                            <Text style={[styles.sectionTitle, { color: primaryColor }]}>Moves</Text>
                            <View style={styles.movesGrid}>
                                {pokemon?.moves?.slice(0, 24).map((m: any) => (
                                    <View
                                        key={m.move.name}
                                        style={[styles.moveTag, { backgroundColor: lightColor, borderColor: primaryColor + '33' }]}
                                    >
                                        <Text style={[styles.moveText, { color: primaryColor }]}>
                                            {m.move.name.replace('-', ' ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── Info Tab ── */}
                    {activeTab === 2 && (
                        <View>
                            <Text style={[styles.sectionTitle, { color: primaryColor }]}>Info</Text>
                            {[
                                ['Pokédex No.', `#${String(pokemon?.id).padStart(3, '0')}`],
                                ['Height', `${(pokemon?.height / 10).toFixed(1)} m`],
                                ['Weight', `${(pokemon?.weight / 10).toFixed(1)} kg`],
                                ['Base Experience', pokemon?.base_experience],
                                ['Forms', pokemon?.forms?.length ?? '—'],
                                ['Game Appearances', pokemon?.game_indices?.length ?? '—'],
                                ['Order', pokemon?.order ?? '—'],
                            ].map(([label, val]) => (
                                <View key={String(label)} style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>{label}</Text>
                                    <Text style={[styles.infoVal, { color: primaryColor }]}>{val}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F2F2F7' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
    loadingPokeball: { fontSize: 52, marginBottom: 12, opacity: 0.3 },
    loadingText: { color: '#999', fontSize: 15, fontWeight: '500' },

    // ── Header ──
    header: {
        paddingTop: 56,
        paddingHorizontal: 24,
        paddingBottom: 24,
        overflow: 'hidden',
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    decorCircle1: { width: 200, height: 200, right: -60, top: -60 },
    decorCircle2: { width: 120, height: 120, right: 20, top: 20 },
    decorCircle3: { width: 80, height: 80, left: -20, bottom: 10 },

    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, zIndex: 2 },
    backArrow: { color: 'rgba(255,255,255,0.9)', fontSize: 30, lineHeight: 30, marginTop: -2 },
    backLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },

    // ✅ Side-by-side layout for name/types + image
    headerBody: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    headerInfo: { flex: 1, paddingBottom: 4 },
    pokemonId: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
    pokemonName: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 12, textTransform: 'capitalize' },

    typePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    typePill: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    typePillText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize', letterSpacing: 0.3 },

    // ✅ In-flow image with fixed size
    pokemonImage: {
        width: 150,
        height: 150,
        marginLeft: 8,
    },

    // ── Card ──
    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 24,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 12,
        elevation: 8,
    },

    // Quick stats
    quickStatsRow: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    quickStatItem: { flex: 1, alignItems: 'center', gap: 2 },
    quickStatIcon: { fontSize: 18, marginBottom: 2 },
    quickStatVal: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
    quickStatKey: { fontSize: 10, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },
    quickStatDivider: { width: StyleSheet.hairlineWidth, height: 40, backgroundColor: '#E5E5EA', alignSelf: 'center' },

    // Tabs
    tabRow: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: {},
    tabText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },

    scrollContent: { paddingBottom: 40 },

    sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 },

    // Stats
    statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    statLabel: { fontSize: 10, color: '#8E8E93', fontWeight: '700', width: 52, letterSpacing: 0.3 },
    statNum: { fontSize: 13, fontWeight: '800', width: 28, textAlign: 'right' },
    statBarBg: { flex: 1, height: 7, backgroundColor: '#F2F2F7', borderRadius: 4, overflow: 'hidden' },
    statBar: { height: '100%', borderRadius: 4 },

    // Abilities
    abilityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    abilityTag: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
    },
    abilityText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },

    // Moves
    movesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    moveTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
    },
    moveText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

    // Info
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#F2F2F7',
    },
    infoLabel: { fontSize: 14, color: '#8E8E93' },
    infoVal: { fontSize: 14, fontWeight: '700' },
})