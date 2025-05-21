
import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContextType, User, Role } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Mock data will only be used if Supabase auth fails
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@eaglexpert.com",
    password: "password",
    role: "admin" as Role,
    franchises: [],
    createdAt: new Date()
  },
  {
    id: "2",
    name: "Commercial User",
    email: "commercial@eaglexpert.com",
    password: "password",
    role: "commercial" as Role,
    franchises: [
      { id: "1", name: "Franchise Abidjan", location: "Abidjan", createdAt: new Date() },
      { id: "2", name: "Franchise Yamoussoukro", location: "Yamoussoukro", createdAt: new Date() }
    ],
    createdAt: new Date()
  },
  {
    id: "3",
    name: "Manager User",
    email: "manager@eaglexpert.com",
    password: "password",
    role: "franchise_manager" as Role,
    franchises: [
      { id: "1", name: "Franchise Abidjan", location: "Abidjan", createdAt: new Date() }
    ],
    createdAt: new Date()
  },
  {
    id: "4",
    name: "Supervisor User",
    email: "supervisor@eaglexpert.com",
    password: "password",
    role: "supervisor" as Role,
    franchises: [
      { id: "1", name: "Franchise Abidjan", location: "Abidjan", createdAt: new Date() }
    ],
    createdAt: new Date()
  },
  {
    id: "5",
    name: "Inspector User",
    email: "inspector@eaglexpert.com",
    password: "password",
    role: "inspector" as Role, 
    franchises: [
      { id: "1", name: "Franchise Abidjan", location: "Abidjan", createdAt: new Date() }
    ],
    createdAt: new Date()
  }
];

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for stored auth on mount and subscribe to auth changes
  useEffect(() => {
    // Check local storage first
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }

    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            // Get user profile from the database
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*, user_franchises(franchise_id)')
              .eq('id', session.user.id)
              .single();

            if (profileError) throw profileError;
            if (!profileData) throw new Error("Profile not found");

            // Get franchises for the user if any
            const franchises = [];
            
            if (profileData.user_franchises && profileData.user_franchises.length > 0) {
              const franchiseIds = profileData.user_franchises.map(uf => uf.franchise_id);
              
              const { data: franchisesData, error: franchisesError } = await supabase
                .from('franchises')
                .select('*')
                .in('id', franchiseIds);
                
              if (franchisesError) throw franchisesError;
              
              if (franchisesData) {
                franchisesData.forEach(f => {
                  franchises.push({
                    id: f.id,
                    name: f.name,
                    location: f.location,
                    createdAt: new Date(f.created_at)
                  });
                });
              }
            }

            // Create user object
            const userObject: User = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role,
              franchises,
              profileUrl: profileData.profile_url || undefined,
              createdAt: new Date(profileData.created_at)
            };

            setUser(userObject);
            localStorage.setItem("user", JSON.stringify(userObject));
          } catch (error) {
            console.error("Error fetching user profile:", error);
            toast({
              title: "Erreur de connexion",
              description: "Impossible de charger votre profil. Veuillez réessayer.",
              variant: "destructive"
            });
            // If we can't get user profile, sign out
            await supabase.auth.signOut();
            localStorage.removeItem("user");
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem("user");
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    setIsLoading(false);

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Try to sign in with Supabase auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Auth state change listener will handle updating the user state
      
    } catch (error) {
      console.error("Login failed, trying mock data:", error);
      
      // Fall back to mock data for development/demo purposes
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      } else {
        throw new Error("Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear local storage and state
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
