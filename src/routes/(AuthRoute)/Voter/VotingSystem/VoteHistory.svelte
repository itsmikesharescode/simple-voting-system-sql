<script lang="ts">
	import { showHistory, votedHistoryArray, votersPositionsArray } from "$lib";
	import Button from "$lib/Components/Button.svelte";
	import { scale } from "svelte/transition";

    

</script>


<div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

    <div class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] shadow-sm shadow-white dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[10vh]" transition:scale>
        <h1 class="text-center font-bold">Vote History </h1>
        
        <div class="max-h-[50vh] overflow-auto flex flex-col gap-2">
            {#each $votersPositionsArray ?? [] as position }

                <div class="flex flex-col gap-2 border-2 p-2">
                    <h1 class="font-bold ">{position.description}</h1>
                    {#each $votedHistoryArray ?? [] as {candidates_tb} }
                        {#if candidates_tb.position === position.description}
                            <p>{candidates_tb.name}</p>
                        {/if}
                    {/each}

                </div>
            {/each}
        </div>

        <div class="flex gap-2">
            <Button title="Click, to back." type="button" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Back" on:click={ () => showHistory.set(false)} />
        </div>

    </div>
    
</div>
