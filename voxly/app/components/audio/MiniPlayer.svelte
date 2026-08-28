{#if $currentAudioUri}
  <gridLayout 
    columns="auto, *, auto, auto, auto" 
    class="items-center shadow-lg mx-4 mb-3 p-3 rounded-2xl mini-player-bar"
  >
    <!-- Play / Pause Toggle Button -->
    <button 
      col={0} 
      class="w-10 h-10 rounded-full font-bold text-center mr-2.5 {$isPlaying ? 'player-btn-pause' : 'player-btn-play'} shadow-xs"
      on:tap={handleTogglePlay}
    >
      <formattedString>
        <span text={$isPlaying ? ICONS.PAUSE : ICONS.PLAY} class="text-xs fas" />
      </formattedString>
    </button>

    <!-- Track Info & Dynamic Progress -->
    <stackLayout col={1} class="justify-center">
      <label text={activeEntryTitle} class="font-bold text-title text-xs" />
      <gridLayout columns="auto, auto" class="items-center mt-0.5">
        <label 
          col={0} 
          text="{formatDuration($playbackPosition)} / {formatDuration(effectiveDuration)}" 
          class="mr-2 font-mono text-3xs text-muted" 
        />
        <!-- Mini Dancing Soundwave Dots -->
        {#if $isPlaying}
          <stackLayout col={1} orientation="horizontal" class="items-end h-2.5">
            <stackLayout class="bg-sky-400 mx-0.5 rounded-full w-1" height="6" />
            <stackLayout class="bg-sky-400 mx-0.5 rounded-full w-1" height="10" />
            <stackLayout class="bg-sky-400 mx-0.5 rounded-full w-1" height="7" />
            <stackLayout class="bg-sky-400 mx-0.5 rounded-full w-1" height="9" />
          </stackLayout>
        {/if}
      </gridLayout>
    </stackLayout>

    <!-- Speed Toggle Button -->
    <button 
      col={2} 
      class="mr-1 px-2 py-1 rounded-full font-bold text-3xs text-brand icon-btn"
      text="{$playbackSpeed}x"
      on:tap={handleSpeedCycle}
    />

    <!-- Skip 10s Forward Button -->
    <button 
      col={3} 
      class="mr-1 rounded-full w-8 h-8 text-center icon-btn"
      on:tap={handleSkipForward}
    >
      <formattedString>
        <span text="+10s" class="font-bold text-3xs text-subtitle" />
      </formattedString>
    </button>

    <!-- Dismiss / Close Player -->
    <button 
      col={4} 
      class="rounded-full w-8 h-8 text-center icon-btn"
      on:tap={handleClose}
    >
      <formattedString>
        <span text={ICONS.TIMES} class="text-3xs text-subtitle fas" />
      </formattedString>
    </button>
  </gridLayout>

{/if}

<script lang="ts">
  import { 
    currentAudioUri, 
    isPlaying, 
    playbackPosition, 
    playbackDuration,
    playbackSpeed,
    cyclePlaybackSpeed
  } from '../../stores/player';
  import { activePlayingEntryId, journalEntries } from '../../stores/journal';
  import { player } from '../../services/audio/player';
  import { formatDuration } from '../../utils/time';
  import { formatJournalHeader } from '../../utils/date';
  import { ICONS } from '../../utils/icons';

  $: activeEntry = $journalEntries.find((e) => e.id === $activePlayingEntryId);
  $: activeEntryTitle = activeEntry 
    ? (activeEntry.topic ? `${activeEntry.topic.toUpperCase()} · ` : '') + formatJournalHeader(activeEntry.createdAt)
    : 'Voice Note';

  $: effectiveDuration = $playbackDuration > 0 
    ? $playbackDuration 
    : (activeEntry ? (activeEntry.duration > 1000 ? activeEntry.duration : activeEntry.duration * 1000) : 0);

  async function handleTogglePlay() {
    try {
      if ($isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (err) {
      console.warn('[MiniPlayer] Toggle play error:', err);
    }
  }

  async function handleSkipForward() {
    try {
      await player.skip(10);
    } catch (err) {
      console.warn('[MiniPlayer] Skip error:', err);
    }
  }

  async function handleSpeedCycle() {
    const newSpeed = cyclePlaybackSpeed();
    try {
      await player.setSpeed(newSpeed);
    } catch (e) {
      console.warn('[MiniPlayer] Set speed error:', e);
    }
  }

  async function handleClose() {
    try {
      await player.stop();
      await player.unload();
      activePlayingEntryId.set(null);
    } catch (err) {
      console.warn('[MiniPlayer] Close error:', err);
    }
  }
</script>

