import { useState } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  ExpandLess,
  ExpandMore,
  Assessment as AssessmentIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

// Navigation items with their icons and optional subitems
const navItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    text: 'Books',
    icon: <MenuBookIcon />,
    path: '/books',
    subitems: [
      { text: 'All Books', path: '/books' },
      { text: 'Add Book', path: '/books/add' },
    ],
  },
  {
    text: 'Members',
    icon: <PeopleIcon />,
    path: '/members',
    subitems: [
      { text: 'All Members', path: '/members' },
      { text: 'Add Member', path: '/members/add' },
    ],
  },
  {
    text: 'Loans',
    icon: <AssignmentIcon />,
    path: '/loans',
    subitems: [
      { text: 'All Loans', path: '/loans' },
      { text: 'Issue Book', path: '/loans/add' },
    ],
  },
  {
    text: 'Authors',
    icon: <PersonIcon />,
    path: '/authors',
    subitems: [
      { text: 'All Authors', path: '/authors' },
      { text: 'Add Author', path: '/authors/add' },
    ],
  },
  {
    text: 'Categories',
    icon: <CategoryIcon />,
    path: '/categories',
    subitems: [
      { text: 'All Categories', path: '/categories' },
      { text: 'Add Category', path: '/categories/add' },
    ],
  },
  {
    text: 'Publishers',
    icon: <BusinessIcon />,
    path: '/publishers',
    subitems: [
      { text: 'All Publishers', path: '/publishers' },
      { text: 'Add Publisher', path: '/publishers/add' },
    ],
  },
  {
    text: 'Reports',
    icon: <AssessmentIcon />,
    path: '/reports',
    subitems: [
      { text: 'Overdue Books', path: '/reports/overdue' },
      { text: 'Popular Books', path: '/reports/popular' },
      { text: 'Member Activity', path: '/reports/members' },
    ],
  },
];

const Sidebar = ({ open = true }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  // Handle expanding/collapsing submenu items
  const handleToggleExpand = (text) => {
    setExpandedItems(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  // Check if a menu item or any of its subitems are active
  const isActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.subitems) {
      return item.subitems.some(subitem => location.pathname === subitem.path);
    }
    return false;
  };

  // The sidebar content
  const sidebarContent = (
    <Box>
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            py: 1,
          }}
        >
          <LibraryBooksIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'primary.main' }}>
            Library MS
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List component="nav">
        {navItems.map((item) => {
          const active = isActive(item);
          const expanded = expandedItems[item.text] || active;

          return (
            <Box key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  component={item.subitems ? 'div' : RouterLink}
                  to={item.subitems ? undefined : item.path}
                  onClick={item.subitems ? () => handleToggleExpand(item.text) : undefined}
                  selected={active}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: active ? 'primary.contrastText' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.subitems && (expanded ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>
              
              {item.subitems && (
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subitems.map((subitem) => (
                      <ListItemButton
                        key={subitem.text}
                        component={RouterLink}
                        to={subitem.path}
                        selected={location.pathname === subitem.path}
                        sx={{
                          pl: 4,
                          '&.Mui-selected': {
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            '&:hover': {
                              bgcolor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ListItemText primary={subitem.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => {}}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            boxShadow: 3,
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            // Transform used for open/closed state
            transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            transition: theme => theme.transitions.create('transform', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open={open}
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;