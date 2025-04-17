
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is FitPath AI?",
      answer:
        "FitPath AI is an AI-powered fitness and meal planning web app that creates personalized plans based on your goals, preferences, and schedule. Our platform uses advanced AI technology to generate customized workout and nutrition plans to help you achieve your fitness goals.",
    },
    {
      question: "How do I create a fitness plan?",
      answer:
        "After signing up and logging in, you can generate a plan by navigating to the Plans page. Select your desired duration (7, 14, 21, or 30 days), choose a subscription plan, and click on 'Generate Plan'. Our AI will create a personalized fitness and meal plan tailored to your selected duration.",
    },
    {
      question: "Are the workout plans suitable for beginners?",
      answer:
        "Yes, our AI generates plans suitable for all fitness levels. The workouts are designed to be accessible while still providing the right level of challenge for your fitness journey. If you're a beginner, we recommend starting with a 7-day plan to ease into your fitness routine.",
    },
    {
      question: "Can I modify my fitness plan after it's generated?",
      answer:
        "Currently, you cannot edit plans directly in the app. However, you can generate a new plan at any time. We're working on adding customization features in future updates that will allow you to modify exercises, meals, and other aspects of your plan.",
    },
    {
      question: "How does the meal planning work?",
      answer:
        "Each fitness plan includes a comprehensive meal plan with breakfast, lunch, dinner, and snack recommendations for each day of your plan. The meals are designed to complement your workouts and support your fitness goals with nutritious options.",
    },
    {
      question: "Can I download my plans?",
      answer:
        "Yes, you can download your fitness and meal plans at any time from your dashboard or the plan detail page. The downloaded file includes all workouts, exercises, and meals for easy reference when you're offline or at the gym.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept various payment methods through our secure Paystack integration, including credit/debit cards, bank transfers, and mobile payments. All transactions are processed securely, and your payment information is never stored on our servers.",
    },
    {
      question: "What's included in the free trial?",
      answer:
        "The 3-day free trial allows you to generate one fitness and meal plan to experience the FitPath AI platform. You'll have full access to view and download your plan but are limited to one plan generation during the trial period.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can manage your subscription from your dashboard. Navigate to the Subscription tab and click on 'Manage Subscription'. From there, you can cancel your current plan. If you need assistance, please contact our support team via email or phone.",
    },
    {
      question: "How many plans can I create with my subscription?",
      answer:
        "All paid subscriptions (Monthly, 6 Months, and Annual) include unlimited plan generation. You can create as many personalized fitness and meal plans as you need throughout your subscription period.",
    },
    {
      question: "Are the workouts suitable for home or do I need gym equipment?",
      answer:
        "Our AI generates plans that can be adapted for both home and gym workouts. While some exercises may suggest basic equipment, most can be performed with minimal or no equipment. We're working on adding more customization options in the future to specify available equipment.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach our customer support team through multiple channels. Visit our Contact page to find our phone numbers, email address, or use the contact form. We strive to respond to all inquiries within 24 hours.",
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about FitPath AI, our plans, and subscription options.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 bg-primary/5 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            If you couldn't find the answer to your question, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:bonaventurejoshuaaugustine@gmail.com"
              className="bg-white border border-gray-200 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
