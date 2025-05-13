
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useAuthRedirect = (redirectPath: string) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
      
      // If not logged in, redirect
      if (!currentSession) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          variant: "destructive",
        });
        navigate(redirectPath);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      // If logged out during session, redirect
      if (event === 'SIGNED_OUT') {
        navigate(redirectPath);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectPath]);

  return { session, loading };
};
