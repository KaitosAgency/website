"use client"

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { ExternalLink, MapPin, Settings, LogOut, RefreshCw, Zap } from "lucide-react";

interface StatItem {
    label: string;
    value: number | string;
}

interface PlatformProfileCardProps {
    // Platform info
    platformName: string;
    platformIcon?: ReactNode;
    platformColor?: string; // Couleur de la plateforme (ex: "#ff5500" pour SoundCloud)

    // User info
    username: string;
    displayName: string;
    avatarUrl?: string;
    profileUrl?: string;
    location?: string;
    description?: string;
    plan?: string;

    // Stats
    stats?: StatItem[];

    // Connection status
    isConnected: boolean;
    isTokenValid?: boolean;
    isCheckingToken?: boolean;
    tokenMessage?: string;
    needsReauth?: boolean;
    onVerifyToken?: () => void;
    onReauth?: () => void;

    // Automation
    automationEnabled?: boolean;
    automationLoading?: boolean;
    automationDisabled?: boolean;
    onAutomationChange?: (checked: boolean) => void;
    automationLabel?: string;
    automationDescription?: string;
    automationDisabledMessage?: string;

    // Actions
    onDisconnect?: () => void;
    onSettings?: () => void;

    // Labels (i18n)
    labels: {
        viewProfile: string;
        connectionStatus: string;
        tokenValidation: string;
        valid: string;
        invalid: string;
        verify: string;
        checking: string;
        reauthenticate: string;
        disconnect: string;
        disconnectDesc: string;
        plan?: string;
        tokenValid?: string;
        account?: string;
        tokenRequired?: string;
    };
}

