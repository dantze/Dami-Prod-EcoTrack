import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Animated, PanResponder, Alert } from 'react-native'
import React, { useState, useRef } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// MOCK DATA TASK
const FULL_DETAILS_MOCK = {
    companyName: "Dansoft",
    cui: "16530585",
    registeredAddress: "Cluj-Napoca, Strada Udrei, nr.2",
    administrator: "Daniel Pentru Dan",
    phone: "0747963611",
    email: "email@gmail.com",
    package: "Armal Cabin (x2)",
    price: "1499 lei",
    location: "Strada Mihail Kogălniceanu, nr. 22",
    duration: "14 days",
    placementDate: "14/02/2025",
    pickupDate: "29/02/2025",
    sanitizations: "N/A",
    contactResp: "07479123455",
    additionalDetails: "N/A"
};

// MOCK DATA ROUTES (For Modal)
const ROUTES_MOCK = [
    "Cluj 1", "Cluj 2", "Dej", "Arad 1",
    "Arad 2", "Hunedoara", "Sibiu", "Timișoara"
];

type DetailRowProps = {
    label: string;
    value: string;
    isMultiline?: boolean;
};

const OrderDetails = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const data = FULL_DETAILS_MOCK;

    // --- STATE FOR MODAL ---
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

    // --- DRAG & DROP LOGIC (ANIMATION) ---
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                // When released, return to place (visual effect)
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    // Route selection function
    const handleSelectRoute = (route: string) => {
        setSelectedRoute(route);
    };

    // Finalize function
    const handleFinalize = () => {
        if (selectedRoute) {
            setModalVisible(false);
            Alert.alert("Success", `Order assigned to route ${selectedRoute}!`);
            // Here you would update the database
            router.back();
        } else {
            Alert.alert("Attention", "Please select a route (drag or tap a box).");
        }
    };

    // Component for detail rows
    const DetailRow = ({ label, value, isMultiline = false }: DetailRowProps) => (
        <View style={styles.rowContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, isMultiline && styles.multilineValue]}>
                {value}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Order Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.detailsCard}>
                    <DetailRow label="Company Name" value={data.companyName} />
                    <DetailRow label="CUI" value={data.cui} />
                    <DetailRow label="Registered Office Address" value={data.registeredAddress} isMultiline />
                    <DetailRow label="Administrator Name" value={data.administrator} />
                    <DetailRow label="Phone" value={data.phone} />
                    <DetailRow label="Email" value={data.email} />
                    <View style={{ height: 10 }} />
                    <DetailRow label="Service Package" value={data.package} />
                    <DetailRow label="Price" value={data.price} />
                    <View style={{ height: 10 }} />
                    <DetailRow label="Location" value={data.location} isMultiline />
                    <DetailRow label="Contract Duration" value={data.duration} />
                    <DetailRow label="Placement Date" value={data.placementDate} />
                    <DetailRow label="Pickup Date" value={data.pickupDate} />
                    <DetailRow label="Sanitizations" value={data.sanitizations} />
                    <View style={{ height: 10 }} />
                    <DetailRow label="Contact Person" value="" />
                    <DetailRow label="Placement Resp." value={data.contactResp} />
                    <DetailRow label="Additional Details" value={data.additionalDetails} />
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

                        {/* Modal Title (Optional, looks like space in image) */}
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
                                    { zIndex: 999 } // To be above others
                                ]}
                                {...panResponder.panHandlers}
                            >
                                <Text style={styles.draggableTitle}>{data.companyName}</Text>
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
                                    !selectedRoute && styles.disabledButton // Gray if nothing selected
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
                            {ROUTES_MOCK.map((route, index) => (
                                <Pressable
                                    key={index}
                                    style={[
                                        styles.dropZone,
                                        selectedRoute === route && styles.activeDropZone // Style when selected
                                    ]}
                                    onPress={() => handleSelectRoute(route)}
                                >
                                    <Text style={[
                                        styles.dropZoneText,
                                        selectedRoute === route && styles.activeDropZoneText
                                    ]}>
                                        {route}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Close Modal Button (for UX) */}
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
