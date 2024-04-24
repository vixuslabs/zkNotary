"use client";

/**
 * v0 by Vercel. Adding back in - Shout out Vercel team, y'all are great.
 * @see https://v0.dev/t/HrbGflUm9ZS
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RawDataContainer from "./raw-data-container";

export default function MainSectionContainer() {
  return (
    <div className="grid min-h-full md:min-h-[650px] grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
      <div className="bg-gray-100 rounded-lg p-6 dark:bg-gray-800">
        <h2 className="text-2xl font-semibold mb-4">Welcome to zkNotary</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Here is a guide to get you started with the examples{" "}
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Create an account by clicking the "Sign Up" button in the top right
            corner.
          </li>
          <li>
            Once you've created your account, you'll be able to access the
            dashboard and all of our features.
          </li>
          <li>
            To get started, navigate to the "Projects" section and create a new
            project.
          </li>
          <li>
            From there, you can add team members, set up integrations, and start
            building your application.
          </li>
        </ol>
      </div>
      <div className="bg-white h-full rounded-lg shadow-lg p-6 dark:bg-gray-700">
        <Tabs className="w-full" defaultValue="config">
          <TabsList className="grid w-full grid-cols-3 gap-2 mb-4">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="clean">Clean Data</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          <TabsContent value="config">
            <form className="space-y-4">
              <div>
                <Label htmlFor="USER_AGENT">User Agent</Label>
                <Input id="USER_AGENT" placeholder="Enter your user agent" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This identifies the application or client making the request.
                </p>
              </div>
              <div>
                <Label htmlFor="Authorization">Authorization</Label>
                <Input
                  id="Authorization"
                  placeholder="Enter your authorization token"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This is used to authenticate and authorize the request.
                </p>
              </div>
              <div>
                <Label htmlFor="CHANNEL_ID">Channel ID</Label>
                <Input id="CHANNEL_ID" placeholder="Enter your channel ID" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This identifies the channel or context for the request.
                </p>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </TabsContent>
          <TabsContent value="clean">
            <RawDataContainer />
          </TabsContent>
          <TabsContent
            value="raw"
            className="min-h-full flex-1 justify-center items-center align-middle"
          >
            <RawDataContainer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
