import React from "react";

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon({ category, size = 24, className = "" }: CategoryIconProps) {
  switch (category) {
    case "Grocery":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3.13V7M8 3.13V7"/><path d="M3 10h18"/></svg>
      );
    case "Dining":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2v8"/><path d="M8 10c0 2.21-1.79 4-4 4"/><path d="M16 2v8"/><path d="M16 10c0 2.21 1.79 4 4 4"/></svg>
      );
    case "Housing/Rent":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 11L12 3l9 8"/><rect x="5" y="11" width="14" height="10" rx="2"/></svg>
      );
    case "Transportation (Intracity)":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg>
      );
    case "Entertainment":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 12l4-4v8z"/></svg>
      );
    case "Utilities":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 2 22 22 8 15 22 13 2"/></svg>
      );
    case "Medicines":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 8v4"/><path d="M10 12h4"/></svg>
      );
    case "Shopping":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2l1.5 6h9L18 2"/><rect x="3" y="8" width="18" height="13" rx="2"/></svg>
      );
    case "Office Spends":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
      );
    case "Personal":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="4"/><path d="M2 20c0-4 8-6 10-6s10 2 10 6"/></svg>
      );
    case "Travel":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 16l20-8M2 16l6 2 2 6 8-20"/></svg>
      );
    case "Other":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      );
    default:
      return null;
  }
}
