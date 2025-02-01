"use client"

import { useState } from "react"
import { CalendarIcon, CreditCard, Banknote, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Script from "next/script"
import { Logo } from "@/components/Logo"

const services = {
  nails: [
    { name: "Gel na tips", price: 120.0 },
    { name: "Manutenção gel", price: 60.0 },
    { name: "Banho de gel", price: 100.0 },
    { name: "Manicure", price: 35.0 },
    { name: "Pedicure", price: 35.0 },
    { name: "Combo Mani + Pedi", price: 60.0 },
  ],
  eyebrows: [
    { name: "Designer com Henna", price: 35.0 },
    { name: "Designer Natural", price: 25.0 },
  ],
}

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedServiceData = [...services.nails, ...services.eyebrows].find(
        (service) => service.name === selectedService,
      )

      if (!selectedServiceData) {
        throw new Error("Serviço não selecionado")
      }

      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedServiceData.name,
          price: selectedServiceData.price,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar preferência de pagamento")
      }

      if (!data.id) {
        throw new Error("ID de preferência não recebido")
      }

      // Inicializar o Mercado Pago
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!, {
        locale: "pt-BR",
      })

      mp.checkout({
        preference: {
          id: data.id,
        },
        render: {
          container: "#payment-form",
          label: "Pagar",
        },
      })
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error.message)
      alert(`Erro ao processar pagamento: ${error.message}. Por favor, tente novamente.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="lazyOnload" />
      <div className="min-h-screen bg-pink-50 p-4">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarIcon className="h-6 w-6 text-pink-600" />
              Agende seu Horário e Escolha o Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Digite seu nome" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(00) 00000-0000" required type="tel" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <Select onValueChange={setSelectedService} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section-nails" disabled className="font-semibold">
                      Serviços de Unhas
                    </SelectItem>
                    {services.nails.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - R${service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                    <SelectItem value="section-eyebrows" disabled className="font-semibold">
                      Serviços de Sobrancelha
                    </SelectItem>
                    {services.eyebrows.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - R${service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <RadioGroup defaultValue="credit" onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
                    <Label
                      htmlFor="credit"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      Cartão de Crédito
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="debit" id="debit" className="peer sr-only" />
                    <Label
                      htmlFor="debit"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Banknote className="mb-3 h-6 w-6" />
                      Cartão de Débito
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                    <Label
                      htmlFor="pix"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <QrCode className="mb-3 h-6 w-6" />
                      PIX
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={loading}>
                {loading ? "Processando..." : "Confirmar Agendamento e Ir para Pagamento"}
              </Button>

              {/* Container para o botão de pagamento do Mercado Pago */}
              <div id="payment-form"></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

