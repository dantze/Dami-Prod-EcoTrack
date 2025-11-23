import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { AntDesign } from '@expo/vector-icons';

const TIP_CLIENT = ["Persoană fizică", "Firme"];

type InputFieldProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
};

const InputField = ({ label, value, onChangeText, placeholder = "", keyboardType = 'default' }: InputFieldProps) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#999"
            keyboardType={keyboardType}
        />
    </View>
);

const CreateClient = () => {
    const router = useRouter();

    // --- STATE ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("Persoană fizică");

    // Form Data
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // Company specific fields
    const [companyName, setCompanyName] = useState('');
    const [cui, setCui] = useState('');
    const [adminName, setAdminName] = useState('');

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSelectType = (type: string) => {
        setSelectedType(type);
        setIsDropdownOpen(false);
    };

    const handleCreate = async () => {
        // Construct client data based on selected type
        const clientData = {
            type: selectedType === "Firme" ? 'company' : 'individual',
            email,
            phone,
            address,
            // Include company fields only if type is 'Firme' (or always if backend expects them)
            // Keeping them as per original logic but adapting to the new UI structure
            name: selectedType === "Firme" ? companyName : '', // 'name' maps to companyName in original
            CUI: selectedType === "Firme" ? cui : '',
            adminName: selectedType === "Firme" ? adminName : ''
        };

        console.log("Creating client with data:", clientData);

        try {
            // Add ip address of your server here
            const response = await fetch('http://localhost:8080/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Client created successfully:', data);
            router.back();
        } catch (error) {
            console.error('Error creating client:', error);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Create Client</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* --- DROPDOWN CLIENT TYPE --- */}
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
                                {TIP_CLIENT.map((item, index) => (
                                    <Pressable
                                        key={index}
                                        style={styles.dropdownItem}
                                        onPress={() => handleSelectType(item)}
                                    >
                                        <Text style={styles.dropdownItemText}>{item}</Text>
                                        {index < TIP_CLIENT.length - 1 && <View style={styles.divider} />}
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* --- FORM FIELDS --- */}
                    <View style={{ zIndex: 100, width: '100%', marginTop: 20 }}>
                        <InputField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                        <InputField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        <InputField label="Address" value={address} onChangeText={setAddress} />

                        {/* Conditional rendering for Company fields */}
                        {selectedType === "Firme" && (
                            <>
                                <InputField label="Company Name" value={companyName} onChangeText={setCompanyName} />
                                <InputField label="CUI" value={cui} onChangeText={setCui} />
                                <InputField label="Administrator Name" value={adminName} onChangeText={setAdminName} />
                            </>
                        )}
                    </View>

                    {/* --- CREATE BUTTON --- */}
                    <Pressable
                        style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.9 }]}
                        onPress={handleCreate}
                    >
                        <Text style={styles.createButtonText}>Create Client</Text>
                    </Pressable>

                </ScrollView>

            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}

export default CreateClient

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16283C',
    },
    headerContainer: {
        marginTop: 60,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        alignItems: 'center',
    },

    // Dropdown
    dropdownWrapper: {
        width: '100%',
        position: 'relative',
    },
    dropdownButton: {
        width: '100%',
        height: 50,
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
        borderRadius: 12,
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
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        width: '100%',
    },

    // Inputs
    inputWrapper: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 5,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#16283C',
    },

    // Create Button
    createButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#427992',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
        elevation: 5,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
})