"use client";

import React, { useCallback } from "react";

import { notarize_etherscan } from "@/server/actions/notarize_etherscan";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { NOTARY_PUB_KEY } from "@/lib/constants";

import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";

import { z } from "zod";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { useExamplesStore } from "@/stores/examples-store";

const etherscanFormSchema = z.object({
  contractAddress: z
    .string()
    .startsWith("0x", {
      message: "Contract address must start with 0x",
    })
    .length(42, {
      message: "Contract address must be 42 characters long",
    }),
  address: z
    .string()
    .startsWith("0x", {
      message: "Contract address must start with 0x",
    })
    .length(42, {
      message: "Contract address must be 42 characters long",
    }),
});

export type EtherscanFormSchema = z.infer<typeof etherscanFormSchema>;

export default function EtherscanForm() {
  const {
    setVerifiedData,
    setProofData: setNotorizedData,
    isFetching,
    setFetching,
  } = useExamplesStore((state) => state);

  const form = useForm<z.infer<typeof etherscanFormSchema>>({
    resolver: zodResolver(etherscanFormSchema),
    defaultValues: {
      contractAddress: "",
      address: "",
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof etherscanFormSchema>) => {
      const verify = (await import("zknotary-verifier")).verify;
      setFetching(true);

      toast.promise(() => notarize_etherscan(values), {
        loading:
          "Notarizing Etherscan data. Please stay on this page, it can take up to a minute.",
        success: ({ data }) => {
          setFetching(false);
          setNotorizedData(data, "etherscan");

          let json_data = JSON.stringify(data);

          let verifiedData = verify(json_data, NOTARY_PUB_KEY);

          setVerifiedData(verifiedData, "etherscan");

          return "Data Notarized Successfully! Check formatted and Raw Data Tabs for more info.";
        },
        error: (error) => {
          setFetching(false);
          return "Error: " + error.message;
        },
      });
    },
    []
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="contractAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Address</FormLabel>
              <FormControl>
                <Input placeholder="0x..." {...field} />
              </FormControl>
              <FormDescription>
                The address of the contract that you are querying.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Address</FormLabel>
              <FormControl>
                <Input placeholder="0x..." {...field} />
              </FormControl>
              <FormDescription>
                The address that you are querying from.
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
