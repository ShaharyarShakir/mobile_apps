<stackLayout class="mx-5 mt-2">
  <!-- Loading State -->
  {#if isLoading}
    <gridLayout class="justify-center items-center my-4 p-8 rounded-3xl card-surface">
      <activityIndicator busy={true} class="mb-3 text-brand" />
      <label text="Loading your journal..." class="font-medium text-subtitle text-xs text-center" />
    </gridLayout>
  <!-- Empty State -->
  {:else if entries.length === 0}
    <EmptyState />
  <!-- Grouped Journal Feed -->
  {:else}
    <!-- Note Stats Header -->
    <gridLayout columns="*, auto" class="mb-2 px-1">
      <label 
        col="0" 
        text="Your Voice Notes" 
        class="font-bold text-title text-sm tracking-wide" 
      />
      <label 
        col="1" 
        text={`${entries.length} ${entries.length === 1 ? 'thought' : 'thoughts'}`} 
        class="font-medium text-muted text-xs" 
      />
    </gridLayout>

    {#each groupedEntries as group}
      <label 
        text={group.dateLabel} 
        class="mt-4 mb-2.5 px-1 font-bold text-subtitle text-xs uppercase tracking-wider" 
      />
      {#each group.entries as entry (entry.id)}
        <JournalEntryCard 
          {entry} 
          on:editTags={() => handleEditTags(entry)} 
        />
      {/each}
    {/each}
  {/if}
</stackLayout>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { JournalEntry } from '../../models/journal';
  import { groupEntriesByDate } from '../../utils/date';
  import JournalEntryCard from '../JournalEntryCard.svelte';
  import EmptyState from '../EmptyState.svelte';

  export let entries: JournalEntry[] = [];
  export let isLoading: boolean = false;

  const dispatch = createEventDispatcher();

  $: groupedEntries = groupEntriesByDate(entries);

  function handleEditTags(entry: JournalEntry) {
    dispatch('editTags', { entry });
  }
</script>

