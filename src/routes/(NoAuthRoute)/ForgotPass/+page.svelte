<script lang="ts">
	import { enhance } from "$app/forms";
    import Button from "$lib/Components/Button.svelte";
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
    };

    interface LOGIN_ERROR_TYPES {
        email: string[]
    };

    let inputErrors: LOGIN_ERROR_TYPES | null = null;
    let loader = false;
    let email = "";

    type ReqPasswordResetNews = {
        status: number
        type: string
        data: {
            msg: string
            errors: LOGIN_ERROR_TYPES
        };
    };

    const reqPasswordResetNews: SubmitFunction = async () =>
    {
        loader = true;

        return async ({update, result}) =>
        {
            const {status, data: {msg, errors}} = result as ReqPasswordResetNews;

            switch (status) {
                case 200:
                    createToast(msg, false);
                    loader = false;
                    email = "";
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

    <form method="POST" action="?/reqPasswordReset" use:enhance={reqPasswordResetNews} enctype="multipart/form-data" class="mx-auto w-[300px] sm:w-[400px] flex flex-col gap-2">

        <h1 class="font-bold h1 text-center">Forgot Password</h1>
        <small class="opacity-50 font-bold text-center">Recover Password to ICCT VOTING SYSTEM</small>

        <div class="flex flex-col break-words">
            <p class="text-xs text-center">An email containing a password resit link will be sent to your email <br> <b class="text-green-500">{email}</b></p>
        </div>

        <label class="">
            <h1>Email:</h1>
            <input name="email" type="email" class="input rounded-xl" bind:value={email} />
            {#each inputErrors?.email ?? [] as err }
                <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <Button title="Click, to send password reset link into your email. {email ? "->" : ""} {email} " name="Send Reset Link" {loader} loader_name="Sending." />

    </form>

    <div class="">
        <p>Already recovered your account? <a title="Click, to navigate back to login." href="/Login" class="text-blue-500 underline transiton-all hover:text-pink-500">Sign in</a> here.</p>
    </div>

    <p><a title="Click, to navigate back to landing page." href="/" class="text-blue-500 underline">Back to landing page?</a></p>

</div>