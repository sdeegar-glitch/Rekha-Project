export default function CrisisResourcesPage() {
  return (
    <div className="container mx-auto py-24 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-destructive">Crisis Resources</h1>
      <p className="mb-8 text-lg">If you are in immediate danger or experiencing a medical emergency, please call your local emergency services immediately.</p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-bold mb-2">National Emergency Number</h2>
          <p className="text-3xl font-bold text-destructive mb-2">112</p>
          <p className="text-muted-foreground">For immediate emergency assistance in India.</p>
        </div>
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-bold mb-2">Vandrevala Foundation Helpline</h2>
          <p className="text-2xl font-bold text-brand-600 mb-2">9999 666 555</p>
          <p className="text-muted-foreground">Free psychological counseling and crisis intervention available 24/7.</p>
        </div>
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-bold mb-2">Kiran Mental Health Helpline</h2>
          <p className="text-2xl font-bold text-brand-600 mb-2">1800-599-0019</p>
          <p className="text-muted-foreground">Govt. of India toll-free helpline available 24/7 in 13 languages.</p>
        </div>
        
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-bold mb-2">AASRA</h2>
          <p className="text-2xl font-bold text-brand-600 mb-2">9820466726</p>
          <p className="text-muted-foreground">24x7 helpline for distress and suicide prevention.</p>
        </div>
      </div>
    </div>
  )
}
