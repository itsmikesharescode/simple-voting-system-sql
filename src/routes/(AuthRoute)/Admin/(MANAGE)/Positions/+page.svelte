<script lang="ts">
	import { onMount } from "svelte";
	import { adminCandidatesArray, adminPositionsArray, adminVotedCandidatesArray, navigationStore, positionArray, positionComparison, sessionStore, showCreatePositions } from "$lib";
    import searchIcon from "$lib/Images/search.svg";
	import ShowCreatePositions from "./ShowCreatePositions.svelte";
	import DeletePosition from "./DeletePosition.svelte";
	import type { PageServerData } from "./$types";
	
    export let data: PageServerData
    
    onMount( async () =>
    {
        $navigationStore.activeItem = "/Admin/Positions";
        $navigationStore.defaultNav = $navigationStore.adminNav;
        const {status, msg, positions, session} = data;
        
        if(session) sessionStore.set(session), adminPositionsArray.set(positions);

    });

</script>

{#if $showCreatePositions}
    <ShowCreatePositions />
{/if}

<div class="mt-[10vh] mx-auto sm:max-w-[80%] dark:text-pink-500 ">
    <div class="flex flex-col gap-2 sm:items-center sm:flex-row">
        <h1 class="font-bold h1 w-full ">Positions</h1>
       
        <div class="flex gap-2 justify-center">
            <button title="Click, to create position" class="bg-green-500 px-4 py-2 text-white flex items-center gap-2 rounded-xl justify-center transition-all active:bg-opacity-50"
            on:click={ () => showCreatePositions.set(true) }
            >
                Create&nbsp;Position
            </button>
            <button class="bg-pink-500 px-4 py-2 text-white flex items-center gap-2 rounded-xl justify-center">
                <img loading="lazy" src={searchIcon} alt="" class="w-5" />
                Search
            </button>
        </div>
        
    </div>

    <div class="mt-5 flex flex-col gap-2 max-h-[55vh] overflow-auto p-2">
        <div class="flex flex-col ">
            {#if $adminPositionsArray?.length}
            <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">

                <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                
                    <div class="shadow overflow-hidden border-b border-blue-200">
                    
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-slate-500 text-white dark:text-pink-500 dark:bg-black">

                                <tr>
                                    <th class="px-6 py-3 text-left ">
                                        <h1 class="font-bold">POSITION</h1>
                                    </th>
                                    <th class="px-6 py-3 text-left ">
                                        <h1 class="font-bold">MAXIMUM&#160;VOTES</h1>
                                    </th>

                                    <th class="px-6 py-3 text-left ">
                                        <h1 class="font-bold">DATE&#160;CREATED</h1>
                                    </th>

                                    <th class="px-6 py-3 text-left ">
                                        <h1 class="font-bold">OPTIONS</h1>
                                    </th>
                                </tr>

                            </thead>

                            <tbody class=" divide-y divide-gray-200">

                                {#each $adminPositionsArray ?? [] as position, index }
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            {position.description}
                                        </td>

                                        <td class="px-6 py-4 whitespace-nowrap">
                                            {position.max_votes}
                                        </td>

                                        <td class="px-6 py-4 whitespace-nowrap">
                                            {new Date(position.created_at)}
                                        </td>
                    
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <DeletePosition {index} {position} />
                                        </td>

                                    </tr>
                                {/each}
                                <!-- More rows... -->
                            </tbody>

                        </table>
                    </div>
            
                </div>
            </div>
            {:else}
                <h1 class="text-center mt-[5vh] h4">There is no position posted... Post one now!</h1>
            {/if}
        </div>
    </div>
</div>