<script lang="ts">
	import Button from "./Button.svelte";
    import { navigationStore, sessionStore } from "$lib";
	import { goto } from "$app/navigation";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
  
    const toastStore = getToastStore();


    const createToast = (msg: string, error: boolean) =>
    {
        const t: ToastSettings = {
            message: `${msg}`,
            background: `text-white ${error ? "bg-red-500" : "bg-green-500"}`,
        };
        toastStore.trigger(t);
    }

    let showMenu = false;
    let loader = false;

    const handleLogout = async () =>
    {

        loader = true;
        const res = await fetch("/API", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                logout: "req for logout"
            })
        })

        const {status, msg } = await res.json() as { status: number, msg: string};

        if(status === 200){
            $sessionStore = null;
            goto("/");
            createToast(msg, false);
            loader = false;
        }
    }

</script>

<nav class="p-2 bg-slate-500 dark:bg-[#00000050] rounded-lg w-full shadow-xl flex items-center">
    
    {#if $sessionStore?.user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8"}
        <button title="Click, to view navigation." class="flex flex-col gap-1 p-2 transition-all active:scale-95 {showMenu ? "hidden": ""} " on:click={ () => showMenu = true }>
            <div class="w-8 border-b-2 border-white"></div>
            <div class="w-8 border-b-2 border-white"></div>
            <div class="w-8 border-b-2 border-white"></div>
        </button>
    {/if}
    
    

    <div class="flex justify-end w-full px-2">
        <Button title="Click, to logout in the voting system." style="bg-red-500 p-2 text-white rounded-xl" name="Logout" on:click={handleLogout} {loader} loader_name="Logging out."  />
    </div>
</nav>

{#if showMenu}

    <div class="fixed left-0 top-0 bottom-0 right-0 bg-[#000000c4]">
        <div class="fixed left-0 top-0 bottom-0 text-black dark:text-white bg-slate-500 dark:bg-[#000000c4] shadow-lg shadow-black">
            <menu class="px-4 py-2 w-[90vw] sm:w-[400px] flex flex-col gap-10 z-10">
                <div class="flex justify-end p-2">
                    <button title="Click, to view navigation." class="flex flex-col gap-1 px-2 py-4 transition-all active:scale-95 " on:click={ () => showMenu = false }>
                        <div class="w-8 border-b-2 border-white rotate-45"></div>
                        <div class="w-8 border-b-2 border-white rotate-[-45deg] absolute"></div>
                    </button>
                </div>
    
    
                <div class="flex flex-wrap justify-center items-center p-2 border-[0.1rem]">
                    <img loading="lazy" src="https://www.svgrepo.com/show/527946/user-circle.svg" alt="" class="w-14" />
                    <div class="">
                        <h1>{$sessionStore?.user.user_metadata.name}</h1>
                        <small>{$sessionStore?.user.email}</small>
                    </div>
                </div>
    
                <div class="overflow-auto max-h-[50vh]">
                    {#each $navigationStore.defaultNav as nav}
                        <h1 class="font-bold p-2 border-[0.1rem] text-center">{nav.header}</h1>
                        <div class="border-[0.1rem] flex flex-col p-2">
                            {#each nav.selections as selection }
                                <a title="Click, to navigate {selection.title} " href={selection.url} 
                                    class="{$navigationStore.activeItem === selection.url ? "bg-pink-800" : ""} transition-all hover:bg-pink-900 hover:text-black p-2"
                                    on:click={ () => {
                                        $navigationStore.activeItem = selection.url;
                                        showMenu = false;
                                        
                                        
                                    }}
                                    >{selection.title}</a>
                            {/each}
                        </div>
                    {/each}
                </div>
            </menu>
        </div> 
    </div>   

{/if}