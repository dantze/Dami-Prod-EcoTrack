import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Animated, PanResponder, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OrderService } from '../../services/OrderService';
import { RouteDefinitionService, RouteDefinition } from '../../services/RouteDefinitionService';

type DetailRowProps = {
    label: string;
    value: string;
    isMultiline?: boolean;
};

const OrderDetails = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.id ? Number(params.id) : null;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<RouteDefinition[]>([]);
    
    // --- STATE FOR MODAL ---
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteDefinition | null>(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
            fetchRoutes();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const data = await OrderService.getOrderById(orderId!);
            console.log("Fetched Order Details:", JSON.stringify(data, null, 2));
            setOrder(data);
        } catch (error: any) {
            console.error("Fetch order error:", error);
            Alert.alert("Error", `Could not fetch order details: ${error.message}`);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const data = await RouteDefinitionService.getAllRouteDefinitions();
            setRoutes(data);
        } catch (error) {
            console.error("Failed to fetch routes", error);
        }
    };

    // --- DRAG & DROP LOGIC (ANIMATION) ---
    const pan = useRef(new Animated.ValueXY()).current;
    
    // ... existing PanResponder code ...

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    // Route selection function
    const handleSelectRoute = (route: RouteDefinition) => {
        setSelectedRoute(route);
    };

    // Finalize function
    const handleFinalize = async () => {
        if (selectedRoute && orderId) {
            try {
                await OrderService.updateOrder(orderId, { routeDefinition: { id: selectedRoute.id } });
                setModalVisible(false);
                Alert.alert("Success", `Order assigned to route ${selectedRoute.name}!`);
                router.back();
            } catch (error) {
                Alert.alert("Error", "Failed to assign route.");
            }
        } else {
            Alert.alert("Attention", "Please select a route.");
        }
    };

    // Component for detail rows
    const DetailRow = ({ label, value, isMultiline = false }: DetailRowProps) => (
        <View style={styles.rowContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, isMultiline && styles.multilineValue]}>
                {value || 'N/A'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    if (!order) return null;

    // Updated here: use 'name' instead of 'companyName'
    const clientName = order.client?.type === 'company' ? order.client?.name : order.client?.fullName;
    const clientAddress = order.client?.address || order.locationCoordinates;

    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <Pressable onPress={() => router.back()} style={{ position: 'absolute', left: 20, top: 0 }}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.headerText}>Order Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.detailsCard}>
                    <DetailRow label="Client Name" value={clientName} />
                    <DetailRow label="Client Type" value={order.client?.type} />
                     {order.client?.cui && <DetailRow label="CUI" value={order.client.cui} />}
                    <DetailRow label="Address" value={clientAddress} isMultiline />
                    
                    <View style={{ height: 10 }} />
                    <DetailRow label="Product" value={order.product?.name} />
                    <DetailRow label="Quantity" value={order.quantity?.toString()} />
                    <DetailRow label="Type" value={order.orderType} />
                    
                    <View style={{ height: 10 }} />
                    <DetailRow label="Start Date" value={order.startDate} />
                    <DetailRow label="End Date" value={order.endDate} />
                    <DetailRow label="Duration" value={order.durationDays ? `${order.durationDays} days` : (order.isIndefinite ? 'Indefinite' : 'N/A')} />
                    
                    <View style={{ height: 10 }} />
                    <DetailRow label="Contact" value={order.contact} />
                    <DetailRow label="Assigned Route" value={order.routeDefinition?.name} />
                    <DetailRow label="Details" value={order.details} isMultiline />
                </View>

                {/* OPEN MODAL BUTTON */}
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.actionButtonText}>Associate with Route</Text>
                </Pressable>

                <Pressable onPress={() => console.log("Navigate map")} style={styles.mapLinkContainer}>
                    <Text style={styles.mapLinkText}>Navigate map →</Text>
                </Pressable>

            </ScrollView>

            {/* ================= ASSIGNMENT MODAL ================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        <View style={{ alignItems: 'flex-end', width: '100%', paddingRight: 10 }}>
                            <Ionicons name="information-circle" size={24} color="#16283C" />
                        </View>

                        {/* --- TOP SECTION (DRAGGABLE + BUTTON) --- */}
                        <View style={styles.modalTopSection}>

                            {/* Draggable Card */}
                            <Animated.View
                                style={[
                                    styles.draggableBox,
                                    { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
                                    { zIndex: 999 }
                                ]}
                                {...panResponder.panHandlers}
                            >
                                <Text style={styles.draggableTitle} numberOfLines={1}>Order #{order.id}</Text>
                                <View style={styles.draggableIcons}>
                                    <Ionicons name="location-sharp" size={24} color="#16283C" />
                                    <View style={{ width: 10 }} />
                                    <Ionicons name="information-circle" size={24} color="#16283C" />
                                </View>
                            </Animated.View>

                            {/* Finalize Button */}
                            <Pressable
                                style={[
                                    styles.finalizeButton,
                                    !selectedRoute && styles.disabledButton
                                ]}
                                onPress={handleFinalize}
                                disabled={!selectedRoute}
                            >
                                <Text style={styles.finalizeText}>Finalize</Text>
                                <MaterialCommunityIcons name="truck-delivery" size={20} color="white" style={{ marginLeft: 5 }} />
                            </Pressable>
                        </View>

                        {/* --- GRID SECTION (ROUTES) --- */}
                        <View style={styles.gridContainer}>
                            {routes.length > 0 ? (
                                routes.map((route, index) => (
                                    <Pressable
                                        key={route.id}
                                        style={[
                                            styles.dropZone,
                                            selectedRoute?.id === route.id && styles.activeDropZone
                                        ]}
                                        onPress={() => handleSelectRoute(route)}
                                    >
                                        <Text style={[
                                            styles.dropZoneText,
                                            selectedRoute?.id === route.id && styles.activeDropZoneText
                                        ]}>
                                            {route.name}
                                        </Text>
                                        <Text style={{ fontSize: 10, color: selectedRoute?.id === route.id ? 'white' : '#666' }}>{route.city}</Text>
                                    </Pressable>
                                ))
                            ) : (
                                <Text>No routes available.</Text>
                            )}
                        </View>

                        <Pressable
                            style={styles.closeModalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeModalText}>Close</Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>

        </View>
    )
}

