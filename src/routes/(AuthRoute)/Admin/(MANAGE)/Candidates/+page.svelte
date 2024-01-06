<script lang="ts">
	import { onMount } from "svelte";
	import type { PageServerData } from "./$types";
	import { adminCandidatesArray, adminPositionsArray, candidateComparison, candidatesArray, navigationStore, sessionStore, showCreateCandidate } from "$lib";
    import searchIcon from "$lib/Images/search.svg";
	import CreateCandidate from "./CreateCandidate.svelte";
	import ShowCandidateDetail from "./ShowCandidateDetail.svelte";
	import DeleteCandidate from "./DeleteCandidate.svelte";

    export let data: PageServerData;
   
    onMount( async () =>
    {
        $navigationStore.activeItem = "/Admin/Candidates";
        $navigationStore.defaultNav = $navigationStore.adminNav;
        
        const {candidates, positions, session} = data;

        if(session) sessionStore.set(session), adminCandidatesArray.set(candidates), adminPositionsArray.set(positions);

    });

</script>


{#if data.positions}
    <CreateCandidate positions={data.positions} />
{/if}

<div class="mt-[10vh] mx-auto sm:max-w-[80%] dark:text-pink-500 ">
    <div class="flex flex-col gap-2 sm:items-center sm:flex-row">
       
        <h1 class="font-bold h1 w-full ">Candidates</h1>
    
        <div class="flex gap-2 justify-center">
            
            {#if data.positions?.length}
                <button title="Click, to create position" class="bg-green-500 px-4 py-2 text-white flex items-center gap-2 rounded-xl justify-center transition-all active:bg-opacity-50"
                on:click={ () => $showCreateCandidate = true } 
                >
                    Create&nbsp;Candidates
                </button>
            {/if}

            <button class="bg-pink-500 px-4 py-2 text-white flex items-center gap-2 rounded-xl justify-center">
                <img loading="lazy" src={searchIcon} alt="" class="w-5" />
                Search
            </button>
        </div>
        
    </div>

    <div class="mt-5 flex flex-col gap-2 max-h-[55vh] overflow-auto p-2">
        <div class="flex flex-col ">
            {#if $adminCandidatesArray?.length}
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
                                    <h1 class="font-bold">CANDIDATE&#160;NAME</h1>
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

                            {#each $adminCandidatesArray ?? [] as candidate, index }
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        {candidate.position}
                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap">

                                        {#if $candidateComparison.showDetails === index}
                                            <ShowCandidateDetail {candidate} />
                                        {/if}

                                        <button title="Click, to view more details about {candidate.name}" 
                                        class="underline transition-all active:scale-95"
                                        on:click={ () => $candidateComparison.showDetails = index}
                                        >
                                            {candidate.name}
                                        </button>
                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap">
                                        {new Date(candidate.created_at)}
                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap">
                                        
                                        {#if data.positions}
                                            <DeleteCandidate {candidate} positions={data.positions} {index} />
                                        {/if}
         
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
                {#if data.positions?.length}
                    <h1 class="text-center mt-[5vh] h4">There is no candidates created... create one now!</h1>
                {:else}
                    <h1 class="text-center mt-[5vh] h4">We detect that there is no position created.</h1>
                    <p class="text-center"><a title="Click, to navigate to positions tab" href="/Admin/Positions" class="text-blue-500 underline">Create one here.</a></p>
                {/if}
            {/if}
        </div>
    </div>
</div>
