import Banner from "./landing/Banner";
import Buyers from "./landing/Buyers";
import Provide from "./landing/Provide";
import Why from "./landing/Why";
import Network from "./landing/Network";
import Clientsay from "./landing/Clientsay";
import Newsletter from "./landing/Newsletter";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <main>
      <Banner onNavigate={onNavigate} />
      <Buyers />
      <Provide />
      <Why />
      <Network />
      <Clientsay />
      <Newsletter />
    </main>
  );
}
