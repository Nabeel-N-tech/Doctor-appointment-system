# Pixel Clear Design System Specification

## 1. Core Principles
- **Pixel Clear**: UIs must be extremely legible, high-contrast, and free of visual clutter.
- **Beginner Friendly**: Navigation and actions must be obvious. No hidden menus or complex gestures.
- **Tactile & Robust**: Buttons and inputs should feel substantial (large touch targets, clear active states).

## 2. Color Palette
### Primary Colors
- **Teal**: Primary action color. Used for primary buttons, focus rings, and active accents.
  - `teal-600` (Main), `teal-700` (Hover), `teal-50` (Backgrounds)
- **Slate**: Neutral text and background scale.
  - `slate-900` (Headings), `slate-800` (Body Text), `slate-500` (Meta text), `slate-50` (Page Backgrounds)

### Status Colors
- **Emerald (Success/Confirmed)**: `bg-emerald-50`, `text-emerald-700`
- **Amber (Pending/Warning)**: `bg-amber-50`, `text-amber-700`
- **Rose (Error/Cancelled)**: `bg-rose-50`, `text-rose-700`
- **Blue (Info/Completed)**: `bg-blue-50`, `text-blue-700`

## 3. Typography
- **Headings**: `font-black` or `font-extrabold`. Use `tracking-tight` for a modern, compact feel.
- **Body**: `font-medium` or `font-bold` for better readability on lower-quality screens.
- **Labels**: `uppercase`, `tracking-widest`, `text-xs`, `font-bold`.

## 4. UI Primitives

### Card
- **Radius**: `rounded-2xl` (Standard), `rounded-3xl` (Featured/Large containers).
- **Style**: White background, `border border-slate-200`, `shadow-sm`.
- **Interaction**: `hover:border-teal-200`, `hover:shadow-md`.

### Button
- **Height**: `h-11` or `h-12` (Large touch targets).
- **Radius**: `rounded-xl`.
- **Typography**: `font-bold`, `uppercase`, `tracking-widest`, `text-sm`.
- **States**: `active:scale-95` (Tactile feedback).

### Input
- **Style**: `bg-white`, `border-slate-200`, `rounded-xl`.
- **Focus**: `ring-4`, `ring-teal-50`, `border-teal-500`.

## 5. Layout Patterns
- **Dashboard**:
  - Header: Large greeting + clear subtitle.
  - Stats: Grid of simple cards with icon + big number.
  - Main: Two-column layout (List + Detail/Sidebar).
- **Lists**:
  - Use specific `Card` rows for items rather than complex tables.
  - vertical lists with `gap-4`.

## 6. Animations
- **Entry**: `animate-fade-in` or `animate-fade-in-up` (subtle 0.5s fade).
- **Interaction**: `transition-all duration-200` on hover/active.

## 7. Role-Specific Views
- **Patient**: Focus on "Next Appointment" and "Book Now". High contrast.
- **Doctor**: Focus on "Today's Queue" and "Patient Status". Condensed density.
- **Admin**: High-level stats + dense tables/lists for management.
