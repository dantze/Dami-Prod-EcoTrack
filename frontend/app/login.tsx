import { StyleSheet, Text, View, TextInput, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'

const login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (

    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>

        <View style={styles.logoStack}>

          <View style={styles.logoBar} />
          <View style={styles.logoBar} />
          <View style={styles.logoBar} />

          <View style={styles.textOverlay}>
            <Text style={styles.ecoTrack}>EcoTrack</Text>
          </View>
        </View>
        <View style={styles.inputFields}>
          <TextInput
            style={styles.input}
            placeholder='Username'
            placeholderTextColor='#A5A5A5'
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder='Password'
            placeholderTextColor='#A5A5A5'
            value={password}
            onChangeText={setPassword}
            autoCapitalize='none'
            autoCorrect={false}
            textContentType='password'
            autoComplete='password'
            secureTextEntry={true}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.loginButton,
            pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }
          ]}
          onPress={() => {
            if (username === 'driver' || password === 'driver' || username === 'sofer' || password === 'sofer' || username === 'Driver' || password === 'Driver') {
              console.log('Login pressed'),
                router.push('/Driver/WestCenter')
            }
            else if (username === 'sales' || password === 'sales' || username === 'vanzari' || password === 'vanzari' || username === 'Sales' || password === 'Sales') {
              console.log('Login pressed'),
                router.push('/Sales/WestCenter')
            }
            else if (username === 'technical' || password === 'technical' || username === 'tehnic' || password === 'tehnic' || username === 'Technical' || password === 'Technical') {
              console.log('Login pressed'),
                router.push('/Technical/WestCenter')
            } else { // test
              console.log('Login pressed for creating new client'),
                router.push('/Sales/CreateClient')
            }
          }}
        >
          <Text style={styles.loginText}>Login</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 100,
    paddingTop: 130,
    backgroundColor: '#16283C'
  },
  logoStack: {
    position: 'relative',
    width: 200,
    height: 152,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  logoBar: {
    width: 150,
    height: 32,
    backgroundColor: '#427992',
    borderRadius: 23,
    transform: [{ rotate: '42deg' }]
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ecoTrack: {
    color: '#FFFFFF',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'normal'
  },
  inputFields: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 290,
    height: 120
  },
  input: {
    width: 290,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 14,
    paddingLeft: 10,
    color: '#444c53ff'
  },
  loginButton: {
    position: 'absolute',
    bottom: 270,
    width: 220,
    height: 45,
    backgroundColor: '#427992',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'normal'
  }
})