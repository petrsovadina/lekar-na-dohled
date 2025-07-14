import { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Search, Calendar, Video, Shield, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'DoktorNaDohled - Najděte svého lékaře s pomocí AI',
  description: 'Inteligentní vyhledávání lékařů v České republice. Využijte AI asistenta pro rychlé a přesné doporučení zdravotnických služeb.',
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl czech-text">
              Najděte svého{' '}
              <span className="text-transparent bg-clip-text health-gradient">
                lékaře
              </span>{' '}
              s pomocí AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 czech-text">
              Inteligentní vyhledávání zdravotnických služeb v České republice. 
              Náš AI asistent vám pomůže najít správného specialistu podle vašich potřeb.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/chat"
                className="rounded-md bg-health-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-health-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-health-primary transition-colors"
              >
                <Sparkles className="mr-2 h-4 w-4 inline" />
                Začít s AI asistentem
              </Link>
              <Link
                href="/vyhledavani"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-health-primary transition-colors"
              >
                Procházet lékaře <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-health-primary to-health-info opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-health-primary">
              Moderní zdravotnictví
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl czech-text">
              Vše co potřebujete pro vaše zdraví
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Komplexní platforma pro vyhledávání a objednávání zdravotnických služeb
              s podporou umělé inteligence a důrazem na ochranu osobních údajů.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-health-primary">
                    <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  AI asistent pro zdraví
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Inteligentní chatbot rozumí vašim zdravotním potřebám a doporučí 
                  vhodné specialisty podle symptomů a preferencí.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-health-primary">
                    <Search className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Pokročilé vyhledávání
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Filtrujte lékaře podle specializace, lokality, dostupnosti, 
                  pojišťovny a hodnocení pacientů.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-health-primary">
                    <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Online rezervace
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Objednejte se k lékaři přímo online s automatickým potvrzením 
                  a připomínkami prostřednictvím SMS nebo emailu.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-health-primary">
                    <Video className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Telemedicína
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Konzultace s lékaři prostřednictvím zabezpečených videohovorů 
                  z pohodlí vašeho domova.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-health-primary">
                    <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  GDPR compliance
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Maximální ochrana vašich osobních a zdravotních údajů 
                  v souladu s evropskou legislativou.
                </dd>
              </div>

              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-health-primary">
                    <Heart className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  České zdravotnictví
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Specializace na český zdravotní systém s podporou všech 
                  pojišťoven a regionálních specifik.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* AI Chat Preview Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl czech-text">
              Vyzkoušejte AI asistenta
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Popište vaše symptomy nebo zdravotní potřeby a AI vám doporučí 
              vhodné specialisty a zdravotnická zařízení.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="rounded-lg bg-white p-8 shadow-sm ring-1 ring-gray-200">
              {/* Simple Chat Demo */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-health-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-900">
                        Dobrý den! Jsem váš AI asistent pro zdraví. 
                        Jak vám mohu pomoci najít vhodného lékaře?
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1">
                    <div className="bg-health-primary rounded-lg p-3 ml-12">
                      <p className="text-sm text-white">
                        Bolí mě hlava a mám často závratě. Potřebuji se objednat k neurologovi v Praze.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-health-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-900">
                        Rozumím vašim symptomům. Našel jsem 3 vhodné neurology v Praze, 
                        kteří mají volné termíny tento týden. Všichni přijímají VZP. 
                        Chcete se podívat na jejich profily?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-8 text-center">
                <Link
                  href="/chat"
                  className="inline-flex items-center rounded-md bg-health-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-health-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-health-primary transition-colors"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Začít konverzaci
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Důvěřují nám lékaři i pacienti
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Spojujeme moderní technologie s kvalitní zdravotní péčí
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Registrovaných lékařů</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">2,500+</dd>
              </div>
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Úspěšných rezervací</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">50,000+</dd>
              </div>
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Spokojených pacientů</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">95%</dd>
              </div>
              <div className="flex flex-col bg-gray-400/5 p-8">
                <dt className="text-sm font-semibold leading-6 text-gray-600">Průměrná doba odezvy</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">&lt; 2 min</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-health-primary">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Připraveni začít?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-health-primary-foreground/90">
              Najděte svého lékaře ještě dnes. Rychle, jednoduše a bezpečně.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/chat"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-health-primary shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
              >
                Začít s AI asistentem
              </Link>
              <Link 
                href="/vyhledavani" 
                className="text-sm font-semibold leading-6 text-white hover:text-gray-100 transition-colors"
              >
                Procházet lékaře <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}