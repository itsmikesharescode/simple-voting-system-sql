import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import {z, ZodError} from "zod";
import type { Session } from "@supabase/supabase-js";

const loginSchema = z.object({
    email: z.string()
    .email({message: "Must enter a valid email."}),

    password: z.string()
    .min(1, {message: "Must enter a password."}),
    
})

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
                    if(user.role === "53UD2jbmvmR5He81zs3lhuYAl4SrR8"){
                        throw redirect(302, "/Admin/Dashboard");

                    }else if(user.role === "authenticated"){
                        throw redirect(302, "/Voter");

                    };
                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                }

            }else if(userError){
                console.log(userError.message);
            };
            
        };

    };

};

export const actions: Actions = {

    login: async ( {locals: {supabase}, request} ) =>
    {
        const formData = Object.fromEntries(await request.formData());
      
        try {

            const result = loginSchema.parse(formData);

            const {data: {session}, error: err} = await supabase.auth.signInWithPassword({
                email: result.email,
                password: result.password,
            })

            if(session)return fail(200, { msg: "Login Success.", session });
            else if(err) return fail(402, { msg: err.message });
            

        } catch (error) {
            const zodError = error as ZodError;
            const { fieldErrors } = zodError.flatten();

            return fail(403, { errors: fieldErrors });
        }

        
    }
};