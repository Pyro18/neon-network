"use client"

/**
 * Pagina di amministrazione per la gestione delle categorie del forum
 * 
 * Funzionalità principali:
 * - Visualizzazione lista categorie con statistiche
 * - Creazione nuove categorie con form modale
 * - Modifica categorie esistenti
 * - Eliminazione categorie (con protezione se contengono thread)
 * - Gestione ordinamento e personalizzazione visiva
 * - Controllo accesso limitato agli amministratori
 * - Interface responsive per desktop e mobile
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Plus,
    Edit,
    Trash2,
    MessageSquare,
    Users,
    HelpCircle,
    Lightbulb,
    Hammer,
    ChevronLeft,
    MoreHorizontal
} from "lucide-react"
import { toast } from "sonner"

import { NeonParticles } from "@/components/neon-particles"
import { NeonButton } from "@/components/neon-button"
import { RoleGate } from "@/components/auth/role-gate"
import { useAuth } from "@/hooks/use-auth"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Interfaccia TypeScript per rappresentare una categoria del forum
 * Include dati base e statistiche di utilizzo
 */
interface Category {
    id: string
    name: string
    description: string
    icon: string
    color: string
    sort_order: number
    thread_count: number
    post_count: number
    created_at: string
    updated_at: string
}

/**
 * Componente principale per la gestione amministrativa delle categorie
 * Richiede ruolo "admin" per l'accesso
 */
