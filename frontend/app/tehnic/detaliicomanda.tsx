import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import React from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';


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


type DetailRowProps = {
    label: string;
    value: string;
    isMultiline?: boolean; 
};

const DetaliiComanda = () => {
    const router = useRouter();
    const params = useLocalSearchParams(); 
    
    const data = FULL_DETAILS_MOCK; 

    
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

                
                <Pressable 
                    style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => console.log("Asociere ruta...")}
                >
                    <Text style={styles.actionButtonText}>Asociază cu rută</Text>
                </Pressable>

               
                <Pressable onPress={() => console.log("Navigare harta")} style={styles.mapLinkContainer}>
                    <Text style={styles.mapLinkText}>Navigează harta →</Text>
                </Pressable>

            </ScrollView>
        </View>
    )
}

export default DetaliiComanda

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 20,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 50,
        alignItems: 'center',
    },
    
    detailsCard: {
        backgroundColor: '#5D8AA8', 
        borderRadius: 20,
        padding: 20,
        width: '100%',
        marginBottom: 30,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', 
        marginBottom: 12, 
    },
    label: {
        color: '#E0E0E0', 
        fontSize: 14,
        flex: 1, 
        fontWeight: '600',
    },
    value: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1, 
        textAlign: 'right', 
    },
    multilineValue: {
        flex: 1.5, 
    },

    actionButton: {
        backgroundColor: '#427992', 
        width: '100%',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }]
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },

    mapLinkContainer: {
        marginTop: 20,
        alignSelf: 'flex-end', 
    },
    mapLinkText: {
        color: '#5D8AA8', 
        fontSize: 16,
        fontWeight: 'bold',
    }
})