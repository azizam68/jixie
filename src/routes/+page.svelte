<script lang="ts">
  import Editor from "$lib/Editor.svelte";
  import * as Y from "yjs";
  
  const ydoc = new Y.Doc();
  
  ydoc.on('update', () => {
    console.log('Document updated');
  });

</script>

<h1>Welcome to Jixie</h1>
<p>dev in progress ...</p>

<Editor {ydoc} />
