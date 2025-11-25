import { StyleSheet, Text, View, Pressable, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Amplasari from './OrderTypes/Amplasari';
import Ridicari from './OrderTypes/Ridicari';
import Igienizari from './OrderTypes/Igienizari';

const ORDER_TYPES = ["Amplasari", "Ridicari", "Igienizari"];

const OrderDetails = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const client = params.client ? JSON.parse(params.client as string) : null;

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(ORDER_TYPES[0]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSelectType = (type: string) => {
        setSelectedType(type);
        setIsDropdownOpen(false);
    };

    const renderOrderComponent = () => {
        switch (selectedType) {
            case "Amplasari":
                return <Amplasari client={client} />;
            case "Ridicari":
                return <Ridicari client={client} />;
            case "Igienizari":
                return <Igienizari client={client} />;
            default:
                return null;
        }
    };

    if (!client) {
        return (
            <View style={styles.container}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <Text style={{ color: 'white', marginTop: 50, textAlign: 'center' }}>No client data found.</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1 }}>
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </Pressable>
                        <Text style={styles.headerText}>Detalii Comandă</Text>
                    </View>

                    <ScrollView
                        style={styles.scrollContent}
                        contentContainerStyle={{ paddingBottom: 50 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Client Info Summary */}
                        <View style={styles.clientSummary}>
                            <Text style={styles.clientLabel}>Client Selectat:</Text>
                            <Text style={styles.clientName}>{client.type === 'company' ? client.name : client.email}</Text>
                            {client.type === 'company' && <Text style={styles.clientDetail}>CUI: {client.CUI}</Text>}
                        </View>

                        {/* Dropdown for Order Type */}
                        <Text style={styles.sectionLabel}>Tip Comandă</Text>
                        <View style={[styles.dropdownWrapper, { zIndex: 200 }]}>
                            <Pressable
                                style={styles.dropdownButton}
                                onPress={toggleDropdown}
                            >
                                <Text style={styles.dropdownButtonText}>{selectedType}</Text>
                                <AntDesign name={isDropdownOpen ? "up" : "down"} size={16} color="#16283C" />
                            </Pressable>

                            {isDropdownOpen && (
                                <View style={styles.dropdownList}>
                                    {ORDER_TYPES.map((item, index) => (
                                        <Pressable
                                            key={index}
                                            style={({ pressed }) => [
                                                styles.dropdownItem,
                                                pressed && { backgroundColor: '#F5F5F5' }
                                            ]}
                                            onPress={() => handleSelectType(item)}
                                        >
                                            <Text style={styles.dropdownItemText}>{item}</Text>
                                            {index < ORDER_TYPES.length - 1 && <View style={styles.divider} />}
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View style={{ zIndex: 100 }}>
                            {renderOrderComponent()}
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default OrderDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    clientSummary: {
        backgroundColor: '#2A3E55',
        padding: 15,
        borderRadius: 12,
        marginBottom: 25,
    },
    clientLabel: {
        color: '#999',
        fontSize: 14,
        marginBottom: 5,
    },
    clientName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clientDetail: {
        color: '#CCCCCC',
        fontSize: 14,
        marginTop: 2,
    },
    sectionLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 5,
    },
    // Dropdown
    dropdownWrapper: {
        width: '100%',
        position: 'relative',
        marginBottom: 20,
    },
    dropdownButton: {
        width: '100%',
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    dropdownButtonText: {
        color: '#16283C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dropdownList: {
        position: 'absolute',
        top: 55,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        paddingVertical: 5,
        elevation: 5,
        zIndex: 1000,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    dropdownItemText: {
        color: '#16283C',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        width: '100%',
    },
})
