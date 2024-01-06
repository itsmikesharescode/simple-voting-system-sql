<script lang="ts">
	import '../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { Toast, storePopup } from '@skeletonlabs/skeleton';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	
	//all fresh import starts here rest is bloating shit
	import Footer from '$lib/Components/Footer.svelte';
	import { navigating } from '$app/stores';
	import Spinner from '$lib/Components/Spinner.svelte';


</script>

<div class="fixed p-4 bottom-0 right-0">
	<LightSwitch />
</div>


<Toast transitions={true} max={4}/>

<div class="p-2">
	{#if $navigating}
		<div class="min-h-screen">
			<Spinner />
		</div>
	{:else}
		<slot />
	{/if}
</div>

<Footer />
