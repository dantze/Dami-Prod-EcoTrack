import { StyleSheet, Text, View, Pressable, Dimensions, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- 1. DEFINE DATA TYPE (Schema) ---
type TaskItem = {
    id: number;
    routeId: string;
    lat: number;
    long: number;
    title: string;
    color: string;
};

// --- 2. APPLY TYPE TO MOCK DATA ---
const ALL_TASKS_MOCK: TaskItem[] = [
    // Tasks for route 'Cluj 1'
    { id: 1, routeId: 'Cluj 1', lat: 46.7712, long: 23.6236, title: 'Task 1', color: '#F4D03F' },
    { id: 2, routeId: 'Cluj 1', lat: 46.7750, long: 23.6100, title: 'Task 2', color: '#F4D03F' },

    // Tasks for route 'Cluj 2'
    { id: 3, routeId: 'Cluj 2', lat: 46.7600, long: 23.6000, title: 'Task A', color: '#EB984E' },

    // Tasks for route 'Sibiu'
    { id: 4, routeId: 'Sibiu', lat: 45.7983, long: 24.1256, title: 'Sibiu Center', color: '#5DADE2' },
];

// Dark Mode Style
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

// --- 1.1 City Coordinates Mapping ---
const CITY_COORDINATES: { [key: string]: { lat: number, long: number } } = {
    'Arad': { lat: 46.1866, long: 21.3123 },
    'București': { lat: 44.4268, long: 26.1025 },
    'Cluj-Napoca': { lat: 46.7712, long: 23.6236 },
    'Sibiu': { lat: 45.7983, long: 24.1256 },
    'Timișoara': { lat: 45.7489, long: 21.2087 },
    'Brașov': { lat: 45.6579, long: 25.6012 },
    'Iași': { lat: 47.1585, long: 27.6014 },
    'Constanța': { lat: 44.1792, long: 28.6383 },
    'Oradea': { lat: 47.0465, long: 21.9189 },
    'Craiova': { lat: 44.3302, long: 23.7949 },
};

const TaskMap = () => {
    const router = useRouter();
    const { routeName, city } = useLocalSearchParams<{ routeName: string, city?: string }>(); 

    // --- 3. MAIN FIX HERE ---
    // We tell it: "This is a list of TaskItem, which starts empty"
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // 🗄️ DATABASE: Here you will write the real code.
                // const { data, error } = await supabase...

                const filteredData = ALL_TASKS_MOCK.filter(task => task.routeId === routeName);

                setTasks(filteredData);

            } catch (error) {
                console.error("Error loading:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [routeName]);

    // Determine initial region based on CITY first, then tasks, then default (Cluj)
    const getInitialRegion = () => {
        if (city && CITY_COORDINATES[city]) {
            return {
                latitude: CITY_COORDINATES[city].lat,
                longitude: CITY_COORDINATES[city].long,
                latitudeDelta: 0.12, // Zoom level appropriate for a city
                longitudeDelta: 0.12,
            };
        }
        if (tasks.length > 0) {
            return {
                latitude: tasks[0].lat,
                longitude: tasks[0].long,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };
        }
        return {
            latitude: 46.7712,
            longitude: 23.6236,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
    };

    const initialRegion = getInitialRegion();

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
                        description={`Task for ${routeName}`}
                        pinColor={marker.color}
                    />
                ))}
            </MapView>

            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <Text style={styles.legendText}>{routeName}</Text>
                    {/* We use '?' (optional chaining) because tasks[0] might be undefined if list is empty */}
                    <Ionicons name="location-sharp" size={20} color={tasks[0]?.color || '#F4D03F'} />
                </View>
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.navItem} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="format-list-bulleted" size={30} color="#5D8AA8" />
                </Pressable>
                <View style={{ width: 1, height: '60%', backgroundColor: '#444' }} />
                <Pressable
                    style={styles.navItem}
                    onPress={() => router.push({
                        pathname: "/Technical/RouteTasks", // Name of your new file
                        params: { routeName: routeName } // Send route name forward
                    })}
                >
                    <MaterialCommunityIcons name="map-marker-radius" size={30} color="white" />
                </Pressable>
            </View>

        </View>
    )
}

export default TaskMap

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
