<script lang="ts">
	import { enhance } from "$app/forms";
	import { sessionStore, userList, votersComparison } from "$lib";
    import Button from "$lib/Components/Button.svelte";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { Session, User } from "@supabase/supabase-js";
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

    export let index: number;
    export let user: User;

    interface DeleteAccountTypes {
        inputCompar: string[]
    }

    interface UpdateAccountTypes {
        fName: string[]        
        mName: string[]        
        lName: string[]       
        newPassword: string[]        
        confirmPassword: string[]
    }

    let deleteInputErrors: DeleteAccountTypes | null = null;
    let updateInputErrors: UpdateAccountTypes | null = null;

    const buttonObj = {
        deleteLoader: false,
        updateLoader: false
    }

    type DeleteAccountNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            users: User[]
            errors: DeleteAccountTypes
        }
    }

    type UpdateAccountNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            users: User[]
            errors: UpdateAccountTypes
        }
    }

    const deleteAcountNews: SubmitFunction = async () =>
    {
        buttonObj.deleteLoader = true;

        return async ({update, result}) =>
        {
            const { status, data: {msg, errors, users, session}} = result as DeleteAccountNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    userList.set(users);
                    createToast(msg, false);
                    buttonObj.deleteLoader = false;
                    $votersComparison.showDelete = 0.1;
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
            }

        }
    };

    const updateAccountNews: SubmitFunction = async () =>
    {
        buttonObj.updateLoader = true;
        return async ({update, result}) =>
        {
            const {status, data: {msg, session, users, errors}} = result as UpdateAccountNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    userList.set(users);
                    buttonObj.updateLoader = false;
                    $votersComparison.showUpdate = 0.1;
                    createToast(msg, false);
                    update();
                    break;

                case 402:
                    createToast(msg, true);
                    buttonObj.updateLoader = false;
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
            }

            
        }
    };

</script>

<!--Delete warning-->
{#if $votersComparison.showDelete === index }
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">
        <form method="POST" action="?/deleteAccount" enctype="multipart/form-data" use:enhance={deleteAcountNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] shadow-sm shadow-white dark:text-pink-500 rounded-xl p-4 sm:max-w-xl mx-auto mt-[20vh]" transition:scale>
            
            <h1 class="text-center font-bold">Confirm Deletion of</h1>
            <p class="text-center text-xs font-bold">{@html user.user_metadata.name} </p>
            <small class="text-center">To delete this account you must type this in the input field</small>
            <small class="text-center font-bold text-red-900">I agree, this account should be deleted</small>
        
            <input name="inputCompar" type="text" class="input text-slate-500" placeholder="Enter the word"/>
            {#each deleteInputErrors?.inputCompar ?? [] as error}
                <p class="text-red-900 font-bold text-xs">{error}</p>
            {/each}
                
            <input name="targetId" type="text" class="hidden" value={user.id}  />

            <div class="flex gap-2">

                <Button type="button" style="w-full bg-green-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $votersComparison.showDelete = 0.1 } />

                <Button style="w-full bg-red-500 p-2 text-white rounded-xl" name="Delete" loader={buttonObj.deleteLoader} loader_name="Deleting." />

            </div>
            
        </form>
        
    </div>
{/if}

<!--Update warning-->
{#if $votersComparison.showUpdate === index }
    <div class="fixed bottom-0 top-0 left-0 right-0 bg-[#000000f5] p-2">

        <form method="POST" action="?/updateAcount" enctype="multipart/form-data" use:enhance={updateAccountNews} class="flex flex-col gap-2 bg-slate-500 text-white dark:bg-[#000000] shadow-sm shadow-white rounded-xl p-4 sm:max-w-xl mx-auto mt-[10vh]" transition:scale>
            
            <h1 class="text-center font-bold">Update this Account?</h1>
            <small class="text-center font-bold">You are updating account of <b class="underline">{user.user_metadata.name}</b></small>
            
            <label>
                <p>New First Name:</p>
                <input title="Enter the New First Name." name="fName" type="text" class="input text-slate-500" placeholder="Enter your new, first name."/>
                {#each updateInputErrors?.fName ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>

            <label>
                <p>New Middle Name:</p>
                <input title="Enter the new Middle Name." name="mName" type="text" class="input text-slate-500" placeholder="Enter your new, middle name."/>
                {#each updateInputErrors?.mName ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>

            <label>
                <p>New Last Name:</p>
                <input title="Enter the new Last Name." name="lName" type="text" class="input text-slate-500" placeholder="Enter your new, last name."/>
                {#each updateInputErrors?.lName ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>

            <label>
                <p>New Password:</p>
                <input title="Enter the new Password." name="newPassword" type="password" class="input text-slate-500" placeholder="Enter your new, password."/>
                {#each updateInputErrors?.newPassword ?? [] as error}
                    <p class="text-red-900 font-bold text-xs">{error}</p>
                {/each}
            </label>

            <label>
                <p>Confirm New Password:</p>
                <input title="Confirm your new Password." name="confirmPassword" type="password" class="input text-slate-500" placeholder="Confirm your new, password."/>
            </label>

            

            <input name="targetId" type="text" class="hidden" value={user.id} />
                

            <div class="flex gap-2">

                <Button type="button" style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $votersComparison.showUpdate = 0.1 } />

                <Button style="w-full bg-green-500 p-2 text-white rounded-xl" name="Update" loader={buttonObj.updateLoader} loader_name="Updating." />

            </div>

        </form>
        
    </div>
{/if}

<div class="flex gap-2">
    <Button title="Click, to delete {user.user_metadata.name} account." style="w-full bg-red-500 p-2 text-white rounded-xl" name="Delete" on:click={ () => $votersComparison.showDelete = index }  />
    <Button title="Click, to edit or update {user.user_metadata.name} account." style="w-full bg-green-500 p-2 text-white rounded-xl" name="Edit" on:click={ () => $votersComparison.showUpdate = index } />
</div>