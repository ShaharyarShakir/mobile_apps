<stackLayout 
  class="journal-card {isActiveCard ? 'journal-card-active' : ''} rounded-3xl p-4 mb-3.5 shadow-sm"
>
  <!-- Top Row: Play/Pause Icon, Title & Time, and More Actions Button (⋯) -->
  <gridLayout columns="auto, *, auto" class="items-center">
    <!-- Play / Pause Action Button -->
    <button 
      col={0} 
      class="w-11 h-11 rounded-full text-center mr-3 font-bold {isThisCardPlaying ? 'player-btn-pause' : 'player-btn-play'} shadow-xs"
      on:tap={handleTogglePlay}
      isEnabled={!isProcessing}
    >
      <formattedString>
        <span 
          text={isThisCardPlaying ? ICONS.PAUSE : ICONS.PLAY} 
          class="text-sm fas" 
        />
      </formattedString>
    </button>

    <!-- Entry Time & Duration (or Active Progress Indicator) -->
    <stackLayout col={1} class="justify-center" on:tap={handleTogglePlay}>
      <gridLayout columns="*, auto" class="items-center">
        <label 
          col={0}
          text={formatJournalTime(entry.createdAt)} 
          class="font-bold text-title text-sm" 
        />
        {#if isThisCardPlaying}
          <Waveform active={true} compact={true} variant="play" />
        {/if}
      </gridLayout>
      <label 
        text={formatDuration(entryDurationMs)} 
        class="mt-0.5 font-mono text-muted text-xs" 
      />
    </stackLayout>

    <!-- More Actions (⋯) -->
    <button 
      col={2} 
      class="rounded-full w-9 h-9 text-center icon-btn"
      on:tap={handleMoreActions}
    >
      <formattedString>
        <span text={ICONS.ELLIPSIS} class="text-subtitle text-xs fas" />
      </formattedString>
    </button>
  </gridLayout>

  <!-- Interactive Slider & Live Timestamp Progress (shown when this card is active) -->
  {#if isActiveCard}
    <gridLayout columns="auto, *, auto" class="items-center mt-3 px-1 pt-2 border-gray-800/20 border-t">
      <label 
        col={0} 
        text={formatDuration(currentPositionDisplay)} 
        class="w-11 font-mono text-subtitle text-xs text-left" 
      />
      <slider 
        col={1} 
        class="mx-2 player-slider"
        value={sliderPosition} 
        minValue={0} 
        maxValue={entryDurationMs > 0 ? entryDurationMs : 1000}
        on:valueChange={handleSeek}
      />
      <label 
        col={2} 
        text={formatDuration(entryDurationMs)} 
        class="w-11 font-mono text-subtitle text-xs text-right" 
      />
    </gridLayout>

    <!-- Quick Seek & Speed Control Bar -->
    <gridLayout columns="auto, *, auto" class="items-center mt-2 px-1">
      <stackLayout col={0} orientation="horizontal" class="items-center">
        <button 
          class="mr-1.5 px-2.5 py-1 rounded-full font-semibold text-3xs icon-btn"
          text="-10s"
          on:tap={() => handleSkip(-10)}
        />
        <button 
          class="mr-1.5 px-2.5 py-1 rounded-full font-semibold text-3xs icon-btn"
          text="+10s"
          on:tap={() => handleSkip(10)}
        />
      </stackLayout>

      <button 
        col={2} 
        class="px-3 py-1 rounded-full font-bold text-3xs text-brand icon-btn"
        text="{$playbackSpeed}x"
        on:tap={handleSpeedCycle}
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
    playbackPosition,
    playbackSpeed,
    cyclePlaybackSpeed
  } from '../stores/player';
  import { activePlayingEntryId, deleteJournalEntry } from '../stores/journal';
  import { player } from '../services/audio/player';
  import { formatDuration } from '../utils/time';
  import { formatJournalTime } from '../utils/date';
  import { ICONS } from '../utils/icons';
  import { confirmDeleteEntry, showMissingAudioFileDialog, showPlaybackErrorAlert } from '../utils/dialogs';
  import TagPill from './journal/TagPill.svelte';
  import Waveform from './audio/Waveform.svelte';

  export let entry: JournalEntry;

  const dispatch = createEventDispatcher();
  let isProcessing: boolean = false;
  let isSeeking: boolean = false;
  let seekTimeout: any = null;
  let sliderPosition: number = 0;

  $: entryDurationMs = entry.duration > 1000 ? entry.duration : entry.duration * 1000;
  $: isActiveCard = $activePlayingEntryId === entry.id;
  $: isThisCardPlaying = isActiveCard && $isPlaying;
  $: hasTags = Boolean(entry.emotion || entry.topic);

  $: currentPositionDisplay = isSeeking ? sliderPosition : $playbackPosition;

  $: if (!isSeeking && isActiveCard) {
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
    if (!isActiveCard) return;
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

  async function handleSkip(seconds: number) {
    if (!isActiveCard) return;
    try {
      await player.skip(seconds);
    } catch (e) {
      console.warn('[JournalEntryCard] Skip error:', e);
    }
  }

  async function handleSpeedCycle() {
    const newSpeed = cyclePlaybackSpeed();
    try {
      await player.setSpeed(newSpeed);
    } catch (e) {
      console.warn('[JournalEntryCard] Set speed error:', e);
    }
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


