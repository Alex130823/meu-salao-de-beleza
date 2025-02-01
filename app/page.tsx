"use client";

import { useEffect } from "react";

export default function PaymentPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = () => {
        console.log("MercadoPago SDK carregado com sucesso!");
      };
      document.body.appendChild(script);
    }
  }, []);

  return <div>Carregando Mercado Pago...</div>;
}
