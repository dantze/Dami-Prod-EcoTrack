import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Igienizari = ({ client }: { client: any }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Formular Igienizari pentru {client?.name || client?.email}</Text>
        </View>
    )
}

export default Igienizari

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#2A3E55',
        borderRadius: 12,
        marginTop: 20,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
    }
})
