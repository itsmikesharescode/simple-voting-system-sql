import { fail, type Actions, redirect } from "@sveltejs/kit";
import {ZodError, z} from "zod";
import type { PageServerLoad } from "./$types";
import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import { decryptMessage } from "$lib/Helpers/encryption";

const castingVoteSchema = z.object({
    candidateObject: z.string(),
});

export const load: PageServerLoad = async ( {locals: { getSession, supabase }, cookies }) => {

    const session = await getSession();

    if(session){

        let sessionCookie: Session | undefined;

        const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");

        if(cookie){

            sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);

            const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);

            if(user){

                if(session.user.role === user.role){

                    if(user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Admin/Dashboard");
                    
                    // first get the positions datas
                    const {data:positions, error:positionsError} = await supabase.from("position_tb").select("*");
                    
                    if(positions){
                        // second get the candidates datas
                        const {data:candidates, error:candidatesError} = await supabase.from("candidates_tb").select("*");

                        if(candidates){
                            //third get the voted candidates datas
                            const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabase.from("voted_candidates_tb").select("*");
                            
                            if(allVotedCandidates) return {status: 200, positions, candidates, allVotedCandidates, session};
                            
                            else if(allVotedCandidatesError) return {status: 402, positions, candidates, allVotedCandidates: null, msg: allVotedCandidatesError.message};

                        }else if(candidatesError) return {status: 402, positions, candidates: null, msg: candidatesError.message};
                        
                    }else if(positionsError) return {status: 402, positions: null, candidates: null, msg: positionsError.message};
                    
                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                }

            }else if(userError){
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            };
            
        }else{
            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
        }

    }else{
        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
        throw redirect(302, "/Login?You-have-to-login");
    }

};


