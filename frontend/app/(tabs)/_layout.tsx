import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Login from './login'

const _layout = () => {
  return (
    <View style={styles.mainContainer}>
      <Login/>
    </View>
  )
}

export default _layout

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1
  }
})