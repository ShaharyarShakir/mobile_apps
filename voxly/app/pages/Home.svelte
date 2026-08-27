<page class="page-bg" actionBarHidden="true">
  <gridLayout rows="auto, *, auto">
    <!-- Header -->
    <AppHeader row="0" />

    <!-- Center: Record Action Area -->
    <RecordButton row="1" />

    <!-- Bottom: Empty State Area -->
    <stackLayout row="2" class="px-2 pb-6">
      <EmptyState />
    </stackLayout>
  </gridLayout>
</page>

<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import RecordButton from '../components/RecordButton.svelte';
  import EmptyState from '../components/EmptyState.svelte';
</script>

