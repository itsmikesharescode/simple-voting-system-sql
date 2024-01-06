<script lang="ts">
	import { candidateComparison } from "$lib";
	import Button from "$lib/Components/Button.svelte";
    import type { CANDIDATES_TB } from "$lib/types";
	import { scale } from "svelte/transition";

    export let candidate: CANDIDATES_TB;
</script>

<div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000b5] p-2">
    <div class="mx-auto sm:max-w-xl bg-slate-500 dark:bg-black min-h-[20vh] mt-[10vh] shadow-sm text-white  shadow-white p-4 rounded-xl" transition:scale>
        <div class="whitespace-normal flex flex-col gap-4">
            <h1 class="text-center font-bold">Candidate Details</h1>
            <h1>Candidate Name: {candidate.name}</h1>
            <h1>Running Position: {candidate.position}</h1>
            <h1>Organization: {candidate.organization}</h1>
            
            <div class="break-words">
                <h1>Agenda/Platform/Objectives:</h1>
                <p>{candidate.agenda}</p>
            </div>

            <div class="flex gap-2">
                <Button style="w-full bg-green-500 p-2 text-white rounded-xl" name="Back" on:click={() => $candidateComparison.showDetails = 0.1} />
            </div>
        </div>
    </div>
</div>


