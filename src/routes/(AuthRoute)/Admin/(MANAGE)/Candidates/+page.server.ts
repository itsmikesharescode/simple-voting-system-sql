import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {ZodError, z} from "zod";
import type { CANDIDATES_TB, POSITION_TB } from "$lib/types";
import type { Session } from "@supabase/supabase-js";

const createCandidateSchema = z.object({

    position: z.string(),

    candidateName: z.string()
    .min(1, {message: "Candidate name must not be empty."})
    .max(40, {message: "Maximum character for candidate is 40."}),

    organization: z.string()
    .min(1, {message: "Organization must not be empty."})
    .max(50, {message: "Maximum character for organization is 50"}),

    agenda: z.string()
    .min(1, {message: "Agenda must not me empty."})

})

const updateCandidateSchema = z.object({

    candidate: z.string(),
    position: z.string(),

    candidateName: z.string()
    .min(1, {message: "Candidate name must not be empty."})
    .max(40, {message: "Maximum character for candidate is 40."}),

    organization: z.string()
    .min(1, {message: "Organization must not be empty."})
    .max(50, {message: "Maximum character for organization is 50"}),

    agenda: z.string()
    .min(1, {message: "Agenda must not me empty."})
})

const deleteCandidateSchema = z.object({
    candidate: z.string(),

    inputCompar: z.string().refine( value => value === "I agree, this candidate should be deleted", {message: "Input must match the instructions."})
    
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
                
                    const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*");

                    if(candidates) {
                        const {data: getPositions, error: getPositionsError } = await supabaseAdmin.from("position_tb").select("*");

                        if(getPositions) return {status: 200, candidates, positions: getPositions, session};
                        else if(getPositionsError) return {status: 402, msg: getPositionsError.message};
                    
                    }else if(candidatesError) return {status: 402, msg: candidatesError.message};             

                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");

                };

            }else if(userError) throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            
        }else throw redirect(302, "/Login?You-must-login");

    }else {
        throw redirect(302, "/Login?You-must-login");
    };
    
};

export const actions: Actions = {

    createCandidate: async ({request, locals: {supabaseAdmin, supabase, getSession}, cookies}) =>
    {
       
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();
        
        try {
            const result = createCandidateSchema.parse(formData);
            const position: POSITION_TB = JSON.parse(result.position);
            if(session){
                console.log(session)
                let sessionCookie: Session | undefined;
        
                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
        
                if(cookie){
        
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
        
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                    if(user){
        
                        if(session.user.role ===  user.role){
                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                            
                            const { error: createCandidateError } = await supabaseAdmin.from("candidates_tb").insert([{
                                position: position.description,
                                name: result.candidateName,
                                agenda: result.agenda,
                                organization: result.organization, 
                                position_id: Number(position.id),
                                max_votes: position.max_votes,
                            }]);

                            if(createCandidateError) return fail(402, {msg: createCandidateError.message});
                            else {
                                const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*");

                                if(candidates) return fail(200, {msg: `Candidate ${result.candidateName} Created Succcessfully.` ,candidates, session});
                                else if(candidatesError) return fail(402, {msg: candidatesError.message});
                            };
                                       
                        }else{
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
        
                        };
        
                    }else if(userError) throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    
                }else throw redirect(302, "/Login?You-must-login");
        
            }else {
                throw redirect(302, "/Login?You-must-login");
            };

        } catch (error) {
            const zodError = error as ZodError;
            const { fieldErrors } = zodError.flatten();

            return fail(403, {errors: fieldErrors})
        }
    },

    deleteCandidate: async ({request, locals: {supabaseAdmin, supabase, getSession}, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        try {
            const result = deleteCandidateSchema.parse(formData);
            const candidate: CANDIDATES_TB = JSON.parse(result.candidate);
    
            if(session){
        
                let sessionCookie: Session | undefined;
        
                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
        
                if(cookie){
        
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
        
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                    if(user){
        
                        if(session.user.role ===  user.role){
                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                        
                            const { error:deleteCandidateError } = await supabaseAdmin.from("candidates_tb").delete().eq("id", candidate.id);
                            if(deleteCandidateError) return fail(402, {msg: deleteCandidateError.message});
                            else{
                                const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*");
                                if(candidates) return fail(200, {msg: `Candidate ${candidate.name} Successfuully Deleted`, candidates, session});
                                else if(candidatesError) return fail(402, {msg: candidatesError.message});
                            };
        
                        }else{
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                        };
        
                    }else if(userError) throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    
                }else throw redirect(302, "/Login?You-must-login");
        
            }else {
                throw redirect(302, "/Login?You-must-login");
            };

        } catch (error) {
            const zodError = error as ZodError;

            const {fieldErrors} = zodError.flatten();

            return fail(403, {errors: fieldErrors});
        }
    },

    updateCandidate: async ({request, locals: {supabaseAdmin, supabase, getSession}, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();
        try {
            const result = updateCandidateSchema.parse(formData);
            const position: POSITION_TB = JSON.parse(result.position);
            const candidate: CANDIDATES_TB = JSON.parse(result.candidate);

            if(session){
        
                let sessionCookie: Session | undefined;
        
                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
        
                if(cookie){
        
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
        
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                    if(user){
        
                        if(session.user.role ===  user.role){
                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                            
                            const {error: updateCandidateError} = await supabaseAdmin.from("candidates_tb").update([{
                                name: result.candidateName,
                                agenda: result.agenda,
                                organization: result.organization,
                                position: position.description,

                            }]).eq("id", candidate.id);
                            
                            if(updateCandidateError) return fail(402, {msg: updateCandidateError.message});
                            else{
                                const {data:candidates, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*");

                                if(candidates) return fail(200, {msg: `Candidate ${candidate.name} Successfully Updated to ${result.candidateName}.`, candidates, session});
                                else if(candidatesError) return fail(402, {msg: candidatesError.message});
                            }
                            
                        }else{
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                        };
        
                    }else if(userError) throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    
                }else throw redirect(302, "/Login?You-must-login");
        
            }else {
                throw redirect(302, "/Login?You-must-login");
            };


        } catch (error) {
            const zodError = error as ZodError;
            const {fieldErrors} = zodError.flatten();

            return fail(403, {errors: fieldErrors});
        }
    }
};