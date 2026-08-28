<stackLayout orientation="horizontal" class="justify-center items-end mb-5 h-14">
  {#each barHeights as height, i}
    <stackLayout 
      class="w-1.5 mx-1 rounded-full {active ? 'waveform-bar-active' : 'waveform-bar'}"
      style="height: {active ? dynamicHeights[i] : height}px; opacity: {active ? '1' : '0.45'};"
    />
  {/each}
</stackLayout>

<script lang="ts">
  import { onDestroy } from 'svelte';

  export let active: boolean = false;

  const barHeights = [12, 22, 36, 48, 38, 26, 14];
  let dynamicHeights = [18, 38, 52, 42, 54, 30, 20];
  let animationInterval: any = null;

  $: if (active) {
    startAnimation();
  } else {
    stopAnimation();
  }

  function startAnimation() {
    stopAnimation();
    animationInterval = setInterval(() => {
      dynamicHeights = [
        12 + Math.floor(Math.random() * 36),
        20 + Math.floor(Math.random() * 32),
        30 + Math.floor(Math.random() * 26),
        24 + Math.floor(Math.random() * 32),
        32 + Math.floor(Math.random() * 24),
        18 + Math.floor(Math.random() * 34),
        12 + Math.floor(Math.random() * 30),
      ];
    }, 180);
  }

  function stopAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }

  onDestroy(() => {
    stopAnimation();
  });
</script>

