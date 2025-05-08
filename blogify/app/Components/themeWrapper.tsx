'use client';
import DarkModeWrapper from '../actions/DarkMode';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeWrapper>
      {children}
    </DarkModeWrapper>
  );
}