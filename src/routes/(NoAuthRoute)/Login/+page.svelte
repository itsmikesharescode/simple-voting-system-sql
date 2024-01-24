<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/Components/Button.svelte";
	import type { Session } from "@supabase/supabase-js";
	import type { SubmitFunction } from "@sveltejs/kit";

    import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { scale } from "svelte/transition";
	import { goto } from "$app/navigation";
	import { navigationStore, sessionStore } from "$lib";

    const toastStore = getToastStore();

    const createToast = (msg: string, error: boolean) =>
    {
        const t: ToastSettings = {
            message: `${msg}`,
            background: `text-white ${error ? "bg-red-500" : "bg-green-500"}`,
        };
        toastStore.trigger(t);
    }

    interface LOGIN_ERROR_TYPES {
        email: string[]
        password: string[]
    }

    let inputErrors: LOGIN_ERROR_TYPES | null = null;
    let loader = false;

    type LoginNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            errors: LOGIN_ERROR_TYPES
        }
    }


    const loginNews: SubmitFunction = async () =>
    {
        loader = true;
        return async ({update, result}) =>
        {
            const {status, data: {msg, session, errors}} = result as LoginNews;
            
            switch (status) {
                case 200:
                    sessionStore.set(session);
                    inputErrors = null;
                    createToast(msg, false);
                    loader = false;

                    if(session.user.role === "authenticated") goto("/Voter");
                    else if(session.user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8") (goto("/Admin/Dashboard"), $navigationStore.defaultNav = $navigationStore.adminNav);
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
        };
    };

</script>

<div class="min-h-screen flex flex-col gap-10 justify-center items-center" in:scale>

    <form method="POST" action="?/login" use:enhance={loginNews} enctype="multipart/form-data" class="mx-auto sm:max-w-[400px] flex flex-col gap-2">
        
        <h1 class="font-bold h1 text-center">Login</h1>
        <small class="opacity-50 font-bold text-center">Login to ICCT VOTING SYSTEM</small>

        <label class="w-[300px] sm:w-[400px]">
            <h1>Email:</h1>
            <input name="email" type="email" class="input rounded-xl" />
            {#each inputErrors?.email ?? [] as err }
                <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <label class="w-[300px] sm:w-[400px]">
            <h1>Password:</h1>
            <input name="password" type="password" class="input rounded-xl" />
            {#each inputErrors?.password ?? [] as err }
                <p class="text-red-500 text-xs">{err}</p>
            {/each}
        </label>

        <Button title="Click, to log in" name="Sign in" {loader} loader_name="Signing in."/>

    </form>

    <div class="">
        <p><a title="Click, to recover your account." href="/ForgotPass" class="text-blue-500 underline transiton-all hover:text-pink-500">Forgot Password?</a></p>
    </div>

    <div class="">
        <p>Not a member yet? <a title="Click, to register your account." href="/SignUp" class="text-blue-500 underline transiton-all hover:text-pink-500">Register here.</a> It's free!</p>
    </div>

    <p><a title="Click, to navigate back to landing page." href="/" class="text-blue-500 underline">Back to landing page?</a></p>

</div>