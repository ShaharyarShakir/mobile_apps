<stackLayout 
  orientation="horizontal" 
  class="justify-center items-center {compact ? 'h-6' : 'h-12 mb-3'}"
>
  {#each heights as height, i}
    <stackLayout 
      class="rounded-full mx-1 {active ? (variant === 'record' ? 'waveform-bar-active' : 'waveform-bar-playing') : 'waveform-bar'}"
      style="width: {compact ? 3 : 5}; height: {height}; opacity: {active ? 1 : 0.35};"
    />
  {/each}

</stackLayout>

<script lang="ts">
  import { audioLevels } from '../../stores/recording';

  export let active: boolean = false;
  export let compact: boolean = false;
  export let variant: 'record' | 'play' = 'record';

  const defaultHeroHeights = [14, 26, 42, 54, 44, 28, 16];
  const defaultCompactHeights = [6, 12, 18, 22, 16, 10, 6];

  $: heights = active 
    ? (compact 
        ? $audioLevels.map((h) => Math.max(4, Math.round(h * 0.4))) 
        : $audioLevels)
    : (compact ? defaultCompactHeights : defaultHeroHeights);
</script>


