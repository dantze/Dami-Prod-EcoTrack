import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
const mapImageSource = require('../../assets/images/harta_romania.png');


const WestCenter = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>


            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Select Zone</Text>
            </View>


            <View style={styles.buttonsContainer}>

                <Pressable
                    style={({ pressed }) => [
                        styles.zoneButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => console.log('West pressed')}
                >
                    <Text style={styles.buttonText}>West</Text>
                </Pressable>


                <View style={styles.separator} />


                <Pressable
                    style={({ pressed }) => [
                        styles.zoneButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => console.log('Center pressed')}
                >
                    <Text style={styles.buttonText}>Center</Text>
                </Pressable>
            </View>

            <View style={styles.mapContainer}>
                <Image
                    source={mapImageSource}
                    style={styles.mapImage}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

export default WestCenter;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
        //justifyContent: 'space-between', 
    },


    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        width: '100%',
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'left',
    },


    buttonsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 50,
    },
    zoneButton: {
        width: 220,
        height: 120,
        backgroundColor: '#427992',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
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
        color: '#16283C',
        fontSize: 22,
        fontWeight: 'bold',
    },
    separator: {
        width: 60,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginVertical: 25,
    },


    mapContainer: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 80,
    },
    mapImage: {
        width: '90%',
        height: '100%',
        opacity: 0.8,
    }
})
