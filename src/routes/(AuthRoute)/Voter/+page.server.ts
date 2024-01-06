import type { Session } from "@supabase/supabase-js";
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

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
                    }
                    
                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
                }

            }else if(userError){
                console.log(userError.message);
            };
            
        };

    }else {
        cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
        throw redirect(302, "/Login?You-need-to-Login");
    }

};