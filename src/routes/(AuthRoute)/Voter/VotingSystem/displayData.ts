import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types"
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"
import { fail } from "@sveltejs/kit"



export const supabaseTableHooks = async ( supabase: SupabaseClient ) =>
{
    const {data:positions, error:positionsError} = await supabase.from("position_tb").select("*") as {data: POSITION_TB[] | null, error: PostgrestError | null};
    
    if(positions){

        const {data:candidates, error:candidatesError} = await supabase.from("candidates_tb").select("*") as {data: CANDIDATES_TB[] | null, error: PostgrestError | null};    
        
        if(candidates){
        
            const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabase.from("voted_candidates_tb").select("*") as {data: VOTED_CANDIDATE_TB[] | null, error: PostgrestError | null };

            if(allVotedCandidates){

                return fail(200, {positions, candidates, allVotedCandidates});

            }else if(allVotedCandidatesError){
                return fail(402, {msg: allVotedCandidatesError.message});
                
            }

        }else if(candidatesError){
            return fail(402, {msg: candidatesError.message});

        }

    }else if(positionsError){
        return fail(402, {msg: positionsError.message});

    }
}