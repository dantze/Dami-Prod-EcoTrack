import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'

const CreateClient = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [cui, setCui] = useState('');
    const [adminName, setAdminName] = useState('');

    const handleCreate = async () => {

        const clientData = {
            type: 'company',
            email,
            phone,
            address,
            name: companyName,
            CUI: cui,
            adminName
        };

        try {
            //Add ip address of your server here
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
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.title}>Creare Client</Text>

                    <View style={styles.inputFields}>
                        <TextInput
                            style={styles.input}
                            placeholder='Email'
                            placeholderTextColor='#A5A5A5'
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Telefon'
                            placeholderTextColor='#A5A5A5'
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Adresă'
                            placeholderTextColor='#A5A5A5'
                            value={address}
                            onChangeText={setAddress}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Nume Companie'
                            placeholderTextColor='#A5A5A5'
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='CUI'
                            placeholderTextColor='#A5A5A5'
                            value={cui}
                            onChangeText={setCui}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Nume Administrator'
                            placeholderTextColor='#A5A5A5'
                            value={adminName}
                            onChangeText={setAdminName}
                        />
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.createButton,
                            pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }
                        ]}
                        onPress={handleCreate}
                    >
                        <Text style={styles.buttonText}>Creare Client</Text>
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
        backgroundColor: '#16283C'
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 30
    },
    title: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20
    },
    inputFields: {
        width: 300,
        gap: 15
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'white',
        borderRadius: 14,
        paddingLeft: 15,
        fontSize: 16,
        color: '#444c53ff'
    },
    createButton: {
        width: 220,
        height: 50,
        backgroundColor: '#427992',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold'
    }
})