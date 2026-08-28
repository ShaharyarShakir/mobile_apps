<stackLayout class="justify-center items-center my-5">
  {#if !$isRecording}
    <!-- ==================== IDLE STATE ==================== -->
    <gridLayout 
      class="w-32 h-32 rounded-full justify-center items-center record-outer-ring" 
      horizontalAlignment="center"
    >
      <gridLayout 
        class="w-24 h-24 rounded-full justify-center items-center record-inner-ring" 
        horizontalAlignment="center"
      >
        <button 
          class="w-18 h-18 rounded-full font-bold text-center btn-record-idle shadow-lg"
          on:tap={handleStartRecording}
          isEnabled={!isProcessing}
        >
          <formattedString>
            <span 
              text={ICONS.PLUS} 
              class="text-2xl fas" 
            />
          </formattedString>
        </button>
      </gridLayout>
    </gridLayout>

    <!-- Subtitle Prompt -->
    <label 
      text="Record a thought" 
      class="text-xs font-semibold text-subtitle mt-3 tracking-wide" 
    />
  {:else}
    <!-- ==================== RECORDING STATE ==================== -->
    <!-- Equalizer / Waveform Visualization -->
    <Waveform active={true} />

    <!-- Pulse Glow Record Button -->
    <gridLayout 
      class="w-36 h-36 rounded-full justify-center items-center record-outer-ring-active" 
      horizontalAlignment="center"
    >
      <gridLayout 
        class="w-28 h-28 rounded-full justify-center items-center record-inner-ring-active" 
        horizontalAlignment="center"
      >
        <button 
          class="w-20 h-20 rounded-full font-bold text-center btn-record-active shadow-xl"
          on:tap={handleStopRecording}
          isEnabled={!isProcessing}
        >
          <formattedString>
            <span 
              text={ICONS.STOP} 
              class="text-2xl fas" 
            />
          </formattedString>
        </button>
      </gridLayout>
    </gridLayout>

    <!-- Prominent Recording Duration Timer -->
    <label 
      text={formatRecordingTime($recordingDuration)} 
      class="text-2xl font-mono font-extrabold text-title mt-2" 
    />

    <!-- Dedicated Stop Action Button / Pill -->
    <gridLayout 
      columns="auto, auto" 
      class="status-pill-active rounded-full px-5 py-2 mt-2 items-center"
      on:tap={handleStopRecording}
    >
      <label 
        col="0" 
        text="●" 
        class="text-red-500 text-xs mr-2 vertical-middle" 
      />
      <label 
        col="1" 
        text="Tap to Stop" 
        class="text-xs font-bold text-red-400 vertical-middle" 
      />
    </gridLayout>
  {/if}
</stackLayout>

<script lang="ts">
  import { onDestroy, createEventDispatcher } from 'svelte';
  import { 
    isRecording, 
    recordingDuration, 
    lastRecordingResult, 
    startDurationTimer, 
    stopDurationTimer, 
    resetRecordingState 
  } from '../stores/recording';
  import { addJournalEntry } from '../stores/journal';
  import type { JournalEntry } from '../models/journal';
  import { recorder } from '../services/audio';
  import { triggerRecordStartHaptic, triggerRecordStopHaptic } from '../utils/haptics';
  import { ICONS } from '../utils/icons';
  import { showPermissionDeniedDialog, showRecordingErrorAlert, showSaveErrorAlert } from '../utils/dialogs';
  import Waveform from './audio/Waveform.svelte';

  const dispatch = createEventDispatcher();
  let isProcessing: boolean = false;

  function formatRecordingTime(seconds: number): string {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  async function handleStartRecording() {
    if (isProcessing) return;
    isProcessing = true;

    const permitted = await recorder.requestPermission();
    if (!permitted) {
      isProcessing = false;
      await showPermissionDeniedDialog();
      return;
    }

    try {
      triggerRecordStartHaptic();
      await recorder.start();
      isRecording.set(true);
      startDurationTimer();
    } catch (err: any) {
      console.error('[RecordButton] Failed to start recording:', err);
      resetRecordingState();
      await showRecordingErrorAlert(err?.message || "Couldn't start recording. Please try again.");
    } finally {
      isProcessing = false;
    }
  }

  async function handleStopRecording() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      triggerRecordStopHaptic();
      const result = await recorder.stop();
      stopDurationTimer();
      isRecording.set(false);
      lastRecordingResult.set(result);

      // Create new Journal Entry and save to SQLite immediately
      const entryId = `01J${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
      const newEntry: JournalEntry = {
        id: entryId,
        audioUri: result.uri,
        duration: result.duration > 1000 ? result.duration : result.duration * 1000,
        createdAt: new Date().toISOString()
      };

      await addJournalEntry(newEntry);
      dispatch('entryCreated', { entry: newEntry });
      console.log('[RecordButton] Journal entry saved to SQLite:', newEntry.id);
    } catch (err: any) {
      console.error('[RecordButton] Failed to stop recording:', err);
      resetRecordingState();
      await showSaveErrorAlert(err?.message || "Couldn't save this recording. Try recording again.");
    } finally {
      isProcessing = false;
    }
  }

  onDestroy(() => {
    stopDurationTimer();
  });
</script>
