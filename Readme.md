# Library Management System

# Video URL: https://youtu.be/Cb6PLdlwx6Y?si=EanLHGetnyDdyeZB
# Github URL: https://github.com/nouman-rehman-khan/library-management-system

A complete library management system built with Node.js, Express, MySQL, and React.

## Project Structure

The project is divided into two main parts:

### Server (Backend)
- Built with Node.js, Express, and MySQL
- RESTful API design
- Complete CRUD operations for all entities

### Client (Frontend)
- Built with React, Vite, and Material UI
- User-friendly interface
- Modern, responsive design

## Features

- **Book Management**: Add, edit, view, and delete books
- **Member Management**: Manage library members and their status
- **Loan Management**: Issue books, track returns, and manage fines
- **Author Management**: Manage book authors and their bibliography
- **Category Management**: Organize books in hierarchical categories
- **Publisher Management**: Keep track of publishers and their books
- **Dashboard**: Quick overview of library statistics

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Database Setup
1. Create a database named `library_management_system_db`
2. Run the SQL scripts in this order:
   ```
   server/sql/create.sql
   server/sql/insert.sql
   ```

### Backend Setup
1. Navigate to the server directory
   ```
   cd server
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file with the following content (modify as needed):
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=library_management_system_db
   ```
4. Start the server
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the client directory
   ```
   cd client
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Start the development server
   ```
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`

## Usage

- **Dashboard**: View library statistics and quick links
- **Books**: Manage the book inventory
- **Members**: Manage library members 
- **Loans**: Handle book borrowing and returns
- **Authors**: Manage book authors
- **Categories**: Organize books by category
- **Publishers**: Manage book publishers

## API Endpoints

### Books
- `GET /api/books`: Get all books
- `GET /api/books/:id`: Get a book by ID
- `POST /api/books`: Create a new book
- `PUT /api/books/:id`: Update a book
- `DELETE /api/books/:id`: Delete a book

### Members
- `GET /api/members`: Get all members
- `GET /api/members/:id`: Get a member by ID
- `POST /api/members`: Create a new member
- `PUT /api/members/:id`: Update a member
- `DELETE /api/members/:id`: Delete a member

### And similar endpoints for Authors, Categories, Publishers, and Loans

## Technologies Used

### Backend
- Node.js
- Express.js
- MySQL
- mysql2 (for database connection)
- cors (for cross-origin requests)
- dotenv (for environment variables)

### Frontend
- React
- Vite
- Material UI
- React Router
- Axios (for API requests)

## License

This project is licensed under the MIT License.
