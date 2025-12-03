import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, Modal, Pressable, Dimensions } from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { AntDesign, Ionicons } from '@expo/vector-icons';

interface Location {
    latitude: number;
    longitude: number;
}

interface ExistingPlacement {
    id: number;
    latitude: number;
    longitude: number;
    count: number;
    name: string;
}

interface LocationPickerProps {
    onLocationSelect: (location: Location, existingPlacementId?: number) => void;
    initialLocation?: Location;
    existingPlacements?: ExistingPlacement[];
}

const { width, height } = Dimensions.get('window');

// Default to Bucharest
const DEFAULT_REGION = {
    latitude: 44.4268,
    longitude: 26.1025,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

const LocationPicker = ({ onLocationSelect, initialLocation, existingPlacements = [] }: LocationPickerProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null);
    const [selectedExistingId, setSelectedExistingId] = useState<number | undefined>(undefined);

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
        // If user moves map significantly, deselect existing marker to switch to "New Location" mode
        if (selectedExistingId) {
            // Optional: Logic to deselect if moved too far, but for now let's keep it manual or explicit
        }
    };

    const handleMarkerPress = (placement: ExistingPlacement) => {
        setSelectedExistingId(placement.id);
        setSelectedLocation({ latitude: placement.latitude, longitude: placement.longitude });
        // Center map on marker
        setRegion({
            ...region,
            latitude: placement.latitude,
            longitude: placement.longitude,
        });
    };

    const confirmLocation = () => {
        if (selectedExistingId) {
            // User selected an existing cluster
            const placement = existingPlacements.find(p => p.id === selectedExistingId);
            if (placement) {
                onLocationSelect({ latitude: placement.latitude, longitude: placement.longitude }, placement.id);
            }
        } else {
            // User selected a new spot (center of map)
            const location = {
                latitude: region.latitude,
                longitude: region.longitude,
            };
            setSelectedLocation(location);
            onLocationSelect(location);
        }
        setModalVisible(false);
    };

    const resetSelection = () => {
        setSelectedExistingId(undefined);
    };

    return (
        <View style={{ marginTop: 15, zIndex: 100 }}>
            <Text style={styles.label}>Locație</Text>
            <Pressable onPress={() => setModalVisible(true)}>
                <View style={[styles.placeholderBox, selectedLocation && styles.selectedBox]}>
                    {selectedLocation ? (
                        <Text style={styles.selectedText}>
                            {selectedExistingId
                                ? `📍 Locație Existentă (ID: ${selectedExistingId})`
                                : `📍 Lat: ${selectedLocation.latitude.toFixed(4)}, Long: ${selectedLocation.longitude.toFixed(4)}`}
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
                        onPress={resetSelection} // Clicking map background resets to "New Location" mode
                    >
                        {existingPlacements.map((placement) => (
                            <Marker
                                key={placement.id}
                                coordinate={{ latitude: placement.latitude, longitude: placement.longitude }}
                                onPress={(e) => {
                                    e.stopPropagation(); // Prevent map onPress
                                    handleMarkerPress(placement);
                                }}
                            >
                                <View style={[styles.clusterMarker, selectedExistingId === placement.id && styles.selectedCluster]}>
                                    <Text style={styles.clusterText}>{placement.count}</Text>
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Fixed Marker in Center (Only show if NO existing marker is selected) */}
                    {!selectedExistingId && (
                        <View style={styles.markerFixed}>
                            <Ionicons name="location-sharp" size={48} color="#E53935" />
                        </View>
                    )}

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
                        <Text style={styles.hintText}>
                            {selectedExistingId
                                ? "Locație existentă selectată. Apasă Confirmă."
                                : "Trage harta pentru a poziționa pin-ul nou."}
                        </Text>
                        <Pressable style={styles.confirmButton} onPress={confirmLocation}>
                            <Text style={styles.confirmButtonText}>
                                {selectedExistingId ? "Adaugă aici (+1)" : "Confirmă Locația Nouă"}
                            </Text>
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
    // Cluster Marker Styles
    clusterMarker: {
        backgroundColor: '#2196F3',
        minWidth: 30,
        height: 30,
        borderRadius: 15,
        paddingHorizontal: 5,
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    selectedCluster: {
        backgroundColor: '#FF9800', // Orange when selected
        transform: [{ scale: 1.1 }],
        zIndex: 10,
    },
    clusterText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
});
