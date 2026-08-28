<gridLayout class="modal-backdrop" rows="*, auto">
  <!-- Tap backdrop to dismiss / skip -->
  <stackLayout row="0" on:tap={handleSkip} />

  <!-- Bottom Sheet Card Surface -->
  <gridLayout 
    row="1" 
    class="p-6 rounded-t-3xl modal-content" 
    rows="auto, auto, auto, auto, auto, auto"
  >
    <!-- Header -->
    <gridLayout row="0" columns="*, auto" class="mb-3">
      <stackLayout col="0">
        <label text="Recording saved" class="font-bold text-title text-base" />
        <label text="How are you feeling?" class="mt-0.5 text-subtitle text-xs" />
      </stackLayout>
      <button 
        col="1" 
        class="rounded-full w-8 h-8 text-center icon-btn"
        on:tap={handleSkip}
      >
        <formattedString>
          <span text={ICONS.TIMES} class="text-subtitle text-xs fas" />
        </formattedString>
      </button>
    </gridLayout>

    <!-- Emotions Section -->
    <flexboxLayout row="1" class="flex-wrap mb-4">
      {#each EMOTIONS as emotion}
        <button 
          text={capitalize(emotion)} 
          class="rounded-full px-3.5 py-1.5 mr-2 mb-2 text-xs font-medium {selectedEmotion === emotion ? 'chip-tag-selected-emotion font-bold' : 'chip-tag'}"
          on:tap={() => toggleEmotion(emotion)}
        />
      {/each}
    </flexboxLayout>

    <!-- Topics Section -->
    <label row="2" text="Topic" class="mb-2 font-semibold text-title text-xs tracking-wide" />
    <flexboxLayout row="3" class="flex-wrap mb-5">
      {#each TOPICS as topic}
        <button 
          text={capitalize(topic)} 
          class="rounded-full px-3.5 py-1.5 mr-2 mb-2 text-xs font-medium {selectedTopic === topic ? 'chip-tag-selected-topic font-bold' : 'chip-tag'}"
          on:tap={() => toggleTopic(topic)}
        />
      {/each}
    </flexboxLayout>

    <!-- Actions: Save & Skip -->
    <gridLayout row="4" columns="*, *" class="gap-3">
      <button 
        col="0" 
        text="Skip" 
        class="py-3 rounded-xl font-semibold text-subtitle text-xs text-center card-subtle"
        on:tap={handleSkip}
      />
      <button 
        col="1" 
        text="Save" 
        class="shadow-md py-3 rounded-xl font-bold text-xs text-center btn-record-idle"
        on:tap={handleSave}
      />
    </gridLayout>
  </gridLayout>
</gridLayout>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { EMOTIONS, TOPICS } from '../models/journal';
  import type { JournalEntry, Emotion, Topic } from '../models/journal';
  import { updateJournalEntry } from '../stores/journal';
  import { triggerTagSelectHaptic } from '../utils/haptics';
  import { ICONS } from '../utils/icons';

  export let entry: JournalEntry;

  const dispatch = createEventDispatcher();

  let selectedEmotion: string | undefined = entry.emotion;
  let selectedTopic: string | undefined = entry.topic;

  function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function toggleEmotion(emotion: Emotion) {
    triggerTagSelectHaptic();
    selectedEmotion = selectedEmotion === emotion ? undefined : emotion;
  }

  function toggleTopic(topic: Topic) {
    triggerTagSelectHaptic();
    selectedTopic = selectedTopic === topic ? undefined : topic;
  }

  async function handleSave() {
    try {
      const updated: JournalEntry = {
        ...entry,
        emotion: selectedEmotion || undefined,
        topic: selectedTopic || undefined
      };
      await updateJournalEntry(updated);
      dispatch('save', { entry: updated });
    } catch (err) {
      console.error('[TagPicker] Error updating tags:', err);
    }
  }

  function handleSkip() {
    dispatch('close');
  }
</script>

