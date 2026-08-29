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
            on:openOptions={handleOpenOptionsModal} 
          />
        </stackLayout>
      </scrollView>

      <!-- Sticky Bottom MiniPlayer -->
      <stackLayout row={2}>
        <MiniPlayer />
      </stackLayout>
    </gridLayout>

    <!-- Bottom-Sheet Voice Note Options Modal -->
    {#if optionsEntry}
      <gridLayout row={0} class="w-full h-full">
        <OptionsModal 
          entry={optionsEntry} 
          on:editTags={handleEditTagsFromOptions} 
          on:delete={handleDeleteFromOptions} 
          on:close={closeOptionsModal} 
        />
      </gridLayout>
    {/if}

    <!-- Bottom-Sheet Tag Picker Modal -->
    {#if editingEntry}
      <gridLayout row={0} class="w-full h-full">
        <TagPicker 
          entry={editingEntry} 
          on:close={closeTagModal} 
          on:save={closeTagModal} 
        />
      </gridLayout>
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
  import OptionsModal from '../components/journal/OptionsModal.svelte';
  import { 
    filteredJournalEntries, 
    isLoadingJournal, 
    loadJournal, 
    deleteJournalEntry 
  } from '../stores/journal';
  import { isRecording, resetRecordingState } from '../stores/recording';
  import { database } from '../services/database';
  import { recorder } from '../services/audio';
  import { confirmDiscardRecording, confirmDeleteEntry } from '../utils/dialogs';
  import type { JournalEntry } from '../models/journal';

  let editingEntry: JournalEntry | null = null;
  let optionsEntry: JournalEntry | null = null;

  const backButtonHandler = async (args: any) => {
    if (optionsEntry) {
      args.cancel = true;
      optionsEntry = null;
      return;
    }

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

  function handleOpenOptionsModal(event: CustomEvent<{ entry: JournalEntry }>) {
    optionsEntry = event.detail.entry;
  }

  function handleEditTagsFromOptions(event: CustomEvent<{ entry: JournalEntry }>) {
    const entry = event.detail.entry;
    optionsEntry = null;
    editingEntry = entry;
  }

  async function handleDeleteFromOptions(event: CustomEvent<{ entry: JournalEntry }>) {
    const entry = event.detail.entry;
    optionsEntry = null;
    const confirmed = await confirmDeleteEntry();
    if (confirmed) {
      try {
        await deleteJournalEntry(entry.id);
      } catch (err) {
        console.error('[Home] Error deleting entry:', err);
      }
    }
  }

  function closeOptionsModal() {
    optionsEntry = null;
  }

  function closeTagModal() {
    editingEntry = null;
  }
</script>