export default OrderDetails

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#16283C' },
    headerContainer: { marginTop: 60, paddingHorizontal: 20, width: '100%', marginBottom: 20 },
    headerText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 50, alignItems: 'center' },
    detailsCard: { backgroundColor: '#5D8AA8', borderRadius: 20, padding: 20, width: '100%', marginBottom: 30 },
    rowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    label: { color: '#E0E0E0', fontSize: 14, flex: 1, fontWeight: '600' },
    value: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', flex: 1, textAlign: 'right' },
    multilineValue: { flex: 1.5 },

    actionButton: { backgroundColor: '#427992', width: '100%', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
    buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
    actionButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    mapLinkContainer: { marginTop: 20, alignSelf: 'flex-end' },
    mapLinkText: { color: '#5D8AA8', fontSize: 16, fontWeight: 'bold' },

    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(22, 40, 60, 0.8)', // Dark semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 20,
        alignItems: 'center',
        elevation: 10,
    },

    // Top Section (Draggable + Button)
    modalTopSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
        marginTop: 10,
    },

    // Draggable Box
    draggableBox: {
        width: 140,
        height: 80,
        backgroundColor: '#5D8AA8', // Teal-blue
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    draggableTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 5,
    },
    draggableIcons: {
        flexDirection: 'row',
    },

    // Finalize Button
    finalizeButton: {
        width: 140,
        height: 50,
        backgroundColor: '#5D8AA8',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    disabledButton: {
        backgroundColor: '#BDC3C7', // Gray when disabled
    },
    finalizeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Routes Grid
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    dropZone: {
        width: '48%', // 2 per row
        height: 70,
        backgroundColor: '#CDDEE7', // Very light blue
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#889',
        borderStyle: 'dashed', // DASHED LINE
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    activeDropZone: {
        backgroundColor: '#5D8AA8', // Colored when selected
        borderColor: '#16283C',
        borderStyle: 'solid',
    },
    dropZoneText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    activeDropZoneText: {
        color: 'white',
    },

    closeModalButton: {
        marginTop: 10,
        padding: 10,
    },
    closeModalText: {
        color: '#999',
        fontWeight: 'bold',
    }
})
