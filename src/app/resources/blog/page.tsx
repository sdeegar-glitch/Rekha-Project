import { BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Blog & Resources | Rekha Patel Psychology',
  description: 'Read the latest articles, mental health tips, and psychological insights from Dr. Rekha Patel.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-brand-50 pt-24 pb-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="bg-white rounded-2xl p-12 sm:p-16 shadow-xs border border-brand-100 flex flex-col items-center">
          <div className="h-20 w-20 bg-sage-100 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-sage-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-900 mb-4">Psychology Blog</h1>
          <p className="text-lg text-brand-700 max-w-2xl mb-8">
            Our blog is currently under construction. Check back soon for insightful articles, mental health tips, and updates from Dr. Rekha Patel.
          </p>
        </div>

      </div>
    </div>
  )
}
