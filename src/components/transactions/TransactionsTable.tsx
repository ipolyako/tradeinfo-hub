
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Transaction } from "@/hooks/useTransactions";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransactionsTableProps {
  transactions: Transaction[];
  formatAlertDateTime: (dateStr: string, timeStr: string) => string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  formatAlertDateTime,
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isMobile ? "Act" : "Action"}</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">{isMobile ? "Qty" : "Quantity"}</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>{isMobile ? "Date" : "Alert Date & Time"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className="whitespace-nowrap">{transaction.action}</TableCell>
                <TableCell className="whitespace-nowrap">{transaction.symbol}</TableCell>
                <TableCell className="text-right whitespace-nowrap">{transaction.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {transaction.tradeprice ? transaction.tradeprice.toFixed(2) : 'N/A'}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {isMobile 
                    ? transaction.alertTime.split('T')[0] 
                    : transaction.alertTime}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
