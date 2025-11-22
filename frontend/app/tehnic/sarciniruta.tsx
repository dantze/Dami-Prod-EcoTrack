import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

// --- 1. DEFINIM TIPUL DATELOR (Schița) ---
type SarcinaItem = {
    id: number;
    rutaId: string; // ex: "Cluj 1"
    client: string;
    dataIgienizare: string;
    telefon: string;
    tip: 'Ridicări' | 'Amplasări'; // Pentru culoarea pinului
};

// --- 2. DATE MOCK (SIMULARE BAZA DE DATE) ---
// 🗄️ BAZA DE DATE: Acesta este tabelul tau 'Sarcini'
const ALL_SARCINI_MOCK: SarcinaItem[] = [
    { id: 1, rutaId: 'Cluj 1', client: 'Dansoft', dataIgienizare: '22/09/2025', telefon: '0747963611', tip: 'Ridicări' },
    { id: 2, rutaId: 'Cluj 1', client: 'Dansoft', dataIgienizare: '22/09/2025', telefon: '0747963611', tip: 'Amplasări' },
    { id: 3, rutaId: 'Cluj 1', client: 'Firma 1 SRL', dataIgienizare: '21/09/2025', telefon: '0747123456', tip: 'Ridicări' },
    { id: 4, rutaId: 'Cluj 1', client: 'Client Test', dataIgienizare: '20/09/2025', telefon: '0747987654', tip: 'Ridicări' },
    { id: 5, rutaId: 'Cluj 2', client: 'Alt Client', dataIgienizare: '19/09/2025', telefon: '0747111222', tip: 'Amplasări' },
];

const SarcinRuta = () => {
    const router = useRouter();
    const { numeRuta } = useLocalSearchParams<{ numeRuta: string }>();

    const [sarcini, setSarcini] = useState<SarcinaItem[]>([]);

    useEffect(() => {
        // 🗄️ BAZA DE DATE: Aici vei face fetch-ul real.
        // const { data } = await supabase.from('sarcini').select('*').eq('rutaId', numeRuta);
        
        // Simulam filtrarea datelor pe baza rutei primite
        const sarciniFiltrate = ALL_SARCINI_MOCK.filter(s => s.rutaId === numeRuta);
        setSarcini(sarciniFiltrate);

    }, [numeRuta]); // Se re-executa cand se schimba 'numeRuta'

    const handleCardPress = (item: SarcinaItem) => {
        console.log("Vezi detalii sarcina:", item.id);
        // Poti naviga catre un ecran de detalii al sarcinii
        router.push({
            pathname: "/tehnic/detaliiservici", 
            params: { id: item.id } // Trimitem ID-ul ca sa stim ce date sa incarcam
        });
    };

    return (
        <View style={styles.container}>
            
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{`Sarcini - ${numeRuta}`}</Text>
            </View>

            {/* LEGENDA */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <Ionicons name="location" size={20} color="#E74C3C" />
                    <Text style={styles.legendText}>Ridicări</Text>
                </View>
                <View style={styles.legendItem}>
                    <Ionicons name="location" size={20} color="#2ECC71" />
                    <Text style={styles.legendText}>Amplasări</Text>
                </View>
            </View>

            {/* LISTA DE SARCINI */}
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 🗄️ BAZA DE DATE: 'sarcini' va fi lista venita de la server */}
                {sarcini.map((item) => (
                    <Pressable 
                        key={item.id} 
                        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        onPress={() => handleCardPress(item)}
                    >
                        {/* Info Stanga */}
                        <View style={styles.cardInfo}>
                            <Text style={styles.clientName}>{item.client}</Text>
                            <Text style={styles.statusText}>Ultima igienizare: {item.dataIgienizare}</Text>
                            <View style={styles.phoneContainer}>
                                <Ionicons name="call" size={14} color="#E0E0E0" style={{marginRight: 5}} />
                                <Text style={styles.statusText}>{item.telefon}</Text>
                            </View>
                        </View>

                        {/* Pin Dreapta */}
                        <View style={styles.pinContainer}>
                            <Ionicons 
                                name="location" 
                                size={28} 
                                color={item.tip === 'Ridicări' ? '#E74C3C' : '#2ECC71'} // Rosu sau Verde
                            />
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

export default SarcinRuta

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 10,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'left',
    },

    // --- LEGENDA ---
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    legendText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 8,
    },

    // --- LISTA ---
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // --- CARDUL SARCINII ---
    card: {
        backgroundColor: '#5D8AA8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }]
    },
    cardInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF', // Alb (diferit de 'Comenzi')
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#E0E0E0', // Gri deschis
        marginBottom: 8,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pinContainer: {
        paddingLeft: 10,
    }
})