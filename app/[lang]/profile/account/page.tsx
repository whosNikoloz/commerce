"use client";

import React, { useState } from "react";
import {
    User as UserIcon,
    Shield,
    Smartphone,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2
} from "lucide-react";
import { useUser } from "@/app/context/userContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useDictionary } from "@/app/context/dictionary-provider";

export default function AccountPage() {
    const { user } = useUser();
    const dict = useDictionary();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        username: user?.userName || "",
        phone: "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success(dict?.profile?.account?.updateProfileSuccess || "Profile updated successfully!");
            setLoading(false);
        }, 1000);
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error(dict?.profile?.account?.passwordMismatch || "New passwords do not match");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success(dict?.profile?.account?.updatePasswordSuccess || "Password updated successfully!");
            setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">
                {dict?.profile?.account?.title || "Account Settings"}
            </h1>

            <div className="grid gap-5">
                {/* Personal Information */}
                <div className="bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-brand-primary" />
                        <h2 className="text-sm font-bold dark:text-white">
                            {dict?.profile?.account?.personalDetails || "Personal Details"}
                        </h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="username" className="text-xs font-semibold text-muted-foreground ml-0.5">
                                    {dict?.profile?.account?.fullName || "Full Name / Username"}
                                </Label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="pl-10 h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground ml-0.5">
                                    {dict?.profile?.account?.phone || "Phone Number"}
                                </Label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                                    <Input
                                        id="phone"
                                        placeholder="+995 5XX XXX XXX"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-10 h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground ml-0.5">
                                {dict?.profile?.account?.email || "Email Address (Read Only)"}
                            </Label>
                            <div className="relative opacity-60">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    value={formData.email}
                                    disabled
                                    className="pl-10 h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none cursor-not-allowed text-sm font-medium"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="rounded-xl h-9 px-5 text-xs font-bold bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading}>
                            {loading ? (dict?.profile?.account?.saving || "Saving...") : (dict?.profile?.account?.saveBtn || "Save Changes")}
                        </Button>
                    </form>
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-white/5 border border-border/60 dark:border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-brand-primary" />
                        <h2 className="text-sm font-bold dark:text-white">
                            {dict?.profile?.account?.security || "Security & Passwords"}
                        </h2>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="currentPassword" className="text-xs font-semibold text-muted-foreground ml-0.5">
                                {dict?.profile?.account?.currentPassword || "Current Password"}
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                                <Input
                                    id="currentPassword"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-xs font-semibold text-muted-foreground ml-0.5">
                                    {dict?.profile?.account?.newPassword || "New Password"}
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20 px-4"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground ml-0.5">
                                    {dict?.profile?.account?.confirmPassword || "Confirm New Password"}
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="h-10 rounded-xl bg-brand-surface dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-2 focus-visible:ring-brand-primary/20 px-4"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Button type="submit" variant="secondary" className="rounded-xl h-9 px-5 text-xs font-bold border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all" disabled={loading}>
                                {loading ? (dict?.profile?.account?.updating || "Updating...") : (dict?.profile?.account?.updatePasswordBtn || "Update Password")}
                            </Button>

                            <div className="hidden md:flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {dict?.profile?.account?.secureAccount || "Secure Account"}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
