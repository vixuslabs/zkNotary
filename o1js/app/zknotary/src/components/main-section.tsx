"use client";


import React from "react";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from "@/components/ui/card";

export default function MainSection() {

	return (
		<Card className="w-full max-w-2xl">
			<CardContent className="flex items-center justify-center p-6 shadow-xl">
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
	)
}
