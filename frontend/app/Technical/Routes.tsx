import { StyleSheet, Text, View, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState, useCallback } from 'react'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { RouteDefinitionService, RouteDefinition } from '../../services/RouteDefinitionService';

const mapImageSource = require('../../assets/images/harta_romania.png');

const Routes = () => {
    const router = useRouter();
    const { zona } = useLocalSearchParams<{ zona?: string }>();
    const zonaLabel = zona ?? 'Center';
    const [routes, setRoutes] = useState<RouteDefinition[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await RouteDefinitionService.getAllRouteDefinitions();
            setRoutes(data);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRoutes();
        }, [])
    );

    const handleRoutePress = (route: RouteDefinition) => {
        console.log("You selected route:", route.name);

        router.push({
            pathname: "/Technical/Map",
            params: {
                routeName: route.name
            }
        });
    };

    const handleAddRoute = () => {
        router.push('/Technical/CreateRoute');
    };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{`Routes - ${zonaLabel}`}</Text>
            </View>

            {/* Static Add Route Button */}
            <View style={styles.addButtonContainer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.addRouteButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={handleAddRoute}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.addButtonText}>Adaugă Rută</Text>
                </Pressable>
            </View>

            <View style={styles.listContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {routes.map((item, index) => (
                            <View key={item.id} style={styles.itemWrapper}>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.routeButton,
                                        pressed && styles.buttonPressed
                                    ]}
                                    onPress={() => handleRoutePress(item)}
                                >
                                    <View>
                                        <Text style={styles.buttonText}>{item.name}</Text>
                                        <Text style={styles.subtitleText}>{item.city}</Text>
                                    </View>
                                </Pressable>

                                {index < routes.length - 1 && <View style={styles.separator} />}

                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            <View style={styles.footerContainer}>
                <Image
                    source={mapImageSource}
                    style={styles.mapImage}
                    resizeMode="contain"
                />

                {/* <Pressable onPress={() => console.log("Navigate Full Map")} style={styles.navLink}>
                    <Text style={styles.navLinkText}>Navigate map →</Text>
                </Pressable> */}
            </View>

        </View>
    )
}

export default Routes;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 30,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'left',
    },

    addButtonContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    addRouteButton: {
        width: 300,
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

    listContainer: {
        flex: 1,
        alignItems: 'center',
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    itemWrapper: {
        alignItems: 'center',
    },

    routeButton: {
        width: 300,
        height: 60,
        backgroundColor: '#427992',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }]
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitleText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginTop: 4,
    },

    separator: {
        width: 100,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginVertical: 15,
    },

    footerContainer: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 30,
    },
    mapImage: {
        width: '80%',
        height: 210,
        opacity: 0.9,
        marginBottom: 10,

    },
    navLink: {
        marginTop: 10,
        alignSelf: 'flex-end',
        marginRight: 30,
    },
    navLinkText: {
        color: '#5D8AA8',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
        zIndex: 1,
    },
})
