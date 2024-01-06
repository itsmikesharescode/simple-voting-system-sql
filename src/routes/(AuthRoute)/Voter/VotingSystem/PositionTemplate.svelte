<script lang="ts">
	import { votersCandidatesArray } from "$lib";
import type { POSITION_TB } from "$lib/types";
	import { filter } from "@skeletonlabs/skeleton";
	import Candidates from "./Candidates.svelte";

    export let position: POSITION_TB;

    const {id,description, max_votes, created_at} = position;

</script>

<div class=" border-slate-500 dark:border-pink-500 ">
    <div class="flex flex-col gap-1 justify-center items-center">
        <h3 class="h3">{description}</h3>
        <p class="text-xs font-bold">You have to vote up to {max_votes} for this position</p>
    </div>
    
    <div class=" flex flex-col gap-2 max-h-[55vh] overflow-auto p-2">

        <div class="overflow-x-auto ">

            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            
                <div class="shadow overflow-hidden border-b border-blue-200">
                    
                    <table class="min-w-full divide-y divide-gray-200">

                        <thead class="bg-white dark:text-pink-500 dark:bg-black">

                            <tr>
                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">CANDIDATE&#160;NAME</h1>
                                </th>
                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">TOTAL&#160;VOTES</h1>
                                </th>

                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">DATE&#160;CREATED</h1>
                                </th>

                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">OPTIONS</h1>
                                </th>
                            </tr>

                        </thead>

                        <tbody class="bg-opacity-50 divide-y divide-gray-200 bg-white dark:bg-[#00000050]">                           
                            
                            {#each $votersCandidatesArray?.filter(item => item.position_id === id)?? [] as candidate }
                                <Candidates {candidate} />
                            {/each}
                                                               
                            <!-- More rows... -->

                        </tbody>

                    </table>
                </div>
        
            </div>
        </div> 
        
    </div>
</div>