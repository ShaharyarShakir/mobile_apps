<stackLayout class="justify-center items-center my-5">
  {#if !$isRecording}
    <!-- ==================== IDLE STATE ==================== -->
    <gridLayout 
      class="justify-center items-center rounded-full record-outer-ring w-32 h-32" 
      horizontalAlignment="center"
    >
      <gridLayout 
        class="justify-center items-center rounded-full record-inner-ring w-24 h-24" 
        horizontalAlignment="center"
      >
        <button 
          class="shadow-lg rounded-full w-18 h-18 font-bold text-center btn-record-idle"
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
      class="mt-3 font-semibold text-subtitle text-xs tracking-wide" 
    />
  {:else}
    <!-- ==================== RECORDING STATE ==================== -->
    <!-- Equalizer / Waveform Visualization -->
    <Waveform active={true} />

    <!-- Pulse Glow Record Button -->
    <gridLayout 
      class="justify-center items-center rounded-full record-outer-ring-active w-36 h-36" 
      horizontalAlignment="center"
    >
      <gridLayout 
        class="justify-center items-center rounded-full record-inner-ring-active w-28 h-28" 
        horizontalAlignment="center"
      >
        <button 
          class="shadow-xl rounded-full w-20 h-20 font-bold text-center btn-record-active"
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
      class="mt-2 font-mono font-extrabold text-title text-2xl" 
    />

    <!-- Stop & Cancel Action Buttons -->
    <stackLayout orientation="horizontal" class="items-center mt-2.5">
      <!-- Stop Button Pill -->
      <gridLayout 
        columns="auto, auto" 
        class="items-center mr-2 px-5 py-2 rounded-full status-pill-active"
        on:tap={handleStopRecording}
      >
        <label 
          col="0" 
          text="●" 
          class="mr-2 text-red-500 text-xs vertical-middle" 
        />
        <label 
          col="1" 
          text="Save Thought" 
          class="font-bold text-red-400 text-xs vertical-middle" 
        />
      </gridLayout>

      <!-- Discard / Cancel Button Pill -->
      <gridLayout 
        columns="auto, auto" 
        class="items-center px-4 py-2 rounded-full status-pill"
        on:tap={handleCancelRecording}
      >
        <label 
          col="0" 
          text={ICONS.TRASH} 
          class="mr-1.5 text-subtitle text-xs fas vertical-middle" 
        />
        <label 
          col="1" 
          text="Discard" 
          class="font-semibold text-subtitle text-xs vertical-middle" 
        />
      </gridLayout>
    </stackLayout>
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
  import { showPermissionDeniedDialog, showRecordingErrorAlert, showSaveErrorAlert, confirmDiscardRecording } from '../utils/dialogs';
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

  async function handleCancelRecording() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const confirmed = await confirmDiscardRecording();
      if (confirmed) {
        await recorder.cancel();
        resetRecordingState();
        triggerRecordStopHaptic();
        console.log('[RecordButton] Recording discarded by user.');
      }
    } catch (err) {
      console.error('[RecordButton] Error canceling recording:', err);
      resetRecordingState();
    } finally {
      isProcessing = false;
    }
  }

  onDestroy(() => {
    stopDurationTimer();
  });
</script>

