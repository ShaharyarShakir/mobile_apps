<gridLayout columns="auto, *, auto" class="items-center mx-5 my-2 px-3 py-1.5 rounded-2xl search-container">
  <!-- Search Icon -->
  <label 
    col={0} 
    text={ICONS.SEARCH} 
    class="mr-2 text-subtitle text-xs fas vertical-middle" 
  />

  <!-- Search Input -->
  <textField 
    col={1} 
    text={$searchQuery} 
    hint="Search thoughts, tags, dates..." 
    class="py-1 font-medium text-xs search-field"
    on:textChange={handleTextChange}
    returnKeyType="search"
  />

  <!-- Clear Button -->
  {#if $searchQuery.length > 0}
    <button 
      col={2} 
      class="justify-center items-center p-0 rounded-full w-6 h-6 text-center icon-btn"
      on:tap={handleClear}
    >
      <formattedString>
        <span text={ICONS.TIMES} class="text-3xs text-subtitle fas" />
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
