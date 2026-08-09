import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MentalHealthTipsPage() {
  return (
    <div className="container mx-auto py-24 px-4 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4">Mental Health Tips</h1>
      <p className="text-xl text-muted-foreground mb-12">Practical advice and habits to improve your daily well-being.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Practice Mindfulness</CardTitle>
          </CardHeader>
          <CardContent>
            Take 5 minutes every day to sit quietly, focus on your breathing, and observe your thoughts without judgment. This can significantly reduce anxiety and ground you in the present moment.
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Maintain a Sleep Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            Try to go to bed and wake up at the same time every day, even on weekends. Quality sleep is foundational to emotional regulation and cognitive function.
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stay Active</CardTitle>
          </CardHeader>
          <CardContent>
            Physical activity releases endorphins which act as natural mood lifters. Even a 20-minute brisk walk daily can make a noticeable difference in your mental state.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limit Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            Set boundaries around your screen time, especially before bed. Constant comparison and doom-scrolling can increase feelings of depression and inadequacy.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connect with Others</CardTitle>
          </CardHeader>
          <CardContent>
            Reach out to a friend or family member regularly. Social connection is a fundamental human need and one of the strongest protective factors against mental health challenges.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seek Professional Help</CardTitle>
          </CardHeader>
          <CardContent>
            Remember that it is okay to ask for help. If you feel overwhelmed, speaking with a licensed therapist can provide you with tailored strategies and support.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
