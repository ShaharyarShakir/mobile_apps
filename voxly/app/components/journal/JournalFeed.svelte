<stackLayout class="mx-5 mt-2">
  <!-- Loading State -->
  {#if isLoading}
    <gridLayout class="justify-center items-center my-4 p-8 rounded-3xl card-surface">
      <activityIndicator busy={true} class="mb-3 text-brand" />
      <label text="Loading your journal..." class="font-medium text-subtitle text-xs text-center" />
    </gridLayout>
  <!-- Empty / Filter State -->
  {:else if entries.length === 0}
    {#if isFiltered}
      <gridLayout class="justify-center items-center my-6 p-8 rounded-3xl card-surface" rows="auto, auto, auto, auto">
        <label row="0" text={ICONS.SEARCH} class="mb-3 text-subtitle text-2xl text-center fas" />
        <label row="1" text="No matching thoughts" class="font-bold text-title text-base text-center" />
        <label row="2" text="Try changing your search keywords or filter pills." class="mt-1 mb-4 px-4 font-normal text-subtitle text-xs text-center" textWrap="true" />
        <button row="3" text="Clear Filters" class="filter-chip-active-topic px-5 py-2 rounded-full font-bold text-xs" on:tap={clearAllFilters} />
      </gridLayout>
    {:else}
      <EmptyState />
    {/if}
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
  import { 
    searchQuery, 
    selectedEmotionFilter, 
    selectedTopicFilter 
  } from '../../stores/journal';
  import { groupEntriesByDate } from '../../utils/date';
  import { ICONS } from '../../utils/icons';
  import { triggerTagSelectHaptic } from '../../utils/haptics';
  import JournalEntryCard from '../JournalEntryCard.svelte';
  import EmptyState from '../EmptyState.svelte';

  export let entries: JournalEntry[] = [];
  export let isLoading: boolean = false;

  const dispatch = createEventDispatcher();

  $: isFiltered = Boolean($searchQuery || $selectedEmotionFilter || $selectedTopicFilter);
  $: groupedEntries = groupEntriesByDate(entries);

  function handleEditTags(entry: JournalEntry) {
    dispatch('editTags', { entry });
  }

  function clearAllFilters() {
    triggerTagSelectHaptic();
    searchQuery.set('');
    selectedEmotionFilter.set(null);
    selectedTopicFilter.set(null);
  }
</script>


