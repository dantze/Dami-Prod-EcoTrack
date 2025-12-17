import { StyleSheet, Text, View, Pressable, Dimensions, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OrderService } from '../../services/OrderService';

// --- Order placement type for map display ---
type OrderPlacement = {
    id: number;
    latitude: number;
    longitude: number;
    count: number;
    name: string;
    clientName: string;
};

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

// --- City Coordinates Mapping ---
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
    const { routeId, routeName, city } = useLocalSearchParams<{ routeId?: string, routeName: string, city?: string }>(); 

    const [placements, setPlacements] = useState<OrderPlacement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                if (routeId) {
                    // Fetch real orders for this route
                    const orders = await OrderService.getOrdersByRoute(Number(routeId));
                    console.log('Fetched orders for route:', orders.length);

                    // Transform orders to placements (same logic as AllOrdersMap.tsx)
                    const rawPlacements = orders
                        .filter((o: any) => o.locationCoordinates && o.locationCoordinates.includes(','))
                        .map((o: any) => {
                            const parts = o.locationCoordinates.split(',');
                            const clientName = o.client?.type === 'company' 
                                ? o.client?.name 
                                : o.client?.fullName || 'Client necunoscut';
                            return {
                                id: o.id,
                                latitude: parseFloat(parts[0]),
                                longitude: parseFloat(parts[1]),
                                count: o.quantity || 1,
                                name: o.product?.name || 'Comanda #' + o.id,
                                clientName: clientName
                            };
                        });

                    // Simple Clustering Logic (same as AllOrdersMap.tsx)
                    const clustered: OrderPlacement[] = [];
                    const THRESHOLD = 0.0002; // Approx 20-30 meters

                    rawPlacements.forEach((p: any) => {
                        const existing = clustered.find(c =>
                            Math.abs(c.latitude - p.latitude) < THRESHOLD &&
                            Math.abs(c.longitude - p.longitude) < THRESHOLD
                        );

                        if (existing) {
                            existing.count += p.count;
                        } else {
                            clustered.push({ ...p });
                        }
                    });

                    console.log('Clustered placements:', clustered.length);
                    setPlacements(clustered);
                }

            } catch (error) {
                console.error("Error loading orders:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [routeId]);

    // Determine initial region based on CITY first, then placements, then default (Cluj)
    const getInitialRegion = () => {
        if (city && CITY_COORDINATES[city]) {
            return {
                latitude: CITY_COORDINATES[city].lat,
                longitude: CITY_COORDINATES[city].long,
                latitudeDelta: 0.12,
                longitudeDelta: 0.12,
            };
        }
        if (placements.length > 0) {
            return {
                latitude: placements[0].latitude,
                longitude: placements[0].longitude,
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

    return (
        <View style={styles.container}>

            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={DARK_MAP_STYLE}
                initialRegion={initialRegion}
            >
                {/* Render order markers with cluster styling (same as AllOrdersMap.tsx) */}
                {placements.map((placement) => (
                    <Marker
                        key={placement.id}
                        coordinate={{ 
                            latitude: placement.latitude, 
                            longitude: placement.longitude 
                        }}
                    >
                        <View style={styles.clusterMarker}>
                            <Text style={styles.clusterText}>{placement.count}</Text>
                        </View>
                        <Callout>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>
                                    {placement.count} {placement.count === 1 ? 'Comandă' : 'Comenzi'}
                                </Text>
                                <Text style={styles.calloutText}>{placement.name}</Text>
                                <Text style={styles.calloutText}>{placement.clientName}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <Text style={styles.legendText}>{routeName}</Text>
                    <Ionicons name="location-sharp" size={20} color="#2196F3" />
                </View>
                <Text style={styles.orderCountText}>
                    {placements.reduce((sum, p) => sum + p.count, 0)} comenzi
                </Text>
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
                        pathname: "/Technical/RouteTasks",
                        params: { routeName: routeName }
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
        backgroundColor: 'rgba(22, 40, 60, 0.9)',
        borderRadius: 15,
        padding: 12,
        zIndex: 10,
        alignItems: 'center',
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
        marginRight: 8,
        fontSize: 16,
    },
    orderCountText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 4,
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
    },
    // Cluster Marker Styles (same as AllOrdersMap.tsx)
    clusterMarker: {
        backgroundColor: '#2196F3',
        minWidth: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    clusterText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    calloutContainer: {
        width: 200,
        padding: 10,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 5,
    },
    calloutText: {
        fontSize: 12,
        color: '#555',
        marginBottom: 2,
    },
})
