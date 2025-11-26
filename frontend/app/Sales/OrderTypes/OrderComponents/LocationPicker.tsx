import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, Pressable, Dimensions } from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { AntDesign, Ionicons } from '@expo/vector-icons';

interface Location {
    latitude: number;
    longitude: number;
}

interface LocationPickerProps {
    onLocationSelect: (location: Location) => void;
    initialLocation?: Location;
}

const { width, height } = Dimensions.get('window');

// Default to Bucharest
const DEFAULT_REGION = {
    latitude: 44.4268,
    longitude: 26.1025,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

const LocationPicker = ({ onLocationSelect, initialLocation }: LocationPickerProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
    };

    const confirmLocation = () => {
        const location = {
            latitude: region.latitude,
            longitude: region.longitude,
        };
        setSelectedLocation(location);
        onLocationSelect(location);
        setModalVisible(false);
    };

    return (
        <View style={{ marginTop: 15, zIndex: 100 }}>
            <Text style={styles.label}>Locație</Text>
            <Pressable onPress={() => setModalVisible(true)}>
                <View style={[styles.placeholderBox, selectedLocation && styles.selectedBox]}>
                    {selectedLocation ? (
                        <Text style={styles.selectedText}>
                            📍 Lat: {selectedLocation.latitude.toFixed(4)}, Long: {selectedLocation.longitude.toFixed(4)}
                        </Text>
                    ) : (
                        <Text style={styles.placeholderText}>Apasă pentru a selecta locația</Text>
                    )}
                    <AntDesign name="environment" size={20} color={selectedLocation ? "#FFFFFF" : "#999"} />
                </View>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={DEFAULT_REGION}
                        onRegionChangeComplete={handleRegionChange}
                    />

                    {/* Fixed Marker in Center */}
                    <View style={styles.markerFixed}>
                        <Ionicons name="location-sharp" size={48} color="#E53935" />
                    </View>

                    {/* Header / Close Button */}
                    <View style={styles.header}>
                        <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <AntDesign name="close" size={24} color="#16283C" />
                        </Pressable>
                        <Text style={styles.headerText}>Alege Locația</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Confirm Button */}
                    <View style={styles.footer}>
                        <Text style={styles.hintText}>Trage harta pentru a poziționa pin-ul</Text>
                        <Pressable style={styles.confirmButton} onPress={confirmLocation}>
                            <Text style={styles.confirmButtonText}>Confirmă Locația</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default LocationPicker;

const styles = StyleSheet.create({
    label: {
        color: '#CCCCCC',
        fontSize: 14,
        marginBottom: 5,
        fontWeight: '600',
    },
    placeholderBox: {
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'dashed',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    selectedBox: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4CAF50',
        borderStyle: 'solid',
    },
    placeholderText: {
        color: '#999',
        fontStyle: 'italic',
        fontSize: 13,
    },
    selectedText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 13,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -24,
        marginTop: -48,
        zIndex: 10,
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 12,
        elevation: 5,
    },
    closeButton: {
        padding: 5,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#16283C',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    hintText: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 15,
        overflow: 'hidden',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        width: '100%',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
