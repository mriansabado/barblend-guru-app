import Hero from './Hero/page';
import Carousel from './Display-Components/Carousel/page';


export default function Home() {
  return (
    <>
      {/* Navbar */}
      <div className="navbar bg-customColor justify-center">
        <div className="btn btn-ghost text-4xl">BarBlend Guru</div>
      </div>

      {/* Main Box */}
      <Hero />
      <Carousel />
    </>
  );
}
