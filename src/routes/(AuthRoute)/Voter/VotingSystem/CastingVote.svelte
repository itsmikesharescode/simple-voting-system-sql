<script lang="ts">
	import { enhance } from "$app/forms";
	import { sessionStore, votersCandidatesArray, votersCandidatesComparison, votersPositionsArray, votersVotedCandidates } from "$lib";
	import Button from "$lib/Components/Button.svelte";
	import { encryptMessage } from "$lib/Helpers/encryption";
	import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { Session } from "@supabase/supabase-js";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { onMount } from "svelte";
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

    const loaderObj = {
        voteLoader: false,
        undoVoteLoader: false,

    };

    type CastingVoteNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            positions: POSITION_TB []
            candidates: CANDIDATES_TB[]
            allVotedCandidates: VOTED_CANDIDATE_TB[]
           
        }
    };

    type UndoVoteCastNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            positions: POSITION_TB []
            candidates: CANDIDATES_TB[]
            allVotedCandidates: VOTED_CANDIDATE_TB[]
           
        }
    };

    const castingVoteNews: SubmitFunction = async () =>
    {
        loaderObj.voteLoader = true;

        return async ({update, result}) =>
        {
            const {status, data: { msg, session, positions, candidates, allVotedCandidates } } = result as CastingVoteNews;

            switch (status) {

                case 200:
                    sessionStore.set(session);
                    votersPositionsArray.set(positions);
                    votersCandidatesArray.set(candidates);
                    votersVotedCandidates.set(allVotedCandidates);

                    $votersCandidatesComparison.showVote = 0.1;
                    loaderObj.voteLoader = false;
                    createToast(msg, false);
                    update();
                    break;

                case 402:
                    loaderObj.voteLoader = false;
                    $votersCandidatesComparison.showVote = 0.1;
                    update();
                    createToast(msg, true);
                    break;
                    
                default:
                    break;
                    //hi youtube.com/@mikesharesCode
            }

            
        }
    };

    const undoVoteCastNews: SubmitFunction = async () =>
    {
        loaderObj.undoVoteLoader = true;

        return async ({update, result}) =>
        {
            const {status, data: { msg, session, positions, candidates, allVotedCandidates } } = result as UndoVoteCastNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    votersPositionsArray.set(positions);
                    votersCandidatesArray.set(candidates);
                    votersVotedCandidates.set(allVotedCandidates);
                    loaderObj.undoVoteLoader = false;
                    createToast(msg, false);
                    update();
                    break;

                case 402:
                    createToast(msg, true);
                    loaderObj.undoVoteLoader = false;
                    update();
                    break;

                default:

                    update();
                    break;
            };
        };
    };

  
    const candidateObject = encryptMessage(JSON.stringify(candidate));
    
    $: result = $votersVotedCandidates?.filter(item => item.vector_uid === $sessionStore?.user.id && item.candidate_id === candidate.id);

</script>

<!--Casting Vote Warning-->
{#if $votersCandidatesComparison.showVote === candidate.id}
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

        <form method="POST" action="?/castVote" enctype="multipart/form-data" use:enhance={castingVoteNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] shadow-sm shadow-white dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[20vh]" transition:scale>
            
            <div class="whitespace-normal">
                <h1 class="text-center font-bold">Are you sure you want to vote</h1>
                <p class="text-center">{candidate.name}</p>
            </div>
            
            <div class="p-2">
                <p>Agenda:</p>
                <p class="">{candidate.agenda}</p>
            </div>
            
            <input name="candidateObject" type="hidden" class="hidden" value={candidateObject}  />
            
            <div class="flex gap-2">

                <Button title="Click, to cancel." type="button" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $votersCandidatesComparison.showVote = 0.1 } />

                <Button title="Click to confirm your vote to {candidate.name}" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Confirm" loader={loaderObj.voteLoader}  loader_name="Voting." />

            </div>

        </form>
        
    </div>
{/if}

<!--Viewing Candidate Details-->
{#if $votersCandidatesComparison.showDetails === candidate.id}
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

        <div class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] shadow-sm shadow-white dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[20vh]" transition:scale>
            <h1 class="text-center font-bold">Details of --> {candidate.name}</h1>
            
            <p>Runing for {candidate.position}</p>
            <p>Name: {candidate.name}</p>
            <p>Organization: {candidate.organization}</p>
            <p>Agenda: {candidate.agenda}</p>

            <div class="flex gap-2">
                <Button title="Click, to back." type="button" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Back" on:click={ () => $votersCandidatesComparison.showDetails = 0.1 } />
            </div>

        </div>
        
    </div>
{/if}

<div class="flex gap-2">
    

        {#if result?.length}
            <form method="POST" action="?/undoVoteCast" enctype="multipart/form-data" use:enhance={undoVoteCastNews}>
                <input name="candidateObject" type="hidden" class="hidden" value={candidateObject}  />
                <Button title="Click, to cancel your vote for {candidate.name}" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" 
                loader={loaderObj.undoVoteLoader} loader_name="Canceling."/>
            </form>
        {:else}
            <Button title="Click, to vote {candidate.name}" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Vote"
            on:click={ () => $votersCandidatesComparison.showVote = candidate.id }
            />
        {/if}
        

    
    <Button title="Click, to view details of {candidate.name}" style="w-full bg-pink-500 p-2 text-white rounded-xl" name="Details" 
    on:click={ () => $votersCandidatesComparison.showDetails = candidate.id }
    />
</div>