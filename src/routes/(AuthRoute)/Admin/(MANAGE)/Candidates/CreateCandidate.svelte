<script lang="ts">
	import { enhance } from "$app/forms";
	import { adminCandidatesArray, candidatesArray, sessionStore, showCreateCandidate } from "$lib";
	import Button from "$lib/Components/Button.svelte";
	import type { CANDIDATES_TB, POSITION_TB } from "$lib/types";
	import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
	import type { Session } from "@supabase/supabase-js";
	import type { SubmitFunction } from "@sveltejs/kit";
    import { scale } from "svelte/transition";

    const toastStore = getToastStore();

    const createToast = (msg: string, error: boolean) =>
    {
        const t: ToastSettings = {
            message: `${msg}`,
            background: `text-white ${error ? "bg-red-500" : "bg-green-500"}`,
        };
        toastStore.trigger(t);
    }

    export let positions: POSITION_TB[] | null;

    interface CreateCandidateErrorTypes {
        positions: string[]
        candidateName: string[]
        organization: string[]
        agenda: string[]
    }

    let createCandidateInputErr: CreateCandidateErrorTypes | null = null;

    let loader = false;

    type CreateCandidateNews = {
        status: number
        type: string
        data: {
            msg: string
            session: Session
            candidates: CANDIDATES_TB[]
            errors: CreateCandidateErrorTypes
        }
    }

    const createCandidateNews: SubmitFunction = async () =>
    {
        loader = true;

        return async ({result, update}) =>
        {

            const {status, data: {msg, session, candidates, errors}} = result as CreateCandidateNews;

            switch (status) {
                case 200:
                    sessionStore.set(session);
                    adminCandidatesArray.set(candidates);
                    createToast(msg, false);
                    loader = false;
                    showCreateCandidate.set(false);
                    update();
                    break;

                case 402:
                    createToast(msg, true);
                    loader = false;
                    update();
                    break;

                case 403:
                    createCandidateInputErr = errors;
                    loader = false;
                    update();
                    break;

                default:
                    break;
            }

        }
    }


</script>
{#if $showCreateCandidate}
    <div class="fixed left-0 right-0 top-0 bottom-0 bg-[#000000db] p-2">

        
        <form method="POST" action="?/createCandidate" use:enhance={createCandidateNews}  class="bg-slate-500  dark:bg-black shadow-sm shadow-white  sm:max-w-xl mx-auto mt-[10vh] flex flex-col gap-4 p-4 rounded-xl" transition:scale>
            <h1 class="font-bold text-center">Create Candidate</h1>

            <div class="flex flex-col gap-2 text-black dark:text-white">
                <label>
                    <p>Positions:</p>
                    <select name="position" class="select text-black dark:text-white">
        
                        {#each positions ?? [] as position }
                            <option value={JSON.stringify(position)} >{position.description}</option>
                            
                        {/each}
        
                    </select>
                    {#each createCandidateInputErr?.positions ?? [] as error}
                        <p class="text-red-900 font-bold text-xs">{error}</p>
                    {/each}
                </label>
        
                <label>
                    <p>Candidate Name:</p>
                    <input name="candidateName" type="text" class="input" />
                    {#each createCandidateInputErr?.candidateName ?? [] as error}
                        <p class="text-red-900 font-bold text-xs">{error}</p>
                    {/each}
                </label>
        
                <label>
                    <p>Organization:</p>
                    <input name="organization" type="text" class="input" />
                    {#each createCandidateInputErr?.organization ?? [] as error}
                        <p class="text-red-900 font-bold text-xs">{error}</p>
                    {/each}
                </label>
        
                <label>
                    <p>Agenda:</p>
                    <textarea name="agenda" class="textarea"></textarea>
                    {#each createCandidateInputErr?.agenda ?? [] as error}
                        <p class="text-red-900 font-bold text-xs">{error}</p>
                    {/each}
                </label>
            </div>

            

            <div class="flex gap-1 items-center ">
                <Button type="button" title="Click, to cancel creating candidate." style="w-full bg-red-500 p-2 text-white rounded-xl" name="Cancel" on:click={ () => $showCreateCandidate = false} />
                <Button style="w-full bg-green-500 p-2 text-white rounded-xl" title="Click, to create candidate." name="Create" {loader} loader_name="Creating."/>
            </div>
        </form>
        

    </div>
{/if}