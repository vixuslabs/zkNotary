import Image from "next/image";

import NavBar from "@/components/nav-bar";
import MainSection from "@/components/main-section";
import Footer from "@/components/footer";

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-center h-16 px-4 border-b md:px-6">
        <NavBar />
      </header>

      <main className="flex flex-1 items-center justify-center py-12 md:py-24 lg:py-32">
        <MainSection />
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  )
}
