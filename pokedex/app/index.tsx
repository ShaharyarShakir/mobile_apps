import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colorByType } from "./colors";
interface Pokemon {
  name: string;
  image: string;
  types: PokemonType[];
  id: number;
}

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

const TYPE_ICONS: Record<string, string> = {
  fire: "🔥", water: "💧", grass: "🌿", electric: "⚡",
  psychic: "🔮", ice: "❄️", dragon: "🐉", dark: "🌑",
  fairy: "✨", fighting: "🥊", flying: "🌬️", poison: "☠️",
  ground: "🌍", rock: "🪨", bug: "🐛", ghost: "👻",
  steel: "⚙️", normal: "⭐",
};

export default function Index() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);


  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);

  const animValues = useRef<Record<string, Animated.Value>>({});

  useEffect(() => {
    fetchPokemon();
  }, []);

  useEffect(() => {
    const filtered = pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPokemon(filtered);
  }, [search, pokemons]);

  function getAnimValue(name: string) {
    if (!animValues.current[name]) {
      animValues.current[name] = new Animated.Value(0);
    }
    return animValues.current[name];
  }

  function animateCard(name: string) {
    const anim = getAnimValue(name);
    Animated.spring(anim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }

  const fetchPokemon = useCallback(async () => {

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const currentOffset = offsetRef.current;
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=20&offset=${currentOffset}`
      );
      const data = await response.json();

      const detailedPokemon = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.other["official-artwork"].front_default,
            types: details.types,
            id: details.id,
          };
        })
      );


      detailedPokemon.forEach((p) => animateCard(p.name));

      setPokemons((prev) => [...prev, ...detailedPokemon]);
      setFilteredPokemon((prev) =>
        search
          ? prev
          : [...prev, ...detailedPokemon]
      );


      offsetRef.current = currentOffset + 20;
    } catch (err) {
      console.error("Failed to fetch Pokémon:", err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
      isFetchingRef.current = false;
    }
  }, [search]);

  const renderPokemon = ({ item }: { item: Pokemon }) => {
    const type = item.types[0]?.type.name;
    const color = colorByType[type as keyof typeof colorByType] || "#A8A878";
    const anim = getAnimValue(item.name);
    const icon = TYPE_ICONS[type] || "⭐";

    return (
      <Animated.View
        style={{
          opacity: anim,
          transform: [
            { scale: anim },
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <Link
          href={{
            pathname: "/details",
            params: { name: item.name, image: item.image, type },
          }}
          asChild
        >
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
          >
            <LinearGradient
              colors={[color, color + "CC", color + "66"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >

              <View style={styles.pokeballWatermark}>
                <Text style={styles.pokeballText}>◎</Text>
              </View>

              <View style={styles.cardLeft}>
                <Text style={styles.pokemonNumber}>
                  #{String(item.id).padStart(3, "0")}
                </Text>
                <Text style={styles.name}>
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </Text>

                <View style={styles.typeBadge}>
                  <Text style={styles.typeIcon}>{icon}</Text>
                  <Text style={styles.typeText}>{type.toUpperCase()}</Text>
                </View>

                {item.types[1] && (() => {
                  const type2 = item.types[1].type.name;
                  const icon2 = TYPE_ICONS[type2] || "⭐";
                  return (
                    <View style={[styles.typeBadge, styles.typeBadge2]}>
                      <Text style={styles.typeIcon}>{icon2}</Text>
                      <Text style={styles.typeText}>{type2.toUpperCase()}</Text>
                    </View>
                  );
                })()}
              </View>

              <Image source={{ uri: item.image }} style={styles.image} />
            </LinearGradient>
          </Pressable>
        </Link>
      </Animated.View>
    );
  };

  const renderFooter = () => {
    if (!loading || initialLoad) return null;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.loaderText}>Loading more...</Text>
      </View>
    );
  };

  if (initialLoad) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.loadingEmoji}>🔴</Text>
        <Text style={styles.loadingLabel}>Loading Pokédex…</Text>
        <ActivityIndicator size="large" color="#E3350D" style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Pokédex</Text>
        <Text style={styles.subtitle}>{pokemons.length} Pokémon</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>
          <Ionicons name="search" size={16} color="#aaa" />
        </Text>
        <TextInput
          placeholder="Search by name..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredPokemon}
        renderItem={renderPokemon}
        keyExtractor={(item) => item.name}
        onEndReached={search ? undefined : fetchPokemon}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingEmoji: {
    fontSize: 56,
  },
  loadingLabel: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    fontWeight: "600",
    marginBottom: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1A1A2E",
  },
  clearBtn: {
    fontSize: 14,
    color: "#bbb",
    paddingLeft: 8,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 10,
    borderRadius: 28,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  pokeballWatermark: {
    position: "absolute",
    right: -10,
    top: -20,
    opacity: 0.1,
  },
  pokeballText: {
    fontSize: 120,
    color: "#fff",
    lineHeight: 130,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  pokemonNumber: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
    gap: 4,
  },
  typeBadge2: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  typeIcon: {
    fontSize: 12,
  },
  typeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  image: {
    width: 110,
    height: 110,
  },
  loaderFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loaderText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
});