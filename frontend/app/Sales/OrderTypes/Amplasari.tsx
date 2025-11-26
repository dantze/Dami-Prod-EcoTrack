import { StyleSheet, Text, View, Pressable, Switch, ScrollView, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { AntDesign } from '@expo/vector-icons';
import DateSelector from './OrderComponents/DateSelector';
import LocationPicker from './OrderComponents/LocationPicker';

// Mock Data
const SERVICE_PACKETS = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Pachet servicii ${i + 1}`,
    price: (i + 1) * 50 + 100
}));

const QUANTITY_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1).toString());
const IGIENIZARI_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

const Amplasari = ({ client, onDataChange }: { client: any, onDataChange: (data: any) => void }) => {
    // State
    const [isPacketDropdownOpen, setIsPacketDropdownOpen] = useState(false);
    const [selectedPacket, setSelectedPacket] = useState<typeof SERVICE_PACKETS[0] | null>(null);

    // Quantity State
    const [isQuantityDropdownOpen, setIsQuantityDropdownOpen] = useState(false);
    const [quantity, setQuantity] = useState('1');

    // Contract Duration State
    const [isIndefinite, setIsIndefinite] = useState(false);
    const [durationDays, setDurationDays] = useState('');

    // New Fields State
    const [isIgienizariDropdownOpen, setIsIgienizariDropdownOpen] = useState(false);
    const [igienizariPerMonth, setIgienizariPerMonth] = useState('1');
    const [contactSantier, setContactSantier] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');

    // Date Placement State
    const [placementStartDate, setPlacementStartDate] = useState('');
    const [placementEndDate, setPlacementEndDate] = useState('');

    // Location State
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Sync data with parent
    useEffect(() => {
        onDataChange({
            packet: selectedPacket,
            quantity,
            isIndefinite,
            duration: durationDays,
            igienizari: igienizariPerMonth,
            contact: contactSantier,
            details: additionalDetails,
            startDate: placementStartDate,
            endDate: placementEndDate,
            location
        });
    }, [selectedPacket, quantity, isIndefinite, durationDays, igienizariPerMonth, contactSantier, additionalDetails, placementStartDate, placementEndDate, location]);

    const togglePacketDropdown = () => {
        setIsPacketDropdownOpen(!isPacketDropdownOpen);
        setIsQuantityDropdownOpen(false);
        setIsIgienizariDropdownOpen(false);
    };

    const handleSelectPacket = (packet: typeof SERVICE_PACKETS[0]) => {
        setSelectedPacket(packet);
        setIsPacketDropdownOpen(false);
    };

    const toggleQuantityDropdown = () => {
        setIsQuantityDropdownOpen(!isQuantityDropdownOpen);
        setIsPacketDropdownOpen(false);
        setIsIgienizariDropdownOpen(false);
    };

    const handleSelectQuantity = (qty: string) => {
        setQuantity(qty);
        setIsQuantityDropdownOpen(false);
    };

    const toggleIgienizariDropdown = () => {
        setIsIgienizariDropdownOpen(!isIgienizariDropdownOpen);
        setIsPacketDropdownOpen(false);
        setIsQuantityDropdownOpen(false);
    };

    const handleSelectIgienizari = (val: string) => {
        setIgienizariPerMonth(val);
        setIsIgienizariDropdownOpen(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Formular Amplasări</Text>

            {/* --- PACKET & QUANTITY --- */}
            <Text style={styles.label}>Pachet Servicii & Cantitate</Text>
            <View style={[styles.row, { zIndex: 300 }]}>
                {/* Packet Dropdown */}
                <View style={styles.dropdownContainer}>
                    <Pressable style={styles.dropdownButton} onPress={togglePacketDropdown}>
                        <Text style={styles.dropdownText}>
                            {selectedPacket ? selectedPacket.name : "Selectează pachet..."}
                        </Text>
                        <AntDesign name={isPacketDropdownOpen ? "up" : "down"} size={16} color="#16283C" />
                    </Pressable>

                    {isPacketDropdownOpen && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                                {SERVICE_PACKETS.map((packet, index) => (
                                    <Pressable
                                        key={packet.id}
                                        style={({ pressed }) => [
                                            styles.dropdownItem,
                                            pressed && { backgroundColor: '#F5F5F5' }
                                        ]}
                                        onPress={() => handleSelectPacket(packet)}
                                    >
                                        <Text style={styles.dropdownItemText}>{packet.name}</Text>
                                        {index < SERVICE_PACKETS.length - 1 && <View style={styles.divider} />}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Quantity Dropdown */}
                <View style={styles.quantityContainer}>
                    <Pressable style={styles.dropdownButton} onPress={toggleQuantityDropdown}>
                        <Text style={styles.dropdownText}>{quantity}</Text>
                        <AntDesign name={isQuantityDropdownOpen ? "up" : "down"} size={16} color="#16283C" />
                    </Pressable>

                    {isQuantityDropdownOpen && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                                {QUANTITY_OPTIONS.map((qty, index) => (
                                    <Pressable
                                        key={qty}
                                        style={({ pressed }) => [
                                            styles.dropdownItem,
                                            pressed && { backgroundColor: '#F5F5F5' }
                                        ]}
                                        onPress={() => handleSelectQuantity(qty)}
                                    >
                                        <Text style={styles.dropdownItemText}>{qty}</Text>
                                        {index < QUANTITY_OPTIONS.length - 1 && <View style={styles.divider} />}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            {/* Price Display */}
            {selectedPacket && (
                <Text style={styles.priceText}>
                    Preț Total: <Text style={{ fontWeight: 'bold' }}>{selectedPacket.price * parseInt(quantity)} RON</Text>
                </Text>
            )}

            {/* --- LOCATION --- */}
            <LocationPicker
                onLocationSelect={(loc) => setLocation(loc)}
                initialLocation={location || undefined}
            />

            {/* --- CONTRACT DURATION --- */}
            <View style={{ marginTop: 15 }}>
                <Text style={styles.label}>Durata Contract</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <TextInput
                            style={[styles.input, isIndefinite && styles.disabledInput]}
                            value={isIndefinite ? '' : durationDays}
                            onChangeText={setDurationDays}
                            placeholder="Nr. Zile"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            editable={!isIndefinite}
                        />
                    </View>

                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Nedeterminat</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#427992" }}
                            thumbColor={isIndefinite ? "#FFFFFF" : "#f4f3f4"}
                            onValueChange={setIsIndefinite}
                            value={isIndefinite}
                        />
                    </View>
                </View>
            </View>

            {/* --- DATA AMPLASARE --- */}
            <DateSelector
                onDateChange={(start, end) => {
                    setPlacementStartDate(start);
                    setPlacementEndDate(end);
                }}
                onToggle={(isOpen) => {
                    if (isOpen) {
                        setIsPacketDropdownOpen(false);
                        setIsQuantityDropdownOpen(false);
                        setIsIgienizariDropdownOpen(false);
                    }
                }}
            />

            {/* --- IGIENIZARI PE LUNA --- */}
            <View style={{ marginTop: 15, zIndex: 200 }}>
                <Text style={styles.label}>Igienizări pe lună</Text>
                <View style={{ position: 'relative' }}>
                    <Pressable style={styles.dropdownButton} onPress={toggleIgienizariDropdown}>
                        <Text style={styles.dropdownText}>{igienizariPerMonth}</Text>
                        <AntDesign name={isIgienizariDropdownOpen ? "up" : "down"} size={16} color="#16283C" />
                    </Pressable>

                    {isIgienizariDropdownOpen && (
                        <View style={styles.dropdownList}>
                            <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
                                {IGIENIZARI_OPTIONS.map((val, index) => (
                                    <Pressable
                                        key={val}
                                        style={({ pressed }) => [
                                            styles.dropdownItem,
                                            pressed && { backgroundColor: '#F5F5F5' }
                                        ]}
                                        onPress={() => handleSelectIgienizari(val)}
                                    >
                                        <Text style={styles.dropdownItemText}>{val}</Text>
                                        {index < IGIENIZARI_OPTIONS.length - 1 && <View style={styles.divider} />}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            {/* --- CONTACT SANTIER --- */}
            <View style={{ marginTop: 15 }}>
                <Text style={styles.label}>Contact Șantier</Text>
                <TextInput
                    style={styles.input}
                    value={contactSantier}
                    onChangeText={setContactSantier}
                    placeholder="Număr telefon"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                />
            </View>

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

export default Amplasari

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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    // Dropdown
    dropdownContainer: {
        flex: 1,
        marginRight: 10,
        position: 'relative',
    },
    quantityContainer: {
        width: 80,
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
    // Price
    priceText: {
        color: '#4CAF50',
        marginTop: 5,
        fontSize: 14,
        marginLeft: 5,
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
    disabledInput: {
        backgroundColor: '#E0E0E0',
        color: '#999',
    },
    // Switch
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchLabel: {
        color: '#FFFFFF',
        marginRight: 10,
    },
})
