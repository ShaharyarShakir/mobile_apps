<gridLayout 
  columns="auto, auto" 
  class="rounded-full px-4 py-1.5 mt-5 {active ? 'status-pill-active' : 'status-pill'}"
  horizontalAlignment="center"
>
  <label 
    col={0} 
    text="●" 
    class="text-xs mr-1.5 vertical-middle {active ? 'text-red-500 font-bold' : 'text-emerald-500'}" 
  />
  <label 
    col={1} 
    text={active ? `Recording ${formatDuration(duration)}` : 'Tap to start recording'} 
    class="text-xs font-semibold vertical-middle {active ? 'text-red-400' : 'text-subtitle'}" 
  />

</gridLayout>

<script lang="ts">
  import { formatDuration } from '../../utils/formatters';

  export let active: boolean = false;
  export let duration: number = 0;
</script>

