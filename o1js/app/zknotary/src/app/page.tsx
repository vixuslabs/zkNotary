import Image from "next/image";

import NavBar from "@/components/core/nav-bar";
import MainSection from "@/components/core/main-section";
import Footer from "@/components/core/footer";

import MainSectionContainer from "@/components/main-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-center h-16 px-4 border-b md:px-6">
        <NavBar />
      </header>

      <main className="flex flex-grow w-full min-h-full items-center justify-center">
        <MainSectionContainer />
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}
