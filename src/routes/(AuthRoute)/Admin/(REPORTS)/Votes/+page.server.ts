import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import { decryptMessage } from "$lib/Helpers/encryption";
import {ZodError, z} from "zod";

const allVotesResetSchema = z.object({
    inputCompar: z.string().refine(value => value === "Yes, reset all votes.", {message: "You have to follow instructions."}),
})

export const load: PageServerLoad = async ( {locals: { getSession, supabase, supabaseAdmin }, cookies} ) => {

    const session = await getSession();

    if(session){
        
        let sessionCookie: Session | undefined;

        const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");

        if(cookie){

            sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);

            const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
            if(user){

                if(session.user.role ===  user.role){
                    if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                    // first get the positions datas
                    const {data:positions, error:positionsError} = await supabaseAdmin.from("position_tb").select("*") as {data: POSITION_TB[] | null, error: PostgrestError | null};
                    if(positions){
                        // second get the candidates datas
                        const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*") as {data: CANDIDATES_TB[] | null, error: PostgrestError | null};
                        
                        if(candidates){
                            //third get the voted candidates datas
                            const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabaseAdmin.from("voted_candidates_tb").select("*") as {data: VOTED_CANDIDATE_TB[] | null, error: PostgrestError | null};
                            
                            if(allVotedCandidates){

                                return {status: 200, positions, candidates, allVotedCandidates, session};
                            
                            }else if(allVotedCandidatesError) return {status: 402, positions, candidates, allVotedCandidates: null, msg: allVotedCandidatesError.message};

                        }else if(candidatesError) return {status: 402, positions, candidates: null, msg: candidatesError.message};         

                    }else if(positionsError) return {status: 402, positions: null, candidates: null, msg: positionsError.message };

                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");

                };

            }else if(userError){
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            };
            
        }else{
            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
        };

    }else {
        throw redirect(302, "/Login?You-must-login");
    };
    
};

export const actions: Actions = {

    resetVotes: async({request, cookies, locals: {getSession,supabase, supabaseAdmin}}) =>
    {
        const formData = await request.formData();
        const session = await getSession();
        

        if(session){

            const decryptedCandidate: CANDIDATES_TB = JSON.parse(decryptMessage(formData.get("encryptedCandidate") as string));

            let sessionCookie: Session | undefined;
    
            const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
    
            if(cookie){
    
                sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
    
                const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                if(user){
    
                    if(session.user.role ===  user.role){
                        if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                        
                        const { error:resetError } = await supabaseAdmin.from("voted_candidates_tb").delete().match({candidate_id: decryptedCandidate.id, position: decryptedCandidate.position})
                        if(resetError) return fail(402, {msg: resetError.message});
                        else{
                            // first get the positions datas
                            const {data:positions, error:positionsError} = await supabaseAdmin.from("position_tb").select("*");
                            if(positions){
                                // second get the candidates datas
                                const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*");
                                
                                if(candidates){
                                    //third get the voted candidates datas
                                    const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabaseAdmin.from("voted_candidates_tb").select("*");
                                    
                                    if(allVotedCandidates){
        
                                        return fail(200, {msg: `Votes for ${decryptedCandidate.name} are back to 0.`, positions, candidates, allVotedCandidates, session});
                                    
                                    }else if(allVotedCandidatesError) return fail(402, { msg: allVotedCandidatesError.message });
        
                                }else if(candidatesError) return fail(402,{ msg: candidatesError.message });         
        
                            }else if(positionsError) return fail(402,{ msg: positionsError.message });
                        };
    
                    }else{
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    };
    
                }else if(userError){
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                };
                
            }else{
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            };
    
        }else {
            throw redirect(302, "/Login?You-must-login");
        };

    },

    refreshVotes: async({request, cookies, locals:{supabase, supabaseAdmin, getSession}}) =>
    {
        const session = await getSession();

        if(session){
        
            let sessionCookie: Session | undefined;
    
            const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
    
            if(cookie){
    
                sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
    
                const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                if(user){
    
                    if(session.user.role ===  user.role){
                        if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                        // first get the positions datas
                        const {data:positions, error:positionsError} = await supabaseAdmin.from("position_tb").select("*");
                        if(positions){
                            // second get the candidates datas
                            const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*");
                            
                            if(candidates){
                                //third get the voted candidates datas
                                const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabaseAdmin.from("voted_candidates_tb").select("*");
                                
                                if(allVotedCandidates){
    
                                    return fail(200,{msg: "Votes Refreshed Successfully.", positions, candidates, allVotedCandidates, session});
                                
                                }else if(allVotedCandidatesError) return fail(402, {msg: allVotedCandidatesError.message});
    
                            }else if(candidatesError) return fail(402, {msg: candidatesError.message});         
    
                        }else if(positionsError) return fail(402,{msg: positionsError.message });
    
                    }else{
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
    
                    };
    
                }else if(userError){
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                };
                
            }else{
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            };
    
        }else {
            throw redirect(302, "/Login?You-must-login");
        };
    },

    allVotesResets: async({request, cookies, locals: {getSession, supabase, supabaseAdmin}}) =>
    {
        const formData = Object.fromEntries(await request.formData());

        const session = await getSession();
        
        try {
            if(session){

                const result = allVotesResetSchema.parse(formData);

                let sessionCookie: Session | undefined;
        
                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
        
                if(cookie){
        
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
        
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                    if(user){
        
                        if(session.user.role ===  user.role){
                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                            
                            const { error:allVotesResetError } = await supabaseAdmin.from("voted_candidates_tb").delete().neq("id", 0);
                            
                            if(allVotesResetError) return fail(402, {msg: allVotesResetError.message});
                            else{
                                // first get the positions datas
                                const {data:positions, error:positionsError} = await supabaseAdmin.from("position_tb").select("*");
                                if(positions){
                                    // second get the candidates datas
                                    const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*");
                                    
                                    if(candidates){
                                        //third get the voted candidates datas
                                        const {data:allVotedCandidates, error:allVotedCandidatesError} = await supabaseAdmin.from("voted_candidates_tb").select("*");
                                        
                                        if(allVotedCandidates){
            
                                            return fail(200,{msg: "All votes are back to 0.", positions, candidates, allVotedCandidates, session});
                                        
                                        }else if(allVotedCandidatesError) return fail(402, {msg: allVotedCandidatesError.message});
            
                                    }else if(candidatesError) return fail(402, {msg: candidatesError.message});         
            
                                }else if(positionsError) return fail(402,{msg: positionsError.message });
                            };
        
                        }else{
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                        };
        
                    }else if(userError){
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    };
                    
                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                };
        
            }else {
                throw redirect(302, "/Login?You-must-login");
            };
            
        } catch (error) {
            const zodError = error as ZodError;
            const {fieldErrors} = zodError.flatten();
            console.log(fieldErrors)
            return fail(403, {errors: fieldErrors});
        }

    }
};