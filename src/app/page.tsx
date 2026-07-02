import SplashScreen from "@/components/SplashScreen";
import HomeLayout from "@/components/layout/HomeLayout";
import HeroSection from "@/components/section/HeroSection";
import AboutSection from "@/components/section/AboutSection";
import ProblemBackground from "@/components/section/ProblemBackground";
import SolutionSection from "@/components/section/Solution";
import ModelFlowSection from "@/components/section/ModelFlowSection";

export default function Home() {
  return (
    <>
      {/* <SplashScreen /> */}

      <HomeLayout>
        <HeroSection />
        <AboutSection/>
        <ProblemBackground />
        <SolutionSection/>
        <ModelFlowSection/>
      </HomeLayout>
    </>
  );
}
