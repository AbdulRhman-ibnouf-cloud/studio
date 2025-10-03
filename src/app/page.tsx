

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import React, { useState, useEffect } from "react";
import {
  Beaker,
  Stethoscope,
  BrainCircuit,
  HeartPulse,
  Loader2,
  FileText,
  TriangleAlert,
  FlaskConical,
  Wind,
  Droplets,
  Baseline,
  LogOut,
  History,
  Settings,
  Sun,
  Moon,
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
import { Login } from "@/components/Login";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { localAbgAnalysis } from "@/lib/local-abg-analysis";

type AnalysisResult = Omit<AbgFormState, "error"> & {
  timestamp: string;
  inputs: z.infer<typeof AbgFormSchema>;
};

function MarkdownContent({ content }: { content: string | undefined }) {
  if (!content) {
    return null;
  }
  const items = content.split('\n').filter(line => line.trim().startsWith('- '));
  if (items.length > 0) {
    return (
      <ul className="list-disc space-y-2 pl-5 text-foreground/90">
        {items.map((item, index) => (
          <li key={index}>{item.substring(2)}</li>
        ))}
      </ul>
    );
  }
  return <p className="whitespace-pre-wrap text-foreground/90">{content}</p>;
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("abgAnalysisHistory");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  useEffect(() => {
    const NOTIFICATION_THRESHOLD_DAYS = 3;
    const LAST_VISIT_KEY = 'abgAppLastVisit';

    const showNotification = () => {
      new Notification('We miss you!', {
        body: 'Time to check in and analyze some ABG results.',
        icon: '/favicon.ico', // You might want to have a proper icon
      });
    };

    const handleNotifications = () => {
      const lastVisitString = localStorage.getItem(LAST_VISIT_KEY);
      const now = new Date();

      if (lastVisitString) {
        const lastVisit = new Date(lastVisitString);
        const daysSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 3600 * 24);

        if (daysSinceLastVisit >= NOTIFICATION_THRESHOLD_DAYS) {
          showNotification();
        }
      }

      localStorage.setItem(LAST_VISIT_KEY, now.toISOString());
    };

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        handleNotifications();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            handleNotifications();
          }
        });
      }
    }
  }, []);

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
  
    // Perform local analysis first
    const localResult = localAbgAnalysis(values);
  
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
        // If offline, use only local results
        const newResult: AnalysisResult = {
          interpretation: localResult.interpretation,
          possibleConditions: "Offline: AI-powered suggestions unavailable.",
          treatmentRecommendations: "Offline: AI-powered recommendations unavailable.",
          timestamp: new Date().toISOString(),
          inputs: values,
        };
        setResults(newResult);
        const updatedHistory = [newResult, ...history];
        setHistory(updatedHistory);
        localStorage.setItem("abgAnalysisHistory", JSON.stringify(updatedHistory));
        setIsLoading(false);
        setError("You are offline. Showing local analysis only.");
        return;
    }

    if (!user) {
      setError("You must be logged in to perform an analysis.");
      setIsLoading(false);
      return;
    }

    // If online, proceed with AI analysis
    try {
      const response = await analyzeAbg(values);

      if ("error" in response) {
        setError(response.error);
        // Fallback to local analysis on AI error
        setResults({
            interpretation: localResult.interpretation,
            possibleConditions: 'AI analysis failed.',
            treatmentRecommendations: 'AI analysis failed.',
            timestamp: new Date().toISOString(),
            inputs: values
        });

      } else {
        const newResult: AnalysisResult = {
          ...response,
          timestamp: new Date().toISOString(),
          inputs: values,
        };
        // We can choose to blend local and AI results here if desired
        // For now, we prefer the more detailed AI result when online
        newResult.interpretation = `${localResult.interpretation}. ${response.interpretation || ''}`.trim()
        setResults(newResult);
        const updatedHistory = [newResult, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(
          "abgAnalysisHistory",
          JSON.stringify(updatedHistory)
        );
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Sorry, we couldn't complete the analysis. ${errorMessage}`);
       // Fallback to local analysis on exception
       setResults({
        interpretation: localResult.interpretation,
        possibleConditions: 'AI analysis failed.',
        treatmentRecommendations: 'AI analysis failed.',
        timestamp: new Date().toISOString(),
        inputs: values
    });
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
    { name: "pCO2", label: "pCO₂ (mmHg)", icon: Wind, min: 10, max: 150, step: 1 },
    { name: "HCO3", label: "HCO₃⁻ (mEq/L)", icon: Droplets, min: 5, max: 60, step: 1 },
    { name: "PaO2", label: "PaO₂ (mmHg)", icon: Wind, min: 20, max: 500, step: 1 },
    { name: "BE", label: "Base Excess (mEq/L)", icon: Baseline, min: -30, max: 30, step: 1 },
  ] as const;
  
  const displayResults = (result: AnalysisResult) => {
    setResults(result);
    form.reset(result.inputs);
    setIsHistoryOpen(false);
  }

  return (
    <>
      <div className="min-h-screen w-full">
        <header className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="inline-flex items-center gap-3">
              <Beaker className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ABG Insights
              </h1>
            </div>
            <div className="flex items-center gap-4">
                <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Analysis History</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100%-4rem)]">
                      <div className="space-y-4 py-4">
                        {history.length > 0 ? (
                          history.map((item, index) => (
                            <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => displayResults(item)}>
                              <CardHeader>
                                <CardTitle className="text-base">
                                  {new Date(item.timestamp).toLocaleString()}
                                </CardTitle>
                                <CardDescription>
                                  pH: {item.inputs.pH}, pCO₂: {item.inputs.pCO2}, HCO₃⁻: {item.inputs.HCO3}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p className="truncate text-sm text-muted-foreground">{item.interpretation}</p>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground">
                            No history yet.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
            </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <header className="text-center mb-12">
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered assistant for rapid Arterial Blood Gas analysis.
            </p>
          </header>

          <div className="grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="text-primary" />
                    Patient ABG Values
                  </CardTitle>
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
                          render={({ field: { value, onChange } }) => (
                            <FormItem>
                              <div className="flex justify-between items-baseline mb-2">
                                <FormLabel className="flex items-center gap-2 font-medium">
                                  <field.icon className="w-5 h-5 text-muted-foreground" />
                                  {field.label}
                                </FormLabel>
                                <span className="text-lg font-bold text-primary w-24 text-right">
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
                                  className="[&>span:first-child]:h-2 [&>span:last-child]:h-5 [&>span:last-child]:w-5"
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
                     <Beaker className="h-24 w-24 text-primary/50 mb-8" />
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
                               <MarkdownContent content={card.content} />
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

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Settings className="h-6 w-6" />
            <span className="sr-only">Open Settings</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsHistoryOpen(true);
                  setIsSettingsOpen(false);
                }}
              >
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
              <div className="flex flex-col space-y-2">
                <Label>Theme</Label>
                <div className="flex justify-around rounded-lg bg-muted p-1">
                  <Button
                    variant={theme === 'light' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </Button>
                </div>
              </div>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

    
