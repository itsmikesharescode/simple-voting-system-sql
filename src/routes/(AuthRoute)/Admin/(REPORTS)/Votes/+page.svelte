<script lang="ts">
	import { onMount } from "svelte";
	import { adminCandidatesArray, adminPositionsArray, adminVotedCandidatesArray, navigationStore, sessionStore } from "$lib";
	import type { PageServerData } from "./$types";
	import VotesPositionTemplate from "./VotesPositionTemplate.svelte";
	import Button from "$lib/Components/Button.svelte";
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";
	import type { Session } from "@supabase/supabase-js";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import { scale } from "svelte/transition";

    const toastStore = getToastStore();

    const createToast = (msg: string, error: boolean) =>
    {
        const t: ToastSettings = {
            message: `${msg}`,
            background: `text-white ${error ? "bg-red-500" : "bg-green-500"}`,
        };
        toastStore.trigger(t);
    };

    export let data: PageServerData;
    
    onMount(  async() =>
    {
        $navigationStore.activeItem = "/Admin/Votes";

        if(data.positions){
            adminPositionsArray.set(data.positions);
            if(data.candidates){
                adminCandidatesArray.set(data.candidates);
                if(data.allVotedCandidates){
                    adminVotedCandidatesArray.set(data.allVotedCandidates);
                    sessionStore.set(data.session);
                    $navigationStore.defaultNav = $navigationStore.adminNav;
                };
            };
        };
        
    });

    const buttonObj = {
        refreshLoader: false,
        allResetLoader: false
    }

    type RefreshVotesNews = {
        status: number
        type: string
        data: {
            msg: string
            positions: POSITION_TB[]
            candidates: CANDIDATES_TB[]
            allVotedCandidates: VOTED_CANDIDATE_TB[]
            session: Session
        };
    };

    const refreshVotesNews: SubmitFunction = async () =>
    {
        buttonObj.refreshLoader = true;

        return async ({update, result}) =>
        {
            const {status, data: {msg, positions, candidates, allVotedCandidates, session}} = result as RefreshVotesNews;
            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminPositionsArray.set(positions);
                    adminCandidatesArray.set(candidates);
                    adminVotedCandidatesArray.set(allVotedCandidates);
                    createToast(msg, false);
                    buttonObj.refreshLoader = false;
                    update();
                    break;

                case 402:
                    createToast(msg, false);
                    buttonObj.refreshLoader = false;
                    update();
                    break;

                default:
                    update();
                    break;
            };

        };

    };

    let showAllVotesReset = false;

    interface AllVotesErrorType {
        inputCompar: string[]
    }

    type AllVotesResetNews = {
        status: number
        type: string
        data: {
            msg: string
            positions: POSITION_TB[]
            candidates: CANDIDATES_TB[]
            allVotedCandidates: VOTED_CANDIDATE_TB[]
            session: Session,
            errors: AllVotesErrorType
        };
    };

    let inputResetError: AllVotesErrorType | null = null;

    const allVotesResetNews: SubmitFunction = async () =>
    {
        buttonObj.allResetLoader = true;

        return async ({result, update}) => 
        {
            const {status, data: {msg, positions, candidates, allVotedCandidates, session, errors }} = result as AllVotesResetNews;
            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminPositionsArray.set(positions);
                    adminCandidatesArray.set(candidates);
                    adminVotedCandidatesArray.set(allVotedCandidates);
                    buttonObj.allResetLoader = false;
                    createToast(msg, false);
                    update();
                    showAllVotesReset = false;
                    break;

                case 402:
                    createToast(msg, true);
                    buttonObj.allResetLoader = false;
                    break;

                case 403:
                    inputResetError = errors;
                    buttonObj.allResetLoader = false;
                    update();
                    break;

                default:
                    update();
                    break;
            };
            
        };
    };

</script>

{#if showAllVotesReset}
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2 flex flex-col justify-center">

        <form method="POST" action="?/allVotesResets" enctype="multipart/form-data" use:enhance={allVotesResetNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] shadow-sm shadow-white dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto" transition:scale>
            
            <div class="whitespace-normal">
                <h1 class="text-center font-bold">Are you sure you want to reset all of the votes?</h1>
                
                <label>
                    <p class="text-center">Enter <b class="text-yellow-400">Yes, reset all votes.</b> in the field</p>
                    <input name="inputCompar" type="text" class="input text-black dark:text-pink-500" />
                    {#each inputResetError?.inputCompar ?? [] as err }
                        <p class="text-yellow-300 font-bold text-xs">{err}</p>
                    {/each}
                </label>

            </div>
            
           
            <input name="encryptedCandidate" type="hidden" class="hidden"  />
            
            
            <div class="flex gap-2">

                <Button title="Click, to cancel." type="button" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Cancel" 
                on:click={() => showAllVotesReset = false}
                />

                <Button title="Click to confirm your decision to reset all votes back to 0. " style="w-full bg-red-500 p-2 text-white rounded-xl" 
                name="Confirm"  
                loader={buttonObj.allResetLoader}
                loader_name="Removing."
                />

            </div>

        </form>
        
    </div>
{/if}

<div class="mt-[10vh] mx-auto sm:max-w-[80%] dark:text-pink-500 ">
    <div class="flex flex-col gap-2 sm:items-center sm:flex-row">
        <h1 class="font-bold h1 w-full text-center sm:text-left ">Vote Counts</h1>
        <div class="flex gap-2">

            <form method="POST" action="?/refreshVotes" use:enhance={refreshVotesNews}>
                <Button title="Click, to refresh and get the latest votes." style="w-full bg-green-500 p-2 text-white rounded-xl" name="RefreshVotes" loader={buttonObj.refreshLoader} loader_name="Refreshing." />
            </form>

            <Button title="Click, to reset all votes to 0." style="w-full bg-green-500 p-2 text-white rounded-xl" name="ResetAll" on:click={() => showAllVotesReset = true} />

        </div>
    </div>

    <div class="flex flex-col gap-2 mt-[5vh]">

        <!--Fetch all candidates here-->
        <div class="flex flex-col gap-2 mt-[5vh]">

            <!--Fetch all candidates here-->
            {#if $adminPositionsArray?.length}
                {#each $adminPositionsArray ?? [] as position }
                    <VotesPositionTemplate {position}/>
                {/each}
            {:else}
                <p>There is no position listed atm.</p>
            {/if}
          
        </div>
      
    </div>
</div>
