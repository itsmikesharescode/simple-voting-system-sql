<script lang="ts">
	import { enhance } from "$app/forms";
	import { showCreateAccount, userList } from "$lib";
    import Button from "$lib/Components/Button.svelte";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { User } from "@supabase/supabase-js";
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

    interface CreateAccountErrorTypes {

        fName: string[]
        mName: string[]
        lName: string[]
        email: string[]
        password: string[]

    };

    let loader = false;
    let inputErrors: CreateAccountErrorTypes | null = null;

    type CreateAccountNews = {
        status: number
        type: string
        data: {
            msg: string
            allUsers: User[] 
            errors: CreateAccountErrorTypes
        }
    }

    const createAccountNews: SubmitFunction = async () =>
    {
        loader = true;

        return async ({update, result}) =>
        {

            const {status, data: {msg, allUsers, errors}} = result as CreateAccountNews;

            switch (status) {
                case 200:
                    userList.set(allUsers);
                    createToast(msg, false);
                    $showCreateAccount = false;
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
                    break

                default:
                    update();
                    break;
            }
            
            
        }
    };

</script>

<div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000cb] p-2 dark:text-pink-500 p-2">
    <form method="POST" action="?/createAccount" use:enhance={createAccountNews}  enctype="multipart/form-data" class="mx-auto sm:max-w-xl p-4 mt-[10vh] max-h-[70vh] overflow-auto dark:bg-[#000000cb] bg-slate-500 flex flex-col gap-4" transition:scale> 
        
        <div class="text-black dark:text-pink-500">
            <h1 class="h3 text-center">Create Account</h1>
            <label>
                <p>First Name:</p>
                <input name="fName" type="text" class="input" />
                {#each inputErrors?.fName ?? [] as err }
                    <p class="text-red-500 text-xs">{err}</p>
                {/each}
            </label>
    
            <label>
                <p>Middle Name:</p>
                <input name="mName" type="text" class="input" />
                {#each inputErrors?.lName ?? [] as err }
                    <p class="text-red-500 text-xs">{err}</p>
                {/each}
            </label>
    
            <label>
                <p>Last Name:</p>
                <input name="lName" type="text" class="input" />
                {#each inputErrors?.lName ?? [] as err }
                    <p class="text-red-500 text-xs">{err}</p>
                {/each}
            </label>
    
            <label>
                <p>Email:</p>
                <input name="email" type="text" class="input" />
                {#each inputErrors?.email ?? [] as err }
                    <p class="text-red-500 text-xs">{err}</p>
                {/each}
            </label>
    
            <label>
                <p>Password:</p>
                <input name="password" type="password" class="input" />
                {#each inputErrors?.password ?? [] as err }
                    <p class="text-red-500 text-xs">{err}</p>
                {/each}
            </label>
    
            <label>
                <p>Confirm Password:</p>
                <input name="confirmPassword" type="password" class="input" />
                
            </label>
        </div>

        <div class="flex gap-2 items-center text-white">
            <Button title="Click, to cancel creating account." type="button" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $showCreateAccount = false } />
            <Button title="Click, to create account." name="Create" {loader} loader_name="Creating." />
        </div>

    </form>
</div>