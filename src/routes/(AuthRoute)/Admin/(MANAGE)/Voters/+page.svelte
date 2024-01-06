<script lang="ts">
	import { onMount } from "svelte";
	import { navigationStore, sessionStore, showCreateAccount, userList, votersListComp } from "$lib";
    import searchIcon from "$lib/Images/search.svg";
    import ShowCreateAccount from "./ShowCreateAccount.svelte";
	import DeleteAccount from "./DeleteAccount.svelte";
	import type { PageServerData } from "./$types";

    export let data: PageServerData;
   
    onMount( async () =>
    {
        $navigationStore.activeItem = "/Admin/Voters";
        $navigationStore.defaultNav = $navigationStore.adminNav;
        
        const {users, session} = data;

        userList.set(users ?? []);
        if(session) sessionStore.set(session);
    });

</script>

{#if $showCreateAccount}
    <ShowCreateAccount />
{/if}

<div class="mt-[10vh] mx-auto sm:max-w-[80%] dark:text-pink-500 ">
    <div class="flex flex-col gap-2 sm:items-center sm:flex-row">
        <h1 class="font-bold h1 w-full ">Voters List</h1>
       
        <div class="flex gap-2 justify-center">
            <button title="Click, to create acccount" class="bg-green-500 px-4 py-2 text-white flex items-center gap-2 rounded-xl justify-center transition-all active:bg-opacity-50"
            on:click={() => $showCreateAccount = true }
            >
                Create&nbsp;Account
            </button>
            <button class="bg-pink-500 px-4 py-2 text-white flex items-center gap-2 rounded-xl justify-center">
                <img loading="lazy" src={searchIcon} alt="" class="w-5" />
                Search
            </button>
        </div>
        
    </div>

    <div class="mt-5 flex flex-col gap-2 max-h-[55vh] overflow-auto p-2">
        {#if $userList?.length}
        <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">

            <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            
                <div class="shadow overflow-hidden border-b border-blue-200">
                
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-slate-500 text-white dark:text-pink-500 dark:bg-black">

                            <tr>
                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">VOTERS NAME</h1>
                                </th>
                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">VOTERS&#160;EMAIL</h1>
                                </th>

                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">DATE&#160;CREATED</h1>
                                </th>

                                <th class="px-6 py-3 text-left ">
                                    <h1 class="font-bold">OPTIONS</h1>
                                </th>
                            </tr>

                        </thead>

                        <tbody class=" divide-y divide-gray-200">

                            {#each $userList ?? [] as user, index }
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        {user.user_metadata.name}
                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap">
                                        {user.email}
                                    </td>

                                    <td class="px-6 py-4 whitespace-nowrap">
                                        {new Date(user.created_at)}
                                    </td>
                
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <DeleteAccount {index} {user} />
                                    </td>

                                </tr>
                            {/each}
                            <!-- More rows... -->
                        </tbody>

                    </table>
                </div>
        
            </div>
        </div> 
        {:else}
            <p class="text-center mt-5">There is no registered voters.</p>
        {/if} 
    </div>
</div>
