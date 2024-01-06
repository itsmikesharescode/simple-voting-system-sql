<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
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
    }

    interface REGISTER_ERROR_TYPES {
        fName: string[]
        mName: string[]
        lName: string[]
        email: string[]
        password: string[]
    }

    let inputErrors: REGISTER_ERROR_TYPES | null = null;
    let loader = false;

    type SignUpNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            errors: REGISTER_ERROR_TYPES
        }
    }

    const singUpNews: SubmitFunction = async () =>
    {
     
        loader = true;

        return async ({update, result}) =>
        {
            const {status, data: {msg, errors, session}} = result as SignUpNews;

            switch (status) {
                case 200:
                    createToast(msg, false);
                    loader = false;

                    if(session.user.role === "authenticated") goto("/Voter");
                    else if(session.user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8") goto("/Admin/Dashboard");
                    break;

                case 402:
                    createToast(msg, true);
                    loader = false;
                    break;
                case 403:
                    inputErrors = errors;
                    loader = false;
                    break;

                default:
                    break;
            };

            update();
        }
    }

</script>

<div class="min-h-screen flex flex-col gap-10 justify-center items-center" in:scale>

    <form method="POST" action="?/signUp" use:enhance={singUpNews} enctype="multipart/form-data" class="mx-auto sm:max-w-[400px] flex flex-col gap-2">
        <h1 class="font-bold h1 text-center">Sign up</h1>
        <small class="opacity-50 font-bold text-center">Register account to ICCT VOTING SYSTEM</small>

        <label class="w-[300px] sm:w-[400px]">
            <h1>First Name:</h1>
            <input name="fName" type="text" class="input rounded-xl" />
            {#each inputErrors?.fName?? [] as err }
            <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label class="w-[300px] sm:w-[400px]">
            <h1>Middle Name:</h1>
            <input name="mName" type="text" class="input rounded-xl" />
            {#each inputErrors?.mName?? [] as err }
            <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label class="w-[300px] sm:w-[400px]">
            <h1>Last Name:</h1>
            <input name="lName" type="text" class="input rounded-xl" />
            {#each inputErrors?.lName?? [] as err }
            <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label class="w-[300px] sm:w-[400px]">
            <h1>Email:</h1>
            <input name="email" type="email" class="input rounded-xl" />
            {#each inputErrors?.email?? [] as err }
            <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label class="w-[300px] sm:w-[400px]">
            <h1>Password:</h1>
            <input name="password" type="password" class="input rounded-xl" />
            {#each inputErrors?.password?? [] as err }
            <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label class="w-[300px] sm:w-[400px]">
            <h1>Confirm Password:</h1>
            <input name="confirmPassword" type="password" class="input rounded-xl" />
        </label>

        <Button title="Click, to sign up." name="Sign up" {loader} loader_name="Signing up." />
    </form>

    <div class="">
        <p>Already a member? <a title="Click, to register your account." href="/Login" class="text-blue-500 underline transiton-all hover:text-pink-500">Sign in</a> here</p>
    </div>

    <p><a title="Click, to navigate back to landing page." href="/" class="text-blue-500 underline">Back to landing page?</a></p>

</div>