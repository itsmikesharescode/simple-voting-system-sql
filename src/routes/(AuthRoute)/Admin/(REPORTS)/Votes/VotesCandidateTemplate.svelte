<script lang="ts">
	import type { CANDIDATES_TB } from "$lib/types";
	import { onMount } from "svelte";
	import VotesOptionTemplate from "./VotesOptionTemplate.svelte";
	import { adminVotedCandidatesArray } from "$lib";
	

    export let candidate: CANDIDATES_TB;

    const {

        id,
        created_at,
        position,
        name,
        agenda,
        organization,
        position_id,
        max_votes

    } = candidate;
     

    $: totalVotes = $adminVotedCandidatesArray?.filter(item => item.candidate_id === id).length;

</script>

<tr>
    <td class="px-6 py-4 whitespace-nowrap">
        {name}
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
        {totalVotes}
    </td>

    <td class="px-6 py-4 whitespace-nowrap">
        <VotesOptionTemplate {candidate} />
    </td>
    
</tr>