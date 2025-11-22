import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/category';
import { categoriesApi } from '../../api/categories';
import { CategoryModal } from '../../components/CategoryModal';

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = () => {
        setSelectedCategory(undefined);
        setModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoriesApi.delete(id);
                fetchCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
            }
        }
    };

    const handleSave = async (data: CreateCategoryDto | UpdateCategoryDto) => {
        if (selectedCategory) {
            await categoriesApi.update(selectedCategory.id, data);
        } else {
            await categoriesApi.create(data as CreateCategoryDto);
        }
        fetchCategories();
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Categories</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    Create Category
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Slug</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No categories found</TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <Chip label={category.displayOrder} size="small" color="primary" />
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>
                                        <Chip label={category.slug} size="small" />
                                    </TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>
                                        {category.imageUrl && (
                                            <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleEdit(category)} size="small">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(category.id)} size="small" color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <CategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                category={selectedCategory}
            />
        </Box>
    );
}
