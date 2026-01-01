import React from 'react';

const InfoSection: React.FC = () => {
  return (
    <div className="space-y-16 py-12">
      {/* Mission & Vision */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-6">Our Vision</h2>
        <p className="text-xl text-stone-600 italic">"Menstruators within all identities live with dignity throughout their life cycle."</p>
        <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
            <h3 className="text-xl font-semibold text-rose-600 mb-4">What is Dignified Menstruation?</h3>
            <p className="text-stone-600 leading-relaxed">
              It moves beyond the limited scope of "hygiene" to address the root causes of discrimination: taboos, stigma, and violence. It is defined as freedom from shame, abuse, and deprivation of resources.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
            <h3 className="text-xl font-semibold text-rose-600 mb-4">The 4 D Strategy</h3>
            <ul className="space-y-3 text-stone-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">01.</span>
                <span><strong className="text-stone-800">Dialogue:</strong> Deconstructing patriarchy through education.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">02.</span>
                <span><strong className="text-stone-800">Dismantle:</strong> Breaking oppressive institutional systems.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">03.</span>
                <span><strong className="text-stone-800">Develop:</strong> Empowering individuals to access rights.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">04.</span>
                <span><strong className="text-stone-800">Discourse:</strong> Igniting a global dignity-centered movement.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs Snippet */}
      <section className="bg-rose-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">Common Myths vs. Facts</h2>
          <div className="grid gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg text-stone-800 flex items-center gap-3">
                <span className="text-red-500 bg-red-100 px-2 py-1 rounded text-xs uppercase tracking-wide">Myth</span>
                Menstrual blood is impure or dirty.
              </h4>
              <p className="mt-3 text-stone-600 pl-2 border-l-4 border-green-400">
                <strong className="text-green-700">Fact:</strong> It is entirely pure and clean blood. It is the inner lining of the uterus prepared to nurture a baby. It is not stagnant or "bad" blood.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg text-stone-800 flex items-center gap-3">
                <span className="text-red-500 bg-red-100 px-2 py-1 rounded text-xs uppercase tracking-wide">Myth</span>
                You cannot eat sour foods or touch plants.
              </h4>
              <p className="mt-3 text-stone-600 pl-2 border-l-4 border-green-400">
                <strong className="text-green-700">Fact:</strong> There is no scientific connection. Menstruators need nutritious food. Touching plants does not cause them to die; that is a superstition used to control women.
              </p>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg text-stone-800 flex items-center gap-3">
                <span className="text-red-500 bg-red-100 px-2 py-1 rounded text-xs uppercase tracking-wide">Myth</span>
                Menstrual restrictions are just "culture".
              </h4>
              <p className="mt-3 text-stone-600 pl-2 border-l-4 border-green-400">
                <strong className="text-green-700">Fact:</strong> When "culture" violates human rights, it is discrimination. The Government of Nepal has criminalized discrimination related to menstruation (Muluki Criminal Code 2074).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfoSection;