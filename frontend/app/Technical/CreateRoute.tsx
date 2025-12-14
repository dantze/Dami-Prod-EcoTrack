import { StyleSheet, Text, View, TextInput, Pressable, Alert, Modal, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

// Mock data for cities
const CITIES = [
    { id: 1, name: 'Arad' },
    { id: 2, name: 'București' },
    { id: 3, name: 'Cluj-Napoca' },
    { id: 4, name: 'Sibiu' },
    { id: 5, name: 'Timișoara' },
    { id: 6, name: 'Brașov' },
    { id: 7, name: 'Iași' },
    { id: 8, name: 'Constanța' },
    { id: 9, name: 'Oradea' },
    { id: 10, name: 'Craiova' },
];

const CreateRoute = () => {
    const router = useRouter();
    const [routeName, setRouteName] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleFinalize = () => {
        if (!routeName.trim()) {
            Alert.alert('Eroare', 'Te rog introdu numele rutei.');
            return;
        }
        if (!selectedCity) {
            Alert.alert('Eroare', 'Te rog selectează un oraș.');
            return;
        }

        // Here you would send the data to the backend
        console.log('Creating route:', { name: routeName, city: selectedCity });
        
        Alert.alert(
            'Succes',
            `Ruta "${routeName}" în ${selectedCity} a fost creată!`,
            [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]
        );
    };

    const handleCitySelect = (cityName: string) => {
        setSelectedCity(cityName);
        setDropdownVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={styles.headerContainer}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.headerText}>Creare Rută</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
                {/* Route Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nume Rută</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Introdu numele rutei..."
                        placeholderTextColor="#888"
                        value={routeName}
                        onChangeText={setRouteName}
                    />
                </View>

                {/* City Dropdown */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Oraș</Text>
                    <Pressable
                        style={styles.dropdownButton}
                        onPress={() => setDropdownVisible(true)}
                    >
                        <Text style={[
                            styles.dropdownButtonText,
                            !selectedCity && styles.placeholderText
                        ]}>
                            {selectedCity || 'Selectează orașul...'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
                    </Pressable>
                </View>
            </View>

            {/* Dropdown Modal */}
            <Modal
                visible={dropdownVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setDropdownVisible(false)}
                >
                    <View style={styles.dropdownModal}>
                        <Text style={styles.dropdownTitle}>Selectează Orașul</Text>
                        <ScrollView style={styles.dropdownList}>
                            {CITIES.map((city) => (
                                <Pressable
                                    key={city.id}
                                    style={({ pressed }) => [
                                        styles.dropdownItem,
                                        selectedCity === city.name && styles.dropdownItemSelected,
                                        pressed && styles.dropdownItemPressed
                                    ]}
                                    onPress={() => handleCitySelect(city.name)}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedCity === city.name && styles.dropdownItemTextSelected
                                    ]}>
                                        {city.name}
                                    </Text>
                                    {selectedCity === city.name && (
                                        <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>

            {/* Finalize Button */}
            <View style={styles.bottomContainer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.finalizeButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={handleFinalize}
                >
                    <Text style={styles.finalizeButtonText}>Finalizează Rută</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default CreateRoute

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
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#427992',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    textInput: {
        backgroundColor: '#2A4158',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#427992',
    },
    dropdownButton: {
        backgroundColor: '#2A4158',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#427992',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    placeholderText: {
        color: '#888',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        backgroundColor: '#2A4158',
        borderRadius: 16,
        width: '80%',
        maxHeight: '60%',
        padding: 20,
    },
    dropdownTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    dropdownList: {
        maxHeight: 300,
    },
    dropdownItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    dropdownItemSelected: {
        backgroundColor: '#16283C',
    },
    dropdownItemPressed: {
        backgroundColor: '#16283C',
        opacity: 0.8,
    },
    dropdownItemText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    dropdownItemTextSelected: {
        fontWeight: 'bold',
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    finalizeButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        paddingVertical: 16,
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
    finalizeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
})
