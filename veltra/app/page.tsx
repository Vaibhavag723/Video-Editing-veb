import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import EditorWindow from "@/components/landing/EditorWindow";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import "./landing.css";

export const metadata: Metadata = {
  title: {
    absolute: "VidioCut — Create videos that keep moving",
  },
  description:
    "Edit, enhance and export professional videos directly in your browser — no complicated software, no unnecessary installs.",
};

export default function HomePage() {
  return (
    <div className="vc-home">
      {/* ambient atmosphere */}
      <div className="ambient" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>
      <div className="grid-fade" aria-hidden="true" />

      <Navbar />
      <main>
        <Hero />
        <EditorWindow />
        <Features />
      </main>
      <Footer />
    </div>
  );
}