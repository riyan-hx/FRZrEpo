import { Header, Hero, Marquee, Services, Work, Process, Faq, Contact, Footer } from './components.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Work />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
