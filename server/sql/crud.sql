-- crud.sql
USE library_management_system_db;

INSERT INTO Publishers (PublisherName, Address, ContactInfo, YearEstablished) 
VALUES ('Oxford University Press', '198 Madison Ave, New York, NY 10016', 'info@oup.com', 1586);

INSERT INTO Categories (CategoryName, Description, ParentCategoryID) 
VALUES ('Romance', 'Fiction focused on the romantic relationship between characters', 1);

INSERT INTO Authors (FirstName, LastName, Biography, Nationality) 
VALUES ('Neil', 'Gaiman', 'English author of short fiction, novels, and graphic novels', 'British');

INSERT INTO Members (FirstName, LastName, Email, Phone, JoinDate, MembershipStatus) 
VALUES ('Patricia', 'Garcia', 'patricia.g@example.com', '555-123-9876', CURDATE(), 'Active');

INSERT INTO Books (Title, ISBN, PublicationYear, CategoryID, PublisherID, AvailableCopies) 
VALUES ('American Gods', '9780062572110', 2001, 4, 2, 3);

INSERT INTO BookAuthors (BookID, AuthorID) 
VALUES (LAST_INSERT_ID(), (SELECT AuthorID FROM Authors WHERE FirstName = 'Neil' AND LastName = 'Gaiman'));

INSERT INTO Loans (BookID, MemberID, LoanDate, DueDate) 
VALUES (
    (SELECT BookID FROM Books WHERE ISBN = '9780062572110'),
    (SELECT MemberID FROM Members WHERE Email = 'patricia.g@example.com'),
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 21 DAY)
);
SELECT * FROM Books;

SELECT * FROM Members WHERE MembershipStatus = 'Active';

SELECT * FROM Loans WHERE ReturnDate IS NULL;

SELECT * FROM Authors WHERE Nationality = 'British';

SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, 
       CONCAT(a.FirstName, ' ', a.LastName) AS Author
FROM Books b
JOIN BookAuthors ba ON b.BookID = ba.BookID
JOIN Authors a ON ba.AuthorID = a.AuthorID
ORDER BY b.Title;

SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear, b.AvailableCopies,
       c.CategoryName, p.PublisherName
FROM Books b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
ORDER BY b.Title;

SELECT l.LoanID, l.LoanDate, l.DueDate, l.ReturnDate, l.FineAmount,
       CONCAT(m.FirstName, ' ', m.LastName) AS Member, 
       b.Title AS Book
FROM Loans l
JOIN Members m ON l.MemberID = m.MemberID
JOIN Books b ON l.BookID = b.BookID
ORDER BY l.LoanDate DESC;

SELECT l.LoanID, l.LoanDate, l.DueDate, DATEDIFF(CURDATE(), l.DueDate) AS DaysOverdue,
       CONCAT(m.FirstName, ' ', m.LastName) AS Member, 
       m.Email, m.Phone,
       b.Title AS Book
FROM Loans l
JOIN Members m ON l.MemberID = m.MemberID
JOIN Books b ON l.BookID = b.BookID
WHERE l.ReturnDate IS NULL AND l.DueDate < CURDATE()
ORDER BY DaysOverdue DESC;

SELECT b.BookID, b.Title, COUNT(l.LoanID) AS TimesLoaned
FROM Books b
JOIN Loans l ON b.BookID = l.BookID
GROUP BY b.BookID, b.Title
ORDER BY TimesLoaned DESC
LIMIT 5;

SELECT SUM(FineAmount) AS TotalFines FROM Loans WHERE FineAmount > 0;

SELECT m.MemberID, CONCAT(m.FirstName, ' ', m.LastName) AS Member, m.Email
FROM Members m
WHERE m.MemberID NOT IN (SELECT DISTINCT MemberID FROM Loans)
ORDER BY m.LastName, m.FirstName;

SELECT b.BookID, b.Title, b.AvailableCopies,
       CASE 
           WHEN b.AvailableCopies > 0 THEN 'Available'
           ELSE 'Unavailable'
       END AS Status
FROM Books b
ORDER BY b.Title;

SELECT b.BookID, b.Title, b.ISBN, b.PublicationYear,
       c.CategoryName, p.PublisherName
FROM Books b
JOIN BookAuthors ba ON b.BookID = ba.BookID
JOIN Authors a ON ba.AuthorID = a.AuthorID
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
WHERE a.FirstName = 'Stephen' AND a.LastName = 'King'
ORDER BY b.PublicationYear;

UPDATE Books 
SET AvailableCopies = 10 
WHERE ISBN = '9780747532743';

UPDATE Members 
SET Phone = '555-987-6543', Email = 'john.smith.updated@example.com' 
WHERE MemberID = 1;

UPDATE Members 
SET MembershipStatus = 'Active' 
WHERE MemberID = 7;

UPDATE Loans 
SET 
    ReturnDate = CURDATE(),
    FineAmount = CASE 
        WHEN CURDATE() > DueDate THEN DATEDIFF(CURDATE(), DueDate) * 0.50
        ELSE 0 
    END
WHERE LoanID = 3;

UPDATE Books 
SET AvailableCopies = AvailableCopies + 1 
WHERE BookID = (SELECT BookID FROM Loans WHERE LoanID = 3);

UPDATE Books 
SET CategoryID = (SELECT CategoryID FROM Categories WHERE CategoryName = 'Fantasy')
WHERE BookID = 6;

UPDATE Authors 
SET Biography = 'British author best known for the Harry Potter series. The books have sold more than 500 million copies worldwide.'
WHERE AuthorID = 1;

DELETE FROM Loans 
WHERE LoanID = 10;

DELETE FROM Members 
WHERE MemberID = 5;

DELETE FROM Books 
WHERE ISBN = '9781451648539';

DELETE FROM Authors 
WHERE AuthorID = 10;

START TRANSACTION;



SELECT AvailableCopies FROM Books WHERE BookID = 4 FOR UPDATE;



UPDATE Books SET AvailableCopies = AvailableCopies - 1 WHERE BookID = 4;



INSERT INTO Loans (BookID, MemberID, LoanDate, DueDate)
VALUES (4, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 21 DAY));

COMMIT;


CREATE OR REPLACE VIEW AvailableBooks AS
SELECT b.BookID, b.Title, b.ISBN, b.AvailableCopies,
       c.CategoryName, p.PublisherName,
       GROUP_CONCAT(CONCAT(a.FirstName, ' ', a.LastName) SEPARATOR ', ') AS Authors
FROM Books b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
LEFT JOIN Publishers p ON b.PublisherID = p.PublisherID
LEFT JOIN BookAuthors ba ON b.BookID = ba.BookID
LEFT JOIN Authors a ON ba.AuthorID = a.AuthorID
WHERE b.AvailableCopies > 0
GROUP BY b.BookID, b.Title, b.ISBN, b.AvailableCopies, c.CategoryName, p.PublisherName;

SELECT * FROM AvailableBooks;

CREATE OR REPLACE VIEW OverdueLoans AS
SELECT l.LoanID, l.LoanDate, l.DueDate, DATEDIFF(CURDATE(), l.DueDate) AS DaysOverdue,
       CONCAT(m.FirstName, ' ', m.LastName) AS Member, m.Email, m.Phone,
       b.Title AS Book, b.ISBN
FROM Loans l
JOIN Members m ON l.MemberID = m.MemberID
JOIN Books b ON l.BookID = b.BookID
WHERE l.ReturnDate IS NULL AND l.DueDate < CURDATE();

SELECT * FROM OverdueLoans ORDER BY DaysOverdue DESC;