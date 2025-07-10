import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useManagerData = () => {
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [activeLogins, setActiveLogins] = useState(0);

  const fetchRecentUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('package_updates')
        .select(`
          *,
          packages (package_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentUpdates(data || []);
    } catch (error) {
      console.error('Error fetching recent updates:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchActiveLogins = async () => {
    // For now, we'll simulate active logins. In a real app, you'd track sessions
    setActiveLogins(Math.floor(Math.random() * 20) + 5);
  };

  useEffect(() => {
    fetchRecentUpdates();
    fetchPackages();
    fetchActiveLogins();
    
    // Set up real-time subscriptions
    const updatesSubscription = supabase
      .channel('package_updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'package_updates' },
        () => fetchRecentUpdates()
      )
      .subscribe();

    const packagesSubscription = supabase
      .channel('packages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'packages' },
        () => fetchPackages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(updatesSubscription);
      supabase.removeChannel(packagesSubscription);
    };
  }, []);

  return {
    recentUpdates,
    packages,
    activeLogins,
    fetchRecentUpdates,
    fetchPackages,
    fetchActiveLogins
  };
};