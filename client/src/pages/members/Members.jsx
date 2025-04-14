import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Components
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import ConfirmDialog from '../../components/ConfirmDialog';

// Services
import { getAllMembers, deleteMember, searchMembers } from '../../services/memberService';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    memberId: null,
    title: '',
    message: '',
  });

  // Fetch members
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let membersData;
        if (searchTerm) {
          membersData = await searchMembers(searchTerm);
        } else {
          membersData = await getAllMembers();
        }
        
        setMembers(membersData);
        
        // Apply status filter if set
        if (statusFilter) {
          setFilteredMembers(membersData.filter(member => member.MembershipStatus === statusFilter));
        } else {
          setFilteredMembers(membersData);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchTerm, refreshKey]);

  // Handle status filter change
  useEffect(() => {
    if (statusFilter) {
      setFilteredMembers(members.filter(member => member.MembershipStatus === statusFilter));
    } else {
      setFilteredMembers(members);
    }
  }, [statusFilter, members]);

  // Handle search
  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
    setSearchTerm('');
    setStatusFilter('');
  };

  // Handle delete member
  const handleDeleteClick = (memberId) => {
    const memberToDelete = members.find(member => member.MemberID === memberId);
    
    setConfirmDialog({
      open: true,
      memberId,
      title: 'Delete Member',
      message: `Are you sure you want to delete "${memberToDelete.FirstName} ${memberToDelete.LastName}"? This action cannot be undone.`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMember(confirmDialog.memberId);
      
      // Refresh the member list
      setRefreshKey(oldKey => oldKey + 1);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    } catch (err) {
      console.error('Error deleting member:', err);
      setError(err);
      
      // Close the dialog
      setConfirmDialog({
        ...confirmDialog,
        open: false,
      });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false,
    });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Expired':
        return 'warning';
      case 'Suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) return <LoadingSpinner message="Loading members..." />;
  if (error) return <ErrorAlert error={error} onRetry={handleRefresh} />;

  return (
    <Container maxWidth="xl">
      <PageHeader 
        title="Members" 
        button={<AddIcon />} 
        buttonText="Add Member" 
        buttonLink="/members/add" 
        icon={PeopleIcon}
      />
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search members by name, email, or phone..." 
          fullWidth 
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Filter by Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label="Filter by Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {filteredMembers.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No members found
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Try adjusting your search or filters, or add a new member.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/members/add"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Add New Member
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.MemberID} hover>
                    <TableCell>{member.MemberID}</TableCell>
                    <TableCell>
                      {`${member.FirstName} ${member.LastName}`}
                    </TableCell>
                    <TableCell>{member.Email}</TableCell>
                    <TableCell>{member.Phone || '-'}</TableCell>
                    <TableCell>
                      {new Date(member.JoinDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={member.MembershipStatus} 
                        color={getStatusColor(member.MembershipStatus)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            component={Link}
                            to={`/members/${member.MemberID}`}
                            size="small"
                            color="primary"
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Member">
                          <IconButton
                            component={Link}
                            to={`/members/${member.MemberID}/edit`}
                            size="small"
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Member">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(member.MemberID)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Container>
  );
};

export default Members;