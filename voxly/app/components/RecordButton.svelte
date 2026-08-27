<stackLayout class="justify-center items-center my-8">
  <!-- Microphone Visual Hero / Badge -->
  <gridLayout 
    class="justify-center items-center bg-indigo-50 dark:bg-indigo-950/60 mb-6 rounded-full w-28 h-28" 
    horizontalAlignment="center"
  >
    <label 
      class="text-primary text-3xl text-center fas" 
      text="&#xf130;" 
      horizontalAlignment="center" 
      verticalAlignment="middle"
    ></label>
  </gridLayout>

  <!-- Circular Record Action Button -->
  <button 
    class="justify-center items-center bg-primary rounded-full w-20 h-20 font-bold text-white text-3xl text-center elevation-4"
    text="+"
    on:tap={handleRecordPress}
  ></button>

  <!-- Helper caption -->
  <label 
    text="Record a thought" 
    class="mt-4 font-semibold text-title text-sm text-center"
  ></label>
</stackLayout>

<script lang="ts">
  import { isRecording } from '../stores/app';

  function handleRecordPress() {
    console.log('Record pressed');
    isRecording.update((current) => !current);
  }
</script>

