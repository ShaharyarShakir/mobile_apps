<gridLayout class="px-6 pt-10 pb-4" columns="*, auto" rows="auto, auto">
  <!-- Brand Title -->
  <label 
    col="0" 
    row="0" 
    text="Voxly" 
    class="font-extrabold text-title text-3xl tracking-tight"
  ></label>

  <!-- Options icon (⋯) -->
  <label 
    col="1" 
    row="0" 
    text="&#xf141;" 
    class="px-2 py-1 text-subtitle text-xl fas vertical-middle"
    on:tap={handleMenuTap}
  ></label>

  <!-- Subtitle -->
  <label 
    col="0" 
    row="1" 
    colSpan="2" 
    text="Capture the moment." 
    class="mt-1 font-medium text-subtitle text-sm" 
    textWrap="true"
  ></label>
</gridLayout>

<script lang="ts">
  function handleMenuTap() {
    console.log('Header options tapped');
  }
</script>

