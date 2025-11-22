import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
} from '@mui/material';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

interface CategoryModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
    category?: Category;
}

export function CategoryModal({ open, onClose, onSave, category }: CategoryModalProps) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [displayOrder, setDisplayOrder] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setSlug(category.slug);
            setDescription(category.description || '');
            setDisplayOrder(category.displayOrder || 0);
        } else {
            setName('');
            setSlug('');
            setDescription('');
            setDisplayOrder(0);
        }
    }, [category, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                name,
                slug,
                description,
                displayOrder,
            });
            onClose();
        } catch (error) {
            console.error('Failed to save category:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!category) {
                                    setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                                }
                            }}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <TextField
                            label="Display Order"
                            type="number"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                            fullWidth
                            helperText="Lower numbers appear first"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
