
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème du localStorage s'il existe
    const storedTheme = localStorage.getItem("theme") as Theme;
    
    // Si un thème est stocké, l'utiliser
    if (storedTheme) return storedTheme;
    
    // Sinon, utiliser la préférence du système (if supported)
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    // Par défaut, utiliser le thème clair
    return "light";
  });

  useEffect(() => {
    // Mettre à jour l'attribut data-theme sur l'élément HTML
    document.documentElement.setAttribute("data-theme", theme);
    
    // Ajouter ou retirer la classe dark sur l'élément HTML
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Stocker le thème dans localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
}
