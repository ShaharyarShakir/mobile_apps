import { useSSO } from '@clerk/expo';
import { useState } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

function useAuthSocial() {
  const [loadingStrategy, setLoadingStartegy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const handleSocialAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
    setLoadingStartegy(strategy);
    try {
      const redirectUrl = Linking.createURL('/', { scheme: 'mobile' });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.log('Error in social auth: ', error);
      const provider = strategy == 'oauth_google' ? 'Google' : 'Apple';
      Alert.alert('Error', `Failed to sing in with ${provider}. Please try again`);
    } finally {
      setLoadingStartegy(null);
    }
  };
  return { handleSocialAuth, loadingStrategy };
}

export default useAuthSocial;
