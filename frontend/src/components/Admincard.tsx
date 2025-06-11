import React from "react";

const highlightColors = {
  green: "text-green-600",
  orange: "text-orange-600",
  default: "text-gray-600",
};

interface CardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  subtitle?: string;
  highlight?: string;
  highlightColor?: keyof typeof highlightColors;
}

const Card: React.FC<CardProps> = ({ title, value, icon, subtitle, highlight, highlightColor = "default" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-4 w-full max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-gray-600 text-sm font-medium">{title}</h4>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className={`text-sm ${highlightColors[highlightColor]} mt-1`}>
        {highlight && <span>{highlight}</span>}
      </div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
};

export default Card;
