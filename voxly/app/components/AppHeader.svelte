<gridLayout class="px-6 pt-6 pb-2" columns="*, auto" rows="auto">
  <!-- Brand Area -->
  <stackLayout col="0" row="0" class="vertical-middle">
    <label>
      <formattedString>
        <span text="Voxly" class="font-extrabold text-title text-2xl tracking-tight" />
        <span text=" •" class="font-black text-brand text-2xl" />
      </formattedString>
    </label>
    <label 
      text="Your voice, your moments." 
      class="mt-0.5 font-normal text-subtitle text-xs" 
    />
  </stackLayout>

  <!-- Right Area: Thought Counter Badge -->
  <stackLayout col="1" row="0" orientation="horizontal" class="items-center vertical-middle">
    {#if $journalStats.totalCount > 0}
      <gridLayout 
        columns="auto, auto" 
        class="items-center px-3 py-1.5 rounded-full status-pill"
      >
        <label 
          col="0" 
          text={ICONS.MIC} 
          class="mr-1.5 text-3xs text-brand fas vertical-middle" 
        />
        <label 
          col="1" 
          text={`${$journalStats.totalCount} ${$journalStats.totalCount === 1 ? 'thought' : 'thoughts'}`} 
          class="font-bold text-title text-xs vertical-middle" 
        />
      </gridLayout>
    {/if}
  </stackLayout>
</gridLayout>

<script lang="ts">
  import { ICONS } from '../utils/icons';
  import { journalStats } from '../stores/journal';
</script>

