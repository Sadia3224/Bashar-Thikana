import { useEffect, useState } from "react";
import { fetchListingFees } from "../api/paymentApi";

// Listing fees come from the server so the prices shown always match what Stripe charges.
export default function useListingFees() {
  const [data, setData] = useState({ fees: {}, testMode: false });
  useEffect(() => {
    let active = true;
    fetchListingFees()
      .then((result) => active && setData(result))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return data;
}
