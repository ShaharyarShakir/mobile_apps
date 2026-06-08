import { COLORS } from "@/utils/Colors";
import { useSSO } from "@clerk/expo";
import { OAuthStrategy } from '@clerk/types';
import { AntDesign } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
export default function Page() {
    // return <Redirect href={'/(tabs)/saves'} />
    const openLink = () => {
        WebBrowser.openBrowserAsync('https://shakir-retro-portfolio.netlify.app/')
    }
    const { startSSOFlow } = useSSO()
    const handleSocialLogin = async (provider: string) => {
        const { createdSessionId, setActive, } = await startSSOFlow({
            strategy: provider as OAuthStrategy
        })
        if (createdSessionId) {
            setActive!({
                session: createdSessionId,
                navigate: async ({ session }) => {
                    // router.replace('/(tabs)/home')
                }
            })
        }
    }
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={'padding'}
            keyboardVerticalOffset={400}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Image source={require('@/assets/images/pocket-logo.png')} style={styles.logoIcon} />
                    <Text style={styles.title}>Login In</Text>
                </View>
            </View>
            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.button} onPress={() => handleSocialLogin('oauth_apple')}>
                    <AntDesign name="apple" size={20} color={'#000000'} />
                    <Text style={styles.buttonText}>Continue with apple</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => handleSocialLogin('oauth_google')}>
                    <AntDesign name="google" size={20} color={'#000000'} />
                    <Text style={styles.buttonText}>Continue with google</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
            </View>
            <View style={styles.emailSection}>
                <TextInput
                    style={styles.emailInput}
                    placeholder="Email"
                    placeholderTextColor={'#999'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
                <Link href="/(tabs)/home" asChild replace>
                    <TouchableOpacity style={{ marginTop: 16, alignSelf: 'center' }}>
                        <Text style={{ color: '#4A90E2', fontWeight: 'bold' }}>Skip for now</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <View style={styles.footer}>
                <Text style={styles.termsText}>
                    By proceeding, you agree to:{'\n'}
                    Pocket's{' '}
                    <Text style={styles.link} onPress={() => openLink}>
                        Terms of Service
                    </Text>{' '}
                    and{' '}
                    <Text style={styles.link} onPress={() => openLink}>
                        Privacy Notice
                    </Text>
                    .{'\n'}
                    Mozilla Accounts{' '}
                    <Text style={styles.link} onPress={() => openLink}>
                        Terms of Service
                    </Text>{' '}
                    and{' '}
                    <Text style={styles.link} onPress={() => openLink}>
                        Privacy Notice
                    </Text>
                    .
                </Text>
                <Button
                    title="Test Sentry"
                    onPress={() => { }}
                />
            </View>

        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 30,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    logoIcon: {
        width: 80,
        height: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    buttonSection: {
        gap: 12,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderColor: COLORS.border,
    },
    buttonText: {
        fontSize: 16,
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    orText: {
        marginHorizontal: 16,
        color: COLORS.textLight,
        fontSize: 14,
    },
    emailSection: {
        marginBottom: 30,
    },
    emailInput: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    nextButton: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 20,
    },
    termsText: {
        fontSize: 12,
        color: COLORS.textGray,
        textAlign: 'center',
        lineHeight: 18,
    },
    link: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
});