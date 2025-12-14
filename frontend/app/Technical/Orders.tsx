import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../constants/ApiConfig';

type Order = {
    id: number;
    orderType: string;  // Changed from 'type'
    quantity: number;
    locationCoordinates: string;
    startDate: string;  // Changed from 'scheduledDate'
    endDate: string;
    details: string;
    contact: string;
    durationDays: number;
    igienizariPerMonth: number;
    isIndefinite: boolean;
    product: {
        id: number;
        name: string;
        price: number;
        description: string;
    };
    client: {
        id: number;
        fullName?: string;
        address?: string;
        email?: string;
        phone?: string;
        type?: string;
        companyName?: string;
    };
};

const Orders = () => {
    const { zona } = useLocalSearchParams<{ zona?: string }>();
    const zonaLabel = zona ?? 'Center';
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`);
            if (!response.ok) {
                throw new Error(`Failed to fetch orders. Status: ${response.status}`);
            }
            const data: Order[] = await response.json();
            console.log('Fetched orders:', data.length);
            console.log('First order:', JSON.stringify(data[0], null, 2));
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Format date from ISO string or any date format
    const formatDate = (dateString: string) => {
        if (!dateString) return { month: 'N/A', day: '--' };
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return { month: 'N/A', day: '--' };
            
            const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
                month: months[date.getMonth()],
                day: date.getDate().toString()
            };
        } catch {
            return { month: 'N/A', day: '--' };
        }
    };

    // Get client display name
    const getClientName = (order: Order): string => {
        if (order.client) {
            // Check for fullName first (for individual clients)
            if (order.client.fullName) {
                return order.client.fullName;
            }
            // Check for companyName (for company clients)
            if (order.client.companyName) {
                return order.client.companyName;
            }
        }
        return 'Client necunoscut';
    };

    // Get location display text
    const getLocationText = (order: Order): string => {
        if (order.client?.address) {
            return order.client.address;
        }
        if (order.locationCoordinates) {
            return `Coordonate: ${order.locationCoordinates.substring(0, 20)}...`;
        }
        return 'Locație nespecificată';
    };

    // Get action text based on order type and quantity
    const getActionText = (order: Order): string => {
        const typeMap: { [key: string]: string } = {
            'Amplasari': 'Amplasare',
            'Ridicari': 'Ridicare',
            'Igienizari': 'Igienizare'
        };
        const actionName = typeMap[order.orderType] || order.orderType || 'Comandă';
        return `${actionName} (x${order.quantity || 1})`;
    };

    const handleCardPress = (order: Order) => {
        router.push({
            pathname: "/Technical/OrderDetails",
            params: {
                id: order.id,
                client: getClientName(order)
            }
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Se încarcă comenzile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{`Comenzi - ${zonaLabel}`}</Text>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {orders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={60} color="#5D8AA8" />
                        <Text style={styles.emptyText}>Nu există comenzi</Text>
                    </View>
                ) : (
                    orders.map((order) => {
                        const { month, day } = formatDate(order.startDate);
                        return (
                            <Pressable
                                key={order.id}
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed
                                ]}
                                onPress={() => handleCardPress(order)}
                            >
                                <View style={styles.cardInfo}>
                                    <Text style={styles.clientName}>{getClientName(order)}</Text>
                                    <Text style={styles.actionText}>{getActionText(order)}</Text>

                                    <View style={styles.addressContainer}>
                                        <Ionicons name="location-sharp" size={14} color="#16283C" style={{ marginRight: 4 }} />
                                        <Text style={styles.addressText} numberOfLines={1}>
                                            {getLocationText(order)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.dateBadge}>
                                    <Text style={styles.dateMonth}>{month}</Text>
                                    <Text style={styles.dateDay}>{day}</Text>
                                </View>

                            </Pressable>
                        );
                    })
                )}

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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontSize: 16,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        color: '#5D8AA8',
        fontSize: 18,
        marginTop: 15,
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