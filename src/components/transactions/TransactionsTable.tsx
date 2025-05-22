
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Transaction } from "@/hooks/useTransactions";

interface TransactionsTableProps {
  transactions: Transaction[];
  formatAlertDateTime: (dateStr: string, timeStr: string) => string;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  formatAlertDateTime,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead> 
            <TableHead>Symbol</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Alert Date & Time</TableHead>
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
                <TableCell>{transaction.action}</TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell className="text-right">{transaction.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {transaction.tradeprice ? transaction.tradeprice.toFixed(2) : 'N/A'}
                </TableCell>
                <TableCell>{formatAlertDateTime(transaction.date, transaction.alertTime)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
