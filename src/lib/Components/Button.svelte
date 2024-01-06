<script lang="ts">
    export let name = "btn name";
    export let loader = false;
    export let loader_name = "loader name";
    export let style = "w-full bg-pink-500 p-2 rounded-xl ";
    export let title = "";
    export let type: "submit" | "button" | "reset" | null | undefined = "submit";

</script>

<!--
    @component
    style variable has a default config of "w-full bg-green-500 p-2 text-white rounded-xl"
-->

<button {title} {type} class=" {style} transition-all active:bg-opacity-50 {loader ? "cursor-progress" : ""} " 
disabled={loader}
on:click
>
    {#if loader}
        <div class="flex items-center gap-2 justify-center">
            <h1 class="font-bold">{loader_name}</h1>
            <div class="w-4 h-4 border-2 border-pink-500 border-b-black rounded-full animate-spin"></div>
        </div>
    {:else}
        <h1 class="font-bold">{name}</h1>
    {/if}
</button>