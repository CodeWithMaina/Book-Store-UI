import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



export const bookApi = createApi({
    reducerPath: "bookApi",
    baseQuery: fetchBaseQuery({baseUrl:"http://localhost:5000/"}),
    tagTypes: ['Books'],
    endpoints:(builder)=>({
        //get all books
        getAllBooks: builder.query({
            query: ()=> "books",
            providesTags:['Books']
        }),
        //delete app books
        deleteBookById: builder.mutation({
            query: (bookId)=> ({
                url: `book/${bookId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Books']
        }),
        //Adding a book
        addingBook: builder.mutation({
            query: (AddBookPayload)=> ({
                url: 'book',
                method: 'POST',
                body: AddBookPayload,
                headers: {
                    'Content-Type': 'application/json',
                }
            }),
            invalidatesTags: ['Books'],
        }),
        //Updating Book
        updateBook: builder.mutation({
            query: ({ bookId, ...updateBookPayload }) => ({
                url: `books/${bookId}`,
                method: 'PUT',
                body: updateBookPayload
            }),
            invalidatesTags: ['Books']
        }),
        //Get by name
        getBooksByName: builder.query({
            query: ({ search}) => ({ 
                url: `books/search/?search=${search}`
            }),           
        }),
    })
})
