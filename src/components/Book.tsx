import { useForm } from "react-hook-form";
import { bookApi } from "../features/api/BookApi";
import { Toaster, toast } from "sonner";
import { useState } from "react";

interface BookFormInput {
  bookTitle: string;
  bookAuthorName: string;
  bookGenre: string;
  publishedYear: number;
}

interface TBook {
  bookId: number;
  bookTitle: string;
  bookAuthorName: string;
  bookGenre: string;
  publishedYear: number;
}
export const Book = () => {
  const [editingBook, setEditingBook] = useState<TBook | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormInput>();

  const [deleteBook] = bookApi.useDeleteBookByIdMutation({});
  const [addBook] = bookApi.useAddingBookMutation({});
  const { data: bookData = [], isLoading } = bookApi.useGetAllBooksQuery({});
  const [updateBook] = bookApi.useUpdateBookMutation({});

  const handleDelete = async (bookId: number) => {
    try {
      await deleteBook(bookId).unwrap();
      toast.success("Book Deleted Successfuly");
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (book: TBook) => {
    setEditingBook(book);
    reset();
  };

  const onSubmit = async (data: BookFormInput) => {
    try {
      if (editingBook) {
        const updatedBookData = {
          bookId: editingBook.bookId,
          bookTitle: editingBook.bookTitle,
          bookAuthorName: editingBook.bookAuthorName,
          bookGenre: editingBook.bookGenre,
          publishedYear: Number(editingBook.publishedYear),
        };

        await updateBook(updatedBookData).unwrap();
        toast.success("Book updated successfully 😎");
        setEditingBook(null);
        reset();
      } else {
        const payload = {
          bookTitle: data.bookTitle,
          bookAuthorName: data.bookAuthorName,
          bookGenre: data.bookGenre,
          publishedYear: Number(data.publishedYear),
        };

        if (isNaN(payload.publishedYear)) {
          throw new Error("Published year must be a valid number");
        }

        await addBook(payload).unwrap();
        toast.success("Book added successfully");
        reset();
      }
    } catch (error) {
      console.error("Complete error:", JSON.stringify(error, null, 2));
      toast.error("Failed to add book");
    }
  };
  return (
    <div className="app">
      <Toaster position="top-right" />
      <h3>Book Repositories</h3>
      <form className="book-form" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Book Name"
          {...register("bookTitle", { required: true })}
        />
        {errors.bookTitle && (
          <span style={{ color: "red" }}>Book Name is Required</span>
        )}
        <input
          type="text"
          placeholder="Author Name"
          {...register("bookAuthorName", { required: true })}
        />
        {errors.bookAuthorName && (
          <span style={{ color: "red" }}>Author Name is Required</span>
        )}
        <input
          type="number"
          placeholder="Book Year"
          {...register("publishedYear", { required: true })}
        />
        {errors.publishedYear && (
          <span style={{ color: "red" }}>Book Year is Required</span>
        )}
        <input
          type="text"
          placeholder="Book Genre"
          {...register("bookGenre", { required: true })}
        />
        {errors.bookGenre && (
          <span style={{ color: "red" }}>Book Genre is Required</span>
        )}

        <button type="submit">{editingBook ? 'Update Book' : 'Add Book'}</button>
      </form>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : bookData?.length === 0 ? (
        <div>No Books Available</div>
      ) : (
        <table className="book-table">
          <thead>
            <tr>
              <td>ID</td>
              <td>Book Name</td>
              <td>Book Year</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {bookData?.map((book: TBook) => (
              <tr key={book.bookId}>
                <td>{book.bookId}</td>
                <td>{book.bookTitle}</td>
                <td>{book.publishedYear}</td>
                <td>
                  <button onClick={() => handleDelete(book.bookId)}>
                    Delete
                  </button>
                  <button onClick={() => handleEdit(book)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
