<script lang="ts">
	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<div>
	<h2>Compteur</h2>

	<p>Compteur : {count}</p>

	<button onclick={increment}>
		Incrémenter
	</button>
</div>