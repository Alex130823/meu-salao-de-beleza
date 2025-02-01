import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const preference = {
      items: body.items,
      back_urls: {
        success: process.env.NEXT_PUBLIC_SITE_URL + "/success",
        failure: process.env.NEXT_PUBLIC_SITE_URL + "/failure",
        pending: process.env.NEXT_PUBLIC_SITE_URL + "/pending",
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [], // Mantemos vazio para aceitar cartão de crédito, débito e PIX
      },
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 500 });
  }
}
