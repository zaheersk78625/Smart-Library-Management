/**
 * Smart Library Management System Types
 */

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  reviews: BookReview[];
  coverUrl: string;
  synopsis: string;
}

export interface BookReview {
  id: string;
  username: string;
  rating: number;
  text: string;
  date: string;
}

export interface BorrowRecord {
  id: string;
  userId: string;
  username: string;
  bookId: string;
  bookTitle: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  fineAmount: number;
  status: 'issued' | 'returned' | 'overdue';
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  activeUsers: number;
  issuedBooks: number;
  totalFines: number;
  overdueCount: number;
  categoryDistribution: { name: string; value: number }[];
  borrowTrends: { date: string; count: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  date: string;
  read: boolean;
}
