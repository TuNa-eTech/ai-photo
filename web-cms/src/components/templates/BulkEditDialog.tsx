/**
 * Bulk Edit Dialog Component
 * 
 * Dialog for bulk editing multiple templates at once
 */

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '../../api/categories'
import type { TemplateStatus, TemplateVisibility, UpdateTemplateRequest } from '../../types'

export interface BulkEditDialogProps {
    open: boolean
    selectedCount: number
    onClose: () => void
    onSubmit: (updates: Partial<UpdateTemplateRequest>) => void
    loading?: boolean
}

export function BulkEditDialog({
    open,
    selectedCount,
    onClose,
    onSubmit,
    loading = false,
}: BulkEditDialogProps): React.ReactElement {
    const [status, setStatus] = useState<TemplateStatus | ''>('')
    const [visibility, setVisibility] = useState<TemplateVisibility | ''>('')
    const [isTrendingManual, setIsTrendingManual] = useState<boolean | null>(null)
    const [modelProvider, setModelProvider] = useState('')
    const [modelName, setModelName] = useState('')
    const [categoryId, setCategoryId] = useState('')

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
        enabled: open,
    })

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setStatus('')
            setVisibility('')
            setIsTrendingManual(null)
            setModelProvider('')
            setModelName('')
            setCategoryId('')
        }
    }, [open])

    const handleSubmit = (): void => {
        const updates: Partial<UpdateTemplateRequest> = {}

        // Only include fields that have been changed
        if (status) updates.status = status
        if (visibility) updates.visibility = visibility
        if (isTrendingManual !== null) updates.isTrendingManual = isTrendingManual
        if (modelProvider) updates.modelProvider = modelProvider
        if (modelName) updates.modelName = modelName
        if (categoryId) updates.categoryId = categoryId

        onSubmit(updates)
    }

    const hasChanges = Boolean(
        status || visibility || isTrendingManual !== null || modelProvider || modelName || categoryId
    )

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Bulk Edit Templates
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Editing {selectedCount} template{selectedCount !== 1 ? 's' : ''}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Only the fields you change below will be updated. Other fields will remain unchanged.
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                    {/* Status */}
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value as TemplateStatus | '')}
                        >
                            <MenuItem value="">
                                <em>Don't change</em>
                            </MenuItem>
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Visibility */}
                    <FormControl fullWidth>
                        <InputLabel>Visibility</InputLabel>
                        <Select
                            value={visibility}
                            label="Visibility"
                            onChange={(e) => setVisibility(e.target.value as TemplateVisibility | '')}
                        >
                            <MenuItem value="">
                                <em>Don't change</em>
                            </MenuItem>
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Trending */}
                    <Box>
                        <Typography variant="body2" fontWeight={500} gutterBottom>
                            Mark as Trending
                        </Typography>
                        <FormControl fullWidth>
                            <Select
                                value={isTrendingManual === null ? 'no-change' : isTrendingManual ? 'true' : 'false'}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val === 'no-change') setIsTrendingManual(null)
                                    else if (val === 'true') setIsTrendingManual(true)
                                    else setIsTrendingManual(false)
                                }}
                            >
                                <MenuItem value="no-change">
                                    <em>Don't change</em>
                                </MenuItem>
                                <MenuItem value="true">Set to Trending</MenuItem>
                                <MenuItem value="false">Remove from Trending</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Model Provider */}
                    <TextField
                        label="Model Provider"
                        value={modelProvider}
                        onChange={(e) => setModelProvider(e.target.value)}
                        helperText="Leave empty to keep existing values"
                        fullWidth
                    />

                    {/* Model Name */}
                    <TextField
                        label="Model Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        helperText="Leave empty to keep existing values"
                        fullWidth
                    />

                    {/* Category */}
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryId}
                            label="Category"
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Don't change</em>
                            </MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !hasChanges}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Updating...' : 'Update Templates'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
