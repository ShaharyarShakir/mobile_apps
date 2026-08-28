<gridLayout 
  class="shadow-md mx-5 my-3 p-4 rounded-2xl player-card" 
  rows="auto, auto, auto"
>
  <!-- Optional Title / Status Header -->
  <gridLayout row={0} columns="*, auto" class="mb-2 px-1">
    <label 
      col={0} 
      text={title || 'Voice Note'} 
      class="font-semibold text-title text-sm vertical-middle" 
    />
    <label 
      col={1} 
      text={$isPlaying ? 'Playing' : 'Ready'} 
      class="text-xs font-medium {$isPlaying ? 'text-brand' : 'text-muted'} vertical-middle" 
    />
  </gridLayout>

  <!-- Center Play / Pause Action Button -->
  <flexboxLayout row={1} class="justify-center items-center py-2" horizontalAlignment="center">
    <button 
      class="w-16 h-16 rounded-full font-bold text-center {$isPlaying ? 'player-btn-pause' : 'player-btn-play'} shadow-md"
      on:tap={togglePlayback}
      isEnabled={!isProcessing && hasAudio}
    >
      <formattedString>
        <span 
          text={$isPlaying ? ICONS.PAUSE : ICONS.PLAY} 
          class="text-xl fas" 
        />
      </formattedString>
    </button>
  </flexboxLayout>

  <!-- Progress Bar & Duration Indicators -->
  <gridLayout row={2} columns="auto, *, auto" class="items-center mt-3 px-1">
    <!-- Current Timestamp -->
    <label 
      col={0} 
      text={formatDuration(currentPositionDisplay)} 
      class="w-12 font-mono text-subtitle text-xs text-left vertical-middle" 
    />

    <!-- Interactive Native Seek Slider -->
    <slider 
      col={1} 
      class="mx-2 player-slider"
      value={sliderPosition} 
      minValue={0} 
      maxValue={maxDuration}
      on:valueChange={handleSliderChange}
      isEnabled={hasAudio}
    />

    <!-- Total Duration -->
    <label 
      col={2} 
      text={formatDuration(totalDurationDisplay)} 
      class="w-12 font-mono text-subtitle text-xs text-right vertical-middle" 
    />
  </gridLayout>
</gridLayout>


<script lang="ts">
  import { onDestroy } from 'svelte';
  import { 
    currentAudioUri, 
    isPlaying, 
    playbackPosition, 
    playbackDuration 
  } from '../stores/player';
  import { player } from '../services/audio/player';
  import { formatDuration } from '../utils/time';
  import { ICONS } from '../utils/icons';
  import { showPlaybackErrorAlert } from '../utils/dialogs';

  export let audioUri: string | null = null;
  export let title: string = '';

  let isProcessing: boolean = false;
  let isSeeking: boolean = false;
  let seekTimeout: any = null;
  let sliderPosition: number = 0;

  // React to store updates or prop changes
  $: hasAudio = Boolean(audioUri || $currentAudioUri);
  $: maxDuration = $playbackDuration > 0 ? $playbackDuration : 1000;
  $: currentPositionDisplay = isSeeking ? sliderPosition : $playbackPosition;
  $: totalDurationDisplay = $playbackDuration > 0 ? $playbackDuration : 0;

  // Sync slider position with playback store when not actively dragging
  $: if (!isSeeking) {
    sliderPosition = $playbackPosition;
  }

  // If audioUri prop changes and differs from current store, load it
  $: if (audioUri && audioUri !== $currentAudioUri) {
    loadAudioFile(audioUri);
  }

  async function loadAudioFile(uri: string) {
    try {
      await player.load(uri);
    } catch (err: any) {
      console.error('[AudioPlayer] Error loading audio:', err);
      await showPlaybackErrorAlert(err?.message || 'Unable to play recording.');
    }
  }

  async function togglePlayback() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      if (!audioUri && !$currentAudioUri) {
        return;
      }

      // If prop specified but not yet loaded in player service
      if (audioUri && audioUri !== $currentAudioUri) {
        await player.load(audioUri);
      }

      if ($isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (err: any) {
      console.error('[AudioPlayer] Playback error:', err);
      await showPlaybackErrorAlert(err?.message || 'Something went wrong while playing this recording.');
    } finally {
      isProcessing = false;
    }
  }

  function handleSliderChange(args: any) {
    const newPosition = Math.round(args.value);
    
    // Ignore synthetic events matching current store position
    if (Math.abs(newPosition - $playbackPosition) < 150 && !isSeeking) {
      return;
    }

    sliderPosition = newPosition;
    isSeeking = true;

    if (seekTimeout) {
      clearTimeout(seekTimeout);
    }

    // Debounce seek to avoid thrashing native audio player during scrub
    seekTimeout = setTimeout(async () => {
      try {
        await player.seekTo(newPosition);
      } catch (err) {
        console.warn('[AudioPlayer] Seek error:', err);
      } finally {
        isSeeking = false;
      }
    }, 50);
  }

  onDestroy(async () => {
    if (seekTimeout) {
      clearTimeout(seekTimeout);
    }
  });
</script>

