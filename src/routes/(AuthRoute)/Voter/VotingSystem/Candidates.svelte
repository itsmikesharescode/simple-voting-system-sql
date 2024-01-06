<script lang="ts">
	import { votersVotedCandidates } from "$lib";
	import type { CANDIDATES_TB } from "$lib/types";
	import { onMount } from "svelte";
	import CastingVote from "./CastingVote.svelte";

    export let candidate: CANDIDATES_TB;

   
    const {id, position, name, agenda, organization, position_id, max_votes, created_at } = candidate;


    $: totalVotes = $votersVotedCandidates?.filter(item => item.candidate_id === id).length;
   

    
</script>

<tr>
    <td class="px-6 py-4 whitespace-nowrap">
        {name}
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
        {totalVotes}
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
        {new Date(created_at)}
    </td>
    
    <td class="px-6 py-4 whitespace-nowrap">
        <CastingVote {candidate}/>
    </td>
</tr>