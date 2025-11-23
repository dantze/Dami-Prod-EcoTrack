import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import React from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';


type OrderItem = {
    id: number;
    client: string;
    action: string;
    address: string;
    month: string;
    day: string;
};

const MOCK_DATA: OrderItem[] = [
    {
        id: 1,
        client: 'Dansoft',
        action: 'Placement (x3 cabins)',
        address: 'Cluj-Napoca, Strada Mihail Kogălniceanu, nr. 22',
        month: 'Feb',
        day: '13'
    },
    {
        id: 2,
        client: 'Dami Prod',
        action: 'Pickup (x1 cabins)',
        address: 'Cluj-Napoca, Strada Mihail Kogălniceanu, nr. 22',
        month: 'Feb',
        day: '17'
    },
    {
        id: 3,
        client: 'Firma 1 SRL',
        action: 'Sanitization (x3 cabins)',
        address: 'Cluj-Napoca, Strada Mihail Kogălniceanu, nr. 22',
        month: 'Mar',
        day: '2'
    },
    {
        id: 4,
        client: 'Firma 2 SRL',
        action: 'Sanitization (x2 cabins)',
        address: 'Cluj-Napoca, Piața Unirii, nr. 1',
        month: 'Mar',
        day: '5'
    },
    {
        id: 5,
        client: 'Test Client',
        action: 'Maintenance',
        address: 'Florești, Strada Avram Iancu',
        month: 'Apr',
        day: '10'
    },
    {
        id: 6,
        client: 'Test firma',
        action: 'Maintenance',
        address: 'Florești, Strada Avram Iancu',
        month: 'Jul',
        day: '9'
    },
    {
        id: 7,
        client: 'Test Client',
        action: 'Maintenance',
        address: 'Florești, Strada Avram Iancu',
        month: 'Apr',
        day: '10'
    }
];

const Orders = () => {
    const { zona } = useLocalSearchParams<{ zona?: string }>();
    const zonaLabel = zona ?? 'Center';
    const router = useRouter();


    const handleCardPress = (item: OrderItem) => {
        router.push({
            pathname: "/Technical/OrderDetails",
            params: {
                id: item.id,
                client: item.client
            }
        });
    };

    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{`Orders - ${zonaLabel}`}</Text>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {MOCK_DATA.map((item) => (
                    <Pressable
                        key={item.id}
                        style={({ pressed }) => [
                            styles.card,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => handleCardPress(item)}
                    >
                        <View style={styles.cardInfo}>
                            <Text style={styles.clientName}>{item.client}</Text>
                            <Text style={styles.actionText}>{item.action}</Text>

                            <View style={styles.addressContainer}>
                                <Ionicons name="location-sharp" size={14} color="#16283C" style={{ marginRight: 4 }} />
                                <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
                            </View>
                        </View>

                        <View style={styles.dateBadge}>
                            <Text style={styles.dateMonth}>{item.month}</Text>
                            <Text style={styles.dateDay}>{item.day}</Text>
                        </View>

                    </Pressable>
                ))}

                <View style={{ height: 20 }} />
            </ScrollView>

        </View>
    )
}

export default Orders

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 20,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'left',
    },

    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    card: {
        backgroundColor: '#5D8AA8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }]
    },

    cardInfo: {
        flex: 1,
        paddingRight: 10,
    },
    clientName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addressText: {
        fontSize: 12,
        color: '#E0E0E0',
        flex: 1,
    },

    dateBadge: {
        backgroundColor: '#16283C',
        borderRadius: 12,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateMonth: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    dateDay: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    }
})
