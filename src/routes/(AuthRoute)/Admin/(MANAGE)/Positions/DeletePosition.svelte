<script lang="ts">
	import { enhance } from "$app/forms";
	import { adminPositionsArray, positionArray, positionComparison, sessionStore } from "$lib";
	import Button from "$lib/Components/Button.svelte";
	import type { POSITION_TB } from "$lib/types";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { Session } from "@supabase/supabase-js";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { scale } from "svelte/transition";

    export let position: POSITION_TB;
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

    interface DeletePositionTypes {
        targetId: string[]
        inputCompar: string[]
    }

    interface UpdatePositionTypes {
        description: string[]
        maxVotes: string[]
    }

    let deleteInputErrors: DeletePositionTypes | null = null;
    let updateInputErrors: UpdatePositionTypes | null = null;

    type DeletePositionNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            positions: POSITION_TB[]
            errors: DeletePositionTypes
        }
    }

    type UpdatePositionNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            positions: POSITION_TB[]
            errors: UpdatePositionTypes
        }
    }

    const deletePositionNews: SubmitFunction = async () =>
    {
        buttonObj.deleteLoader = true;

        return async ({ result, update }) =>
        {
            
            const {status, data: {msg, session, positions, errors}} = result as DeletePositionNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminPositionsArray.set(positions);
                    createToast(msg, false);
                    buttonObj.deleteLoader = false;
                    $positionComparison.deleteComparison = 0.1;
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

    const updatePositionNews: SubmitFunction = async () =>
    {
        buttonObj.updateLoader = true;

        return async ({result, update}) =>
        {
            const {status, data:{msg, session, positions, errors}} = result as UpdatePositionNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminPositionsArray.set(positions);
                    createToast(msg, false);
                    $positionComparison.updateComparison = 0.1;
                    buttonObj.updateLoader = false;
                    update();
                    break;

                case 402:
                    if(msg === `duplicate key value violates unique constraint "position_tb_description_key"`){
                        createToast("Description already exist", true);
                        buttonObj.updateLoader = false;
                        update();
                        break;

                    }else{
                        createToast(msg, true);
                        buttonObj.updateLoader = false;
                        update();
                        break;
                    }
                    
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
{#if $positionComparison.deleteComparison === index }
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

        <form method="POST" action="?/deletePost" enctype="multipart/form-data" use:enhance={deletePositionNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] dark:shadow-lg dark:shadow-pink-500 dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[20vh]" transition:scale>
            
            <h1 class="text-center font-bold">Confirm Deletion?</h1>
            <small class="text-center">To delete this position you must type this in the input field</small>
            <small class="text-center font-bold text-red-900">I agree, this position should be deleted</small>
            
            <input name="inputCompar" type="text" class="input text-slate-500" placeholder="Enter the word"/>
            {#each deleteInputErrors?.inputCompar ?? [] as error}
                <p class="text-red-900 font-bold text-xs">{error}</p>
            {/each}
                
            

            <input name="position" type="text" class="hidden" value={JSON.stringify(position)} />

            <div class="flex gap-2">

                <Button type="button" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $positionComparison.deleteComparison = 0.1 } />

                <Button style="w-full bg-red-500 p-2 text-white rounded-xl" name="Delete" loader={buttonObj.deleteLoader} loader_name="Deleting." />

            </div>

        </form>
        
    </div>
{/if}

<!--Update warning-->
{#if $positionComparison.updateComparison === index }
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

        <form method="POST" action="?/updatePost" enctype="multipart/form-data" use:enhance={updatePositionNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] dark:shadow-lg dark:shadow-pink-500 dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[20vh]" transition:scale>
            
            <h1 class="text-center font-bold">Update this position?</h1>
            <small class="text-center font-bold">You are updating position of <b class="underline">{position.description}</b></small>
            
            <label>
                <p>Description:</p>
                <input title="Enter the description. Example President." name="description" type="text" class="input text-slate-500" placeholder="Enter description"/>
                {#each updateInputErrors?.description ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>

            <label>
                <p>Max Votes:</p>
                <input title="Enter max votes. Example 1 for president, 8 for senators." name="maxVotes" type="number" class="input text-slate-500" placeholder="Enter max votes"/>
                {#each updateInputErrors?.maxVotes ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>

            <input name="targetId" type="text" class="hidden" value={position.id} />
                

            <div class="flex gap-2">

                <Button type="button" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $positionComparison.updateComparison = 0.1 } />

                <Button style="w-full bg-green-500 p-2 text-white rounded-xl" name="Update" loader={buttonObj.updateLoader} loader_name="Updating." />

            </div>

        </form>
        
    </div>
{/if}

<div class="flex gap-2">
    <Button style="w-full bg-red-500 p-2 text-white rounded-xl" name="Delete" on:click={ () => $positionComparison.deleteComparison = index } />
    <Button style="w-full bg-green-500 p-2 text-white rounded-xl" name="Edit" on:click={ () => $positionComparison.updateComparison = index } />
</div>