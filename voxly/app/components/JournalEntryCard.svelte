<stackLayout 
  class="journal-card {$isActiveCard ? 'journal-card-active' : ''} rounded-3xl p-4 mb-3.5 shadow-sm"
>
  <!-- Top Row: Play/Pause Icon, Title & Time, and More Actions Button (⋯) -->
  <gridLayout columns="auto, *, auto" class="items-center">
    <!-- Play / Pause Action Button -->
    <button 
      col="0" 
      class="w-11 h-11 rounded-full text-center mr-3 font-bold {$isThisCardPlaying ? 'player-btn-pause' : 'player-btn-play'} shadow-xs"
      on:tap={handleTogglePlay}
      isEnabled={!isProcessing}
    >
      <formattedString>
        <span 
          text={$isThisCardPlaying ? ICONS.PAUSE : ICONS.PLAY} 
          class="text-sm fas" 
        />
      </formattedString>
    </button>

    <!-- Entry Time & Duration (or Active Progress Indicator) -->
    <stackLayout col="1" class="justify-center" on:tap={handleTogglePlay}>
      <label 
        text={formatJournalTime(entry.createdAt)} 
        class="font-bold text-title text-sm" 
      />
      <label 
        text={formatDuration(entryDurationMs)} 
        class="font-mono text-muted text-xs mt-0.5" 
      />
    </stackLayout>

    <!-- More Actions (⋯) -->
    <button 
      col="2" 
      class="w-9 h-9 rounded-full icon-btn text-center"
      on:tap={handleMoreActions}
    >
      <formattedString>
        <span text={ICONS.ELLIPSIS} class="text-xs fas text-subtitle" />
      </formattedString>
    </button>
  </gridLayout>

  <!-- Interactive Slider & Live Timestamp Progress (shown when this card is active) -->
  {#if $isActiveCard}
    <gridLayout columns="auto, *, auto" class="items-center mt-3 pt-2 px-1 border-t border-gray-800/20">
      <label 
        col="0" 
        text={formatDuration(currentPositionDisplay)} 
        class="text-xs font-mono text-subtitle w-11 text-left" 
      />
      <slider 
        col="1" 
        class="player-slider mx-2"
        value={sliderPosition} 
        minValue={0} 
        maxValue={entryDurationMs > 0 ? entryDurationMs : 1000}
        on:valueChange={handleSeek}
      />
      <label 
        col="2" 
        text={formatDuration(entryDurationMs)} 
        class="text-xs font-mono text-subtitle w-11 text-right" 
      />
    </gridLayout>
  {/if}

  <!-- Bottom Row: Emotion & Topic Badges -->
  {#if hasTags}
    <flexboxLayout class="flex-wrap items-center mt-2.5 pt-1">
      {#if entry.emotion}
        <TagPill text={entry.emotion} type="emotion" />
      {/if}

      {#if entry.topic}
        <TagPill text={entry.topic} type="topic" />
      {/if}
    </flexboxLayout>
  {/if}
</stackLayout>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Dialogs } from '@nativescript/core';
  import type { JournalEntry } from '../models/journal';
  import { 
    currentAudioUri, 
    isPlaying, 
    playbackPosition 
  } from '../stores/player';
  import { activePlayingEntryId, deleteJournalEntry } from '../stores/journal';
  import { player } from '../services/audio/player';
  import { formatDuration } from '../utils/time';
  import { formatJournalTime } from '../utils/date';
  import { ICONS } from '../utils/icons';
  import { confirmDeleteEntry, showMissingAudioFileDialog, showPlaybackErrorAlert } from '../utils/dialogs';
  import TagPill from './journal/TagPill.svelte';

  export let entry: JournalEntry;

  const dispatch = createEventDispatcher();
  let isProcessing: boolean = false;
  let isSeeking: boolean = false;
  let seekTimeout: any = null;
  let sliderPosition: number = 0;

  $: entryDurationMs = entry.duration > 1000 ? entry.duration : entry.duration * 1000;
  $: isActiveCard = $activePlayingEntryId === entry.id;
  $: isThisCardPlaying = $isActiveCard && $isPlaying;
  $: hasTags = Boolean(entry.emotion || entry.topic);

  $: currentPositionDisplay = isSeeking ? sliderPosition : $playbackPosition;

  $: if (!isSeeking && $isActiveCard) {
    sliderPosition = $playbackPosition;
  }

  async function handleTogglePlay() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      if ($activePlayingEntryId !== entry.id || $currentAudioUri !== entry.audioUri) {
        await player.load(entry.audioUri);
        activePlayingEntryId.set(entry.id);
        await player.play();
      } else {
        if ($isPlaying) {
          await player.pause();
        } else {
          await player.play();
        }
      }
    } catch (err: any) {
      console.error('[JournalEntryCard] Playback error:', err);
      const message = err?.message || '';
      if (message.includes('not be found') || message.includes('unavailable')) {
        const remove = await showMissingAudioFileDialog();
        if (remove) {
          await deleteJournalEntry(entry.id);
        }
      } else {
        await showPlaybackErrorAlert(message || 'Unable to play recording.');
      }
    } finally {
      isProcessing = false;
    }
  }

  function handleSeek(args: any) {
    if (!$isActiveCard) return;
    const newPos = Math.round(args.value);
    sliderPosition = newPos;
    isSeeking = true;

    if (seekTimeout) clearTimeout(seekTimeout);
    seekTimeout = setTimeout(async () => {
      try {
        await player.seekTo(newPos);
      } catch (e) {
        console.warn('[JournalEntryCard] Seek error:', e);
      } finally {
        isSeeking = false;
      }
    }, 50);
  }

  async function handleMoreActions() {
    const action = await Dialogs.action({
      title: 'Voice Note Options',
      cancelButtonText: 'Cancel',
      actions: ['Edit Tags', 'Delete Recording']
    });

    if (action === 'Edit Tags') {
      dispatch('editTags', { entry });
    } else if (action === 'Delete Recording') {
      const confirmed = await confirmDeleteEntry();
      if (confirmed) {
        try {
          await deleteJournalEntry(entry.id);
        } catch (err) {
          console.error('[JournalEntryCard] Error deleting entry:', err);
        }
      }
    }
  }
</script>
