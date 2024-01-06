import {writable, type Writable} from "svelte/store";
import { getContext, setContext } from "svelte";
import type { Session, User } from "@supabase/supabase-js";
import type { CANDIDATES_TB, POSITION_TB, VOTED_CANDIDATE_TB } from "./types";

//navigation store management neutral
export const navigationStore = writable({
    activeItem: "",

    adminNav: [
        {
            header: "REPORTS",
            selections: [
                {
                    title: "Dashboard",
                    url: "/Admin/Dashboard"
                },

                {
                    title: "Votes",
                    url: "/Admin/Votes"
                },
            ]
        },

        {
            header: "MANAGE",
            selections: [
                {
                    title: "Voters",
                    url: "/Admin/Voters"
                },

                {
                    title: "Positions",
                    url: "/Admin/Positions"
                },

                {
                    title: "Candidates",
                    url: "/Admin/Candidates"
                },
            ]
        },
    ],

    defaultNav: [
        {
            header: "CREATED BY MIKE",
            selections: [
                {
                    title: "SUBSCRIBE",
                    url: "/"
                },

                {
                    title: "@mikeSharesCode",
                    url: "/"
                },
            ]
        },
    ],

    loading: false,
});

export const sessionStore = writable<Session | null>();

//voters list store management admin
export const votersListComp = writable(0.1);
export const userList = writable<User[] | null>(null);
export const showCreateAccount = writable(false);
export const votersComparison = writable({
    showDelete: 0.1,
    showUpdate: 0.1
})

//positions store management admin
export const showCreatePositions = writable(false);
export const positionArray = writable<POSITION_TB[] | null>(null);

export const positionComparison = writable({
    deleteComparison: 0.1,
    updateComparison: 0.1,
})

//candidate store management admin
export const showCreateCandidate = writable(false);
export const candidatesArray = writable<CANDIDATES_TB[] | null>(null);
export const candidateComparison = writable({
    showDetails: 0.1,
    showDelete: 0.1,
    showUpdate: 0.1
})

//votes store  management admin
export const adminPositionsArray = writable<POSITION_TB[] | null>(null);
export const adminCandidatesArray = writable<CANDIDATES_TB[] | null>(null);
export const adminVotedCandidatesArray = writable<VOTED_CANDIDATE_TB[] | null>(null);

//voters point of view store management
export const votersCandidatesArray = writable<CANDIDATES_TB[] | null>(null);
export const votersPositionsArray = writable<POSITION_TB[] | null>(null);
export const votersCandidatesComparison = writable({
    showVote: 0.1,
    showDetails: 0.1,
})
export const votersVotedCandidates = writable<VOTED_CANDIDATE_TB[] | null>(null);
export const showHistory = writable(false);

export const votedHistoryArray = writable<{ candidates_tb: { name: string, position: string} }[] | null>(null);


