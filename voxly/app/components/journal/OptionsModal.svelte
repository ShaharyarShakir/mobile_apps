<gridLayout class="modal-backdrop" rows="*, auto">
  <!-- Tap backdrop to dismiss -->
  <stackLayout row={0} on:tap={handleClose} />

  <!-- Bottom Sheet Surface -->
  <gridLayout 
    row={1} 
    class="p-6 rounded-t-3xl modal-content" 
    rows="auto, auto, auto, auto, auto"
  >
    <!-- Drag Handle Indicator -->
    <stackLayout row={0} horizontalAlignment="center" class="mb-4">
      <stackLayout class="modal-handle" />
    </stackLayout>

    <!-- Header & Voice Note Preview -->
    <gridLayout row={1} columns="auto, *, auto" class="items-center mb-4 p-3 rounded-2xl card-subtle">
      <flexboxLayout col={0} class="justify-center items-center bg-indigo-500/20 mr-3 rounded-full w-10 h-10">
        <label text={ICONS.MIC} class="text-brand text-sm text-center fas" />
      </flexboxLayout>

      <stackLayout col={1} class="justify-center">
        <label text={formatJournalHeader(entry.createdAt)} class="font-bold text-title text-sm" />
        <label text="{formatDuration(entryDurationMs)}" class="mt-0.5 font-mono text-muted text-xs" />
      </stackLayout>

      {#if entry.emotion || entry.topic}
        <stackLayout col={2} class="items-end">
          {#if entry.emotion}
            <label text={entry.emotion.toUpperCase()} class="px-2 py-0.5 rounded-full font-bold text-3xs tag-pill-emotion" />
          {/if}
          {#if entry.topic}
            <label text={entry.topic.toUpperCase()} class="mt-1 px-2 py-0.5 rounded-full font-bold text-3xs tag-pill-topic" />
          {/if}
        </stackLayout>
      {/if}
    </gridLayout>

    <!-- Action 1: Edit Tags & Mood -->
    <gridLayout 
      row={2} 
      columns="auto, *, auto" 
      class="items-center mb-2.5 p-4 action-item"
      on:tap={handleEditTags}
    >
      <flexboxLayout col={0} class="justify-center items-center bg-purple-500/20 mr-3 rounded-full w-9 h-9">
        <label text={ICONS.TAG} class="text-purple-400 text-xs text-center fas" />
      </flexboxLayout>

      <stackLayout col={1} class="justify-center">
        <label text="Edit Feelings & Tags" class="font-bold text-title text-sm" />
        <label text="Update emotion and topic categories" class="mt-0.5 font-normal text-subtitle text-xs" />
      </stackLayout>

      <label col={2} text={ICONS.CHEVRON_RIGHT} class="mr-1 text-muted text-xs fas" />
    </gridLayout>

    <!-- Action 2: Delete Voice Note -->
    <gridLayout 
      row={3} 
      columns="auto, *" 
      class="items-center mb-4 p-4 action-item-danger"
      on:tap={handleDelete}
    >
      <flexboxLayout col={0} class="justify-center items-center bg-red-500/20 mr-3 rounded-full w-9 h-9">
        <label text={ICONS.TRASH} class="text-red-400 text-xs text-center fas" />
      </flexboxLayout>

      <stackLayout col={1} class="justify-center">
        <label text="Delete Recording" class="font-bold text-red-400 text-sm" />
        <label text="Permanently remove this voice thought" class="mt-0.5 font-normal text-red-300/70 text-xs" />
      </stackLayout>
    </gridLayout>

    <!-- Cancel Button -->
    <button 
      row={4} 
      text="Cancel" 
      class="py-3.5 rounded-2xl font-bold text-subtitle text-xs text-center card-subtle"
      on:tap={handleClose}
    />
  </gridLayout>
</gridLayout>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { JournalEntry } from '../../models/journal';
  import { formatJournalHeader } from '../../utils/date';
  import { formatDuration } from '../../utils/time';
  import { ICONS } from '../../utils/icons';
  import { triggerHapticFeedback } from '../../utils/haptics';

  export let entry: JournalEntry;

  const dispatch = createEventDispatcher();

  $: entryDurationMs = entry.duration > 1000 ? entry.duration : entry.duration * 1000;

  function handleEditTags() {
    triggerHapticFeedback();
    dispatch('editTags', { entry });
  }

  function handleDelete() {
    triggerHapticFeedback();
    dispatch('delete', { entry });
  }

  function handleClose() {
    dispatch('close');
  }
</script>

