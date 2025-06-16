import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PricingTabs from "@/components/pricing/pricing-tabs";

export default function Pricing() {
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Header />
      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl lg:text-5xl font-bold text-black mb-6">
              Planos para cada necessidade
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para seu perfil e comece a transformar seus eventos hoje mesmo.
            </p>
          </div>

          <PricingTabs />
        </div>
      </section>

      <Footer />
    </div>
  );
}
