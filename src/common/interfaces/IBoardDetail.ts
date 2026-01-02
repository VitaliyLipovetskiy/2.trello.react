export interface IBoardDetail {
    title: string,
    custom?: {
        background: string
    },
    lists: [{
        id: number,
        title: string,
        cards: [{
            id: number,
            title: string,
            color: string,
            description: string,
            custom: {
                deadline: string
            },
            users: number[],
            created_at: number
        }]
    }],
}