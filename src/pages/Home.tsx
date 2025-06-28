
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Check, Brain, Dumbbell, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

// Local subscription plans data to avoid PaymentContext dependency
const SUBSCRIPTION_PLANS = [
  {
    id: "free-trial",
    name: "3-Day Free Trial",
    baseAmount: 0,
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    baseAmount: 2500, // 25 NGN in kobo
  },
  {
    id: "semi-annual",
    name: "6-Month Plan", 
    baseAmount: 12000, // 120 NGN in kobo
  },
  {
    id: "annual",
    name: "Annual Plan",
    baseAmount: 20000, // 200 NGN in kobo
  },
];

// Local price formatter
const formatPrice = (amount: number): string => {
  return `₦${(amount / 100).toFixed(0)}`;
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const features = [
    {
      title: "AI-Powered Fitness Plans",
      description: "Get personalized workout plans based on your goals and preferences",
      icon: <Brain className="h-12 w-12 text-fitpath-blue" />,
    },
    {
      title: "Customized Meal Plans",
      description: "Receive nutrition plans tailored to your workout routine and dietary needs",
      icon: <Dumbbell className="h-12 w-12 text-fitpath-blue" />,
    },
    {
      title: "Flexible Duration Options",
      description: "Choose from 7, 14, 21, or 30-day plans to fit your schedule",
      icon: <Calendar className="h-12 w-12 text-fitpath-blue" />,
    },
  ];

  const testimonials = [
    {
      name: "Chinelo Okonkwo",
      text: "Fitpath AI helped me stay consistent with my meals and workouts. I feel more energized every day!",
    },
    {
      name: "Tolu Adebayo",
      text: "As a busy professional, this app gave me exactly what I needed without wasting time. It's amazing.",
    },
    {
      name: "Emeka Obasi",
      text: "I've lost 4kg already in just 2 weeks. The plans are easy to follow and super motivating.",
    },
    {
      name: "Sarah Johnson",
      text: "Finally, a fitness plan that's tailored to my lifestyle. I love the simplicity and results.",
    },
    {
      name: "Michael Williams",
      text: "The daily variation in meals keeps things exciting. Highly recommend for anyone serious about health.",
    },
    {
      name: "Amanda Jones",
      text: "I use it every morning. The structure and pacing of workouts keep me accountable!",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-white to-fitpath-gray rounded-2xl mb-12">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Transform Your Fitness Journey with{" "}
                <span className="text-fitpath-blue">AI-Powered</span> Plans
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                FitPath AI creates personalized fitness and meal plans tailored to your goals,
                preferences, and schedule.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button
                    size="lg"
                    onClick={() => navigate("/plans")}
                    className="bg-fitpath-blue hover:bg-blue-600 text-white"
                  >
                    Generate Your Plan <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() => navigate("/signup")}
                    className="bg-fitpath-blue hover:bg-blue-600 text-white"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/plans")}
                >
                  View Plans
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Fitness Training"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-center mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 bg-gray-50 rounded-2xl">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Choose the plan that works best for you
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
                  plan.id === "monthly" ? "border-2 border-fitpath-blue" : ""
                }`}
              >
                {plan.id === "monthly" && (
                  <div className="bg-fitpath-blue text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 mx-auto w-fit">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-center mb-2">{plan.name}</h3>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">
                    {plan.baseAmount === 0 ? "Free" : formatPrice(plan.baseAmount)}
                  </span>
                  {plan.baseAmount > 0 && (
                    <span className="text-gray-600"> / {plan.id === "monthly" ? "month" : plan.id}</span>
                  )}
                </div>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Personalized Fitness Plans</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Customized Meal Plans</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Plan History & Download</span>
                  </li>
                  {plan.id !== "free-trial" && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Priority Support</span>
                    </li>
                  )}
                </ul>
                <Button
                  className={`w-full ${
                    plan.id === "free-trial"
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      : plan.id === "monthly"
                      ? "bg-fitpath-blue hover:bg-blue-600 text-white"
                      : ""
                  }`}
                  variant={plan.id === "free-trial" ? "outline" : "default"}
                  onClick={() => navigate("/plans")}
                >
                  {plan.id === "free-trial" ? "Start Free Trial" : "Choose Plan"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white rounded-2xl my-12">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Users Are Saying</h2>
          <p className="text-lg text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Discover how Fitpath AI has helped people transform their fitness journey
          </p>
          
          <div className="relative px-12 max-w-4xl mx-auto">
            <div className="w-full">
              <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-fitpath-gray p-8 rounded-2xl shadow-soft transition-all duration-300 hover:shadow-hover text-center min-h-[200px] flex flex-col justify-center">
                      <p className="text-lg italic mb-6">"{testimonial.text}"</p>
                      <h3 className="font-semibold text-fitpath-blue">{testimonial.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeIndex === index 
                      ? "bg-fitpath-blue scale-110" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 mt-12">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to start your fitness journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of users who have transformed their bodies and lives with FitPath AI's
            personalized fitness and meal plans.
          </p>
          <Button
            size="lg"
            onClick={() => navigate(user ? "/plans" : "/signup")}
            className="bg-fitpath-blue hover:bg-blue-600 text-white"
          >
            {user ? "Generate Your Plan" : "Sign Up Now"} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
