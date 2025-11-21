import { StyleSheet, Text, View, Pressable, ScrollView, Image, Modal, Animated, PanResponder, Alert } from 'react-native'
import React, { useState, useRef } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// DATE MOCK SARCINA
const FULL_DETAILS_MOCK = {
    numeCompanie: "Dansoft",
    cui: "16530585",
    adresaSediu: "Cluj-Napoca, Strada Udrei, nr.2",
    administrator: "Daniel Pentru Dan",
    telefon: "0747963611",
    email: "email@gmail.com",
    pachet: "Cabina Armal (x2)",
    pret: "1499 lei",
    locatie: "Strada Mihail Kogălniceanu, nr. 22",
    durata: "14 zile",
    dataAmplasare: "14/02/2025",
    dataRidicare: "29/02/2025",
    igienizari: "N/A",
    contactResponsabil: "07479123455",
    detaliiSuplimentare: "N/A"
};

// DATE MOCK RUTE (Pentru Modal)
const ROUTES_MOCK = [
    "Cluj 1", "Cluj 2", "Dej", "Arad 1", 
    "Arad 2", "Hunedoara", "Sibiu", "Timișoara"
];

type DetailRowProps = {
    label: string;
    value: string;
    isMultiline?: boolean;
};

const DetaliiComanda = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const data = FULL_DETAILS_MOCK;

    // --- STATE PENTRU MODAL ---
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

    // --- LOGICA DRAG & DROP (ANIMATIE) ---
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                // Cand dam drumul, se intoarce la loc (efect visual)
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    // Functia de selectare a rutei
    const handleSelectRoute = (route: string) => {
        setSelectedRoute(route);
    };

    // Functia de finalizare
    const handleFinalize = () => {
        if (selectedRoute) {
            setModalVisible(false);
            Alert.alert("Succes", `Comanda a fost asignată rutei ${selectedRoute}!`);
            // Aici ai face update in baza de date
            router.back(); 
        } else {
            Alert.alert("Atenție", "Te rugăm să selectezi o rută (trage sau apasă pe o căsuță).");
        }
    };

    // Componenta pentru randuri detalii
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
                <Text style={styles.headerText}>Detalii comandă</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.detailsCard}>
                    <DetailRow label="Nume Companie" value={data.numeCompanie} />
                    <DetailRow label="CUI" value={data.cui} />
                    <DetailRow label="Adresă sediu social" value={data.adresaSediu} isMultiline />
                    <DetailRow label="Nume Administrator" value={data.administrator} />
                    <DetailRow label="Telefon" value={data.telefon} />
                    <DetailRow label="Email" value={data.email} />
                    <View style={{height: 10}} /> 
                    <DetailRow label="Pachet Servicii" value={data.pachet} />
                    <DetailRow label="Preț" value={data.pret} />
                    <View style={{height: 10}} />
                    <DetailRow label="Locație" value={data.locatie} isMultiline />
                    <DetailRow label="Durată contract" value={data.durata} />
                    <DetailRow label="Dată amplasare" value={data.dataAmplasare} />
                    <DetailRow label="Data Ridicare" value={data.dataRidicare} />
                    <DetailRow label="Igienizări" value={data.igienizari} />
                    <View style={{height: 10}} />
                    <DetailRow label="Contact Persoană" value="" />
                    <DetailRow label="Respon. Amplasare" value={data.contactResponsabil} />
                    <DetailRow label="Detalii Suplimentare" value={data.detaliiSuplimentare} />
                </View>

                {/* BUTON DESCHIDERE MODAL */}
                <Pressable 
                    style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.actionButtonText}>Asociază cu rută</Text>
                </Pressable>

                <Pressable onPress={() => console.log("Navigare harta")} style={styles.mapLinkContainer}>
                    <Text style={styles.mapLinkText}>Navigează harta →</Text>
                </Pressable>

            </ScrollView>

            {/* ================= MODALUL DE ASIGNARE ================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        
                        {/* Titlu Modal (Optional, din poza pare a fi doar spatiu) */}
                        <View style={{alignItems: 'flex-end', width: '100%', paddingRight: 10}}>
                             <Ionicons name="information-circle" size={24} color="#16283C" />
                        </View>

                        {/* --- ZONA DE SUS (DRAGGABLE + BUTTON) --- */}
                        <View style={styles.modalTopSection}>
                            
                            {/* Draggable Card */}
                            <Animated.View 
                                style={[
                                    styles.draggableBox,
                                    { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
                                    { zIndex: 999 } // Sa fie peste celelalte
                                ]}
                                {...panResponder.panHandlers}
                            >
                                <Text style={styles.draggableTitle}>{data.numeCompanie}</Text>
                                <View style={styles.draggableIcons}>
                                    <Ionicons name="location-sharp" size={24} color="#16283C" />
                                    <View style={{width: 10}} />
                                    <Ionicons name="information-circle" size={24} color="#16283C" />
                                </View>
                            </Animated.View>

                            {/* Buton Finalizeaza */}
                            <Pressable 
                                style={[
                                    styles.finalizeButton,
                                    !selectedRoute && styles.disabledButton // Gri daca nu e selectat nimic
                                ]}
                                onPress={handleFinalize}
                                disabled={!selectedRoute}
                            >
                                <Text style={styles.finalizeText}>Finalizează</Text>
                                <MaterialCommunityIcons name="truck-delivery" size={20} color="white" style={{marginLeft: 5}} />
                            </Pressable>
                        </View>

                        {/* --- ZONA DE GRID (RUTE) --- */}
                        <View style={styles.gridContainer}>
                            {ROUTES_MOCK.map((route, index) => (
                                <Pressable 
                                    key={index}
                                    style={[
                                        styles.dropZone,
                                        selectedRoute === route && styles.activeDropZone // Stil cand e selectat
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

                        {/* Buton Inchide Modal (pentru UX) */}
                        <Pressable 
                            style={styles.closeModalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeModalText}>Închide</Text>
                        </Pressable>

                    </View>
                </View>
            </Modal>

        </View>
    )
}

export default DetaliiComanda

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

    // --- STILURI MODAL ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(22, 40, 60, 0.8)', // Fundal intunecat semi-transparent
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
    
    // Zona de sus (Draggable + Buton)
    modalTopSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
        marginTop: 10,
    },
    
    // Cutia Dansoft care se trage
    draggableBox: {
        width: 140,
        height: 80,
        backgroundColor: '#5D8AA8', // Albastru-teal
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

    // Butonul Finalizeaza
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
        backgroundColor: '#BDC3C7', // Gri cand e dezactivat
    },
    finalizeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Grila de Rute
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    dropZone: {
        width: '48%', // Cate 2 pe rand
        height: 70,
        backgroundColor: '#CDDEE7', // Albastru foarte deschis
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#889',
        borderStyle: 'dashed', // LINIE PUNCTATA
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    activeDropZone: {
        backgroundColor: '#5D8AA8', // Se coloreaza cand e selectat
        borderColor: '#16283C',
        borderStyle: 'solid',
    },
    dropZoneText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: {width: -1, height: 1},
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