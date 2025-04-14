-- insert.sql
USE library_management_system_db;
INSERT INTO Publishers (PublisherName, Address, ContactInfo, YearEstablished) VALUES
('Penguin Random House', '1745 Broadway, New York, NY 10019', 'contact@penguinrandomhouse.com', 1925),
('HarperCollins', '195 Broadway, New York, NY 10007', 'info@harpercollins.com', 1817),
('Simon & Schuster', '1230 Avenue of the Americas, New York, NY 10020', 'customer.service@simonandschuster.com', 1924),
('Macmillan Publishers', '120 Broadway, New York, NY 10271', 'info@macmillan.com', 1843),
('Hachette Book Group', '1290 Avenue of the Americas, New York, NY 10104', 'customer.service@hbgusa.com', 1837);

INSERT INTO Categories (CategoryName, Description, ParentCategoryID) VALUES
('Fiction', 'Literary works created from the imagination', NULL),
('Non-Fiction', 'Informational works based on facts', NULL),
('Science Fiction', 'Fiction dealing with imagined scientific or technological advances', 1),
('Fantasy', 'Fiction involving magical or supernatural elements', 1),
('Mystery', 'Fiction dealing with solving a crime or puzzle', 1),
('Biography', 'Non-fiction narrative of a person''s life', 2),
('History', 'Study of past events', 2),
('Science', 'Study of the physical and natural world', 2);

INSERT INTO Authors (FirstName, LastName, Biography, Nationality) VALUES
('J.K.', 'Rowling', 'British author best known for the Harry Potter series', 'British'),
('Stephen', 'King', 'American author of horror, supernatural fiction, suspense, and fantasy novels', 'American'),
('Agatha', 'Christie', 'English writer known for her detective novels', 'British'),
('George R.R.', 'Martin', 'American novelist best known for A Song of Ice and Fire', 'American'),
('Jane', 'Austen', 'English novelist known for her six major novels', 'British'),
('Ernest', 'Hemingway', 'American novelist, short-story writer, and journalist', 'American'),
('Toni', 'Morrison', 'American novelist, essayist, and professor', 'American'),
('Haruki', 'Murakami', 'Japanese writer whose works have been translated into 50 languages', 'Japanese'),
('Gabriel', 'García Márquez', 'Colombian novelist and short-story writer', 'Colombian'),
('Virginia', 'Woolf', 'English writer and modernist', 'British');

INSERT INTO Members (FirstName, LastName, Email, Phone, JoinDate, MembershipStatus) VALUES
('John', 'Smith', 'john.smith@example.com', '123-456-7890', '2023-01-15', 'Active'),
('Sarah', 'Johnson', 'sarah.j@example.com', '987-654-3210', '2023-02-20', 'Active'),
('Michael', 'Williams', 'michael.w@example.com', '555-123-4567', '2023-03-10', 'Active'),
('Emily', 'Jones', 'emily.jones@example.com', '444-555-6666', '2023-04-05', 'Active'),
('David', 'Brown', 'david.brown@example.com', '777-888-9999', '2023-05-12', 'Suspended'),
('Jennifer', 'Davis', 'jennifer.d@example.com', '111-222-3333', '2023-06-18', 'Active'),
('Robert', 'Miller', 'robert.m@example.com', '222-333-4444', '2023-07-22', 'Expired'),
('Lisa', 'Wilson', 'lisa.wilson@example.com', '333-444-5555', '2023-08-30', 'Active'),
('James', 'Taylor', 'james.t@example.com', '666-777-8888', '2023-09-14', 'Active'),
('Maria', 'Anderson', 'maria.a@example.com', '888-999-0000', '2023-10-05', 'Active');

INSERT INTO Books (Title, ISBN, PublicationYear, CategoryID, PublisherID, AvailableCopies) VALUES
('Harry Potter and the Philosopher''s Stone', '9780747532743', 1997, 4, 1, 5),
('The Shining', '9780385121675', 1977, 5, 2, 3),
('Murder on the Orient Express', '9780062693662', 1934, 5, 3, 2),
('A Game of Thrones', '9780553103540', 1996, 4, 4, 4),
('Pride and Prejudice', '9780141439518', 1813, 1, 5, 6),
('The Old Man and the Sea', '9780684801223', 1952, 1, 1, 1),
('Beloved', '9781400033416', 1987, 1, 2, 2),
('Norwegian Wood', '9780375704024', 1987, 1, 3, 3),
('One Hundred Years of Solitude', '9780060883287', 1967, 1, 4, 1),
('Mrs Dalloway', '9780156628709', 1925, 1, 5, 2),
('A Brief History of Time', '9780553380163', 1988, 8, 1, 3),
('Steve Jobs', '9781451648539', 2011, 6, 2, 4);

INSERT INTO BookAuthors (BookID, AuthorID) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(11, 2),
(12, 7);

INSERT INTO Loans (BookID, MemberID, LoanDate, DueDate, ReturnDate, FineAmount) VALUES
(1, 1, '2024-01-15', '2024-02-05', '2024-02-02', 0.00),
(2, 2, '2024-01-20', '2024-02-10', '2024-02-15', 5.00),
(3, 3, '2024-01-25', '2024-02-15', NULL, 0.00),
(4, 4, '2024-02-01', '2024-02-22', '2024-02-20', 0.00),
(5, 5, '2024-02-05', '2024-02-26', NULL, 0.00),
(6, 6, '2024-02-10', '2024-03-03', '2024-03-01', 0.00),
(7, 7, '2024-02-15', '2024-03-08', NULL, 0.00),
(8, 8, '2024-02-20', '2024-03-13', '2024-03-10', 0.00),
(9, 9, '2024-02-25', '2024-03-18', NULL, 0.00),
(1, 2, '2024-03-01', '2024-03-22', NULL, 0.00),
(2, 3, '2024-03-05', '2024-03-26', NULL, 0.00),
(3, 4, '2024-03-10', '2024-03-31', NULL, 0.00);