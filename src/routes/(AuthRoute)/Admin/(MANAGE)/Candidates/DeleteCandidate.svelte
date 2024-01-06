<script lang="ts">
	import { enhance } from "$app/forms";
	import { adminCandidatesArray, candidateComparison, candidatesArray, sessionStore} from "$lib";
	import Button from "$lib/Components/Button.svelte";
	import type { CANDIDATES_TB, POSITION_TB } from "$lib/types";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { Session } from "@supabase/supabase-js";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { scale } from "svelte/transition";

    export let candidate: CANDIDATES_TB;
    export let positions: POSITION_TB[];
    export let index: number;

    const toastStore = getToastStore();

    const createToast = (msg: string, error: boolean) =>
    {
        const t: ToastSettings = {
            message: `${msg}`,
            background: `text-white ${error ? "bg-red-500" : "bg-green-500"}`,
        };
        toastStore.trigger(t);
    }

    const buttonObj = {
        
        deleteLoader: false,
        updateLoader: false,

    }

    interface DeleteCandidateTypes {
        targetId: string[]
        inputCompar: string[]
    }

    interface UpdateCandidateTypes {
        positions: string[]
        candidateName: string[]
        organization: string[]
        agenda: string[]
    }


    let deleteInputErrors: DeleteCandidateTypes | null = null;
    let updateInputErrors: UpdateCandidateTypes | null = null;

    type DeleteCandidateNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            candidates: CANDIDATES_TB[]
            errors: DeleteCandidateTypes
        }
    }

    type UpdateCandidateNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            candidates: CANDIDATES_TB[]
            errors: UpdateCandidateTypes
        }
    }

    const deleteCandidateNews: SubmitFunction = async () =>
    {
        buttonObj.deleteLoader = true;

        return async ({result, update}) =>
        {
            const {status, data: {msg, session, candidates, errors}} = result as DeleteCandidateNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminCandidatesArray.set(candidates);
                    $candidateComparison.showDelete = 0.1;
                    createToast(msg, false);
                    buttonObj.deleteLoader = false;
                    update();
                    break;

                case 402:
                    createToast(msg, true);
                    buttonObj.deleteLoader = false;
                    update();
                    break;

                case 403:
                    deleteInputErrors = errors;
                    buttonObj.deleteLoader = false;
                    update();
                    break;

                default:
                    update();
                    break;
            };

        };
        
    };

    const updateCandidateNews: SubmitFunction = async () =>
    {
        buttonObj.updateLoader = true;

        return async ({result, update}) =>
        {
            const {status, data: {msg, session, candidates, errors}} = result as UpdateCandidateNews;
            
            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminCandidatesArray.set(candidates);
                    createToast(msg, false);
                    buttonObj.deleteLoader = false;
                    $candidateComparison.showUpdate = 0.1;
                    update();
                    break;

                case 402:
                    createToast(msg, true);
                    buttonObj.deleteLoader = false;
                    update();
                    break;

                case 403:
                    updateInputErrors = errors;
                    buttonObj.updateLoader = false;
                    update();
                    break;

                default:
                    update();
                    break;
            };

        };
    };


</script>
<!--Delete warning-->
{#if $candidateComparison.showDelete === index }
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

        <form method="POST" action="?/deleteCandidate" enctype="multipart/form-data" use:enhance={deleteCandidateNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] dark:shadow-lg dark:shadow-pink-500 dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[20vh]" transition:scale>
            
            <h1 class="text-center font-bold">Confirm Deletion?</h1>
            <small class="text-center">To delete this candidate you must type this in the input field</small>
            <small class="text-center font-bold text-red-900">I agree, this candidate should be deleted</small>
            
            <input name="inputCompar" type="text" class="input text-slate-500" placeholder="Enter the word"/>

            {#each deleteInputErrors?.inputCompar ?? [] as error}
                <p class="text-red-900 font-bold text-xs">{error}</p>
            {/each}
                
            <input name="candidate" type="text" class="hidden" value={JSON.stringify(candidate)} />

            <div class="flex gap-2">

                <Button title="Click, to cancel deleting candidate {candidate.name}" type="button" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $candidateComparison.showDelete = 0.1 } />

                <Button title="Click, to delete candidate {candidate.name}" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Delete" loader={buttonObj.deleteLoader} loader_name="Deleting." />

            </div>

        </form>
        
    </div>
{/if}

<!--Update warning-->
{#if $candidateComparison.showUpdate === index }
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

        <form method="POST" action="?/updateCandidate" enctype="multipart/form-data" use:enhance={updateCandidateNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] dark:shadow-lg dark:shadow-pink-500 dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[20vh]" transition:scale>
            
            <h1 class="font-bold text-center">Update Candidate -> {candidate.name}</h1>
            
            <input name="candidate" type="text" value={JSON.stringify(candidate)} class="hidden" />

        <div class="flex flex-col gap-2 text-black dark:text-white">
            <label>
                <p>Positions:</p>
                <select name="position" class="select text-black dark:text-white">
    
                    {#each positions ?? [] as position }
                        <option value={JSON.stringify(position)} >{position.description}</option>
                        
                    {/each}
    
                </select>
                {#each updateInputErrors?.positions ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>
    
            <label>
                <p>Candidate Name:</p>
                <input name="candidateName" type="text" class="input" />
                {#each updateInputErrors?.candidateName ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>
    
            <label>
                <p>Organization:</p>
                <input name="organization" type="text" class="input" />
                {#each updateInputErrors?.organization ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>
    
            <label>
                <p>Agenda:</p>
                <textarea name="agenda" class="textarea"></textarea>
                {#each updateInputErrors?.agenda ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>
        </div>

                

            <div class="flex gap-2">

                <Button title="Click, to cancel updating candidate {candidate.name}" type="button" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $candidateComparison.showUpdate = 0.1 } />

                <Button title="Click, to update candidate {candidate.name}" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Update" loader={buttonObj.updateLoader} loader_name="Updating." />

            </div>

        </form>
        
    </div>
{/if}

<div class="flex gap-2">
    <Button title="Click, to delete this candidate." style="w-full bg-red-500 p-2 text-white rounded-xl" name="Delete" on:click={ () => $candidateComparison.showDelete = index } />
    <Button title="Click, to update this candidate." style="w-full bg-green-500 p-2 text-white rounded-xl" name="Edit" on:click={ () => $candidateComparison.showUpdate = index } />
</div>