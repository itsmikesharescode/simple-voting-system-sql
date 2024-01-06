<script  lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/Components/Button.svelte";

</script>

<div class="p-2">
    <div class="text-center mx-auto sm:max-w-xl p-4 flex flex-col gap-2 border-[0.1rem] border-black text-black dark:border-pink-500 dark:text-white rounded-xl mt-[10vh]">
        <h1 class="font-bold p-4">ICCT Voting System!</h1>
        
        <p>
            Hello there! We're thrilled to see you here. Your voice matters, and this platform is where you can make it heard. 
        </p>

        <p>
            Whether you're here to cast your vote, learn about the candidates, or understand the voting process, we've got you covered. Remember, every vote counts. Your decision can make a difference.
        </p>
        <p>
            So, explore, understand, and most importantly, exercise your right to vote. Thank you for being a part of this democratic process. Happy voting!
        </p>
    </div>

    <div class="text-center mx-auto sm:max-w-xl p-4 flex flex-col gap-2 border-[0.1rem] border-black text-black dark:border-pink-500 dark:text-white rounded-xl mt-2">
        <h1 class="font-bold p-4">RULES</h1>
        
        <p>
            Use the system accordingly.
        </p>

        <p>
            Vote and exit
        </p>
        <p>
            If you find bugs email the dev <a title="Click, to mail the developer." href="mailto:eviotamikejohnb@gmail.com" class="underline text-blue-500">eviotamikejohnb@gmail.com</a>
        </p>
    </div>

   <div class="flex flex-col gap-2 mx-auto sm:max-w-xl my-[10vh]">
        <h1 class="text-center font-bold">Proceed to Voting System?</h1>
        <div class="flex flex-col gap-2 sm:flex-row">
                <Button title="Click, to proceed." style="w-full bg-green-500 p-2 text-white rounded-xl" name="Yes" on:click={() => goto("/Voter/VotingSystem")}/>
                <Button title="Click, to not proceed." style="w-full bg-red-500 p-2 text-white rounded-xl" name="No" on:click={() => goto("/")} />
        </div>
   </div>
    
</div>