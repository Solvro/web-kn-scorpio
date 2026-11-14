import { MessageSquareIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MESSAGE_SUBJECTS = [
  { label: "Wybierz temat...", value: null },
  { label: "Współpraca / Sponsoring", value: "sponsorship" },
  { label: "Dołączenie do Koła (HR)", value: "recruitment" },
  { label: "Zapytanie prasowe / Media", value: "media" },
  { label: "Inny temat", value: "other" },
];

export function ContactForm() {
  return (
    <Card className="relative overflow-hidden p-8">
      <div
        aria-hidden
        className="via-primary/40 absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent"
      />
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 text-primary rounded-lg border p-2">
            <MessageSquareIcon aria-hidden className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Formularz kontaktowy</CardTitle>
            <CardDescription className="text-sm">
              Wypełnij formularz, a odpowiemy najszybciej jak to możliwe.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-6">
        <form>
          <FieldSet>
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Imię i Nazwisko *</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  autoComplete="off"
                  placeholder="Jan Kowalski"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Adres E-mail *</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="jan.kowalski@example.com"
                  required
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="subject">Temat wiadomości *</FieldLabel>
                <Select items={MESSAGE_SUBJECTS} name="subject" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {MESSAGE_SUBJECTS.map((item) => (
                        <SelectItem key={item.label} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="message">Wiadomość *</FieldLabel>
                <Textarea
                  name="message"
                  id="message"
                  rows={6}
                  required
                  className="min-h-40 resize-none"
                  placeholder="Opisz swoje pytanie lub propozycję współpracy..."
                ></Textarea>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Button type="submit" className="group mt-6 w-full py-5">
            <SendIcon
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            />
            Wyślij wiadomość
          </Button>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            Pola oznaczone * są wymagane.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
