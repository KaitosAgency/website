import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";
import Hero from "./components/pages/homepage/Hero";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Hero />
    </main>
  );
}
