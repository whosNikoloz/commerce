"use client";

import { useEffect, useState } from "react";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    Tag,
    Filter,
    X,
    Search,
    Plus,
    MoreVertical
} from "lucide-react";
import type { CategoryModel } from "@/types/category";
import { getAllCategories } from "@/app/api/services/categoryService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryTreeProps {
    onSelectCategory: (id: string | null) => void;
}

export function CategoryTree({ onSelectCategory }: CategoryTreeProps) {
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                setCategories(response);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const toggleExpanded = (categoryId: string) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpanded(newExpanded);
    };

    const handleCategorySelect = (categoryId: string | null) => {
        setSelectedCategory(categoryId);
        onSelectCategory(categoryId);
    };

    const clearSelection = () => {
        setSelectedCategory(null);
        onSelectCategory(null);
    };

    const getChildrenCount = (parentId: string | null): number => {
        return categories.filter(c => c.parentId === parentId).length;
    };

    const hasChildren = (categoryId: string): boolean => {
        return categories.some(c => c.parentId === categoryId);
    };

    const filteredCategories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const expandAllParents = (categoryId: string) => {
        const newExpanded = new Set(expanded);

        const findParentIds = (catId: string): string[] => {
            const category = categories.find(c => c.id === catId);
            if (!category || !category.parentId) return [];
            return [category.parentId, ...findParentIds(category.parentId)];
        };

        const parentIds = findParentIds(categoryId);
        parentIds.forEach(id => newExpanded.add(id));
        setExpanded(newExpanded);
    };

    useEffect(() => {
        if (searchTerm && filteredCategories.length > 0) {
            filteredCategories.forEach(cat => expandAllParents(cat.id));
        }
    }, [searchTerm, categories]);

    const renderTree = (cats: CategoryModel[], parentId: string | null = null, level: number = 0) => {
        const filteredCats = searchTerm
            ? cats.filter(c => c.parentId === parentId && filteredCategories.some(fc => fc.id === c.id))
            : cats.filter(c => c.parentId === parentId);

        if (filteredCats.length === 0) return null;

        return (
            <div className={`space-y-1 ${level > 0 ? 'ml-6 pl-3 border-l border-slate-200 dark:border-slate-700' : ''}`}>
                {filteredCats.map((cat) => {
                    const isExpanded = expanded.has(cat.id);
                    const isSelected = selectedCategory === cat.id;
                    const childrenCount = getChildrenCount(cat.id);
                    const hasChildCategories = hasChildren(cat.id);
                    const isHighlighted = searchTerm && cat.name?.toLowerCase().includes(searchTerm.toLowerCase());

                    return (
                        <div key={cat.id} className="group">
                            <div
                                className={`
                                            flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                                            transition-all duration-200 ease-in-out relative
                                            ${isSelected
                                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-sm'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                    }
                                            ${isHighlighted && !isSelected ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : ''}
                                            `}
                                onClick={() => handleCategorySelect(cat.id)}
                            >
                                {/* Expand/Collapse Button */}
                                {hasChildCategories ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpanded(cat.id);
                                        }}
                                        className={`
                                                    p-1 rounded-md transition-all duration-200
                                                    ${isSelected
                                                ? 'hover:bg-blue-200 dark:hover:bg-blue-800'
                                                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }
                                                    `}
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                        ) : (
                                            <ChevronRight className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                                        )}
                                    </button>
                                ) : (
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    </div>
                                )}

                                {/* Category Icon */}
                                <div className="flex items-center">
                                    {hasChildCategories ? (
                                        isExpanded ? (
                                            <FolderOpen className={`h-4 w-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`} />
                                        ) : (
                                            <Folder className={`h-4 w-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                                        )
                                    ) : (
                                        <Tag className={`h-4 w-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                    )}
                                </div>

                                {/* Category Name */}
                                <span
                                    className={`
                                                flex-1 text-sm font-medium truncate
                                                ${isSelected
                                            ? 'text-blue-900 dark:text-blue-100'
                                            : 'text-slate-700 dark:text-slate-200'
                                        }
                                                ${isHighlighted && !isSelected ? 'text-yellow-800 dark:text-yellow-200' : ''}
                                            `}
                                    title={cat.name}
                                >
                                    {cat.name}
                                </span>

                                {/* Children Count Badge */}
                                {childrenCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className={`
                                                text-xs px-2 py-0.5 h-5 font-medium
                                                ${isSelected
                                                ? 'bg-blue-200 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200'
                                                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }
                                                `}
                                    >
                                        {childrenCount}
                                    </Badge>
                                )}
                            </div>

                            {/* Subcategories */}
                            {isExpanded && hasChildCategories && (
                                <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                                    {renderTree(cats, cat.id, level + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <Card className="h-fit sticky top-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <CardTitle className="text-lg">Categories</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const rootCategories = categories.filter(c => c.parentId === null);

    return (
        <Card className="h-fit sticky top-4 dark:bg-brand-muteddark bg-brand-muted">
            {/* Header */}
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <CardTitle className="text-lg">Categories</CardTitle>
                        <Badge variant="outline" className="text-xs font-normal">
                            {rootCategories.length}
                        </Badge>
                    </div>

                    {selectedCategory && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-8 text-sm"
                    />
                </div>
            </CardHeader>

            {/* Categories Tree */}
            <CardContent className="pt-0">
                <ScrollArea className="h-[calc(100vh-320px)] pr-3">
                    {categories.length === 0 ? (
                        <div className="text-center py-8">
                            <Folder className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                No categories found
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* All Categories Option */}
                            <div
                                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                  transition-all duration-200 ease-in-out border
                  ${selectedCategory === null
                                        ? 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-900/20 border-slate-200 dark:border-slate-700 shadow-sm'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
                                    }
                `}
                                onClick={() => handleCategorySelect(null)}
                            >
                                <Folder className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    All Categories
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5 h-5 font-medium bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                >
                                    {rootCategories.length}
                                </Badge>
                            </div>
                            {/* Render Root Categories */}
                            {renderTree(categories, null)}
                        </div>

                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
