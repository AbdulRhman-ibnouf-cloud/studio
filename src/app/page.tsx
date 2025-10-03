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
  Baseline,
  LogOut,
} from "lucide-react";
import { useAuth, useUser } from "@/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeAbg } from "@/app/actions";
import { AbgFormSchema, type AbgFormState } from "@/app/schema";
import { Slider } from "@/components/ui/slider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Login } from "@/components/Login";

type Results = Omit<AbgFormState, "error">;

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholderImage = PlaceHolderImages.find(
    (img) => img.id === "medical-chart-placeholder"
  );

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
    if (!user) {
      setError("You must be logged in to perform an analysis.");
      return;
    }
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
  
  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
  };


  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
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
    { name: "pH", label: "pH", icon: FlaskConical, min: 6.8, max: 7.8, step: 0.01 },
    { name: "pCO2", label: "pCO₂ (mmHg)", icon: Cloud, min: 10, max: 150, step: 1 },
    { name: "HCO3", label: "HCO₃⁻ (mEq/L)", icon: Droplets, min: 5, max: 60, step: 1 },
    { name: "PaO2", label: "PaO₂ (mmHg)", icon: Wind, min: 20, max: 500, step: 1 },
    { name: "BE", label: "Base Excess (mEq/L)", icon: Baseline, min: -30, max: 30, step: 1 },
  ] as const;

  return (
    <>
      <div className="min-h-screen w-full">
        <header className="absolute top-4 right-4 z-10 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign Out</span>
          </Button>
          <ThemeToggle />
        </header>
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
                      className="space-y-8"
                    >
                      {formFields.map((field) => (
                        <FormField
                          key={field.name}
                          control={form.control}
                          name={field.name}
                          render={({ field: { value, onChange } }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel className="flex items-center gap-2">
                                  <field.icon className="w-4 h-4 text-muted-foreground" />
                                  {field.label}
                                </FormLabel>
                                <span className="text-sm font-medium text-foreground w-20 text-right">
                                  {value}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  value={[value]}
                                  onValueChange={(vals) => onChange(vals[0])}
                                  min={field.min}
                                  max={field.max}
                                  step={field.step}
                                  disabled={isLoading}
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
                        disabled={isLoading || !user}
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
                  <Card className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[50vh] shadow-none border-dashed">
                    {placeholderImage && (
                      <div className="mb-4 rounded-lg overflow-hidden aspect-video relative w-full max-w-md">
                        <Image
                          src={placeholderImage.imageUrl}
                          alt={placeholderImage.description}
                          fill
                          className="object-cover"
                          data-ai-hint={placeholderImage.imageHint}
                        />
                      </div>
                    )}
                    <Lightbulb className="h-10 w-10 text-muted-foreground mb-4 mt-8" />
                    <h3 className="text-xl font-semibold text-foreground">
                      Awaiting Analysis
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
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
