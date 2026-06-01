import { useCameraPermissions } from "expo-camera"
import { Link } from "expo-router"
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'

function QrIcon() {
    return (
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="3" width="7" height="7" rx="1" />
            <Rect x="14" y="3" width="7" height="7" rx="1" />
            <Rect x="3" y="14" width="7" height="7" rx="1" />
            <Path d="M14 14h3v3M17 17v3h3M14 20h3" />
        </Svg>
    )
}

function ScanIcon({ color = 'white' }: { color?: string }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
            <Path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
            <Line x1="7" y1="12" x2="17" y2="12" />
        </Svg>
    )
}

function InfoIcon() {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 8v4m0 4h.01" />
        </Svg>
    )
}

export default function Index() {
    const [permission, requestPermission] = useCameraPermissions()
    const isPermissionGranted = Boolean(permission?.granted)

    return (
        <SafeAreaView style={styles.container}>

            {/* Icon */}
            <View style={styles.iconWrap}>
                <QrIcon />
            </View>

            {/* Title + subtitle */}
            <Text style={styles.title}>QR scanner</Text>
            <Text style={styles.subtitle}>Scan any QR code instantly using your device camera</Text>

            {/* Status pill */}
            <View style={[styles.statusPill, isPermissionGranted && styles.statusPillGranted]}>
                <View style={[styles.dot, isPermissionGranted ? styles.dotGranted : styles.dotDenied]} />
                <Text style={styles.statusText}>
                    {isPermissionGranted ? 'Camera access granted' : 'Camera access not granted'}
                </Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Buttons */}
            <TouchableOpacity
                style={[styles.btnPrimary, isPermissionGranted && styles.btnPrimaryDisabled]}
                onPress={requestPermission}
                disabled={isPermissionGranted}
                activeOpacity={0.85}
            >
                <InfoIcon />
                <Text style={styles.btnPrimaryText}>Allow camera access</Text>
            </TouchableOpacity>

            <Link href="/scanner" asChild>
                <TouchableOpacity
                    style={[styles.btnSecondary, !isPermissionGranted && styles.btnSecondaryDisabled]}
                    disabled={!isPermissionGranted}
                    activeOpacity={0.85}
                >
                    <ScanIcon color={!isPermissionGranted ? '#aaa' : '#111'} />
                    <Text style={[styles.btnSecondaryText, !isPermissionGranted && styles.btnSecondaryTextDisabled]}>
                        Scan QR code
                    </Text>
                </TouchableOpacity>
            </Link>

            {/* Hint */}
            <Text style={styles.hint}>
                {isPermissionGranted
                    ? 'Tap "Scan QR code" to open the scanner'
                    : 'Grant camera permission first to enable scanning'}
            </Text>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#fff',
    },

    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#EEEDFE',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 56,
        marginBottom: 20,
    },

    title: {
        fontSize: 22,
        fontWeight: '500',
        color: '#111',
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 19,
        maxWidth: 240,
    },

    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 24,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 99,
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        backgroundColor: '#f5f5f5',
    },
    statusPillGranted: {
        backgroundColor: '#EAF3DE',
        borderColor: '#C0DD97',
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 99,
    },
    dotDenied: { backgroundColor: '#E24B4A' },
    dotGranted: { backgroundColor: '#639922' },
    statusText: {
        fontSize: 12,
        color: '#666',
    },

    divider: {
        width: '100%',
        height: 0.5,
        backgroundColor: '#e5e5e5',
        marginTop: 24,
        marginBottom: 24,
    },

    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        height: 48,
        borderRadius: 14,
        backgroundColor: '#7F77DD',
        marginBottom: 12,
    },
    btnPrimaryDisabled: {
        opacity: 0.4,
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },

    btnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        height: 48,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#ccc',
    },
    btnSecondaryDisabled: {
        opacity: 0.4,
    },
    btnSecondaryText: {
        color: '#111',
        fontSize: 15,
    },
    btnSecondaryTextDisabled: {
        color: '#aaa',
    },

    hint: {
        fontSize: 11,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 16,
    },
})