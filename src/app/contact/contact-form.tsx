import { SendIcon } from "lucide-react";

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
    <Card className="relative p-8">
      <div className="bg-primary/10 pointer-events-none absolute -top-24 -right-24 size-48 rounded-full blur-3xl" />
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Formularz kontaktowy</CardTitle>
        <CardDescription className="text-sm">
          Wypełnij formularz, a odpowiemy najszybciej jak to możliwe.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6">
        <form>
          <FieldSet>
            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Imię i Nazwisko *</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  autoComplete="off"
                  placeholder="Jan Kowalki"
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
                        <SelectItem key={item.value} value={item.value}>
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
                  rows={10}
                  required
                  className="min-h-32 resize-none"
                  placeholder="Opisz swoje pytanie lub propozycję współpracy..."
                ></Textarea>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Button type="submit" className="mt-6 w-full py-5">
            <SendIcon className="size-4" />
            Wyślij wiadomość
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
