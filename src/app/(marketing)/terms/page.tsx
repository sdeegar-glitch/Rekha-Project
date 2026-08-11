export default function TermsPage() {
  return (
    <div className="container mx-auto py-24 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="mb-4 text-muted-foreground">Effective Date: [Insert Date]</p>
      
      <section className="mb-8 space-y-4 text-muted-foreground">
        <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing our website and booking our services, you agree to comply with and be bound by these Terms of Service.</p>
        
        <h2 className="text-2xl font-semibold text-foreground">2. Booking and Cancellation</h2>
        <p>Appointments must be cancelled at least 24 hours in advance to avoid cancellation fees. Late cancellations may be subject to a fee up to the full cost of the session.</p>
        
        <h2 className="text-2xl font-semibold text-foreground">3. Medical Disclaimer</h2>
        <p>The information on this website is for informational purposes only and does not substitute for professional medical advice, diagnosis, or treatment.</p>
      </section>
    </div>
  )
}
