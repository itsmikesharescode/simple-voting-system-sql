import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import {ZodError, z} from "zod";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import type { POSITION_TB } from "$lib/types";

const createPositionSchema = z.object({
    description: z.string()
    .min(4, {message: "Must enter a valid description example. President"})
    .max(30, {message: "Max character allowed is 30."}),
    
    maxVotes: z.string()
    .min(1, {message: "Must enter the maximum vote required for description."}),

});

const deletePostSchema = z.object({
    position: z.string(),

    inputCompar: z.string().refine( value => value === "I agree, this position should be deleted", {message: "Input must match the instructions."})
    
})

const updatePostSchema = z.object({
    description: z.string()
    .min(1, {message: "Description must not be empty."})
    .max(40, {message: "Maximum character for description is 40."}),

    maxVotes: z.string()
    .min(1, {message: "Max votes must not be empty."}),

    targetId: z.string()
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
                
                    const {data:getPositions, error:getPositionsError} = await supabaseAdmin.from("position_tb").select("*");
                    
                    if(getPositions) return {status: 200, positions: getPositions, session};
                    else if(getPositionsError) return {status: 402, msg: getPositionsError.message};

                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                }

            }else if(userError){
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            };
            
        }else throw redirect(302, "/Login?You-must-login");

    }else {
        throw redirect(302, "/Login?You-must-login");
    }
    
};

export const actions: Actions = {

    createPost: async ({request, locals: { supabaseAdmin, supabase, getSession }, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        try {
            const result = createPositionSchema.parse(formData);

            if(session){
                let sessionCookie: Session | undefined;

                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");

                if(cookie){
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);

                    if(user){

                        if(session.user.role ===  user.role){

                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");

                            const {error:insertPositionError} = await supabaseAdmin.from("position_tb").insert([{
                                description: result.description,
                                max_votes: Number(result.maxVotes),
                            }]);

                            if(insertPositionError) return fail(402, {msg: insertPositionError.message});
                            else{
                                const {data:getPositions, error:getPositionsError} = await supabaseAdmin.from("position_tb").select("*");

                                if(getPositionsError) return fail(402, {msg: getPositionsError.message});
                                else return fail(200, {msg: "Position Created", positions: getPositions, session });
                            }
                                       
                        }else{
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                        };
        
                    }else if(userError){
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    };

                }else throw redirect(302, "/Login?You-must-login");
                
            }else throw redirect(302, "/Login?You-must-login");

        } catch (error) {
            const zodError = error as ZodError;
            const { fieldErrors } = zodError.flatten();

            return fail(403, { errors: fieldErrors });
        }
    },

    deletePost: async ({request, locals: {supabaseAdmin, supabase, getSession}, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        try {
            const result = deletePostSchema.parse(formData);
            const position: POSITION_TB = JSON.parse(result.position);
            if(session){
        
                let sessionCookie: Session | undefined;
        
                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
        
                if(cookie){
        
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
        
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                    if(user){
                       
                        if(session.user.role ===  user.role){
                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                            
                            const { error:deletePositionError } = await supabaseAdmin.from("position_tb").delete().eq("id", Number(position.id));

                            if(deletePositionError) return fail(402, {msg: deletePositionError.message});
                            else{
                                const {data:getPositions, error:getPositionsError} = await supabaseAdmin.from("position_tb").select("*");

                                if(getPositions) return fail(200, {msg: `Position ${position.description} Successfully Deleted.`, positions: getPositions, session});
                                else if(getPositionsError) return fail(402, {msg: getPositionsError.message});
                                
                            };
                            
                        }else{
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                        }
        
                    }else if(userError){
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    };
                    
                }else throw redirect(302, "/Login?You-must-login");
            }

        } catch (error) {
            const zodError = error as ZodError;
            const {fieldErrors} = zodError.flatten();
    
            return fail(403, {errors: fieldErrors});
        }
    },

    updatePost: async ({request, locals: { supabaseAdmin, supabase, getSession }, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();
        try {
            const result = updatePostSchema.parse(formData);

            if(session){
        
                let sessionCookie: Session | undefined;
        
                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
        
                if(cookie){
        
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
        
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                    if(user){
                       
                        if(session.user.role ===  user.role){
                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                            
                            const { error: updatePositionError } = await supabaseAdmin.from("position_tb").update([{
                                description: result.description,
                                max_votes: result.maxVotes,
                            }]).eq("id", Number(result.targetId));

                            if(updatePositionError) return fail(402, {msg: updatePositionError.message});
                            else{
                                const {data: getPositions, error: getPositionsError} = await supabaseAdmin.from("position_tb").select("*");

                                if(getPositions) return fail(200, {msg: `Position ${result.description} Successfully Updated.`, positions: getPositions, session});
                                else if(getPositionsError) return fail(402, {msg: getPositionsError.message});
                            }
                            
                        }else{
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                        }
        
                    }else if(userError){
                        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                        throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                    };
                    
                }else throw redirect(302, "/Login?You-must-login");
            };

        } catch (error) {
            const zodError = error as ZodError;
            const {fieldErrors} = zodError.flatten();

            return fail(403, {errors: fieldErrors});

        }
        
    }
};