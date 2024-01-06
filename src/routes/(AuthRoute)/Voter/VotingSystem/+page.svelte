<script lang="ts">
	import { sessionStore, showHistory, votedHistoryArray, votersCandidatesArray, votersPositionsArray, votersVotedCandidates } from "$lib";
    import Button from "$lib/Components/Button.svelte";
	
	import { onMount } from "svelte";
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { PageServerData } from "./$types";
	import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";
	import VoteHistory from "./VoteHistory.svelte";
	import type { Session } from "@supabase/supabase-js";
	import PositionTemplate from "./PositionTemplate.svelte";

    export let data: PageServerData;

    const toastStore = getToastStore();

    const createToast = (msg: string, error: boolean) =>
    {
        const t: ToastSettings = {
            message: `${msg}`,
            background: `text-white ${error ? "bg-red-500" : "bg-green-500"}`,
        };
        toastStore.trigger(t);
    }
    
    onMount( async () => {
        
        const { positions, candidates, allVotedCandidates, session } = data;
        
        if(session) sessionStore.set(session), votersPositionsArray.set(positions), votersCandidatesArray.set(candidates), votersVotedCandidates.set(allVotedCandidates)

    });

    type RefreshNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            positions: POSITION_TB []
            candidates: CANDIDATES_TB[]
            allVotedCandidates: VOTED_CANDIDATE_TB[]
        }
    }

    type ViewHistoryNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            voteHistory: {
                candidates_tb: {
                    name: string
                    position: string
                }
            }[]
        }
    }
    
    
    let refreshLoader = false;

    const refreshNews: SubmitFunction = async () =>
    {
        refreshLoader = true;
        return async ({update, result}) =>
        {
            const {data: { msg,session, positions, candidates, allVotedCandidates } } = result as RefreshNews;

            switch (result.status) {

                case 200:
                    sessionStore.set(session);
                    votersPositionsArray.set(positions);
                    votersCandidatesArray.set(candidates);
                    votersVotedCandidates.set(allVotedCandidates);
                    refreshLoader = false;
                    createToast(msg, false);
                    update();
                    break;

                case 402:
                    refreshLoader = false;
                    createToast(msg, true);
                    update();
                    break;
                     
                default:
                    update();
                    break;
            }

            
        }
    };

    let viewHistoryLoader = false;

    const viewHistoryNews: SubmitFunction = async () =>
    {
        viewHistoryLoader = true;

        return async ({update, result}) =>
        {
            const {status, data: {voteHistory, session, msg}} = result as ViewHistoryNews;

            switch (status) {
                case 200:
                    
                    votedHistoryArray.set(voteHistory);
                    showHistory.set(true);
                    viewHistoryLoader = false;
                    update();
                    break;
                    

                case 402:
                    createToast(msg, true);
                    viewHistoryLoader = false;
                    update();
                    break;

                default:
                    viewHistoryLoader = false;
                    update();
                    break;
            };
            
        };
    };
    

</script>


<div class="p-5">
    <p><a title="Click, to back to voter introduction." href="/Voter" class="underline text-blue-500 transition-all hover:text-red-500">Back to voter introduction.</a></p>
</div>

<div class="mt-[10vh] mx-auto sm:max-w-[80%] dark:text-pink-500 ">
    <div class="flex flex-col gap-2 sm:items-center sm:flex-row">
        <h1 class="font-bold h1 w-full text-center sm:text-left ">Voters System</h1>
       
        <div class="flex gap-2 justify-center">
            
            <form method="POST" action="?/refreshVotes" enctype="multipart/form-data" use:enhance={refreshNews}>

                <Button style="w-full bg-green-500 p-2 text-white rounded-xl" name="RefreshVotes" 
                loader={refreshLoader}
                loader_name="Refreshing!"
                />
            </form>

            {#if $showHistory}
                <VoteHistory />
            {/if}
            
            <form method="POST" action="?/viewHistory" enctype="multipart/form-data" use:enhance={viewHistoryNews} >

                <Button title="Click, to view your vote history." style="w-full bg-green-500 p-2 text-white rounded-xl" name="VotedCandidates" loader={viewHistoryLoader} loader_name="Checking."/>
                 
            </form>

            
        </div>
        
    </div>

    <div class="flex flex-col gap-2 mt-[5vh]">

        <!--Fetch all candidates here-->
        {#if $votersPositionsArray?.length}
            {#each $votersPositionsArray ?? [] as position }
                <PositionTemplate {position} />
            {/each}
        {:else}
            <p>There is no position listed atm.</p>
        {/if}
      
    </div>
</div>
