import React from 'react';
import { IconType } from 'react-icons';

interface IconTextProps {
    icon: IconType;
    text: string | number;
}

export const IconText: React.FC<IconTextProps> = ({ icon: Icon, text }) => {
    return (
        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Icon className="w-4 h-4" />
            <span>{text}</span>
        </div>
    );
}; 