import { redirect, type Actions, fail } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import {ZodError, z} from "zod";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";

const createAccountSchema = z.object({
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
});

const deleteAccountSchema = z.object({
    targetId: z.string(),

    inputCompar: z.string().refine( value => value === "I agree, this account should be deleted", {message: "Input must match the instructions."})
});

const updateAccountSchema = z.object({
    targetId: z.string(),

    fName: z.string()
    .min(1, {message: "Must enter a valid new, first name."})
    .max(20, {message: "Max character for first name is 20."})
    .trim(),

    mName: z.string()
    .min(1, {message: "Must enter a valid new, middle name."})
    .max(20, {message: "Max character for middle name is 20."})
    .trim(),

    lName: z.string()
    .min(1, {message: "Must enter a valid new, last name."})
    .max(20, {message: "Max character for last name is 20."})
    .trim(),

    newPassword: z.string()
    .min(6, {message: "Provide a strong new, password."})
    .max(30, {message: "Max character for password is 30."}),

    confirmPassword: z.string(),
});

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
                
                    const {data:{users}, error:usersError} = await supabaseAdmin.auth.admin.listUsers();
                    
                    if(usersError) return {status: 402, msg: usersError.message};
                    else {
                        const results = users.filter(item => item.email !== "eviotamikejohnb@gmail.com");
                        return {status: 200, users: results, session}
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

    }else throw redirect(302, "/Login?You-must-login");
    
    
};

export const actions: Actions = {

    createAccount: async ({locals: {supabaseAdmin, getSession, supabase}, request, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        try {
            const result = createAccountSchema.parse(formData);

            if(result.password === result.confirmPassword){

                if(session){
                    let sessionCookie: Session | undefined;

                    const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");

                    if(cookie){
                        sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
                        const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);

                        if(user){

                            if(session.user.role ===  user.role){

                                if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");

                                const {data:adminCreate, error:adminCreateError} = await supabaseAdmin.auth.admin.createUser({
                                    email: result.email,
                                    password: result.password,
                                    user_metadata: {
                                        name: `${result.lName}, ${result.fName} ${result.mName}`,
                                        whoareyou: "MzBXKFX2jc62HlWn5Pkb7A52nrWdPn",
                                    },
                                    email_confirm: true,
                                });

                                if(adminCreate.user){
                                    const {data:{users}, error:allUsersError} = await supabaseAdmin.auth.admin.listUsers();
                                    
                                    if(users){
                                        const results = users.filter( item => item.email !== "eviotamikejohnb@gmail.com");

                                        return fail(200, {msg: "Account Created", allUsers: results});

                                    }else if(allUsersError) return fail(402, {msg: allUsersError.message});


                                }else if(adminCreateError) return fail(402, {msg: adminCreateError.message});
                                           
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
                
            }else{
                return fail(402, {msg: "Password not same."});
            }

        } catch (error) {
            const zodError = error as ZodError;
            const { fieldErrors } = zodError.flatten();

            return fail(403, {errors: fieldErrors});
        }
    },

    deleteAccount: async ({locals: {supabaseAdmin, supabase, getSession}, request, cookies}) => 
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        try {
            const result = deleteAccountSchema.parse(formData);

            if(session){
        
                let sessionCookie: Session | undefined;
        
                const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
        
                if(cookie){
        
                    sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
        
                    const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                    if(user){
        
                        if(session.user.role ===  user.role){
                            if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                        
                            const {error:deleteError} = await supabaseAdmin.auth.admin.deleteUser(result.targetId);
                            
                            if(deleteError) return fail(402, {msg: deleteError.message});
                            else{
                                const {data:{users}, error:usersError} = await supabaseAdmin.auth.admin.listUsers();

                                if(usersError) return fail(402, {msg: usersError.message});
                                else {                            
                                    const results = users.filter(item => item.email !== "eviotamikejohnb@gmail.com");
                                    return fail(200, {msg:"Voter Successfully Deleted", users: results, session});
                                }
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
        
            }else throw redirect(302, "/Login?You-must-login");
            
        } catch (error) {
            const zodError = error as ZodError;
            const {fieldErrors} = zodError.flatten();

            console.log(fieldErrors);

            return fail(403, {errors: fieldErrors});

        }
    },

    updateAcount: async ({locals: {supabaseAdmin, supabase, getSession}, request, cookies}) =>
    {
        const formData = Object.fromEntries(await request.formData());
        const session = await getSession();

        try {
            const result = updateAccountSchema.parse(formData);

            if(result.newPassword === result.confirmPassword){

                if(session){
                    let sessionCookie: Session | undefined;
        
                    const cookie = cookies.get("sb-hhisseoyfiqnetufhdra-auth-token");
            
                    if(cookie){
            
                        sessionCookie = JSON.parse(cookies.get("sb-hhisseoyfiqnetufhdra-auth-token") as string);
            
                        const {data: {user} , error: userError} = await supabase.auth.getUser(sessionCookie?.access_token);
                        if(user){
            
                            if(session.user.role ===  user.role){
                                if(user.role !== "53UD2jbmvmR5He81zs3lhuYAl4SrR8") throw redirect(302, "/Voter");
                            
                                const {error: updateUserError} = await supabaseAdmin.auth.admin.updateUserById(result.targetId, {
                                    user_metadata: {
                                        name: `${result.lName} ${result.fName} ${result.mName}`,
                                    },
                                    password: result.newPassword,
                                });

                                if(updateUserError) return fail(402, {msg: updateUserError.message});
                                else{
                                    const {data:allUsers, error:allUsersError} = await supabaseAdmin.auth.admin.listUsers();

                                    if(allUsers.users){
                                        const results = allUsers.users.filter(item => item.email !== "eviotamikejohnb@gmail.com");
                                        
                                        return fail(200, {msg: "Account Successfully Updated", users: results, session});

                                    }else if(allUsersError) fail(402, {msg: allUsersError.message});
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

                }else throw redirect(302, "/Login?You-must-login");

            }else{
                return fail(402, {msg: "Password not same."})
            }
 
        } catch (error) {
            const zodError = error as ZodError;
            const { fieldErrors } = zodError.flatten();
            return fail(403, {errors: fieldErrors});
        };
    },
};