import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    role: 'SUPER_ADMIN' | 'PASTOR' | 'EVANGELIST';
    status: 'PENDING' | 'VALIDATED' | 'REJECTED';
    first_name: string;
    last_name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Restaurer la session si le token existe
        if (token) {
            // En vrai app, on ferait un appel /me ici pour valider le token et recup user
            // Pour l'instant on suppose que si token dans localStorage, on essaye de persister
            // Amelioration: sauver user dans localStorage aussi ou faire appel API
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
