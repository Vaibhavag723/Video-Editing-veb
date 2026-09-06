import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import EditorWindow from './components/EditorWindow.jsx';
import Features from './components/Features.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
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
    </>
  );
}
