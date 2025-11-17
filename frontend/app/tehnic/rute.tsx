import { StyleSheet, Text, View, Pressable, Image, ScrollView } from 'react-native'
import React from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'

const mapImageSource = require('../../assets/images/harta_romania.png');

// 2. Datele Mock pentru Rute (Aici vei pune datele din baza de date in viitor)
const RUTE_DATA = [
    { id: 1, nume: 'Cluj 1' },
    { id: 2, nume: 'Cluj 2' },
    { id: 3, nume: 'Sibiu' },
    { id: 4, nume: 'Hunedoara' },
];

const Rute = () => {
    const router = useRouter();
    const { zona } = useLocalSearchParams<{ zona?: string }>();
    const zonaLabel = zona ?? 'Centru'; 

    const handleRutaPress = (ruta: any) => {
        console.log("Ai selectat ruta:", ruta.nume);
        
        router.push({
            pathname: "/tehnic/harta", // sau calea corecta catre fisierul de mai sus
            params: { 
                numeRuta: ruta.nume // Trimitem "Cluj 1" ca sa stim ce sa filtram
            }
        });
    };

    return (
        <View style={styles.container}>
            
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{`Rute - ${zonaLabel}`}</Text>
            </View>

            <View style={styles.listContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {RUTE_DATA.map((item, index) => (
                        <View key={item.id} style={styles.itemWrapper}>
                            
                            <Pressable
                                style={({ pressed }) => [
                                    styles.routeButton,
                                    pressed && styles.buttonPressed
                                ]}
                                onPress={() => handleRutaPress(item)}
                            >
                                <Text style={styles.buttonText}>{item.nume}</Text>
                            </Pressable>

                            {index < RUTE_DATA.length - 1 && <View style={styles.separator} />}
                        
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.footerContainer}>
                <Image 
                    source={mapImageSource} 
                    style={styles.mapImage} 
                    resizeMode="contain" 
                />
                
                {/* <Pressable onPress={() => console.log("Navigare Harta Full")} style={styles.navLink}>
                    <Text style={styles.navLinkText}>Navigează harta →</Text>
                </Pressable> */}
            </View>

        </View>
    )
}

export default Rute;

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