
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Camera,
  Volume2,
  Pause,
  UserPlus,
  Mail,
  Star,
  Bug,
} from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
import { localAbgAnalysis } from "@/lib/local-abg-analysis";
import { AbgScanDialog } from "@/components/AbgScanDialog";
import { extractAbgFromImage } from "@/ai/flows/extract-abg-from-image";
import { ThemeToggleSwitch } from "@/components/ThemeToggleSwitch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { SplashScreen } from "@/components/SplashScreen";


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

const resultCardsConfig = [
    {
      key: "analysis",
      title: "Automated Analysis",
      icon: Stethoscope,
      contentKey: "interpretation",
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
      iconClass: "text-blue-500",
    },
    {
      key: "suggestions",
      title: "Diagnostic Suggestions",
      icon: BrainCircuit,
      contentKey: "possibleConditions",
      bgClass: "bg-purple-50 dark:bg-purple-900/20",
      iconClass: "text-purple-500",
    },
    {
      key: "recommendations",
      title: "Suggestions",
      icon: HeartPulse,
      contentKey: "treatmentRecommendations",
      bgClass: "bg-green-50 dark:bg-green-900/20",
      iconClass: "text-green-500",
    },
] as const;

const formFieldsConfig = [
    { name: "pH", label: "pH", icon: FlaskConical, min: 6.8, max: 7.8, step: 0.01 },
    { name: "pCO2", label: "pCO₂ (mmHg)", icon: Wind, min: 10, max: 150, step: 1 },
    { name: "HCO3", label: "HCO₃⁻ (mEq/L)", icon: Droplets, min: 5, max: 60, step: 1 },
    { name: "PaO2", label: "PaO₂ (mmHg)", icon: Wind, min: 20, max: 500, step: 1 },
    { name: "BE", label: "Base Excess (mEq/L)", icon: Baseline, min: -30, max: 30, step: 1 },
] as const;

