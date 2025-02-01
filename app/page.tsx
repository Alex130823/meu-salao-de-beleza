"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, CreditCard, Banknote, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Script from "next/script"
import { Logo } from "@/components/Logo"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

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

const allTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

type BookedTimes = Record<string, string[]>

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("")
  const [availableTimes, setAvailableTimes] = useState<string[]>(allTimes)
  const [bookedTimes, setBookedTimes] = useState<BookedTimes>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('bookings') || '{}')
    }
    return {}
  })
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    if (date) {
      const dateKey = format(date, 'yyyy-MM-dd')
      const busyTimes = bookedTimes[dateKey] || []
      setAvailableTimes(allTimes.filter(t => !busyTimes.includes(t)))
    }
  }, [date, bookedTimes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!name || !phone) throw new Error("Preencha seu nome e telefone")
      if (!date || !time) throw new Error("Selecione data e horário")
      if (!availableTimes.includes(time)) throw new Error("Horário indisponível")

      const selectedServiceData = [...services.nails, ...services.eyebrows].find(
        service => service.name === selectedService
      )
      if (!selectedServiceData) throw new Error("Serviço não selecionado")

      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedServiceData.name,
          price: selectedServiceData.price,
          paymentMethod,
          date: format(date, "yyyy-MM-dd"),
          time,
          clientName: name,
          clientPhone: phone
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao criar preferência")
      if (!data.id) throw new Error("ID de preferência não recebido")

      const dateKey = format(date, 'yyyy-MM-dd')
      setBookedTimes(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), time]
      }))

      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY!, {
        locale: "pt-BR",
      })

      mp.checkout({
        preference: { id: data.id },
        render: {
          container: "#payment-form",
          label: "Pagar",
        },
      })
    } catch (error: any) {
      alert(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookedTimes))
  }, [bookedTimes])

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
              Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Dados do Cliente</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="WhatsApp (11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Serviço</Label>
                <Select onValueChange={setSelectedService} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section-nails" disabled className="font-semibold">
                      Unhas
                    </SelectItem>
                    {services.nails.map(service => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - R${service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                    <SelectItem value="section-eyebrows" disabled className="font-semibold">
                      Sobrancelhas
                    </SelectItem>
                    {services.eyebrows.map(service => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name} - R${service.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={time} onValueChange={setTime} disabled={!date}>
                  <SelectTrigger>
                    <SelectValue placeholder={date ? "Selecione" : "Escolha a data primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                    {availableTimes.length === 0 && date && (
                      <div className="p-2 text-sm text-red-500">Nenhum horário disponível</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pagamento</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
                    <Label
                      htmlFor="credit"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <CreditCard className="mb-3 h-6 w-6" />
                      Crédito
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="debit" id="debit" className="peer sr-only" />
                    <Label
                      htmlFor="debit"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Banknote className="mb-3 h-6 w-6" />
                      Débito
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
                {loading ? "Processando..." : "Confirmar Agendamento"}
              </Button>

              <div id="payment-form" className="mt-4"></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}