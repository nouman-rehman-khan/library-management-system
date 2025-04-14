-- create.sql
CREATE DATABASE IF NOT EXISTS library_management_system_db;
USE library_management_system_db;

DROP TABLE IF EXISTS BookAuthors;
DROP TABLE IF EXISTS Loans;
DROP TABLE IF EXISTS Books;
DROP TABLE IF EXISTS Members;
DROP TABLE IF EXISTS Authors;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Publishers;

CREATE TABLE Publishers (
    PublisherID INT PRIMARY KEY AUTO_INCREMENT,
    PublisherName VARCHAR(255) NOT NULL,
    Address TEXT,
    ContactInfo VARCHAR(255),
    YearEstablished INT
);

CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    CategoryName VARCHAR(100) UNIQUE NOT NULL,
    Description TEXT,
    ParentCategoryID INT,
    FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL 
);

CREATE TABLE Authors (
    AuthorID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Biography TEXT,
    Nationality VARCHAR(100)
);

CREATE TABLE Members (
    MemberID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    JoinDate DATE NOT NULL,
    MembershipStatus ENUM('Active', 'Expired', 'Suspended') DEFAULT 'Active'
);

CREATE TABLE Books (
    BookID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(255) NOT NULL,
    ISBN VARCHAR(20) UNIQUE NOT NULL,
    PublicationYear INT,
    CategoryID INT,
    PublisherID INT,
    AvailableCopies INT NOT NULL DEFAULT 1,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL,
    FOREIGN KEY (PublisherID) REFERENCES Publishers(PublisherID) ON DELETE SET NULL
);

CREATE TABLE Loans (
    LoanID INT PRIMARY KEY AUTO_INCREMENT,
    BookID INT NOT NULL,
    MemberID INT NOT NULL,
    LoanDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    ReturnDate DATE,
    FineAmount DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (BookID) REFERENCES Books(BookID) ON DELETE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES Members(MemberID) ON DELETE CASCADE
);

CREATE TABLE BookAuthors (
    BookID INT,
    AuthorID INT,
    PRIMARY KEY (BookID, AuthorID),
    FOREIGN KEY (BookID) REFERENCES Books(BookID) ON DELETE CASCADE,
    FOREIGN KEY (AuthorID) REFERENCES Authors(AuthorID) ON DELETE CASCADE
);

CREATE INDEX idx_books_title ON Books(Title);
CREATE INDEX idx_authors_lastname ON Authors(LastName);
CREATE INDEX idx_members_lastname ON Members(LastName);
CREATE INDEX idx_loans_dates ON Loans(LoanDate, DueDate, ReturnDate);