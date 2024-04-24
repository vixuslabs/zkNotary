"use client";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MainSection() {
  return (
    <div className="grid px-8 w-full h-full min-h-[700px] md:min-h-[600px] grids-rows-1 gap-8 grid-cols-2">
      <Card className="w-full max-w-2xl h-full min-w-[100px]">
        <CardContent className="flex items-center justify-center shadow-xl h-full">
          <div className="flex w-fit space-x-4">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Card 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Details of Card 1</p>
              </CardContent>
            </Card>
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Card 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Details of Card 2</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl h-full min-w-[100px]">
        <CardContent className="flex items-center justify-center p-6 shadow-xl h-full">
          <div className="flex w-fit space-x-4">
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Card 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Details of Card 1</p>
              </CardContent>
            </Card>
            <Card className="w-1/2">
              <CardHeader>
                <CardTitle>Card 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Details of Card 2</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
