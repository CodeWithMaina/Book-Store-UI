import { useForm } from "react-hook-form";
import { bookApi } from "../features/api/BookApi";
import { useState, useEffect } from "react";

// Add these interfaces for the toast system
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  timestamp: number;
}

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
  const [toasts, setToasts] = useState<Toast[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<BookFormInput>();

  const [deleteBook] = bookApi.useDeleteBookByIdMutation({});
  const [addBook] = bookApi.useAddingBookMutation({});
  const { data: bookData = [], isLoading } = bookApi.useGetAllBooksQuery({});
  const [updateBook] = bookApi.useUpdateBookMutation({});

  // Pre-fill form when editingBook changes
  useEffect(() => {
    if (editingBook) {
      setValue("bookTitle", editingBook.bookTitle);
      setValue("bookAuthorName", editingBook.bookAuthorName);
      setValue("bookGenre", editingBook.bookGenre);
      setValue("publishedYear", editingBook.publishedYear);
    }
  }, [editingBook, setValue]);

  // Auto-remove toasts after 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(toast => now - toast.timestamp < 3000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      timestamp: Date.now()
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleDelete = async (bookId: number) => {
    try {
      await deleteBook(bookId).unwrap();
      addToast("Book deleted successfully!", 'success');
      reset();
    } catch (error) {
      addToast("Failed to delete book", 'error');
      console.error(error);
    }
  };

  const handleEdit = (book: TBook) => {
    setEditingBook(book);
  };

  const onSubmit = async (data: BookFormInput) => {
    try {
      if (editingBook) {
        const updatedBookData = {
          bookId: editingBook.bookId,
          ...data,
          publishedYear: Number(data.publishedYear),
        };

        await updateBook(updatedBookData).unwrap();
        addToast("Book updated successfully!", 'success');
        setEditingBook(null);
        reset();
      } else {
        const payload = {
          ...data,
          publishedYear: Number(data.publishedYear),
        };

        if (isNaN(payload.publishedYear)) {
          throw new Error("Published year must be a valid number");
        }

        await addBook(payload).unwrap();
        addToast("Book added successfully!", 'success');
        reset();
      }
    } catch (error) {
      console.error("Complete error:", JSON.stringify(error, null, 2));
      addToast(
        error instanceof Error ? error.message : "Operation failed",
        'error'
      );
    }
  };

  // Toast component styles
  const toastStyles = {
    success: {
      background: "#F6FFED",
      border: "1px solid #B7EB8F",
      color: "#52C41A",
      icon: "✓"
    },
    error: {
      background: "#FFF2F0",
      border: "1px solid #FFCCC7",
      color: "#FF4D4F",
      icon: "✗"
    },
    warning: {
      background: "#FFFBE6",
      border: "1px solid #FFE58F",
      color: "#FAAD14",
      icon: "⚠"
    }
  };

  return (
    <div className="app">
      {/* Toast container */}
      <div className="toast-container" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            style={{
              padding: '12px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              ...toastStyles[toast.type],
              animation: 'fadeIn 0.3s ease-out',
              maxWidth: '300px'
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={{ fontWeight: 'bold' }}>{toastStyles[toast.type].icon}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

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

        <button type="submit">
          {editingBook ? "Update Book" : "Add Book"}
        </button>
        {editingBook && (
          <button
            type="button"
            onClick={() => {
              setEditingBook(null);
              reset();
            }}
            style={{ marginLeft: "8px", background: "#ccc" }}
          >
            Cancel
          </button>
        )}
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

      {/* Add some global styles for the toasts */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};