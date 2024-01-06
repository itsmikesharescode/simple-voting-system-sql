<script lang="ts">
	import { enhance } from "$app/forms";
	import { adminCandidatesArray, adminPositionsArray, adminVotedCandidatesArray, sessionStore } from "$lib";
	import Button from "$lib/Components/Button.svelte";
	import { encryptMessage } from "$lib/Helpers/encryption";
	import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { Session } from "@supabase/supabase-js";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { scale } from "svelte/transition";

    const toastStore = getToastStore();

    const createToast = (msg: string, error: boolean) =>
    {
        const t: ToastSettings = {
            message: `${msg}`,
            background: `text-white ${error ? "bg-red-500" : "bg-green-500"}`,
        };
        toastStore.trigger(t);
    }
    
    export let candidate: CANDIDATES_TB; 

    let showConfirmReset = false;

    const encryptedCandidate = encryptMessage(JSON.stringify(candidate));

    type ResetNews = {
        status: number
        type: string
        data: {
            msg: string
            positions: POSITION_TB[]
            candidates: CANDIDATES_TB[]
            allVotedCandidates: VOTED_CANDIDATE_TB[]
            session: Session
        }
    };

    let loader = false;

    const resetNews: SubmitFunction = async () =>
    {
        loader = true;

        return async ({result, update}) =>
        {
            const {status, data: {msg, positions, candidates, allVotedCandidates, session}} = result as ResetNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminPositionsArray.set(positions);
                    adminCandidatesArray.set(candidates);
                    adminVotedCandidatesArray.set(allVotedCandidates);
                    createToast(msg, false);
                    loader = false;
                    showConfirmReset = false;
                    update();
                    break;

                case 402:
                    createToast(msg, true);
                    loader = false;
                    update();
                    break;

                default:
                    update();
                    break;
            };

        };
    };

</script>

{#if showConfirmReset}
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2 flex flex-col justify-center">

        <form method="POST" action="?/resetVotes" enctype="multipart/form-data" use:enhance={resetNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] shadow-sm shadow-white dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto" transition:scale>
            
            <div class="whitespace-normal">
                <h1 class="text-center font-bold">Are you sure you want to reset vote counts for</h1>
                <p class="text-center">{candidate.name}</p>
            </div>
            
            <input name="encryptedCandidate" type="hidden" class="hidden" value={encryptedCandidate}  />
            
            <div class="flex gap-2">

                <Button title="Click, to cancel." type="button" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" 
                on:click={ () => showConfirmReset = false }
                />

                <Button title="Click to confirm your vote counr reset to {candidate.name}" style="w-full bg-green-500 p-2 text-white rounded-xl" 
                name="Confirm"  
                {loader}
                loader_name="Removing."
                />

            </div>

        </form>
        
    </div>
{/if}

<div class="flex gap-2">
    <Button title="Click, to reset the vote counts of {candidate.name} " style="w-full bg-red-500 p-2 text-white rounded-xl" name="Reset"
    on:click={ () => showConfirmReset = true }
    />
</div>