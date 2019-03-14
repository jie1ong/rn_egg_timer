import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EggTimerTimeDisplay = (props) => {

    return <View style={styles.container}>
        <Text style={styles.time}>{props.time}</Text>
    </View>
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 150
    },
    time: {
        fontSize: 120,
        fontWeight: 'bold',
        fontFamily: 'Helvetica Neue'
    }
})