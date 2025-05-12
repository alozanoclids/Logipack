import React from "react";
import {
    Smile, Heart, Star, Sun, Moon, Camera, Bell, Coffee, ThumbsUp, Trash,
    Music, Zap, AlertCircle, Calendar, Cloud, Folder, Globe, Lock, Phone
} from "lucide-react";

const iconsMap: Record<string, React.FC<{ className?: string }>> = {
    Smile,
    Heart,
    Star,
    Sun,
    Moon,
    Camera,
    Bell,
    Coffee,
    ThumbsUp,
    Trash,
    Music,
    Zap,
    AlertCircle,
    Calendar,
    Cloud,
    Folder,
    Globe,
    Lock,
    Phone,
};

export function DynamicIcon({
    iconName,
    className,
}: {
    iconName: string;
    className?: string;
}) {
    const IconComponent = iconsMap[iconName];

    if (!IconComponent) return null; // O podrías poner un ícono por defecto

    return <IconComponent className={className} />;
}
