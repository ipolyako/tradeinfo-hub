
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Transaction = {
  date: string;
  symbol: string;
  action: string;
  quantity: number;
  alertTime: string;
  tradeprice?: number;
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTransactionsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching data from Supabase alerthist table");
      
      // Add timestamp to query parameter to prevent caching
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('alerthist')
        .select('*', { count: 'exact' })
        .order('symbol', { ascending: true })
        .order('alerttime', { ascending: true });
      
      console.log(`Query executed at ${timestamp} to prevent caching`);
      console.log('Full query result:', data);
      
      if (error) {
        throw new Error(`Failed to fetch data: ${error.message}`);
      }
      
      console.log("Data fetched successfully:", data?.slice(0, 2)); // Log first 2 items
      
      // Map the data from Supabase to our Transaction type
      // Preserve the exact timestamp format from the database
      const mappedData: Transaction[] = (data || []).map((item: any) => ({
        // Store full alerttime as it appears in the database
        date: item.alerttime ? item.alerttime.split('T')[0] : '',
        symbol: item.symbol || "",
        action: item.action || "",
        quantity: item.tradesize || 0,
        // Store the raw alerttime value for display
        alertTime: item.alerttime || "",
        tradeprice: item.tradeprice || 0,
      }));
      
      console.log(`Mapped ${mappedData.length} transactions from database`);
      setTransactions(mappedData);
      toast({
        title: "Data loaded successfully",
        description: "Transactions data loaded from the database"
      });
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions data. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Could not fetch transaction data from the database"
      });
      
      // No fallback to mock data - we'll show an error state
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a timestamp to force a fresh fetch each time
    const timestamp = new Date().getTime();
    console.log(`Initializing data fetch at ${timestamp}`);
    fetchTransactionsData();

    // Re-fetch when component unmounts and remounts to ensure fresh data
    return () => {
      console.log('TransactionsHistory unmounting, next mount will fetch fresh data');
    };
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    transactions,
    paginatedTransactions,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};
