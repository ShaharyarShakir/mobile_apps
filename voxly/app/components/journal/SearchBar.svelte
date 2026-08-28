<gridLayout columns="auto, *, auto" class="search-container rounded-2xl mx-5 my-2 px-3 py-1.5 items-center">
  <!-- Search Icon -->
  <label 
    col="0" 
    text={ICONS.SEARCH} 
    class="fas text-subtitle text-xs mr-2 vertical-middle" 
  />

  <!-- Search Input -->
  <textField 
    col="1" 
    text={$searchQuery} 
    hint="Search thoughts, tags, dates..." 
    class="search-field text-xs font-medium py-1"
    on:textChange={handleTextChange}
    returnKeyType="search"
  />

  <!-- Clear Button -->
  {#if $searchQuery.length > 0}
    <button 
      col="2" 
      class="w-6 h-6 rounded-full icon-btn text-center justify-center items-center p-0"
      on:tap={handleClear}
    >
      <formattedString>
        <span text={ICONS.TIMES} class="fas text-subtitle text-3xs" />
      </formattedString>
    </button>
  {/if}
</gridLayout>

<script lang="ts">
  import { searchQuery } from '../../stores/journal';
  import { ICONS } from '../../utils/icons';

  function handleTextChange(args: any) {
    const text = args.value || '';
    searchQuery.set(text);
  }

  function handleClear() {
    searchQuery.set('');
  }
</script>
