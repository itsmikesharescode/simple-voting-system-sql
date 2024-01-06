<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/Components/Button.svelte";
	
    
</script>

<div class="p-2 flex flex-col items-center justify-center h-screen">
	<div class="mx-auto sm:max-w-xl border-[0.1rem] rounded-xl p-4 shadow-lg shadow-black flex flex-col gap-4">
        <h1 class="font-bold text-center">ICCT VOTING SYSTEM</h1>
        <div class="max-h-[50vh] overflow-auto flex flex-col gap-2">
            <p>
                Welcome to our state-of-the-art web-based voting system. This platform is designed with the aim of making the voting process more efficient, accessible, and secure.
            </p>
    
            <p>
                Leveraging modern technology, our system ensures a seamless voting experience that is significantly faster than traditional methods. It eliminates the need for physical presence, allowing users to cast their votes from the comfort of their homes or any location with internet access.
            </p>
    
            <p>
                Our system is built with a user-friendly interface, making it easy for voters of all ages to navigate and cast their votes. It also features robust security measures to protect the integrity of each vote, ensuring that every voice is heard and counted accurately.
            </p>
    
            <p>
                Join us as we revolutionize the voting process, making it more convenient and inclusive for everyone. Welcome to the future of voting!
            </p>

            
        </div>

        <Button title="Click, to navigate in voting system" name="Let's Go!" on:click={ () => goto("/Login")}/>
    </div>
</div>