import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'

// Components
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

// Pages
import Dashboard from './pages/Dashboard'
import Books from './pages/books/Books'
import BookDetails from './pages/books/BookDetails'
import AddBook from './pages/books/AddBook'
import EditBook from './pages/books/EditBook'
import Members from './pages/members/Members'
import MemberDetails from './pages/members/MemberDetails'
import AddMember from './pages/members/AddMember'
import EditMember from './pages/members/EditMember'
import Loans from './pages/loans/Loans'
import AddLoan from './pages/loans/AddLoan'
import Authors from './pages/authors/Authors'
import AuthorDetails from './pages/authors/AuthorDetails'
import AddAuthor from './pages/authors/AddAuthor'
import EditAuthor from './pages/authors/EditAuthor'
import Categories from './pages/categories/Categories'
import CategoryDetails from './pages/categories/CategoryDetails'
import AddCategory from './pages/categories/AddCategory'
import EditCategory from './pages/categories/EditCategory'
import Publishers from './pages/publishers/Publishers'
import PublisherDetails from './pages/publishers/PublisherDetails'
import AddPublisher from './pages/publishers/AddPublisher'
import EditPublisher from './pages/publishers/EditPublisher'
import NotFound from './pages/NotFound'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      overflow: 'hidden' 
    }}>
      <Navbar toggleSidebar={toggleSidebar} />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <Sidebar open={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            pt: { xs: 4, sm: 6 },
            mt: 8,
            ml: { sm: sidebarOpen ? '240px' : 0 },
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Book Routes */}
            <Route path="/books" element={<Books />} />
            <Route path="/books/add" element={<AddBook />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/books/:id/edit" element={<EditBook />} />
            
            {/* Member Routes */}
            <Route path="/members" element={<Members />} />
            <Route path="/members/add" element={<AddMember />} />
            <Route path="/members/:id" element={<MemberDetails />} />
            <Route path="/members/:id/edit" element={<EditMember />} />
            
            {/* Loan Routes */}
            <Route path="/loans" element={<Loans />} />
            <Route path="/loans/add" element={<AddLoan />} />
            
            {/* Author Routes */}
            <Route path="/authors" element={<Authors />} />
            <Route path="/authors/add" element={<AddAuthor />} />
            <Route path="/authors/:id" element={<AuthorDetails />} />
            <Route path="/authors/:id/edit" element={<EditAuthor />} />
            
            {/* Category Routes */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/add" element={<AddCategory />} />
            <Route path="/categories/:id" element={<CategoryDetails />} />
            <Route path="/categories/:id/edit" element={<EditCategory />} />
            
            {/* Publisher Routes */}
            <Route path="/publishers" element={<Publishers />} />
            <Route path="/publishers/add" element={<AddPublisher />} />
            <Route path="/publishers/:id" element={<PublisherDetails />} />
            <Route path="/publishers/:id/edit" element={<EditPublisher />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  )
}

export default App