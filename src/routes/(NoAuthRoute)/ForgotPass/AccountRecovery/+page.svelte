<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import Button from "$lib/Components/Button.svelte";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
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
    };

    let loader = false;

    interface UpdateErrorTypes {
        newPassword: string[]
    }

    let inputErrors: UpdateErrorTypes | null = null;

    type UpdatePasswordNews = {
        status: number
        type: string
        data: {
            msg: string
            errors: UpdateErrorTypes
        }
    }

    const updatePasswordNews: SubmitFunction = async () =>
    {
        loader = true;
        return async ({result, update}) =>
        {
            const {status, data: {msg, errors}} = result as UpdatePasswordNews;

            switch (status) {
                case 200:
                    createToast(msg, false);
                    goto("/Login?Success-Password-Updated");
                    loader = false;
                    update();
                    break;

                case 402:
                    createToast(msg, true);
                    loader = false;
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
            };



        };
    };


</script>

<div class="min-h-screen flex flex-col gap-10 justify-center items-center" in:scale>

    <form method="POST" action="?/updatePassword"  enctype="multipart/form-data" use:enhance={updatePasswordNews} class="mx-auto w-[300px] sm:w-[400px] flex flex-col gap-2">

        <h1 class="font-bold h1 text-center">Update Password</h1>
        <small class="opacity-50 font-bold text-center">Recover Password to ICCT VOTING SYSTEM</small>

        <div class="flex flex-col break-words">
            <p class="text-xs text-center">Avoid reloading this page or you will begin from start again. <br> <b class="text-green-500"></b></p>
        </div>

        <label class="">
            <h1>New Password:</h1>
            <input name="newPassword" type="password" class="input rounded-xl" />
            {#each inputErrors?.newPassword ?? [] as err }
                <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label class="">
            <h1>Confirm New Password:</h1>
            <input name="confirmNewPassword" type="password" class="input rounded-xl" />
            
        </label>

        <Button name="Update" {loader} loader_name="Updating." />

    </form>

    

</div>