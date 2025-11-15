import { StyleSheet, Text, View, TextInput, Pressable, TouchableWithoutFeedback, Keyboard} from 'react-native'
import React from 'react'
import { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router' // <--- 1. Importul necesar

const rutesisoferi = () => {
  const { zona } = useLocalSearchParams<{ zona?: string }>();
  const zonaLabel = zona ?? 'Centru';

    return (
    <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style = {styles.headerText}>{`Rute si Soferi - ${zonaLabel}`}</Text>
        </View>
    </View>
    )
}

export default rutesisoferi
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 40,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    inputsContainer: {
        alignItems: 'center',
        zIndex: 10,
        paddingBottom: 50,
    },
    dropdownWrapper: {
        position: 'relative',
        width: 330,
        alignItems: 'center',
    },
    zoneButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }]
    },
    buttonText: {
        color: '#16283C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dropdownContent: {
        position: 'absolute',
        top: 55,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        overflow: 'hidden'
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: '#fff'
    },
    dropdownText: {
        color: '#16283C',
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        width: '100%',
    },
    
    // --- STILURI PENTRU BUTONUL CONTINUA ---
    continueButton: {
        marginTop: 10, // Spatiu fata de dropdown-ul de sus
        width: 200,
        height: 50,
        backgroundColor: '#427992', // Culoare albastra-teal (ca in tema veche)
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1, // Sa fie sub dropdown-uri daca se deschid
    },
    optiuneButton: {
        //marginTop: 5, // Spatiu fata de dropdown-ul de sus
        width: 330,
        height: 50,
        backgroundColor: '#427992', // Culoare albastra-teal (ca in tema veche)
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1, // Sa fie sub dropdown-uri daca se deschid
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // ---------------------------------------

    mapContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
        zIndex: 1,
    },
    buttonsContainer: {
    flex:1 ,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 50,
    marginTop: 30,
  },
  separator: {
    width: 100,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', 
    marginVertical: 15, 
  },
    mapImage: {
        width: '90%',
        height: 250,
        opacity: 0.8,
    }
})