export const actions: Actions = {

    refreshVotes: async ({request, locals: {supabase, getSession}, cookies}) =>
    {
        const session = await getSession();

        if(session){

            let sessionCookie: Session | undefined;

            const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");

            if(cookie){

                sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);

                const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);

                if(user){

                    if(session.user.role === user.role){

                        if(user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Admin/Dashboard");
                        
                        //final cycle
                        const {data:positions, error:positionsError} = await supabase.from("position_tb").select("*");
                    
                        if(positions){

                            const {data:candidates, error:candidatesError} = await supabase.from("candidates_tb").select("*");   
                            
                            if(candidates){
                            
                                const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabase.from("voted_candidates_tb").select("*");

                                if(allVotedCandidates) return fail(200, {msg: "Votes Refresh Successfully." , positions, candidates, allVotedCandidates, session});

                                else if(allVotedCandidatesError) return fail(402, {msg: allVotedCandidatesError.message});

                            }else if(candidatesError) return fail(402, {msg: candidatesError.message});

                        }else if(positionsError) return fail(402, {msg: positionsError.message});
                        
                    }else{
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    }

                }else if(userError){
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                };
                
            }else{
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            }

        }else{
            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
            throw redirect(302, "/Login?You-have-to-login");
        }
        

    },

    castVote: async ({request, locals: {supabase, getSession}, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
       
        const session = await getSession();

        const result = castingVoteSchema.parse(formData);
        
        if(session){
            const candidate: CANDIDATES_TB = JSON.parse(decryptMessage(result.candidateObject));

            let sessionCookie: Session | undefined;
    
            const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
    
            if(cookie){
    
                sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
    
                const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
    
                if(user){
    
                    if(session.user.role === user.role){

                        if(user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Admin/Dashboard");

                        const {data:candidateMaxVote, error:candidateMaxVoteError} = await supabase.from("candidates_tb").select("max_votes, id").eq("id", candidate.id);
                        
                        if(candidateMaxVote){
                            const maxVotes = candidateMaxVote[0].max_votes;
                            const {data:totalVotes, error:totalVotesError} = await supabase.from("voted_candidates_tb").select("candidates_tb(position)").match({vector_uid: session.user.id, position: candidate.position });
                            
                            if(totalVotes){
                                if(totalVotes.length < maxVotes){
                                    const {data:checkifExist, error:checkifExistError} = await supabase.from("voted_candidates_tb").select("id").match({vector_uid: session.user.id, candidate_id: candidate.id});
                                    if(checkifExist?.length) return fail(402, {msg: "You have voted this candidate already."});
                                    else if(checkifExistError) return fail(402, {msg: checkifExistError.message});
                                    else{
                                        const {error:insertVoteError} = await supabase.from("voted_candidates_tb").insert([{ candidate_id: candidate.id, vector_uid: session.user.id, position: candidate.position}]);

                                        if(insertVoteError) return fail(402, {msg: insertVoteError.message});
                                        else {

                                            //final cycle
                                            const {data:positions, error:positionsError} = await supabase.from("position_tb").select("*");
                                        
                                            if(positions){

                                                const {data:candidates, error:candidatesError} = await supabase.from("candidates_tb").select("*");   
                                                
                                                if(candidates){
                                                
                                                    const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabase.from("voted_candidates_tb").select("*");

                                                    if(allVotedCandidates) return fail(200, {msg: `Thank you for voting ${candidate.name}.` , positions, candidates, allVotedCandidates, session});

                                                    else if(allVotedCandidatesError) return fail(402, {msg: allVotedCandidatesError.message});

                                                }else if(candidatesError) return fail(402, {msg: candidatesError.message});

                                            }else if(positionsError) return fail(402, {msg: positionsError.message});

                                        };
                                    };
                                    
                                }else return fail(402, {msg: "You have exceed the maximum votes allowed for this position."});
                                
                            }else if(totalVotesError) return fail(402, {msg: totalVotesError.message});

                        }else if(candidateMaxVoteError) return fail(402, {msg: candidateMaxVoteError.message});
                            
                    }else{
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    }
    
                }else if(userError){
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                };
                
            }else{
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            };
    
        }else{
            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
            throw redirect(302, "/Login?You-have-to-login");
        };
            

    },

    undoVoteCast: async ({request, locals: {supabase, getSession}, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const result = castingVoteSchema.parse(formData);

        const session = await getSession();

        if(session){
            const candidate: CANDIDATES_TB = JSON.parse(decryptMessage(result.candidateObject));
            let sessionCookie: Session | undefined;
    
            const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
    
            if(cookie){
    
                sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
    
                const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
    
                if(user){
    
                    if(session.user.role === user.role){
    
                        if(user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Admin/Dashboard");
                        
                        const {error:deleteVoteError} = await supabase.from("voted_candidates_tb").delete().match({vector_uid: session.user.id, candidate_id: candidate.id});
                        
                        if(deleteVoteError) return fail(402, {msg: deleteVoteError.message});
                        else{
                            //final cycle
                            const {data:positions, error:positionsError} = await supabase.from("position_tb").select("*");
                                        
                            if(positions){

                                const {data:candidates, error:candidatesError} = await supabase.from("candidates_tb").select("*");   
                                
                                if(candidates){
                                
                                    const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabase.from("voted_candidates_tb").select("*");

                                    if(allVotedCandidates) return fail(200, {msg: `You have canceled vote for ${candidate.name}.` , positions, candidates, allVotedCandidates, session});

                                    else if(allVotedCandidatesError) return fail(402, {msg: allVotedCandidatesError.message});

                                }else if(candidatesError) return fail(402, {msg: candidatesError.message});

                            }else if(positionsError) return fail(402, {msg: positionsError.message});
                        }
                        
                    }else{
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    }
    
                }else if(userError){
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                };
                
            }else{
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            }
    
        }else{
            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
            throw redirect(302, "/Login?You-have-to-login");
        }
    },

    viewHistory: async ({request, locals: {supabase, getSession}, cookies}) =>
    {
        const session = await getSession();
        if(session){

            let sessionCookie: Session | undefined;

            const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");

            if(cookie){

                sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);

                const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);

                if(user){

                    if(session.user.role === user.role){

                        if(user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Admin/Dashboard");
                        
                        const {data:voteHistory, error:voteHistoryError} = await supabase.from("voted_candidates_tb").select("candidates_tb(name, position)").eq("vector_uid", session.user.id);
                        
                        if(voteHistory) return fail(200, {voteHistory, session});
                        else if(voteHistoryError) return fail(402, {msg: voteHistoryError.message});
                        
                    }else{
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    }

                }else if(userError){
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                };
                
            }else{
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            }

        }else{
            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
            throw redirect(302, "/Login?You-have-to-login");
        };

    },
};