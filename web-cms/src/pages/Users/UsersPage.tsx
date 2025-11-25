import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Card,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Select,
    MenuItem,
    Chip,
    Pagination,
    CircularProgress,
    Avatar,
    Stack,
    FormControl,
    InputLabel,
    Paper,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { getUsers, type User } from '../../api/users';
import { format } from 'date-fns';

export const UsersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const page = parseInt(searchParams.get('page') || '1');
    const type = (searchParams.get('type') as 'all' | 'anonymous' | 'real') || 'all';
    const search = searchParams.get('search') || '';

    // Simple debounce implementation if hook doesn't exist
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchUsers();
    }, [page, type, debouncedSearch]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers({
                page,
                limit: 10,
                search: debouncedSearch,
                type,
            });
            setUsers(response.data);
            setTotal(response.meta.total);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams({
            page: '1',
            type,
            search: event.target.value,
        });
    };

    const handleTypeChange = (event: any) => {
        setSearchParams({
            page: '1',
            type: event.target.value,
            search,
        });
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setSearchParams({
            page: value.toString(),
            type,
            search,
        });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    User Management
                </Typography>
                <Chip label={`Total: ${total}`} color="primary" variant="outlined" />
            </Box>

            <Card variant="outlined" sx={{ mb: 4, p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={handleSearchChange}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>User Type</InputLabel>
                        <Select
                            value={type}
                            label="User Type"
                            onChange={handleTypeChange}
                        >
                            <MenuItem value="all">All Users</MenuItem>
                            <MenuItem value="real">Real Users</MenuItem>
                            <MenuItem value="anonymous">Anonymous Users</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Card>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Credits</TableCell>
                            <TableCell>Last Active</TableCell>
                            <TableCell>Created At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No users found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={user.avatar_url} alt={user.name}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {user.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_anonymous ? (
                                            <Chip
                                                icon={<SmartToyIcon />}
                                                label="Anonymous"
                                                size="small"
                                                color="default"
                                                variant="outlined"
                                            />
                                        ) : (
                                            <Chip
                                                icon={<PersonIcon />}
                                                label="Real User"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={user.credits} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {user.last_active_at
                                                ? format(new Date(user.last_active_at), 'MMM d, yyyy HH:mm')
                                                : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {format(new Date(user.created_at), 'MMM d, yyyy')}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Container>
    );
};
