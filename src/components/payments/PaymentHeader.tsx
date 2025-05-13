
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const PaymentHeader = () => {
  return (
    <>
      <Link to="/account" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Account
      </Link>
      <h1 className="text-3xl font-bold mb-8">Payments</h1>
    </>
  );
};