export default function AdminCategoriesPage() {
    const { user, profile } = useAuth()
    
    // Stati per la gestione della lista categorie
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    // Stati per la gestione dei modali
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Stato del form per creazione/modifica categorie
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'MessageSquare',
        color: 'default',
        sort_order: 0
    })

    // Opzioni disponibili per le icone delle categorie
    const iconOptions = [
        { value: 'MessageSquare', label: 'Message', icon: MessageSquare },
        { value: 'Users', label: 'Users', icon: Users },
        { value: 'HelpCircle', label: 'Help', icon: HelpCircle },
        { value: 'Lightbulb', label: 'Ideas', icon: Lightbulb },        { value: 'Hammer', label: 'Development', icon: Hammer },
    ]

    // Opzioni di colore per personalizzare l'aspetto delle categorie
    const colorOptions = [
        { value: 'default', label: 'Cyan', color: 'bg-primary' },
        { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
        { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
        { value: 'green', label: 'Green', color: 'bg-green-500' },
        { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
    ]

    /**
     * Recupera la lista delle categorie dal server
     * Include statistiche di utilizzo (numero thread e post)
     */
    const fetchCategories = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/categories')

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to fetch categories')
            }

            const data = await response.json()
            setCategories(data)
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to fetch categories')
        } finally {
            setIsLoading(false)        }
    }

    // Carica le categorie quando l'utente è autenticato come admin
    useEffect(() => {
        if (user && profile?.role === 'admin') {
            fetchCategories()
        }
    }, [user, profile])

    /**
     * Resetta il form ai valori di default
     * Utilizzato dopo operazioni di creazione/modifica
     */
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            icon: 'MessageSquare',
            color: 'default',
            sort_order: 0
        })
        setSelectedCategory(null)
    }

    /**
     * Gestisce la creazione di una nuova categoria
     * Valida i dati required e invia la richiesta al server
     */
    const handleCreateCategory = async () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error('Name and description are required')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to create category')
            }

            toast.success('Category created successfully')
            setIsCreateDialogOpen(false)
            resetForm()
            fetchCategories()
        } catch (error) {
            console.error('Error creating category:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create category')
        } finally {
            setIsSubmitting(false)
        }
    }
    /**
     * Gestisce la modifica di una categoria esistente
     * Valida i dati e aggiorna la categoria sul server
     */
    const handleEditCategory = async () => {
        if (!selectedCategory || !formData.name.trim() || !formData.description.trim()) {
            toast.error('Name and description are required')
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/admin/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, id: selectedCategory.id })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to update category')
            }

            toast.success('Category updated successfully')
            setIsEditDialogOpen(false)
            resetForm()
            fetchCategories()
        } catch (error) {
            console.error('Error updating category:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to update category')
        } finally {
            setIsSubmitting(false)
        }
    }

    /**
     * Gestisce l'eliminazione di una categoria
     * Previene l'eliminazione se la categoria contiene thread
     */
    const handleDeleteCategory = async () => {
        if (!selectedCategory) return

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/admin/categories?id=${selectedCategory.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to delete category')
            }

            toast.success('Category deleted successfully')
            setIsDeleteDialogOpen(false)
            resetForm()
            fetchCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to delete category')
        } finally {
            setIsSubmitting(false)
        }
    }    
    
    /**
     * Apre il dialog di modifica precompilando il form con i dati della categoria
     * @param category - Categoria da modificare
     */
    const openEditDialog = (category: Category) => {
        setSelectedCategory(category)
        setFormData({
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            sort_order: category.sort_order
        })
        setIsEditDialogOpen(true)
    }    
    
    /**
     * Apre il dialog di conferma per l'eliminazione
     * @param category - Categoria da eliminare
     */
    const openDeleteDialog = (category: Category) => {
        setSelectedCategory(category)
        setIsDeleteDialogOpen(true)
    }

    /**
     * Ottiene il componente React dell'icona basato sul nome
     * @param iconName - Nome dell'icona da cercare
     * @returns Componente React dell'icona o MessageSquare di default
     */
    const getIconComponent = (iconName: string) => {
        const iconOption = iconOptions.find(opt => opt.value === iconName)
        if (iconOption) {
            const IconComponent = iconOption.icon
            return <IconComponent className="h-5 w-5" />
        }
        return <MessageSquare className="h-5 w-5" />
    }

    /**
     * Contenuto mostrato quando l'utente non ha i permessi di amministratore
     * Include un messaggio di errore e un link per tornare al forum
     */
    const unauthorizedContent = (
        <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 p-6 max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
                <p className="text-muted-foreground mb-6">
                    You need administrator privileges to manage forum categories.
                </p>
                <Link href="/forum">
                    <Button variant="outline">Return to Forum</Button>
                </Link>
            </div>
        </div>
    )

    return (
        <div className="relative min-h-screen">
            <NeonParticles density={30} />

            <RoleGate requiredRole="admin" fallback={unauthorizedContent}>
                <div className="container mx-auto px-4 py-12 relative z-10">                {/* Breadcrumb di navigazione per tornare alla dashboard admin */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link href="/admin/forum" className="hover:text-primary flex items-center">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Admin Dashboard
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Categories</h1>
                            <p className="text-muted-foreground">
                                Create, edit, and organize forum categories
                            </p>
                        </div>

                        <NeonButton onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Category
                        </NeonButton>
                    </div>                    {/* Lista delle categorie con stati di caricamento e empty state */}
                    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-border/30 overflow-hidden">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-md" />
                                        <div className="flex-1">
                                            <Skeleton className="h-6 w-48 mb-2" />
                                            <Skeleton className="h-4 w-full max-w-md" />
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-12 text-center">
                                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first forum category to get started.
                                </p>
                                <NeonButton onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Category
                                </NeonButton>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {categories.map((category) => (
                                    <div key={category.id} className="p-6 flex items-center gap-4 hover:bg-background/10">                                        {/* Icona e colore della categoria */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-md flex items-center justify-center",
                                            category.color === 'blue' && "bg-blue-500/10 text-blue-500",
                                            category.color === 'purple' && "bg-purple-500/10 text-purple-500",
                                            category.color === 'green' && "bg-green-500/10 text-green-500",
                                            category.color === 'pink' && "bg-pink-500/10 text-pink-500",
                                            category.color === 'default' && "bg-primary/10 text-primary",
                                        )}>
                                            {getIconComponent(category.icon)}
                                        </div>                                        {/* Informazioni della categoria con nome, descrizione e statistiche */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold truncate">{category.name}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    #{category.sort_order}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                {category.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{category.thread_count} threads</span>
                                                <span>{category.post_count} posts</span>
                                            </div>
                                        </div>                                        {/* Menu dropdown con azioni di modifica ed eliminazione */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">More actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteDialog(category)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>                {/* Dialog modale per la creazione di nuove categorie */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="bg-background/95 backdrop-blur-sm">
                        <DialogHeader>
                            <DialogTitle>Create New Category</DialogTitle>
                            <DialogDescription>
                                Add a new category to organize forum discussions.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Announcements, Help & Support"
                                    className="bg-background/50"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the category"
                                    className="bg-background/50 resize-none h-20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Icon</Label>
                                    <Select
                                        value={formData.icon}
                                        onValueChange={(value) => setFormData({ ...formData, icon: value })}
                                    >
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {iconOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center">
                                                        <option.icon className="h-4 w-4 mr-2" />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Color</Label>
                                    <Select
                                        value={formData.color}
                                        onValueChange={(value) => setFormData({ ...formData, color: value })}
                                    >
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colorOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center">
                                                        <div className={cn("w-4 h-4 rounded-full mr-2", option.color)} />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="bg-background/50 w-24"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCreateDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <NeonButton onClick={handleCreateCategory} disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Category'}
                            </NeonButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>                {/* Dialog modale per la modifica di categorie esistenti */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="bg-background/95 backdrop-blur-sm">
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>
                                Modify the category details.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Category Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-background/50"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-background/50 resize-none h-20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Icon</Label>
                                    <Select
                                        value={formData.icon}
                                        onValueChange={(value) => setFormData({ ...formData, icon: value })}
                                    >
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {iconOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center">
                                                        <option.icon className="h-4 w-4 mr-2" />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Color</Label>
                                    <Select
                                        value={formData.color}
                                        onValueChange={(value) => setFormData({ ...formData, color: value })}
                                    >
                                        <SelectTrigger className="bg-background/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colorOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center">
                                                        <div className={cn("w-4 h-4 rounded-full mr-2", option.color)} />
                                                        {option.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit-sort_order">Sort Order</Label>
                                <Input
                                    id="edit-sort_order"
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    className="bg-background/50 w-24"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <NeonButton onClick={handleEditCategory} disabled={isSubmitting}>
                                {isSubmitting ? 'Updating...' : 'Update Category'}
                            </NeonButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>                {/* Dialog di conferma per l'eliminazione con protezioni */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="bg-background/95 backdrop-blur-sm">
                        <DialogHeader>
                            <DialogTitle>Delete Category</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedCategory && selectedCategory.thread_count > 0 && (
                            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                <p className="text-sm text-destructive">
                                    ⚠️ This category contains {selectedCategory.thread_count} thread(s).
                                    You must move or delete all threads before deleting this category.
                                </p>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteCategory}
                                disabled={isSubmitting || (selectedCategory?.thread_count || 0) > 0}
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete Category'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </RoleGate>
        </div>
    )
}