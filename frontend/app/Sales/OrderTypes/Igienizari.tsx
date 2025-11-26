import { StyleSheet, Text, View, Pressable, ScrollView, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { AntDesign } from '@expo/vector-icons';
import DateSelector from './OrderComponents/DateSelector';
import LocationPicker from './OrderComponents/LocationPicker';

const SUBSCRIPTION_TYPES = Array.from({ length: 6 }, (_, i) => `Subscription Type ${i + 1}`);

const Igienizari = ({ client, onDataChange }: { client: any, onDataChange: (data: any) => void }) => {
    // Subscription State
    const [isSubscriptionDropdownOpen, setIsSubscriptionDropdownOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

    // Location State
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Date State
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    // Additional Details State
    const [additionalDetails, setAdditionalDetails] = useState('');

    // Sync data with parent
    useEffect(() => {
        onDataChange({
            subscription: selectedSubscription,
            location,
            date: dateStart, // Assuming single date or start date
            details: additionalDetails
        });
    }, [selectedSubscription, location, dateStart, additionalDetails]);

    const toggleSubscriptionDropdown = () => {
        setIsSubscriptionDropdownOpen(!isSubscriptionDropdownOpen);
    };

    const handleSelectSubscription = (sub: string) => {
        setSelectedSubscription(sub);
        setIsSubscriptionDropdownOpen(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Formular Igienizări</Text>

            {/* --- ABONAMENT IGIENIZARI --- */}
            <Text style={styles.label}>Abonament Igienizări</Text>
            <View style={[styles.dropdownContainer, { zIndex: 300 }]}>
                <Pressable style={styles.dropdownButton} onPress={toggleSubscriptionDropdown}>
                    <Text style={styles.dropdownText}>
                        {selectedSubscription ? selectedSubscription : "Selectează abonament..."}
                    </Text>
                    <AntDesign name={isSubscriptionDropdownOpen ? "up" : "down"} size={16} color="#16283C" />
                </Pressable>

                {isSubscriptionDropdownOpen && (
                    <View style={styles.dropdownList}>
                        <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                            {SUBSCRIPTION_TYPES.map((sub, index) => (
                                <Pressable
                                    key={sub}
                                    style={({ pressed }) => [
                                        styles.dropdownItem,
                                        pressed && { backgroundColor: '#F5F5F5' }
                                    ]}
                                    onPress={() => handleSelectSubscription(sub)}
                                >
                                    <Text style={styles.dropdownItemText}>{sub}</Text>
                                    {index < SUBSCRIPTION_TYPES.length - 1 && <View style={styles.divider} />}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* --- LOCATION --- */}
            <LocationPicker
                onLocationSelect={(loc) => setLocation(loc)}
                initialLocation={location || undefined}
            />

            {/* --- DATA IGIENIZARE --- */}
            <DateSelector
                label="Dată Igienizare"
                onDateChange={(start, end) => {
                    setDateStart(start);
                    setDateEnd(end);
                }}
                onToggle={(isOpen) => {
                    if (isOpen) {
                        setIsSubscriptionDropdownOpen(false);
                    }
                }}
            />

            {/* --- DETALII SUPLIMENTARE --- */}
            <View style={{ marginTop: 15 }}>
                <Text style={styles.label}>Detalii Suplimentare</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={additionalDetails}
                    onChangeText={setAdditionalDetails}
                    placeholder="Alte informații..."
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

        </View>
    )
}

export default Igienizari

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2A3E55',
        borderRadius: 12,
        marginTop: 10,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    label: {
        color: '#CCCCCC',
        fontSize: 14,
        marginBottom: 5,
        fontWeight: '600',
    },
    // Dropdown
    dropdownContainer: {
        marginBottom: 15,
        position: 'relative',
    },
    dropdownButton: {
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    dropdownText: {
        color: '#16283C',
        fontSize: 14,
    },
    dropdownList: {
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        elevation: 5,
        zIndex: 1000,
        maxHeight: 200,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    dropdownItemText: {
        color: '#16283C',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        width: '100%',
    },
    // Input
    input: {
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 10,
        color: '#16283C',
    },
    multilineInput: {
        height: 100,
        paddingTop: 10,
    },
})
