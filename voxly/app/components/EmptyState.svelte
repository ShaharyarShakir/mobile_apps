<stackLayout class="mx-5 my-6">
  <!-- Elevated Clean Empty State Card -->
  <gridLayout 
    class="items-center p-8 rounded-3xl card-surface" 
    rows="auto, auto, auto, auto"
  >
    <!-- Visual Circle Icon -->
    <flexboxLayout 
      row={0} 
      class="justify-center items-center mb-4 rounded-full w-14 h-14 card-subtle" 
      horizontalAlignment="center"
    >
      <label 
        text={ICONS.MIC} 
        class="text-brand text-xl text-center fas" 
      />
    </flexboxLayout>

    <!-- Title -->
    <label 
      row={1} 
      text="Nothing here yet" 
      class="font-bold text-title text-base text-center" 
    />

    <!-- Description -->
    <label 
      row={2} 
      text="Capture your first thought in your own voice." 
      class="mt-1.5 mb-5 px-4 font-normal text-subtitle text-xs text-center" 
      textWrap={true} 
    />

    <!-- Prompt Inspiration Tips -->
    <stackLayout row={3} class="w-full">
      <gridLayout 
        columns="auto, *" 
        class="mb-2.5 p-3 rounded-xl prompt-chip"
      >
        <label 
          col={0} 
          text={ICONS.LIGHTBULB} 
          class="mr-2.5 text-amber-400 text-xs fas vertical-middle" 
        />
        <label 
          col={1} 
          text="What was the most important thing you learned today?" 
          class="text-subtitle text-xs vertical-middle" 
          textWrap={true} 
        />
      </gridLayout>

      <gridLayout 
        columns="auto, *" 
        class="p-3 rounded-xl prompt-chip"
      >
        <label 
          col={0} 
          text={ICONS.BOLT} 
          class="mr-2.5 text-indigo-400 text-xs fas vertical-middle" 
        />
        <label 
          col={1} 
          text="An idea or task you want to remember tomorrow." 
          class="text-subtitle text-xs vertical-middle" 
          textWrap={true} 
        />
      </gridLayout>
    </stackLayout>
  </gridLayout>
</stackLayout>


<script lang="ts">
  import { ICONS } from '../utils/icons';
</script>
