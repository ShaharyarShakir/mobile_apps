<page class="page-bg" actionBarHidden={true}>
  <gridLayout rows="*" class="page-bg">
    <!-- Main Content Container with Docked MiniPlayer -->
    <gridLayout rows="auto, *, auto" row={0}>
      <!-- Fixed Top Controls: App Header, Search Bar, Filter Bar -->
      <stackLayout row={0}>
        <AppHeader />
        <SearchBar />
        <FilterBar />
      </stackLayout>

      <!-- Scrollable Feed -->
      <scrollView row={1}>
        <stackLayout class="pb-16">
          <!-- Hero Recording Experience -->
          <RecordButton on:entryCreated={handleEntryCreated} />

          <!-- Modular Journal Feed -->
          <JournalFeed 
            entries={$filteredJournalEntries} 
            isLoading={$isLoadingJournal} 
            on:editTags={handleOpenTagModal} 
          />
        </stackLayout>
      </scrollView>

      <!-- Sticky Bottom MiniPlayer -->
      <stackLayout row={2}>
        <MiniPlayer />
      </stackLayout>
    </gridLayout>



    <!-- Bottom-Sheet Tag Picker Modal -->
    {#if editingEntry}
      <TagPicker 
        entry={editingEntry} 
        on:close={closeTagModal} 
        on:save={closeTagModal} 
      />
    {/if}
  </gridLayout>
</page>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application, isAndroid, AndroidApplication } from '@nativescript/core';
  import AppHeader from '../components/AppHeader.svelte';
  import SearchBar from '../components/journal/SearchBar.svelte';
  import FilterBar from '../components/journal/FilterBar.svelte';
  import RecordButton from '../components/RecordButton.svelte';
  import JournalFeed from '../components/journal/JournalFeed.svelte';
  import MiniPlayer from '../components/audio/MiniPlayer.svelte';
  import TagPicker from '../components/TagPicker.svelte';
  import { filteredJournalEntries, isLoadingJournal, loadJournal } from '../stores/journal';
  import { isRecording, resetRecordingState } from '../stores/recording';
  import { database } from '../services/database';
  import { recorder } from '../services/audio';
  import { confirmDiscardRecording } from '../utils/dialogs';
  import type { JournalEntry } from '../models/journal';

  let editingEntry: JournalEntry | null = null;

  const backButtonHandler = async (args: any) => {
    if (editingEntry) {
      args.cancel = true;
      editingEntry = null;
      return;
    }

    if ($isRecording) {
      args.cancel = true;
      const shouldDiscard = await confirmDiscardRecording();
      if (shouldDiscard) {
        try {
          await recorder.cancel();
        } finally {
          resetRecordingState();
        }
      }
      return;
    }
  };

  onMount(async () => {
    try {
      if (isAndroid) {
        Application.android.on(AndroidApplication.activityBackPressedEvent, backButtonHandler);
      }
      await database.initialize();
      await loadJournal();
    } catch (err) {
      console.error('[Home] Initialization error:', err);
    }
  });

  onDestroy(() => {
    if (isAndroid) {
      Application.android.off(AndroidApplication.activityBackPressedEvent, backButtonHandler);
    }
  });

  async function handleEntryCreated(event: CustomEvent<{ entry: JournalEntry }>) {
    const entry = event.detail.entry;
    if (entry) {
      editingEntry = entry;
      await loadJournal();
    }
  }

  function handleOpenTagModal(event: CustomEvent<{ entry: JournalEntry }>) {
    editingEntry = event.detail.entry;
  }

  function closeTagModal() {
    editingEntry = null;
  }
</script>