export function PlatformProfileCard({
    platformName,
    platformIcon,
    platformColor = "#ff5500", // Orange SoundCloud par défaut
    username,
    displayName,
    avatarUrl,
    profileUrl,
    location,
    description,
    plan,
    stats = [],
    isConnected,
    isTokenValid,
    isCheckingToken,
    tokenMessage,
    needsReauth,
    onVerifyToken,
    onReauth,
    automationEnabled,
    automationLoading,
    automationDisabled,
    onAutomationChange,
    automationLabel,
    automationDescription,
    automationDisabledMessage,
    onDisconnect,
    onSettings,
    labels,
}: PlatformProfileCardProps) {
    if (!isConnected) {
        return null;
    }

    return (
        <Card className="overflow-hidden w-full max-w-md mx-auto">
            {/* Header avec dégradé */}
            <div
                className="relative h-28"
                style={{
                    background: `linear-gradient(135deg, ${platformColor} 0%, #1a1a2e 100%)`,
                }}
            >
                {/* Platform badge */}
                <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                        {platformIcon && (
                            <div className="w-6 h-6 text-white/90 flex items-center justify-center">
                                {platformIcon}
                            </div>
                        )}
                        <span className="text-white/90 text-sm font-medium">{platformName}</span>
                    </div>

                    {/* Token Status Badge */}
                    {onVerifyToken && (
                        <button
                            onClick={onVerifyToken}
                            disabled={isCheckingToken}
                            className="group relative h-auto p-1.5 py-1 bg-white hover:bg-white rounded-md transition-all duration-300 shadow-sm overflow-hidden"
                            title={labels.tokenValidation}
                        >
                            {/* Loading State */}
                            {isCheckingToken ? (
                                <div className="h-full px-2.5 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span>{labels.checking}</span>
                                </div>
                            ) : isTokenValid === undefined ? (
                                <div className="h-full px-2.5 flex items-center">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                                </div>
                            ) : (
                                /* Dynamic Content Container */
                                <div className="flex items-center h-auto">
                                    {/* Default Status State */}
                                    <div className="flex items-center gap-1.5 transition-all duration-300 ease-in-out group-hover:w-0 group-hover:opacity-0 group-hover:overflow-hidden whitespace-nowrap">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ml-[2px] ${isTokenValid ? 'bg-green-500' : 'bg-red-500'
                                            }`}></span>
                                        <span className={`text-[10px] font-medium tracking-wide ${isTokenValid ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {isTokenValid ? labels.valid : labels.invalid}
                                        </span>
                                    </div>

                                    {/* Hover Verify State */}
                                    <div className="flex items-center gap-1.5 w-0 opacity-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:w-auto group-hover:opacity-100 text-gray-600 whitespace-nowrap">
                                        <RefreshCw className="w-3 h-3 shrink-0" />
                                        <span className="text-[10px] font-medium tracking-wide">
                                            {labels.verify}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </button>
                    )}
                </div>

                {/* Top right buttons (profile link + settings) */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    {profileUrl && (
                        <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            title={labels.viewProfile}
                        >
                            <ExternalLink className="w-4 h-4 text-white/80" />
                        </a>
                    )}
                    {onSettings && (
                        <button
                            onClick={onSettings}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <Settings className="w-4 h-4 text-white/80" />
                        </button>
                    )}
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100"
                        style={{ borderColor: platformColor + '20' }}
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                                style={{ backgroundColor: platformColor }}
                            >
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <CardContent className="pt-16 pb-6 px-6 text-center">
                {/* Name & Username */}
                <h3 className="text-xl font-bold text-secondary mb-1">{displayName}</h3>
                <p className="text-gray-500 text-sm mb-2">@{username}</p>

                {/* Location */}
                {location && (
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{location}</span>
                    </div>
                )}

                {/* Plan badge */}
                {plan && (
                    <div className="mb-4">
                        <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: platformColor + '15',
                                color: platformColor
                            }}
                        >
                            {labels.plan || 'Plan'}: {plan}
                        </span>
                    </div>
                )}

                {/* Stats */}
                {stats.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 py-4 border-y border-gray-100 mb-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-base font-bold text-secondary">
                                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                </div>
                                <div className="text-[10px] text-gray-500 leading-tight">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Reauth warning - only show if needs reauth */}
                {needsReauth && tokenMessage && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left mb-4">
                        <p className="text-xs text-yellow-800 mb-2">{tokenMessage}</p>
                        {onReauth && (
                            <Button
                                size="sm"
                                onClick={onReauth}
                                className="h-7 text-xs"
                                style={{ backgroundColor: platformColor }}
                            >
                                {labels.reauthenticate}
                            </Button>
                        )}
                    </div>
                )}

                {/* Automation Toggle */}
                {onAutomationChange && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="text-left flex-1">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4" style={{ color: platformColor }} />
                                    <Label className="text-sm font-medium text-secondary">
                                        {automationLabel || 'Automation'}
                                    </Label>
                                </div>
                                {automationDescription && (
                                    <p className="text-xs text-gray-500 mt-1">{automationDescription}</p>
                                )}
                            </div>
                            <Switch
                                checked={automationEnabled || false}
                                onCheckedChange={onAutomationChange}
                                disabled={automationLoading || automationDisabled}
                            />
                        </div>
                        {automationDisabled && automationDisabledMessage && (
                            <p className="text-xs text-gray-500 mt-2 text-left">{automationDisabledMessage}</p>
                        )}
                    </div>
                )}

                {/* Disconnect Button */}
                {onDisconnect && (
                    <div className="border-t border-gray-100 pt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDisconnect}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                        >
                            <LogOut className="w-3.5 h-3.5 mr-1.5" />
                            {labels.disconnect}
                        </Button>
                        <p className="text-xs text-gray-400 mt-1">{labels.disconnectDesc}</p>
                    </div>
                )}
            </CardContent>
        </Card >
    );
}

// Skeleton for loading state
export function PlatformProfileCardSkeleton() {
    return (
        <Card className="overflow-hidden w-full max-w-md mx-auto">
            <div className="relative h-28 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse" />
            <CardContent className="pt-16 pb-6 px-6 text-center">
                <div className="absolute top-[6.5rem] left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-gray-200 animate-pulse border-4 border-white" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto mb-4" />
                <div className="flex justify-center gap-6 py-4 border-y border-gray-100 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="text-center">
                            <Skeleton className="h-6 w-10 mx-auto mb-1" />
                            <Skeleton className="h-3 w-14" />
                        </div>
                    ))}
                </div>
                <Skeleton className="h-20 w-full rounded-lg mb-4" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
        </Card>
    );
}
