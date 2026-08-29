<gridLayout class="modal-backdrop" rows="*, auto">
  <!-- Tap backdrop to dismiss / skip -->
  <stackLayout row={0} on:tap={handleSkip} />

  <!-- Bottom Sheet Card Surface -->
  <gridLayout 
    row={1} 
    class="p-6 rounded-t-3xl modal-content" 
    rows="auto, auto, auto, auto, auto, auto, auto, auto"
  >
    <!-- Drag Handle Indicator -->
    <stackLayout row={0} horizontalAlignment="center" class="mb-3">
      <stackLayout class="modal-handle" />
    </stackLayout>

    <!-- Header -->
    <gridLayout row={1} columns="*, auto" class="items-center mb-3">
      <stackLayout col={0}>
        <label text="Edit Voice Thought" class="font-bold text-title text-base" />
        <label text="Name your recording and add feelings" class="mt-0.5 text-subtitle text-xs" />
      </stackLayout>
      <button 
        col={1} 
        class="rounded-full w-8 h-8 text-center icon-btn"
        on:tap={handleSkip}
      >
        <formattedString>
          <span text={ICONS.TIMES} class="text-subtitle text-xs fas" />
        </formattedString>
      </button>
    </gridLayout>

    <!-- Thought Name / Title Input -->
    <label row={2} text="NAME / TITLE" class="mb-1.5 font-bold text-3xs text-subtitle uppercase tracking-wider" />
    <gridLayout row={3} class="mb-4">
      <textField 
        text={titleText} 
        hint="e.g. Morning Reflection, Meeting Notes..." 
        class="px-4 py-2.5 rounded-2xl font-semibold text-title text-sm search-container"
        on:textChange={(e) => titleText = e.value}
        returnKeyType="done"
      />
    </gridLayout>

    <!-- Emotions Section -->
    <label row={4} text="HOW ARE YOU FEELING?" class="mb-2 font-bold text-3xs text-subtitle uppercase tracking-wider" />
    <flexboxLayout row={5} class="flex-wrap mb-3">
      {#each EMOTIONS as emotion}
        <button 
          text={capitalize(emotion)} 
          class="rounded-full px-4 py-2 mr-2 mb-2 text-xs font-semibold {selectedEmotion === emotion ? 'chip-tag-selected-emotion font-bold' : 'chip-tag'}"
          on:tap={() => toggleEmotion(emotion)}
        />
      {/each}
    </flexboxLayout>

    <!-- Topics Section -->
    <label row={6} text="WHAT IS THIS ABOUT?" class="mb-2 font-bold text-3xs text-subtitle uppercase tracking-wider" />
    <flexboxLayout row={7} class="flex-wrap mb-5">
      {#each TOPICS as topic}
        <button 
          text={capitalize(topic)} 
          class="rounded-full px-4 py-2 mr-2 mb-2 text-xs font-semibold {selectedTopic === topic ? 'chip-tag-selected-topic font-bold' : 'chip-tag'}"
          on:tap={() => toggleTopic(topic)}
        />
      {/each}
    </flexboxLayout>

    <!-- Actions: Save & Skip -->
    <gridLayout row={8} columns="*, *" class="gap-3">
      <button 
        col={0} 
        text="Cancel" 
        class="py-3.5 rounded-2xl font-bold text-subtitle text-xs text-center card-subtle"
        on:tap={handleSkip}
      />
      <button 
        col={1} 
        text="Save Changes" 
        class="shadow-md py-3.5 rounded-2xl font-bold text-xs text-center btn-record-idle"
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
  import { triggerTagSelectHaptic, triggerHapticFeedback } from '../utils/haptics';
  import { ICONS } from '../utils/icons';

  export let entry: JournalEntry;

  const dispatch = createEventDispatcher();

  let titleText: string = entry.title || '';
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
      triggerHapticFeedback();
      const updated: JournalEntry = {
        ...entry,
        title: titleText.trim() || undefined,
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


