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
        <div className="max-w-4xl space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black dark:text-white tracking-tight uppercase">
                    {dict?.profile?.account?.title || "Account Settings"}
                </h1>
                <p className="text-muted-foreground text-sm font-medium italic">
                    {dict?.profile?.account?.subtitle || "Manage your personal information and security"}
                </p>
            </div>

            <div className="grid gap-10">
                {/* Personal Information */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-brand-primary" />
                        </div>
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                            {dict?.profile?.account?.personalDetails || "Personal Details"}
                        </h2>
                    </div>

                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-border dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5">
                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="grid gap-8 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        {dict?.profile?.account?.fullName || "Full Name / Username"}
                                    </Label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                                        <Input
                                            id="username"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="pl-12 h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 font-bold tracking-tight"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        {dict?.profile?.account?.phone || "Phone Number"}
                                    </Label>
                                    <div className="relative group">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                                        <Input
                                            id="phone"
                                            placeholder="+995 5XX XXX XXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="pl-12 h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 font-bold tracking-tight"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                    {dict?.profile?.account?.email || "Email Address (Read Only)"}
                                </Label>
                                <div className="relative opacity-60">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={formData.email}
                                        disabled
                                        className="pl-12 h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none cursor-not-allowed font-bold"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground ml-1 italic font-medium">
                                    {dict?.profile?.account?.emailDesc || "Email is verified and linked to your primary login."}
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white" disabled={loading}>
                                    {loading ? (dict?.profile?.account?.saving || "Saving Changes...") : (dict?.profile?.account?.saveBtn || "Save Profile Details")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Security Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-brand-primary" />
                        </div>
                        <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                            {dict?.profile?.account?.security || "Security & Passwords"}
                        </h2>
                    </div>

                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-border dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black/5">
                        <form onSubmit={handleUpdatePassword} className="space-y-8">
                            <div className="space-y-3">
                                <Label htmlFor="currentPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                    {dict?.profile?.account?.currentPassword || "Current Password"}
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="pl-12 pr-12 h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 font-bold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-8 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        {dict?.profile?.account?.newPassword || "New Password"}
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 px-6 font-bold"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-primary transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        {dict?.profile?.account?.confirmPassword || "Confirm New Password"}
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                        className="h-14 rounded-2xl bg-brand-surface dark:bg-white/5 border-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 px-6 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <Button type="submit" variant="secondary" className="rounded-2xl h-14 px-10 border-2 border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white font-black uppercase tracking-widest transition-all" disabled={loading}>
                                    {loading ? (dict?.profile?.account?.updating || "Updating...") : (dict?.profile?.account?.updatePasswordBtn || "Update Password")}
                                </Button>

                                <div className="hidden md:flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {dict?.profile?.account?.secureAccount || "Secure Account"}
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
