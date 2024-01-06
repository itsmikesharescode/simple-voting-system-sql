<script lang="ts">
	import { enhance } from "$app/forms";
	import { adminPositionsArray, positionArray, sessionStore, showCreatePositions } from "$lib";
	import Button from "$lib/Components/Button.svelte";
	import type { POSITION_TB } from "$lib/types";
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

    interface CREATE_POSITION_ERRORS_TYPES {
        description: string[]
        maxVotes: string[]
    }

    let loader = false;
    let inputErrors: CREATE_POSITION_ERRORS_TYPES | null = null;

    type CreatePositionNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            positions: POSITION_TB[]
            errors: CREATE_POSITION_ERRORS_TYPES
        }
    }

    const createPositionNews: SubmitFunction = async () =>
    {
        loader = true;
        return async ({result, update}) =>
        {

            const {status, data: {msg, session, positions, errors}} = result as CreatePositionNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminPositionsArray.set(positions);
                    createToast(msg, false);
                    loader = false;
                    showCreatePositions.set(false);
                    update();
                    break;

                case 402:
                    if(msg === `duplicate key value violates unique constraint "position_tb_description_key"`){
                        createToast("Description already exist", true);
                        loader = false;
                        update();
                    }else{
                        createToast(msg, true);
                        loader = false;
                        update();
                    }
                    update();
                    break;

                case 403:
                    inputErrors = errors;
                    loader = false;
                    update();
                    break;

                default:
                    update();
                    break;
            }


        };
    };

</script>

<div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000cb] dark:text-pink-500 p-2">
    <form method="POST" action="?/createPost" use:enhance={createPositionNews} enctype="multipart/form-data" class="mx-auto sm:max-w-xl p-4  mt-[20vh] dark:bg-[#000000cb] bg-slate-500 rounded-xl flex flex-col gap-4" transition:scale>
        <h1 class="h3 text-center">Create Position</h1>
      
        <label>
            <p>Description:</p>
            <input name="description" type="text" class="input" />
            {#each inputErrors?.description ?? [] as err }
                <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label>
            <p>Maximum Votes:</p>
            <input name="maxVotes" type="number" class="input" />
            {#each inputErrors?.maxVotes ?? [] as err }
                <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <div class="flex gap-2 items-center text-white">
            <Button title="Click, to cancel creating position." type="button" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => showCreatePositions.set(false) }/>
            <Button title="Click, to create this position." name="Create" {loader} loader_name="Creating." />
        </div>

    </form>
</div>