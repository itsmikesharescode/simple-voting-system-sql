import { fail, type Actions, redirect } from "@sveltejs/kit";
import {ZodError, z} from "zod";
import type { PageServerLoad } from "../$types";
import type { Session } from "@supabase/supabase-js";

const updatePasswordSchema = z.object({
    newPassword: z.string()
    .min(6, {message: "Choose a strong password"})
    .max(16, {message: "Max characters for password is 16."}),
    confirmNewPassword: z.string()


});

export const load: PageServerLoad = async ({url, cookies, locals: { supabase }}) => {

    const {data:{session}, error:err} = await supabase.auth.verifyOtp({token_hash: url.search.slice(1), type: "email"});

    if(!session) throw redirect(302, "/Login?You-have-an-invalid-token-this-route-is-sensitive.");
    
};

export const actions: Actions = {
    updatePassword: async ({request, cookies, locals: {supabase, getSession}}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();
        try {
            const result = updatePasswordSchema.parse(formData);

            if(result.confirmNewPassword === result.newPassword){
                if(session){

                    let sessionCookie: Session | undefined;
            
                    const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
            
                    if(cookie){
            
                        sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
            
                        const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
            
                        if(user){
                            
                            if(session.user.role === user.role){
                                
                                const {data:{user}, error:updatePassError} = await supabase.auth.updateUser({ password: result.newPassword });                               
                                if(user) return fail(200, {msg: "You have successfully updated your password.!"});
                                else if(updatePassError) return fail(402, {msg: updatePassError.message});
                                

                            }else{
                                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                            }
            
                        }else if(userError){
                            cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                            throw redirect(302, "/Login?You-need-to-Login");
                        };
                        
                    };
            
                }else {
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?InvalidToken");
                };
            }else return fail(402, {msg: "New password not same."});

        } catch (error) {
            const zodError = error as ZodError;
            const {fieldErrors} = zodError.flatten();

            return fail(403, {errors: fieldErrors});
        }
    }
};