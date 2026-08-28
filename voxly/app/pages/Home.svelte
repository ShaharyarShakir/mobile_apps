<page class="page-bg" actionBarHidden="true">
  <gridLayout rows="*" class="page-bg">
    <!-- Main Scrollable Content -->
    <gridLayout rows="auto, *" row="0">
      <!-- App Header -->
      <AppHeader row="0" />

      <!-- Scrollable Feed -->
      <scrollView row="1">
        <stackLayout class="pb-12">
          <!-- Hero Recording Experience -->
          <RecordButton on:entryCreated={handleEntryCreated} />

          <!-- Modular Journal Feed -->
          <JournalFeed 
            entries={$journalEntries} 
            isLoading={$isLoadingJournal} 
            on:editTags={handleOpenTagModal} 
          />
        </stackLayout>
      </scrollView>
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
  import RecordButton from '../components/RecordButton.svelte';
  import JournalFeed from '../components/journal/JournalFeed.svelte';
  import TagPicker from '../components/TagPicker.svelte';
  import { journalEntries, isLoadingJournal, loadJournal } from '../stores/journal';
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
