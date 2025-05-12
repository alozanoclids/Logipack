'use client";' 
import {
  Smile, Heart, Star, Sun, Moon, Camera, Bell, Coffee, ThumbsUp, Trash,
  Music, Zap, AlertCircle, Calendar, Cloud, Folder, Globe, Lock, Phone
} from "lucide-react";

const iconOptions = [
  { name: "Smile", icon: Smile },
  { name: "Heart", icon: Heart },
  { name: "Star", icon: Star },
  { name: "Sun", icon: Sun },
  { name: "Moon", icon: Moon },
  { name: "Camera", icon: Camera },
  { name: "Bell", icon: Bell },
  { name: "Coffee", icon: Coffee },
  { name: "ThumbsUp", icon: ThumbsUp },
  { name: "Trash", icon: Trash },
  { name: "Music", icon: Music },
  { name: "Zap", icon: Zap },
  { name: "AlertCircle", icon: AlertCircle },
  { name: "Calendar", icon: Calendar },
  { name: "Cloud", icon: Cloud },
  { name: "Folder", icon: Folder },
  { name: "Globe", icon: Globe },
  { name: "Lock", icon: Lock },
  { name: "Phone", icon: Phone },
];

export function IconSelector({
  onChange,
  selectedIcon,
}: {
  onChange: (icon: string) => void;
  selectedIcon: string;
}) {
  return (
    <div className="flex gap-4 flex-wrap">
      {iconOptions.map(({ name, icon: IconComponent }) => (
        <button
          key={name}
          className={`p-2 border rounded-xl hover:bg-gray-100 text-black transition ${selectedIcon === name ? "bg-blue-100 border-blue-400" : ""
            }`}
          onClick={() => onChange(name)}
        >
          <IconComponent className="w-6 h-6" />
        </button>
      ))}
    </div>
  );
}
