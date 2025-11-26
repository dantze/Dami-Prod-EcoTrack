import { StyleSheet, Text, View, Pressable, ScrollView, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { AntDesign } from '@expo/vector-icons';
import DateSelector from './OrderComponents/DateSelector';

const Ridicari = ({ client, onDataChange }: { client: any, onDataChange: (data: any) => void }) => {
    // State
    const [clientPackets, setClientPackets] = useState<any[]>([]);
    // Stores how many of each packet to remove: { packetId: count }
    const [packetsToRemove, setPacketsToRemove] = useState<{ [key: number]: number }>({});

    // New Fields State
    const [contactPersoana, setContactPersoana] = useState('');
    const [additionalDetails, setAdditionalDetails] = useState('');

    // Date Placement State
    const [placementStartDate, setPlacementStartDate] = useState('');
    const [placementEndDate, setPlacementEndDate] = useState('');

    // Sync data with parent
    useEffect(() => {
        onDataChange({
            packetsToRemove,
            contact: contactPersoana,
            details: additionalDetails,
            date: placementStartDate // Assuming single date for pickup, or start date
        });
    }, [packetsToRemove, contactPersoana, additionalDetails, placementStartDate]);

    // Mock Fetch Client Packets
    useEffect(() => {
        // TODO: Fetch actual packets from DB based on client.id
        console.log("Fetching packets for client:", client?.id);

        // Mocking data for now - 'count' represents how many they currently have on site
        const mockPackets = [
            { id: 101, name: 'Pachet Eco Standard', count: 5 },
            { id: 102, name: 'Pachet Premium', count: 2 },
            { id: 103, name: 'Pachet Basic', count: 1 }
        ];
        setClientPackets(mockPackets);
    }, [client]);

    const handleIncrement = (packetId: number, maxCount: number) => {
        setPacketsToRemove(prev => {
            const current = prev[packetId] || 0;
            if (current < maxCount) {
                return { ...prev, [packetId]: current + 1 };
            }
            return prev;
        });
    };

    const handleDecrement = (packetId: number) => {
        setPacketsToRemove(prev => {
            const current = prev[packetId] || 0;
            if (current > 0) {
                const newState = { ...prev, [packetId]: current - 1 };
                if (newState[packetId] === 0) {
                    delete newState[packetId];
                    return newState;
                }
                return newState;
            }
            return prev;
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Formular Ridicări</Text>

            {/* --- PACKET LIST --- */}
            <Text style={styles.label}>Selectează Pachete de Ridicat</Text>
            <View style={styles.packetListContainer}>
                {clientPackets.length > 0 ? (
                    clientPackets.map((packet) => {
                        const toRemove = packetsToRemove[packet.id] || 0;
                        const remaining = packet.count - toRemove;

                        return (
                            <View key={packet.id} style={[styles.packetRow, toRemove > 0 && styles.packetRowActive]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.packetName}>{packet.name}</Text>
                                    <Text style={styles.packetSubtext}>
                                        Disponibil: <Text style={{ fontWeight: 'bold', color: '#4CAF50' }}>{remaining}</Text> / {packet.count}
                                    </Text>
                                </View>

                                <View style={styles.counterContainer}>
                                    <Pressable
                                        style={[styles.counterButton, toRemove === 0 && styles.counterButtonDisabled]}
                                        onPress={() => handleDecrement(packet.id)}
                                    >
                                        <AntDesign name="minus" size={16} color={toRemove === 0 ? "#ccc" : "#16283C"} />
                                    </Pressable>

                                    <View style={styles.countDisplay}>
                                        <Text style={[styles.countText, toRemove > 0 && { color: '#E53935', fontWeight: 'bold' }]}>
                                            {toRemove > 0 ? `-${toRemove}` : '0'}
                                        </Text>
                                    </View>

                                    <Pressable
                                        style={[styles.counterButton, toRemove >= packet.count && styles.counterButtonDisabled]}
                                        onPress={() => handleIncrement(packet.id, packet.count)}
                                    >
                                        <AntDesign name="plus" size={16} color={toRemove >= packet.count ? "#ccc" : "#16283C"} />
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <Text style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                        Acest client nu are pachete active.
                    </Text>
                )}
            </View>

            {/* --- DATA RIDICARE --- */}
            <DateSelector
                label="Dată Ridicare"
                onDateChange={(start, end) => {
                    setPlacementStartDate(start);
                    setPlacementEndDate(end);
                }}
            />

            {/* --- CONTACT PERSOANA RESPONSABILA --- */}
            <View style={{ marginTop: 15 }}>
                <Text style={styles.label}>Contact Persoană Responsabilă Amplasare</Text>
                <TextInput
                    style={styles.input}
                    value={contactPersoana}
                    onChangeText={setContactPersoana}
                    placeholder="Nume / Telefon"
                    placeholderTextColor="#999"
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

export default Ridicari

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
    // Packet List Styles
    packetListContainer: {
        marginTop: 5,
        marginBottom: 15,
    },
    packetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    packetRowActive: {
        borderWidth: 1,
        borderColor: '#E53935',
        backgroundColor: '#FFF5F5',
    },
    packetName: {
        color: '#16283C',
        fontSize: 14,
        fontWeight: '500',
    },
    packetSubtext: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        padding: 2,
    },
    counterButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    counterButtonDisabled: {
        backgroundColor: '#E0E0E0',
        elevation: 0,
    },
    countDisplay: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        fontSize: 14,
        color: '#16283C',
        fontWeight: '500',
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
