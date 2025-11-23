import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

// --- 1. DEFINE DATA TYPE (Schema) ---
type TaskItem = {
    id: number;
    routeId: string; // ex: "Cluj 1"
    client: string;
    sanitizationDate: string;
    phone: string;
    type: 'Pickups' | 'Placements'; // For pin color
};

// --- 2. MOCK DATA (DATABASE SIMULATION) ---
// 🗄️ DATABASE: This is your 'Tasks' table
const ALL_TASKS_MOCK: TaskItem[] = [
    { id: 1, routeId: 'Cluj 1', client: 'Dansoft', sanitizationDate: '22/09/2025', phone: '0747963611', type: 'Pickups' },
    { id: 2, routeId: 'Cluj 1', client: 'Dansoft', sanitizationDate: '22/09/2025', phone: '0747963611', type: 'Placements' },
    { id: 3, routeId: 'Cluj 1', client: 'Firma 1 SRL', sanitizationDate: '21/09/2025', phone: '0747123456', type: 'Pickups' },
    { id: 4, routeId: 'Cluj 1', client: 'Client Test', sanitizationDate: '20/09/2025', phone: '0747987654', type: 'Pickups' },
    { id: 5, routeId: 'Cluj 2', client: 'Alt Client', sanitizationDate: '19/09/2025', phone: '0747111222', type: 'Placements' },
];

const RouteTasks = () => {
    const router = useRouter();
    const { routeName } = useLocalSearchParams<{ routeName: string }>();

    const [tasks, setTasks] = useState<TaskItem[]>([]);

    useEffect(() => {
        // 🗄️ DATABASE: Here you will do the real fetch.
        // const { data } = await supabase.from('tasks').select('*').eq('routeId', routeName);

        // Simulate data filtering based on received route
        const filteredTasks = ALL_TASKS_MOCK.filter(s => s.routeId === routeName);
        setTasks(filteredTasks);

    }, [routeName]); // Re-executes when 'routeName' changes

    const handleCardPress = (item: TaskItem) => {
        console.log("View task details:", item.id);
        // You can navigate to a task details screen
        router.push({
            pathname: "/Technical/ServiceDetails",
            params: { id: item.id } // Send ID to know what data to load
        });
    };

    return (
        <View style={styles.container}>

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{`Tasks - ${routeName}`}</Text>
            </View>

            {/* LEGEND */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <Ionicons name="location" size={20} color="#E74C3C" />
                    <Text style={styles.legendText}>Pickups</Text>
                </View>
                <View style={styles.legendItem}>
                    <Ionicons name="location" size={20} color="#2ECC71" />
                    <Text style={styles.legendText}>Placements</Text>
                </View>
            </View>

            {/* TASKS LIST */}
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 🗄️ DATABASE: 'tasks' will be the list coming from server */}
                {tasks.map((item) => (
                    <Pressable
                        key={item.id}
                        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        onPress={() => handleCardPress(item)}
                    >
                        {/* Left Info */}
                        <View style={styles.cardInfo}>
                            <Text style={styles.clientName}>{item.client}</Text>
                            <Text style={styles.statusText}>Last sanitization: {item.sanitizationDate}</Text>
                            <View style={styles.phoneContainer}>
                                <Ionicons name="call" size={14} color="#E0E0E0" style={{ marginRight: 5 }} />
                                <Text style={styles.statusText}>{item.phone}</Text>
                            </View>
                        </View>

                        {/* Right Pin */}
                        <View style={styles.pinContainer}>
                            <Ionicons
                                name="location"
                                size={28}
                                color={item.type === 'Pickups' ? '#E74C3C' : '#2ECC71'} // Red or Green
                            />
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

export default RouteTasks

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 10,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'left',
    },

    // --- LEGEND ---
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    legendText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 8,
    },

    // --- LIST ---
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // --- TASK CARD ---
    card: {
        backgroundColor: '#5D8AA8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }]
    },
    cardInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF', // White (different from 'Orders')
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#E0E0E0', // Light gray
        marginBottom: 8,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pinContainer: {
        paddingLeft: 10,
    }
})
