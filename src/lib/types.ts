
export type POSITION_TB = {
    id: number
    created_at: string
    description: string
    max_votes: number
    
}

export type CANDIDATES_TB = {
    id: number
    created_at: string
    position: string
    name: string
    agenda: string
    organization: string
    position_id: number
    max_votes: number
}

export type VOTED_CANDIDATE_TB = {
    id: number
    candidate_id: number
    created_at: string
    vector_uid: string
    position: string
}
