import { StyleSheet, Text, View, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../constants/ApiConfig';

type Task = {
    id: number;
    type: string;
    status: string;
    address: string;
    clientName: string;
    clientPhone: string;
    scheduledTime: string;
    internalNotes: string;
};

const TASK_TYPE_LABELS: { [key: string]: string } = {
    'PLACEMENT': 'Amplasare',
    'PICKUP': 'Ridicare',
    'SANITIZATION': 'Igienizare',
    'MAINTENANCE': 'Mentenanță',
};

const STATUS_LABELS: { [key: string]: string } = {
    'NEW': 'Nouă',
    'IN_PROGRESS': 'În progres',
    'COMPLETED': 'Finalizată',
    'CANCELLED': 'Anulată',
};

const STATUS_COLORS: { [key: string]: string } = {
    'NEW': '#FFA500',
    'IN_PROGRESS': '#2196F3',
    'COMPLETED': '#4CAF50',
    'CANCELLED': '#F44336',
};

const RouteTasks = () => {
    const router = useRouter();
    const { routeId, routeDate } = useLocalSearchParams<{ routeId: string; routeDate?: string }>();
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (routeId) {
            fetchTasks();
        }
    }, [routeId]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/route/${routeId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
            }
            const data: Task[] = await response.json();
            console.log('Fetched tasks:', data.length);
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskPress = (task: Task) => {
        router.push({
            pathname: "/Driver/TaskDetails",
            params: {
                taskId: task.id,
            }
        });
    };

    const handleStartTask = async (task: Task) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${task.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'IN_PROGRESS' }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update task status');
            }
            
            Alert.alert('Succes', 'Sarcina a fost marcată ca "În progres"');
            fetchTasks(); // Refresh tasks
        } catch (error) {
            console.error('Error updating task:', error);
            Alert.alert('Eroare', 'Nu s-a putut actualiza sarcina');
        }
    };

    const handleCompleteTask = async (task: Task) => {
        Alert.alert(
            'Finalizare Sarcină',
            'Ești sigur că vrei să marchezi sarcina ca finalizată?',
            [
                { text: 'Anulează', style: 'cancel' },
                {
                    text: 'Finalizează',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_BASE_URL}/tasks/${task.id}/status`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ status: 'COMPLETED' }),
                            });
                            
                            if (!response.ok) {
                                throw new Error('Failed to update task status');
                            }
                            
                            Alert.alert('Succes', 'Sarcina a fost finalizată!');
                            fetchTasks(); // Refresh tasks
                        } catch (error) {
                            console.error('Error updating task:', error);
                            Alert.alert('Eroare', 'Nu s-a putut actualiza sarcina');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Data necunoscută';
        try {
            const date = new Date(dateString);
            const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
            const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 
                          'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
            return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
        } catch {
            return 'Data necunoscută';
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Se încarcă sarcinile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerText}>Sarcini Rută</Text>
                    <Text style={styles.subHeaderText}>{formatDate(routeDate || '')}</Text>
                </View>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{tasks.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                        {tasks.filter(t => t.status === 'COMPLETED').length}
                    </Text>
                    <Text style={styles.statLabel}>Finalizate</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#FFA500' }]}>
                        {tasks.filter(t => t.status === 'NEW' || t.status === 'IN_PROGRESS').length}
                    </Text>
                    <Text style={styles.statLabel}>Rămase</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {tasks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="clipboard-outline" size={60} color="#5D8AA8" />
                        <Text style={styles.emptyText}>Nu există sarcini pentru această rută</Text>
                    </View>
                ) : (
                    tasks.map((task, index) => (
                        <Pressable
                            key={task.id}
                            style={({ pressed }) => [
                                styles.card,
                                task.status === 'COMPLETED' && styles.cardCompleted,
                                pressed && styles.cardPressed
                            ]}
                            onPress={() => handleTaskPress(task)}
                        >
                            {/* Task Number Badge */}
                            <View style={styles.taskNumberBadge}>
                                <Text style={styles.taskNumberText}>{index + 1}</Text>
                            </View>

                            {/* Task Info */}
                            <View style={styles.cardInfo}>
                                <View style={styles.taskTypeRow}>
                                    <Text style={styles.taskType}>
                                        {TASK_TYPE_LABELS[task.type] || task.type}
                                    </Text>
                                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[task.status] || '#888' }]}>
                                        <Text style={styles.statusText}>
                                            {STATUS_LABELS[task.status] || task.status}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.clientName}>{task.clientName || 'Client necunoscut'}</Text>

                                <View style={styles.addressRow}>
                                    <Ionicons name="location-sharp" size={14} color="#E0E0E0" />
                                    <Text style={styles.addressText} numberOfLines={1}>
                                        {task.address || 'Adresă necunoscută'}
                                    </Text>
                                </View>

                                {task.clientPhone && (
                                    <View style={styles.phoneRow}>
                                        <Ionicons name="call" size={14} color="#E0E0E0" />
                                        <Text style={styles.phoneText}>{task.clientPhone}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                {task.status === 'NEW' && (
                                    <Pressable
                                        style={styles.startButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleStartTask(task);
                                        }}
                                    >
                                        <Ionicons name="play" size={20} color="#FFFFFF" />
                                    </Pressable>
                                )}
                                {task.status === 'IN_PROGRESS' && (
                                    <Pressable
                                        style={styles.completeButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleCompleteTask(task);
                                        }}
                                    >
                                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                    </Pressable>
                                )}
                                {task.status === 'COMPLETED' && (
                                    <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                                )}
                            </View>
                        </Pressable>
                    ))
                )}

                <View style={{ height: 20 }} />
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
    headerTextContainer: {
        flex: 1,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subHeaderText: {
        color: '#5D8AA8',
        fontSize: 14,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#2A4158',
        marginHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#5D8AA8',
        fontSize: 12,
        marginTop: 2,
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
        fontSize: 16,
        marginTop: 15,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#427992',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardCompleted: {
        backgroundColor: '#2A4158',
        opacity: 0.8,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }]
    },
    taskNumberBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#16283C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    taskNumberText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardInfo: {
        flex: 1,
    },
    taskTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    taskType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    clientName: {
        fontSize: 14,
        color: '#E0E0E0',
        marginBottom: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    addressText: {
        fontSize: 12,
        color: '#B0B0B0',
        marginLeft: 4,
        flex: 1,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    phoneText: {
        fontSize: 12,
        color: '#B0B0B0',
        marginLeft: 4,
    },
    actionButtons: {
        marginLeft: 10,
    },
    startButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    completeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
})
