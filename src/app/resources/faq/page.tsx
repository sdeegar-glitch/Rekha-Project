import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata = {
  title: 'Frequently Asked Questions | Rekha Patel Psychology',
  description: 'Find answers to common questions about therapy, confidentiality, fees, and what to expect in your first session with Dr. Rekha Patel.',
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'What should I expect in the first session?',
      answer: 'Your first session is primarily an assessment and getting-to-know-you phase. We will discuss your current challenges, medical history, and what you hope to achieve through therapy. It is also an opportunity for you to ask questions and see if we are a good fit.'
    },
    {
      question: 'How long does a typical therapy session last?',
      answer: 'A standard individual or CBT session lasts for 50 minutes. Couples and Family therapy sessions typically last for 60 minutes.'
    },
    {
      question: 'Is what I share in therapy confidential?',
      answer: 'Yes, confidentiality is a cornerstone of therapy. Everything discussed in our sessions remains strictly private, except in rare legal circumstances where there is an immediate risk of harm to yourself or others, which is required by law.'
    },
    {
      question: 'Do you accept insurance?',
      answer: 'We operate on a private pay basis and do not directly bill insurance companies. However, we can provide you with a detailed invoice that you can submit to your insurance provider for potential out-of-network reimbursement.'
    },
    {
      question: 'How often should I attend therapy?',
      answer: 'Frequency varies depending on your specific needs and goals. Many clients begin with weekly sessions to build momentum and establish a therapeutic relationship, then transition to bi-weekly or monthly sessions as they make progress.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We require a 24-hour notice for cancellations or rescheduling. Appointments cancelled with less than 24 hours notice may be subject to a cancellation fee.'
    }
  ]

  return (
    <div className="min-h-screen bg-brand-50 pt-24 pb-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-brand-700">Find answers to common questions about starting therapy.</p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xs border border-brand-100">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-brand-900 hover:text-brand-700">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-brand-700 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </div>
  )
}
