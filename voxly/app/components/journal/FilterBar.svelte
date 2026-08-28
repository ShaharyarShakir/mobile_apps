<scrollView orientation="horizontal" scrollBarIndicatorVisible="false" class="my-1.5 px-4">
  <stackLayout orientation="horizontal" class="items-center py-1">
    <!-- "All" Reset Chip -->
    <button 
      text="All Thoughts ({$journalStats.totalCount})" 
      class="rounded-full px-3.5 py-1.5 mr-2 text-xs font-semibold {!$selectedEmotionFilter && !$selectedTopicFilter ? 'filter-chip-active-topic font-bold' : 'filter-chip-default'}"
      on:tap={clearFilters}
    />

    <!-- Emotion Chips -->
    {#each EMOTIONS as emotion}
      {@const count = $journalStats.emotionMap[emotion] || 0}
      {#if count > 0 || $selectedEmotionFilter === emotion}
        <button 
          text="{capitalize(emotion)}{count > 0 ? ` (${count})` : ''}" 
          class="rounded-full px-3.5 py-1.5 mr-2 text-xs font-semibold {$selectedEmotionFilter === emotion ? 'filter-chip-active-emotion font-bold' : 'filter-chip-default'}"
          on:tap={() => toggleEmotion(emotion)}
        />
      {/if}
    {/each}

    <!-- Topic Chips -->
    {#each TOPICS as topic}
      {@const count = $journalStats.topicMap[topic] || 0}
      {#if count > 0 || $selectedTopicFilter === topic}
        <button 
          text="{capitalize(topic)}{count > 0 ? ` (${count})` : ''}" 
          class="rounded-full px-3.5 py-1.5 mr-2 text-xs font-semibold {$selectedTopicFilter === topic ? 'filter-chip-active-topic font-bold' : 'filter-chip-default'}"
          on:tap={() => toggleTopic(topic)}
        />
      {/if}
    {/each}
  </stackLayout>
</scrollView>

<script lang="ts">
  import { EMOTIONS, TOPICS } from '../../models/journal';
  import type { Emotion, Topic } from '../../models/journal';
  import { 
    selectedEmotionFilter, 
    selectedTopicFilter, 
    journalStats 
  } from '../../stores/journal';
  import { triggerTagSelectHaptic } from '../../utils/haptics';

  function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function toggleEmotion(emotion: Emotion) {
    triggerTagSelectHaptic();
    if ($selectedEmotionFilter === emotion) {
      selectedEmotionFilter.set(null);
    } else {
      selectedEmotionFilter.set(emotion);
      selectedTopicFilter.set(null);
    }
  }

  function toggleTopic(topic: Topic) {
    triggerTagSelectHaptic();
    if ($selectedTopicFilter === topic) {
      selectedTopicFilter.set(null);
    } else {
      selectedTopicFilter.set(topic);
      selectedEmotionFilter.set(null);
    }
  }

  function clearFilters() {
    triggerTagSelectHaptic();
    selectedEmotionFilter.set(null);
    selectedTopicFilter.set(null);
  }
</script>
