<script lang="ts">
	import { onMount } from "svelte";
	import type { PageServerData } from "./$types";
	import { adminCandidatesArray, adminPositionsArray, adminVotedCandidatesArray, navigationStore, sessionStore } from "$lib";

    export let data: PageServerData;
    
   
    onMount( async () =>
    {
        const {session} = data;
        $navigationStore.activeItem = "/Admin/Dashboard";
        if(session) sessionStore.set(session), $navigationStore.defaultNav = $navigationStore.adminNav;
        
    })

</script>
<div class="mx-auto sm:max-w-[80%] mt-[10vh]">
    <h1 class="font-bold h1 dark:text-pink-500">Dashboard</h1>
</div>
<div class="flex flex-col sm:flex-row flex-wrap gap-2 justify-center mt-[5vh] text-white dark:text-pink-500">
    
    <div class="min-h-[20vh] w-full sm:w-[20vw] bg-slate-500 rounded-xl dark:bg-[#00000050] p-4 flex flex-col gap-4 justify-center items-center">
        <h1 class="h1 ">{data.positionCount}</h1>
        <h1 class="h4 ">No. Positions</h1>
    </div>

    <div class="min-h-[20vh] w-full sm:w-[20vw] bg-slate-500 rounded-xl dark:bg-[#00000050] p-4 flex flex-col gap-4 justify-center items-center">
        <h1 class="h1 ">{data.candidatesCount}</h1>
        <h1 class="h4 ">No. Candidates</h1>
    </div>

    <div class="min-h-[20vh] w-full sm:w-[20vw] bg-slate-500 rounded-xl dark:bg-[#00000050] p-4 flex flex-col gap-4 justify-center items-center">
        <h1 class="h1 ">{data.usersCount}</h1>
        <h1 class="h4 ">No. Registered Voters</h1>
    </div>

    <div class="min-h-[20vh] w-full sm:w-[20vw] bg-slate-500 rounded-xl dark:bg-[#00000050] p-4 flex flex-col gap-4 justify-center items-center">
        <h1 class="h1 ">{data.usersCount}</h1>
        <h1 class="h4 ">No. Voted</h1>
    </div>
</div>
