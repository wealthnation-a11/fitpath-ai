import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Utensils, Apple, Coffee, Soup } from "lucide-react";

const MealPlan = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Sample weekly meal plan as defined in the context
  const weeklyMealPlan = {
    1: { // Monday
      breakfast: "Oatmeal with skimmed milk, banana slices, and a sprinkle of nuts",
      midMorningSnack: "A handful of cashew nuts",
      lunch: "Brown rice with grilled chicken and steamed vegetables",
      afternoonSnack: "Carrot sticks with hummus",
      dinner: "Vegetable soup with a side of boiled plantains"
    },
    2: { // Tuesday
      breakfast: "Pap (fermented corn pudding) with moi moi (steamed bean pudding)",
      midMorningSnack: "Sliced cucumber with a dash of lemon juice",
      lunch: "Amala (yam flour swallow) with ewedu soup and grilled fish",
      afternoonSnack: "Greek yogurt with honey",
      dinner: "Stir-fried vegetables with tofu"
    },
    3: { // Wednesday
      breakfast: "Unripe plantain porridge with vegetables",
      midMorningSnack: "Apple slices with peanut butter",
      lunch: "Ofada rice with vegetable sauce and lean beef",
      afternoonSnack: "Boiled groundnuts",
      dinner: "Okra soup with a small portion of fufu"
    },
    4: { // Thursday
      breakfast: "Smoothie made with spinach, banana, and almond milk",
      midMorningSnack: "Garden eggs (African eggplants)",
      lunch: "Sweet potatoes with grilled turkey and sautéed vegetables",
      afternoonSnack: "Pawpaw slices",
      dinner: "Egusi soup with a small portion of pounded yam"
    },
    5: { // Friday
      breakfast: "Whole wheat bread with avocado spread and boiled eggs",
      midMorningSnack: "Mixed fruit salad",
      lunch: "Jollof rice with grilled fish and a side salad",
      afternoonSnack: "Roasted plantain chips",
      dinner: "Vegetable stir-fry with quinoa"
    },
    6: { // Saturday
      breakfast: "Akara (bean cakes) with pap",
      midMorningSnack: "Tigernuts",
      lunch: "Yam porridge with spinach and smoked fish",
      afternoonSnack: "Boiled corn with coconut",
      dinner: "Light vegetable soup with a small portion of rice"
    },
    0: { // Sunday
      breakfast: "Granola with unsweetened yogurt and fresh berries",
      midMorningSnack: "Orange slices",
      lunch: "Eba (cassava flour swallow) with ogbono soup and lean meat",
      afternoonSnack: "Boiled eggs",
      dinner: "Steamed vegetables with grilled chicken"
    }
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const monthlyFocus = [
    { month: "January", focus: "Increase fiber intake with more legumes and whole grains" },
    { month: "February", focus: "Incorporate heart-healthy fats from sources like avocados and nuts" },
    { month: "March", focus: "Explore new vegetables and incorporate them into meals" },
    { month: "April", focus: "Practice mindful eating and reduce added sugars" },
    { month: "May", focus: "Increase physical activity with regular exercise routines" },
    { month: "June", focus: "Focus on hydration, especially as temperatures rise" },
    { month: "July", focus: "Experiment with new healthy recipes" },
    { month: "August", focus: "Incorporate more plant-based meals" },
    { month: "September", focus: "Prepare meals ahead to avoid unhealthy choices" },
    { month: "October", focus: "Reduce sodium intake by using herbs and spices for flavor" },
    { month: "November", focus: "Practice gratitude and enjoy meals with family and friends" },
    { month: "December", focus: "Reflect on the year's progress and set goals for the next year" }
  ];

  const nutritionalTips = [
    "Portion Control: Be mindful of portion sizes to avoid overeating",
    "Cooking Methods: Opt for boiling, grilling, steaming, or baking over frying to reduce fat intake",
    "Hydration: Drink at least 1.5 to 2 liters of water daily",
    "Seasonal Produce: Utilize seasonal fruits and vegetables to maximize nutrient intake and freshness",
    "Whole Grains: Choose whole grains like brown rice, whole wheat, and oats over refined grains"
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Meal Plan</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A comprehensive 365-day meal plan featuring energy-boosting breakfasts, balanced lunches, 
            and light dinners with weekly rotations to ensure variety and prevent monotony.
          </p>
        </div>

        {/* Meal Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-6 w-6" />
              Daily Meal Structure
            </CardTitle>
            <CardDescription>
              Each day includes five carefully planned meals to support your fitness goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <Coffee className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Breakfast</h3>
                <p className="text-sm text-orange-700">Energy-boosting meals with complex carbohydrates, proteins, and healthy fats</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <Apple className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-green-800">Mid-Morning</h3>
                <p className="text-sm text-green-700">Light options like fruits or nuts</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <Soup className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Lunch</h3>
                <p className="text-sm text-blue-700">Balanced meals with lean proteins, whole grains, and vegetables</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Apple className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Afternoon</h3>
                <p className="text-sm text-purple-700">Similar to mid-morning snack</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                <h3 className="font-semibold text-indigo-800">Dinner</h3>
                <p className="text-sm text-indigo-700">Light meals focusing on proteins and vegetables</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Meal Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Sample Weekly Meal Plan
            </CardTitle>
            <CardDescription>
              This weekly rotation repeats throughout the year with seasonal variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dayNames.map((dayName, index) => {
                const dayMeals = weeklyMealPlan[index as keyof typeof weeklyMealPlan];
                return (
                  <div key={dayName} className="border rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-4 text-primary">{dayName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <Coffee className="h-3 w-3 mr-1" />
                          Breakfast
                        </Badge>
                        <p className="text-sm">{dayMeals.breakfast}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Apple className="h-3 w-3 mr-1" />
                          Mid-Morning
                        </Badge>
                        <p className="text-sm">{dayMeals.midMorningSnack}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Soup className="h-3 w-3 mr-1" />
                          Lunch
                        </Badge>
                        <p className="text-sm">{dayMeals.lunch}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Apple className="h-3 w-3 mr-1" />
                          Afternoon
                        </Badge>
                        <p className="text-sm">{dayMeals.afternoonSnack}</p>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Dinner
                        </Badge>
                        <p className="text-sm">{dayMeals.dinner}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for additional information */}
        <Tabs defaultValue="tips" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tips">Nutritional Tips</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Focus</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🥦 Nutritional Tips</CardTitle>
                <CardDescription>
                  Essential guidelines to maximize the benefits of your meal plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nutritionalTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📅 Monthly Focus</CardTitle>
                <CardDescription>
                  Each month focuses on a specific aspect of nutrition or fitness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthlyFocus.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-primary mb-2">{item.month}</h3>
                      <p className="text-sm text-muted-foreground">{item.focus}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/20 border-primary/20">
          <CardContent className="text-center p-8">
            <h3 className="text-2xl font-semibold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-6">
              This structured meal plan rotates weekly to ensure variety and prevent monotony while 
              incorporating seasonal fruits and vegetables for optimal nutrition.
            </p>
            <p className="text-sm text-muted-foreground">
              Create your personalized fitness plan to get your customized 365-day meal plan with these guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MealPlan;