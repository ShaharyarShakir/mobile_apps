import { isAndroid, isIOS, Application, AndroidApplication, AndroidActivityRequestPermissionsEventData, Utils } from '@nativescript/core';

const REQUEST_RECORD_AUDIO_CODE = 2001;

/**
 * Checks whether the app currently has microphone recording permission.
 */
export async function hasMicrophonePermission(): Promise<boolean> {
  if (isAndroid) {
    try {
      if (typeof android === 'undefined' || typeof androidx === 'undefined') {
        return true; // Preview / simulated fallback
      }
      const context = Utils.android.getApplicationContext() || Application.android?.context;
      if (!context) {
        return true;
      }
      const permission = android.Manifest.permission.RECORD_AUDIO;
      const check = androidx.core.content.ContextCompat.checkSelfPermission(context, permission);
      return check === android.content.pm.PackageManager.PERMISSION_GRANTED;
    } catch (err) {
      console.error('[AudioPermissions] Error checking Android permission', err);
      return false;
    }
  }

  if (isIOS) {
    try {
      if (typeof AVAudioSession === 'undefined') return true;
      const session = AVAudioSession.sharedInstance();
      return session.recordPermission === AVAudioSessionRecordPermission.Granted;
    } catch (err) {
      console.error('[AudioPermissions] Error checking iOS permission', err);
      return false;
    }
  }

  return true;
}

/**
 * Requests microphone recording permission from the user on-demand.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  const alreadyGranted = await hasMicrophonePermission();
  if (alreadyGranted) {
    return true;
  }

  if (isAndroid) {
    return new Promise<boolean>((resolve) => {
      try {
        if (typeof android === 'undefined' || typeof androidx === 'undefined') {
          resolve(true); // Preview / simulated fallback
          return;
        }

        const activity =
          Application.android?.foregroundActivity ||
          Application.android?.startActivity ||
          (Application.android as any)?.activity;

        if (!activity) {
          console.warn('[AudioPermissions] No Android Activity currently available. Assuming permission granted.');
          resolve(true);
          return;
        }

        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            Application.android.off(AndroidApplication.activityRequestPermissionsEvent, onPermissionsResult);
            hasMicrophonePermission().then(resolve);
          }
        }, 15000);

        const onPermissionsResult = (args: AndroidActivityRequestPermissionsEventData) => {
          if (args.requestCode === REQUEST_RECORD_AUDIO_CODE && !resolved) {
            resolved = true;
            clearTimeout(timeout);
            Application.android.off(AndroidApplication.activityRequestPermissionsEvent, onPermissionsResult);
            const grantResults = args.grantResults;
            const granted =
              grantResults != null &&
              grantResults.length > 0 &&
              grantResults[0] === android.content.pm.PackageManager.PERMISSION_GRANTED;
            resolve(granted);
          }
        };

        Application.android.on(AndroidApplication.activityRequestPermissionsEvent, onPermissionsResult);

        androidx.core.app.ActivityCompat.requestPermissions(
          activity,
          [android.Manifest.permission.RECORD_AUDIO],
          REQUEST_RECORD_AUDIO_CODE
        );
      } catch (err) {
        console.error('[AudioPermissions] Failed to request Android audio permission', err);
        resolve(false);
      }
    });
  }

  if (isIOS) {
    return new Promise<boolean>((resolve) => {
      try {
        if (typeof AVAudioSession === 'undefined') {
          resolve(true);
          return;
        }
        const session = AVAudioSession.sharedInstance();
        session.requestRecordPermission((granted: boolean) => {
          resolve(granted);
        });
      } catch (err) {
        console.error('[AudioPermissions] Failed to request iOS audio permission', err);
        resolve(false);
      }
    });
  }

  return true;
}

/**
 * Opens system application details settings so user can manually toggle permissions.
 */
export function openAppSettings(): void {
  if (isAndroid) {
    try {
      const context = Utils.android.getApplicationContext() || Application.android?.context;
      if (!context || typeof android === 'undefined') return;

      const intent = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      const uri = android.net.Uri.fromParts('package', context.getPackageName(), '');
      intent.setData(uri);
      intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(intent);
    } catch (err) {
      console.error('[AudioPermissions] Failed to open Android app settings', err);
    }
  } else if (isIOS) {
    try {
      if (typeof UIApplication === 'undefined' || typeof NSURL === 'undefined') return;
      const url = NSURL.URLWithString(UIApplicationOpenSettingsURLString);
      if (UIApplication.sharedApplication.canOpenURL(url)) {
        UIApplication.sharedApplication.openURLOptionsCompletionHandler(url, NSDictionary.dictionary(), () => {});
      }
    } catch (err) {
      console.error('[AudioPermissions] Failed to open iOS app settings', err);
    }
  }
}
