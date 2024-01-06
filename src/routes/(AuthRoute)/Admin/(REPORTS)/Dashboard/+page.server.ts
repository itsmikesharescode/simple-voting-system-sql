import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { PostgrestError, Session } from "@supabase/supabase-js";
import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "$lib/types";

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
                    const {count:positionCount, error:positionsError} = await supabaseAdmin.from("position_tb").select("*", { count: 'exact', head: true });
                    if(positionCount){
                        // second get the candidates datas
                        const {count:candidatesCount, error:candidatesError} = await supabaseAdmin.from("candidates_tb").select("*", { count: 'exact', head: true });
                        
                        if(candidatesCount){
                            //third get the voted candidates datas
                            const {count:votedCount, error:allVotedCandidatesError} = await supabaseAdmin.from("voted_candidates_tb").select("*", { count: 'exact', head: true });
                            
                            if(votedCount){
                                const {count:usersCount, error:usersCountError} = await supabaseAdmin.from("users_list").select("*", {count: "exact", head: true});

                                if(usersCount) return {status: 200,usersCount, positionCount, candidatesCount, votedCount, session};
                                else if(usersCountError) return {status: 402, msg: usersCountError.message};
                                
                            
                            }else if(allVotedCandidatesError){

                                return {status: 402, msg: allVotedCandidatesError.message};

                            };

                        }else if(candidatesError){

                            return {status: 402, msg: candidatesError.message};

                        };

                    }else if(positionsError){

                        return {status: 402, msg: positionsError.message };

                    };

                }else{
                    cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                    throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");

                }

            }else if(userError){
                cookies.delete("sb-hhisseoyfiqnetufhdra-auth-token", {path: "/"});
                throw redirect(302, "/Login?ChangingTokenDetected-From-Mikey-hehehe");
            };
            
        };

    }else {
        throw redirect(302, "/Login?You-must-login");
    }
    
    
};