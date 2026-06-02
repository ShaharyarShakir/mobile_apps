import { useAuthCallback } from '@/hooks/useAuth';
import { useAuth, useUser } from '@clerk/expo';
import { useEffect, useId, useRef } from 'react';
import * as Sentry from '@sentry/react-native';
function AuthSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { mutate: syncUser } = useAuthCallback();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;

      syncUser(undefined, {
        onSuccess: (data) => {
          console.log(`User Synced with backend: ${data.name}`);
          Sentry.logger.info(Sentry.logger.fmt`User Synced with backend: ${data.name}`, {
            useId: user.id,
            userName: data.name,
          });
        },
        onError: (error) => {
          console.log(`User Sync failed: ${error}`);
          Sentry.logger.error(Sentry.logger.fmt`User Synced with backend: ${error}`, {
            useId: user.id,
            error: error instanceof Error ? error.message : String(error),
          });
        },
      });
    }

    if (!isSignedIn) {
      hasSynced.current = false;
    }
  }, [isSignedIn, user, syncUser]);

  return null;
}

export default AuthSync;