const ResultDisplay = ({
  results,
  speakingCardKey,
  isSpeaking,
  handlePlayAudio,
}: {
  results: AnalysisResult;
  speakingCardKey: string | null;
  isSpeaking: boolean;
  handlePlayAudio: (key: string, text: string) => void;
}) => {
  return (
    <div className="animate-in fade-in-50 duration-500 mx-auto space-y-6">
      <div className="space-y-6">
          {resultCardsConfig.map((card) => {
            const content = results[card.contentKey as keyof typeof results] as string | undefined;
            return content ? (
              <Card
                key={card.key}
                className={`shadow-lg ${card.bgClass}`}
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-white dark:bg-background ${card.iconClass}`}>
                          <card.icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{card.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayAudio(card.key, content!)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {speakingCardKey === card.key && isSpeaking ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                    <span className="sr-only">Read text</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <MarkdownContent content={content} />
                </CardContent>
              </Card>
            ) : null;
          })}
        </div>
    </div>
  );
};


export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingCardKey, setSpeakingCardKey] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const defaultFormValues = {
    pH: 7.4,
    pCO2: 40,
    HCO3: 24,
    PaO2: 95,
    BE: 0,
  };

  const form = useForm<z.infer<typeof AbgFormSchema>>({
    resolver: zodResolver(AbgFormSchema),
    defaultValues: defaultFormValues,
  });
  
  const resetPage = useCallback(() => {
    setIsLoading(false);
    setIsScanning(false);
    setResults(null);
    setError(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingCardKey(null);
    form.reset(defaultFormValues);
  }, [form]);

  useEffect(() => {
    if (user) {
      if (history.length === 0 && !user.isAnonymous) {
          const savedHistory = localStorage.getItem(`abgAnalysisHistory_${user.uid}`);
          if (savedHistory) {
              setHistory(JSON.parse(savedHistory));
          }
      }
      window.scrollTo(0, 0);
    } else if (!isUserLoading) {
      setHistory([]);
      resetPage();
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [user, isUserLoading, resetPage, history.length]);

  const handleImageScan = async (imageDataUri: string) => {
    setIsScanDialogOpen(false);
    setIsScanning(true);
    setError(null);
    try {
      const result = await extractAbgFromImage({ imageDataUri });
      const { values } = result;
      
      let valueSet = false;
      if (values.pH) { form.setValue('pH', values.pH); valueSet = true; }
      if (values.pCO2) { form.setValue('pCO2', values.pCO2); valueSet = true; }
      if (values.HCO3) { form.setValue('HCO3', values.HCO3); valueSet = true; }
      if (values.PaO2) { form.setValue('PaO2', values.PaO2); valueSet = true; }
      if (values.BE) { form.setValue('BE', values.BE); valueSet = true; }
      
      if (valueSet) {
        await onSubmit(form.getValues());
      } else {
        setError("Could not extract any ABG values from the image. Please try again or enter them manually.");
      }

    } catch (e) {
      console.error("Image scan failed:", e);
      setError("Failed to analyze the image. Please ensure it's a clear photo of an ABG report.");
    } finally {
      setIsScanning(false);
    }
  };
  
  const saveHistory = (newHistory: AnalysisResult[]) => {
    if (user && !user.isAnonymous) {
      localStorage.setItem(`abgAnalysisHistory_${user.uid}`, JSON.stringify(newHistory));
    }
  }

  async function onSubmit(values: z.infer<typeof AbgFormSchema>) {
    window.speechSynthesis.cancel();
    setIsLoading(true);
    setResults(null);
    setError(null);
    setIsSpeaking(false);
    setSpeakingCardKey(null);
  
    const localResult = localAbgAnalysis(values);
  
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
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
        saveHistory(updatedHistory);
        setIsLoading(false);
        setError("You are offline. Showing local analysis only.");
        return;
    }

    if (!user) {
      setError("You must be logged in to perform an analysis.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await analyzeAbg(values);

      if ("error" in response) {
        setError(response.error);
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
        newResult.interpretation = `${localResult.interpretation} ${response.interpretation || ''}`.trim()
        setResults(newResult);
        const updatedHistory = [newResult, ...history];
        setHistory(updatedHistory);
        saveHistory(updatedHistory);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
      setError(`Sorry, we couldn't complete the analysis. ${errorMessage}`);
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
      resetPage();
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'G';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handlePlayAudio = (key: string, text: string) => {
    if (speakingCardKey === key && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingCardKey(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a suitable male voice
    const maleVoice = voices.find(voice => voice.name.toLowerCase().includes('male') && voice.lang.startsWith('en')) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    } else {
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "No suitable voice found on your system.",
      });
      return;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingCardKey(key);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingCardKey(null);
    };
    
    utterance.onerror = (event) => {
      if (event.error === 'interrupted') {
        return;
      }

      console.error('SpeechSynthesis Error:', event.error);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: `Could not play audio: ${event.error}`,
      });
      setIsSpeaking(false);
      setSpeakingCardKey(null);
    };

    window.speechSynthesis.speak(utterance);
  };
  
  if (isAppLoading) {
    return <SplashScreen />;
  }

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

  
  const displayResults = (result: AnalysisResult) => {
    window.speechSynthesis.cancel();
    setResults(result);
    form.reset(result.inputs);
    setIsHistoryOpen(false);
  }

  return (
    <>
      <AbgScanDialog 
        isOpen={isScanDialogOpen}
        onOpenChange={setIsScanDialogOpen}
        onScan={handleImageScan}
      />
      <div className="min-h-screen w-full">
        <header className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="inline-flex items-center gap-3">
              <Beaker className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ABG AI Analyzer
              </h1>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsHistoryOpen(true)}>
                  <History className="h-5 w-5" />
                  <span className="sr-only">View History</span>
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Open Settings</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Settings</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 flex flex-col h-full">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-20 w-20">
                           <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                           <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                           <p className="font-semibold text-lg">{user.displayName || user.email}</p>
                           <p className="text-sm text-muted-foreground">
                            {user.isAnonymous ? "Guest Account" : (user.email ? "" : "Signed In")}
                           </p>
                        </div>
                      </div>
                      <div className="mt-6 flex-grow space-y-4">
                        <ThemeToggleSwitch />
                         <Separator />
                        <div className="space-y-2 text-center">
                            <p className="text-sm font-medium">Designed by</p>
                            <p className="text-sm text-muted-foreground">Dr. AbdulRhman Ibn Ouf, Anaesthesiologist</p>
                        </div>
                        <div className="space-y-2">
                             <a href="mailto:x5ibnouf@gmail.com" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contact Developer
                                </Button>
                            </a>
                            <a href="mailto:x5ibnouf@gmail.com?subject=Bug%20Report:%20ABG%20AI%20Analyzer" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Bug className="mr-2 h-4 w-4" />
                                    Report a Bug
                                </Button>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Star className="mr-2 h-4 w-4" />
                                    Rate App
                                </Button>
                            </a>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <Button variant="destructive" onClick={handleSignOut} className="w-full">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
            </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12">
          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Analysis History</SheetTitle>
              </SheetHeader>
              {user.isAnonymous ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <History className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">Sign Up to Save Your History</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                        Create an account to keep a permanent record of your analyses.
                    </p>
                    <Button onClick={handleSignOut} className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up to Save History
                    </Button>
                </div>
              ) : (
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
                      <p className="text-center text-muted-foreground py-10">
                        No history yet.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </SheetContent>
          </Sheet>

          <div className="max-w-5xl mx-auto space-y-8">
            <header className="text-center mb-12 animate-in fade-in-50 duration-500">
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Your AI-powered assistant for rapid Arterial Blood Gas analysis.
                </p>
            </header>

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
                      {formFieldsConfig.map((field) => (
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
                                  disabled={isLoading || isScanning}
                                  className="[&>span:first-child]:h-2 [&>span:last-child]:h-5 [&>span:last-child]:w-5"
                              />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      ))}
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                          type="button"
                          variant="outline"
                          className="w-full font-semibold"
                          onClick={() => setIsScanDialogOpen(true)}
                          disabled={isLoading || isScanning}
                          >
                          <Camera className="mr-2 h-4 w-4" />
                          Scan ABG Report
                          </Button>
                          <Button
                          type="submit"
                          className="w-full font-semibold"
                          disabled={isLoading || isScanning || !user}
                          size="lg"
                          >
                          {isLoading || isScanning ? (
                              <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isScanning ? "Scanning..." : "Analyzing..."}
                              </>
                          ) : (
                              "Analyze Now"
                          )}
                          </Button>
                      </div>
                  </form>
                  </Form>
              </CardContent>
            </Card>

            {(isLoading || isScanning) && (
              <div className="space-y-6 mt-8">
                <div className="space-y-6 max-w-2xl mx-auto">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
              </div>
            )}
            
            {results && !isLoading && !isScanning && (
                  <ResultDisplay 
                    results={results}
                    speakingCardKey={speakingCardKey}
                    isSpeaking={isSpeaking}
                    handlePlayAudio={handlePlayAudio}
                  />
            )}

            {error && (
              <Alert variant="destructive" className="mt-8">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLoading && !isScanning && !results && !error && (
                <div className="text-center mt-16 text-muted-foreground">
                    <Beaker className="h-24 w-24 text-primary/20 mx-auto mb-8" />
                    <h3 className="text-xl font-semibold text-foreground/80">
                        Awaiting Analysis
                    </h3>
                    <p className="mt-2 max-w-sm mx-auto">
                        Enter patient values above or scan a report to begin.
                    </p>
                </div>
            )}
            
            {results && (
              <div className="text-center mt-8">
                <Button onClick={resetPage}>
                  Start New Analysis
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
