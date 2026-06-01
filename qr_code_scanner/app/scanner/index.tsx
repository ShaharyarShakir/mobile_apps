import { CameraView } from 'expo-camera'
import React, { useEffect, useRef } from 'react'
import { AppState, Linking, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Overlay from './overlay'

export default function Index
    () {
    const qrLock = useRef(false)
    const appState = useRef(AppState.currentState)
    useEffect(() => {
        const sub = AppState.addEventListener("change", (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === "active") {
                qrLock.current = false
            }
            appState.current = nextAppState
        })
    }, [])
    return (
        <SafeAreaView style={StyleSheet.absoluteFillObject}>
            <CameraView style={StyleSheet.absoluteFillObject} facing='back' onBarcodeScanned={(({ data }) => {
                if (data && !qrLock.current) {
                    qrLock.current = true
                    setTimeout(async () => {
                        await Linking.openURL(data)
                    }, 5000);
                }
            })} />
            <Overlay />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({})