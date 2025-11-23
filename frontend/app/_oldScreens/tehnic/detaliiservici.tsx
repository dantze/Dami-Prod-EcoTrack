import { StyleSheet, Text, View, Pressable, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

// DATE MOCK EXTINSE
const TASK_DETAILS_MOCK = {
    id: 1,
    numeCompanie: "Dansoft",
    ultimaIgienizare: "12/02/2025",
    telefon: "0747963611",
    tipSarcina: "Amplasare/Igienizare/Ridicare",
    telefonSecundar: "0747923422",
    descriere: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    imagineUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCCvGfvCGF5vX0Dq2yT9YnfnvL_qVbCg4q4Q&s" 
};

// 1. DEFINIM TIPUL PENTRU RANDUL DE DETALII (Fixul pentru eroare)
type DetailRowProps = {
    label: string;
    value: string | number; // Poate fi text sau numar
};

const DetaliiServici = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    
    const [isExpanded, setIsExpanded] = useState(true);

    const data = TASK_DETAILS_MOCK;

    // 2. APLICAM TIPUL AICI (: DetailRowProps)
    const DetailRow = ({ label, value }: DetailRowProps) => (
        <View style={styles.rowContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            
            {/* --- HEADER CU STATUS --- */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Detalii sarcină</Text>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>Status</Text>
                    <View style={styles.statusDot} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* --- CARDUL PRINCIPAL ALBASTRU --- */}
                <View style={styles.mainCard}>
                    
                    <DetailRow label="Nume Companie" value={data.numeCompanie} />
                    <DetailRow label="Ultima igienizare" value={data.ultimaIgienizare} />
                    <DetailRow label="Telefon" value={data.telefon} />
                    
                    <View style={[styles.rowContainer, {marginTop: 10}]}>
                        <Text style={styles.label}>Tip Sarcină</Text>
                    </View>
                    <Text style={[styles.value, {textAlign: 'right', marginBottom: 15}]}>
                        {data.tipSarcina}
                    </Text>

                    <Text style={[styles.label, {marginBottom: 10}]}>Informații</Text>

                    {/* --- ZONA IMAGINE SI GALERIE --- */}
                    <View style={styles.mediaContainer}>
                        <Image 
                            source={{ uri: data.imagineUrl }} 
                            style={styles.taskImage} 
                        />
                        
                        <Pressable 
                            //style={styles.galleryButton}\
                            style={({ pressed }) => [styles.galleryButton, pressed && styles.cardPressed]}
                            onPress={() => console.log("Deschide galeria")}
                        >
                            <Text style={styles.galleryText}>Galerie</Text>
                            <Ionicons name="images-outline" size={20} color="white" style={{marginLeft: 5}}/>
                        </Pressable>
                    </View>

                    <DetailRow label="Telefon Secundar" value={data.telefonSecundar} />
                    
                    {/* --- ZONA EXPANDABILA --- */}
                    <Pressable 
                        style={styles.expandHeader} 
                        onPress={() => setIsExpanded(!isExpanded)}
                    >
                        <Text style={styles.label}>Detalii suplimentare</Text>
                        <Ionicons 
                            name={isExpanded ? "arrow-up" : "arrow-down"} 
                            size={20} 
                            color="white" 
                        />
                    </Pressable>

                    {isExpanded && (
                        <Text style={styles.descriptionText}>
                            {data.descriere}
                        </Text>
                    )}

                </View>
            </ScrollView>

            {/* --- BUTOANELE DE JOS --- */}
            <View style={styles.footerButtons}>
                <Pressable 
                    //style={[styles.actionButton, styles.postponeButton]}
                    style={({ pressed }) => [styles.actionButton, styles.postponeButton, pressed && styles.cardPressed]}
                    onPress={() => console.log("Amana")}
                >
                    <Text style={styles.actionText}>Amână</Text>
                </Pressable>

                <Pressable 
                    //style={[styles.actionButton, styles.finishButton]}
                    style={({ pressed }) => [styles.actionButton, styles.finishButton, pressed && styles.cardPressed]}
                    onPress={() => console.log("Finalizeaza")}
                >
                    <Text style={styles.actionText}>Finalizează</Text>
                </Pressable>
            </View>

        </View>
    )
}

export default DetaliiServici;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }]
    },
    
    // Header
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 8,
    },
    statusDot: {
        width: 15,
        height: 15,
        borderRadius: 8,
        backgroundColor: '#2ECC71', // Verde aprins
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Loc pentru butoanele de jos
    },

    // Main Card Styles
    mainCard: {
        backgroundColor: '#5D8AA8', // Albastru deschis
        borderRadius: 20,
        padding: 20,
        width: '100%',
        borderWidth: 2,
        borderColor: '#3498DB',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    value: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Media
    mediaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    taskImage: {
        width: 120,
        height: 120,
        borderRadius: 15,
        marginRight: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    galleryButton: {
        backgroundColor: 'rgba(0,0,0,0.2)', 
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    galleryText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    // Descriere
    expandHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    descriptionText: {
        color: '#E0E0E0',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'justify',
        marginTop: 5,
    },

    // Footer Buttons
    footerButtons: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: '48%',
        height: 55,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    postponeButton: {
        backgroundColor: '#456276', 
    },
    finishButton: {
        backgroundColor: '#427992', 
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
})