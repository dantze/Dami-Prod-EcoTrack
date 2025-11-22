import { StyleSheet, Text, View, Pressable, Dimensions, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- 1. DEFINIM TIPUL DATELOR (SCHIȚA) ---
type TaskItem = {
    id: number;
    rutaId: string;
    lat: number;
    long: number;
    title: string;
    color: string;
};

// --- 2. APLICAM TIPUL PE DATELE MOCK ---
const ALL_TASKS_MOCK: TaskItem[] = [
    // Sarcini pentru ruta 'Cluj 1'
    { id: 1, rutaId: 'Cluj 1', lat: 46.7712, long: 23.6236, title: 'Sarcina 1', color: '#F4D03F' },
    { id: 2, rutaId: 'Cluj 1', lat: 46.7750, long: 23.6100, title: 'Sarcina 2', color: '#F4D03F' },

    // Sarcini pentru ruta 'Cluj 2'
    { id: 3, rutaId: 'Cluj 2', lat: 46.7600, long: 23.6000, title: 'Sarcina A', color: '#EB984E' },

    // Sarcini pentru ruta 'Sibiu'
    { id: 4, rutaId: 'Sibiu', lat: 45.7983, long: 24.1256, title: 'Centru Sibiu', color: '#5DADE2' },
];

// Stilul Dark Mode
const DARK_MAP_STYLE = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const HartaSarcini = () => {
    const router = useRouter();
    const { numeRuta } = useLocalSearchParams<{ numeRuta: string }>(); // Tipizam si parametrul primit

    // --- 3. REPARATIA PRINCIPALA AICI ---
    // Ii spunem: "Aceasta este o lista de TaskItem, care incepe goala"
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const incarcaDatele = async () => {
            try {
                setLoading(true);

                // 🗄️ BAZA DE DATE: Aici vei scrie codul real.
                // const { data, error } = await supabase...

                const dateFiltrate = ALL_TASKS_MOCK.filter(task => task.rutaId === numeRuta);

                setTasks(dateFiltrate);

            } catch (error) {
                console.error("Eroare la incarcare:", error);
            } finally {
                setLoading(false);
            }
        };

        incarcaDatele();
    }, [numeRuta]);


    const initialRegion = {
        latitude: tasks.length > 0 ? tasks[0].lat : 46.7712,
        longitude: tasks.length > 0 ? tasks[0].long : 23.6236,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#5D8AA8" />
            </View>
        );
    }
    console.log("key is ---- :", process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY)
    return (
        <View style={styles.container}>

            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={DARK_MAP_STYLE}
                initialRegion={initialRegion}
            >
                {tasks.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={{ latitude: marker.lat, longitude: marker.long }}
                        title={marker.title}
                        description={`Sarcina pentru ${numeRuta}`}
                        pinColor={marker.color}
                    />
                ))}
            </MapView>

            {/* Legenda */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <Text style={styles.legendText}>{numeRuta}</Text>
                    {/* Folosim '?' (optional chaining) pentru ca tasks[0] poate fi undefined daca lista e goala */}
                    <Ionicons name="location-sharp" size={20} color={tasks[0]?.color || '#F4D03F'} />
                </View>
            </View>

            {/* Bara de jos */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.navItem} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="format-list-bulleted" size={30} color="#5D8AA8" />
                </Pressable>
                <View style={{ width: 1, height: '60%', backgroundColor: '#444' }} />
                <Pressable
                    style={styles.navItem}
                    onPress={() => router.push({
                        pathname: "/tehnic/sarciniruta", // Numele noului tau fisier
                        params: { numeRuta: numeRuta } // Trimitem numele rutei mai departe
                    })}
                >
                    <MaterialCommunityIcons name="map-marker-radius" size={30} color="white" />
                </Pressable>
            </View>

        </View>
    )
}

export default HartaSarcini

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    legendContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'rgba(22, 40, 60, 0.8)',
        borderRadius: 15,
        padding: 10,
        zIndex: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 80,
    },
    legendText: {
        color: 'white',
        fontWeight: 'bold',
        marginRight: 5,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: '#1C1C1E',
        borderRadius: 35,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})