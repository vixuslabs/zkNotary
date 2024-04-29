"use client";

import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { format } from "date-fns";
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { NOTARY_PUB_KEY } from "@/lib/constants";

import { Button } from "@/components/ui/button";

import { notarize_github } from "@/server/actions/notarize_github";

import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExamplesStore } from "@/components/examples-store";

const githubFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  repo: z.string().min(1, "Repository name is required"),
  since: z.date({
    required_error: "Since date is required",
  }),
  until: z.date({
    required_error: "Until date is required",
  }),
});

export type NotaryGithubArgs = z.infer<typeof githubFormSchema>;

export default function GithubNotarizationForm() {
  const { isFetching, setFetching, setProofData, setVerifiedData } =
    useExamplesStore((state) => state);
  const form = useForm<NotaryGithubArgs>({
    resolver: zodResolver(githubFormSchema),
    defaultValues: {
      username: "",
      repo: "",
      since: new Date(),
      until: new Date(),
    },
  });

  const onSubmit = useCallback(async (values: NotaryGithubArgs) => {
    const verify = (await import("zknotary-verifier")).verify;

    if (values.since > values.until) {
      form.setError("since", {
        type: "manual",
        message: "Since date must be before the until date",
      });
      return;
    }
    setFetching(true);
    toast.promise(() => notarize_github(values), {
      loading:
        "Notarizing GitHub data. Please stay on this page, it can take up to a minute.",

      success: ({ data }) => {
        setProofData(data, "github");

        const strData = JSON.stringify(data);

        const verifiedData = verify(strData, NOTARY_PUB_KEY);

        console.log("verifiedData", verifiedData);

        setVerifiedData(verifiedData, "github");

        setFetching(false);

        return "GitHub data notarized successfully";
      },
      error: (error) => {
        setFetching(false);
        console.warn("error", error);
        return "Error: " + error.message;
      },
    });
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your GitHub username" {...field} />
              </FormControl>
              <FormDescription>
                Enter the GitHub username associated with the repository.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="repo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repository Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter the repository name" {...field} />
              </FormControl>
              <FormDescription>
                Enter the name of the repository you want to notarize.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="since"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="mr-2">Since Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2005-04-07")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the start date for the notarization period.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="until"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Until Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2005-04-07")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the end date for the notarization period.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isFetching} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
