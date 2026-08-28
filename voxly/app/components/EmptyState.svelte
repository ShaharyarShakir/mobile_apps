<stackLayout class="mx-5 my-6">
  <!-- Elevated Clean Empty State Card -->
  <gridLayout 
    class="card-surface rounded-3xl p-8 items-center" 
    rows="auto, auto, auto, auto"
  >
    <!-- Visual Circle Icon -->
    <flexboxLayout 
      row="0" 
      class="w-14 h-14 rounded-full card-subtle justify-center items-center mb-4" 
      horizontalAlignment="center"
    >
      <label 
        text={ICONS.MIC} 
        class="text-brand text-xl fas text-center" 
      />
    </flexboxLayout>

    <!-- Title -->
    <label 
      row="1" 
      text="Nothing here yet" 
      class="font-bold text-title text-base text-center" 
    />

    <!-- Description -->
    <label 
      row="2" 
      text="Capture your first thought in your own voice." 
      class="font-normal text-subtitle text-xs text-center mt-1.5 mb-5 px-4" 
      textWrap="true" 
    />

    <!-- Prompt Inspiration Tips -->
    <stackLayout row="3" class="w-full">
      <gridLayout 
        columns="auto, *" 
        class="prompt-chip rounded-xl p-3 mb-2.5"
      >
        <label 
          col="0" 
          text={ICONS.LIGHTBULB} 
          class="text-amber-400 text-xs fas mr-2.5 vertical-middle" 
        />
        <label 
          col="1" 
          text="What was the most important thing you learned today?" 
          class="text-subtitle text-xs vertical-middle" 
          textWrap="true" 
        />
      </gridLayout>

      <gridLayout 
        columns="auto, *" 
        class="prompt-chip rounded-xl p-3"
      >
        <label 
          col="0" 
          text={ICONS.BOLT} 
          class="text-indigo-400 text-xs fas mr-2.5 vertical-middle" 
        />
        <label 
          col="1" 
          text="An idea or task you want to remember tomorrow." 
          class="text-subtitle text-xs vertical-middle" 
          textWrap="true" 
        />
      </gridLayout>
    </stackLayout>
  </gridLayout>
</stackLayout>

<script lang="ts">
  import { ICONS } from '../utils/icons';
</script>
