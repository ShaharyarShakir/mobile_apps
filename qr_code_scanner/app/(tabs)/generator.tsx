import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import QRCode from "react-native-qrcode-svg"
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Generator() {
    const [inputValue, setInputValue] = useState("")
    const [qrValue, setQrValue] = useState("")

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>QR Generator</Text>
                <Text style={styles.subtitle}>Paste any text, URL, or data</Text>
            </View>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a text..."
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    onChangeText={setInputValue}
                    value={inputValue}
                    onSubmitEditing={() => setQrValue(inputValue)}
                />
                <TouchableOpacity style={styles.btn} onPress={() => setQrValue(inputValue)}>
                    <Text style={styles.btnText}>Generate</Text>
                </TouchableOpacity>
            </View>

            {qrValue ? (
                <View style={styles.qrCard}>
                    <QRCode value={qrValue} size={200} color="#1a1a1a" backgroundColor="white" />
                    {/* <Text style={styles.qrLabel} numberOfLines={2}>{qrValue}</Text> */}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Your QR code will appear here</Text>
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", paddingHorizontal: 20, backgroundColor: '#fafafa' },
    header: { alignItems: 'center', marginTop: 40, marginBottom: 28 },
    title: { fontSize: 22, fontWeight: '500', color: '#111', letterSpacing: -0.3 },
    subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
    inputRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 20 },
    input: { flex: 1, height: 44, borderWidth: 0.5, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, backgroundColor: '#fff', color: '#111' },
    btn: { height: 44, paddingHorizontal: 18, backgroundColor: '#7F77DD', borderRadius: 8, justifyContent: 'center' },
    btnText: { color: '#fff', fontSize: 13, fontWeight: '500' },
    qrCard: { backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#e5e5e5', borderRadius: 16, padding: 28, alignItems: 'center', gap: 12 },
    qrLabel: { fontSize: 12, color: '#999', textAlign: 'center', maxWidth: 200 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.4 },
    emptyText: { fontSize: 13, color: '#888' },
})