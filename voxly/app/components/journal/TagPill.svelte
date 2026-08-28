<flexboxLayout class="{type === 'emotion' ? 'tag-pill-emotion' : 'tag-pill-topic'} rounded-full px-3 py-1 mr-2 mb-1.5 items-center shadow-xs">
  <label text={icon} class="mr-1.5 text-xs fas vertical-middle" />
  <label text={label} class="font-semibold text-xs vertical-middle" />
</flexboxLayout>

<script lang="ts">
  import { ICONS } from '../../utils/icons';

  export let text: string = '';
  export let type: 'emotion' | 'topic' = 'emotion';

  $: label = text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  $: icon = getIcon(text, type);

  function getIcon(val: string, tagType: 'emotion' | 'topic'): string {
    const lower = (val || '').toLowerCase();
    if (tagType === 'emotion') {
      if (lower === 'happy') return ICONS.SPARKLES;
      if (lower === 'calm') return ICONS.HEART;
      if (lower === 'excited') return ICONS.BOLT;
      if (lower === 'sad') return ICONS.WAVE;
      if (lower === 'angry') return ICONS.BOLT;
      if (lower === 'anxious') return ICONS.WAVE;
      return ICONS.HEART;
    } else {
      if (lower === 'ideas') return ICONS.LIGHTBULB;
      if (lower === 'work') return ICONS.FILE_TEXT;
      if (lower === 'study') return ICONS.FILE_TEXT;
      if (lower === 'goals') return ICONS.CHECK;
      if (lower === 'personal') return ICONS.HEART;
      if (lower === 'random') return ICONS.SPARKLES;
      return ICONS.TAG;
    }
  }
</script>

