import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import {z, ZodError} from "zod";
import type { Session } from "@supabase/supabase-js";

const registerSchema = z.object({
    fName: z.string()
    .min(1, {message: "Must enter a valid first name."})
    .max(20, {message: "Max character for first name is 20."})
    .trim(),

    mName: z.string()
    .min(1, {message: "Must enter a valid middle name."})
    .max(20, {message: "Max character for middle name is 20."})
    .trim(),

    lName: z.string()
    .min(1, {message: "Must enter a valid last name."})
    .max(20, {message: "Max character for last name is 20."})
    .trim(),

    email: z.string()
    .email({message: "Must enter a valid email."}),

    password: z.string()
    .min(6, {message: "Provide a strong password."})
    .max(30, {message: "Max character for password is 30."}),

    confirmPassword: z.string(),
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
    signUp: async ( {locals: {supabase, supabaseAdmin}, request } ) =>
    {
        const formData = Object.fromEntries(await request.formData());

        try {
            const result = registerSchema.parse(formData);

            if(result.confirmPassword === result.password){

                const { data: {session}, error: signUpError} = await supabase.auth.signUp({
                    email: result.email,
                    password: result.password,

                    options: {
                        data: {
                            name: `${result.lName}, ${result.fName} ${result.mName}`,
                            whoareyou: "MzBXKFX2jc62HlWn5Pkb7A52nrWdPn"
                        }
                    },

                });
                
                if(session){
                    const {error:insertUserError} = await supabase.from("users_list").insert([{uid: session.user.id}]);
                    if(insertUserError) {
                        const { error:deleteUser } = await supabaseAdmin.auth.admin.deleteUser(session.user.id);
                        if(deleteUser) return fail(402, {msg: "There is a problem creating account are you exploiting?"});
                    }else return fail(200, { msg: "Account Created", session });
                }else if (signUpError) return fail(402, { msg: signUpError.message });
                
            }else{
                return fail(402, {msg: "Password not same."});
            }      
            
        } catch (error) {
            const zodError = error as ZodError;
            const { fieldErrors } = zodError.flatten();

            console.log(fieldErrors);

            return fail(403, { errors: fieldErrors });
        }
    }
};