"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Beaker,
  Stethoscope,
  BrainCircuit,
  HeartPulse,
  Loader2,
  Lightbulb,
  FileText,
  TriangleAlert,
  FlaskConical,
  Wind,
  Droplets,
  Cloud,
  PlusMinus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeAbg, AbgFormSchema, type AbgFormState } from "@/app/actions";

type Results = Omit<AbgFormState, "error">;

export default function Home() {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholderImage = PlaceHolderImages.find(
    (img) => img.id === "medical-chart-placeholder"
  );

  useEffect(() => {
    if (localStorage.getItem("abgInsightsDisclaimerAccepted") === "true") {
      setHasAcceptedDisclaimer(true);
    } else {
      setIsDisclaimerOpen(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem("abgInsightsDisclaimerAccepted", "true");
    setIsDisclaimerOpen(false);
    setHasAcceptedDisclaimer(true);
  };

  const form = useForm<z.infer<typeof AbgFormSchema>>({
    resolver: zodResolver(AbgFormSchema),
    defaultValues: {
      pH: 7.4,
      pCO2: 40,
      HCO3: 24,
      PaO2: 95,
      BE: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof AbgFormSchema>) {
    setIsLoading(true);
    setResults(null);
    setError(null);

    const response = await analyzeAbg(values);

    if ("error" in response) {
      setError(response.error);
    } else {
      setResults(response);
    }

    setIsLoading(false);
  }

  const resultCards = [
    {
      title: "Automated Analysis",
      icon: Stethoscope,
      content: results?.interpretation,
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
      iconClass: "text-blue-500",
    },
    {
      title: "Diagnostic Suggestions",
      icon: BrainCircuit,
      content: results?.possibleConditions,
      bgClass: "bg-purple-50 dark:bg-purple-900/20",
      iconClass: "text-purple-500",
    },
    {
      title: "Treatment Recommendations",
      icon: HeartPulse,
      content: results?.treatmentRecommendations,
      bgClass: "bg-green-50 dark:bg-green-900/20",
      iconClass: "text-green-500",
    },
  ];

  const formFields = [
    { name: "pH", label: "pH", icon: FlaskConical },
    { name: "pCO2", label: "pCO₂ (mmHg)", icon: Cloud },
    { name: "HCO3", label: "HCO₃⁻ (mEq/L)", icon: Droplets },
    { name: "PaO2", label: "PaO₂ (mmHg)", icon: Wind },
    { name: "BE", label: "Base Excess (mEq/L)", icon: PlusMinus },
  ] as const;

  return (
    <>
      <AlertDialog open={isDisclaimerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disclaimer</AlertDialogTitle>
            <AlertDialogDescription>
              This tool provides an AI-based analysis and does not constitute medical
              advice. The interpretations are for informational purposes and should be
              used in conjunction with a full clinical evaluation by a qualified
              medical professional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="background">Your Professional Role (Optional)</Label>
            <Input id="background" placeholder="e.g., Physician, Nurse, Student" />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAcceptDisclaimer}>
              Acknowledge & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen w-full">
        <main className="container mx-auto px-4 py-8 md:py-12">
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-3">
              <Beaker className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ABG Insights
              </h1>
            </div>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered assistant for rapid Arterial Blood Gas analysis.
            </p>
          </header>

          <div className="grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="text-primary" />
                    Enter Patient ABG Values
                  </CardTitle>
                  <CardDescription>
                    Input the values from the ABG report to begin analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {formFields.map((field) => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <field.icon className="w-4 h-4 text-muted-foreground" />
                                {field.label}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="any"
                                  disabled={isLoading}
                                  {...formField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}

                      <Button
                        type="submit"
                        className="w-full font-semibold"
                        disabled={isLoading || !hasAcceptedDisclaimer}
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Now"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-3">
              <div className="space-y-6">
                {isLoading && (
                  <>
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </>
                )}

                {error && (
                  <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!isLoading && !results && !error && (
                  <Card className="flex flex-col items-center justify-center text-center p-8 h-[50vh] shadow-none border-dashed">
                    {placeholderImage && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={placeholderImage.imageUrl}
                          alt={placeholderImage.description}
                          width={300}
                          height={200}
                          className="object-cover"
                          data-ai-hint={placeholderImage.imageHint}
                        />
                      </div>
                    )}
                    <Lightbulb className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-foreground">
                      Awaiting Analysis
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Your patient&apos;s results will appear here once the analysis
                      is complete.
                    </p>
                  </Card>
                )}

                {results && (
                  <div className="space-y-6">
                    {resultCards.map(
                      (card, index) =>
                        card.content && (
                          <Card
                            key={card.title}
                            className={`shadow-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-500 ${card.bgClass}`}
                            style={{ animationDelay: `${index * 150}ms` }}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-full bg-white dark:bg-background ${card.iconClass}`}
                                >
                                  <card.icon className="h-6 w-6" />
                                </div>
                                {card.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="whitespace-pre-wrap text-foreground/90">
                                {card.content}
                              </p>
                            </CardContent>
                          </Card>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
