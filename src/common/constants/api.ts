export default {
  baseURL: process.env.REACT_APP_API_URL || 'https://trello-back.shpp.me/vitalii.lypovetsky/api/v1',
};

// export const api = createApi({
//   baseQuery: fetchBaseQuery({
//     baseUrl: process.env.REACT_APP_API_URL || 'https://trello-back.shpp.me/vitalii.lypovetsky/api/v1/',
//   }),
//   endpoints: (build) => ({
//     getAllBoards: build.query<IBoard[], void>({
//       query: () => 'boards',
//     }),
//     getBoardById: build.query<IBoard, number>({
//       query: (id) => `boards/${id}`,
//     }),
//     createBoard: build.mutation<IResultCreated, { title: string }>({
//       query: ({ title }) => ({ url: `boards`, method: 'POST', body: { title } }),
//     }),
//   }),
// });
//
// export const { useGetAllBoardsQuery, useGetBoardByIdQuery, useCreateBoardMutation } = api;
