import type { POSITION_TB } from "$lib/types";
import { json, type RequestHandler } from "@sveltejs/kit";



export const POST: RequestHandler = async ({ request, locals: { supabase, supabaseAdmin }}) =>
{
    const { logout } = await request.json() as {logout: string}

    if(logout === "req for logout"){
        const { error: err } = await supabase.auth.signOut();

        if(!err){
            return json({status: 200, msg: "Logout Success"})
        }
    }

    return json({status: 402, msg: "Invalid Parameters"});
}