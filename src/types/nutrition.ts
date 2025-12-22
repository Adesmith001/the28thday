export interface MealLog {
  id: string;
  userId: string;
  date: Date;
  mealType: MealType;
  foods: FoodItem[];
  totalCalories: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodItem {
  name: string;
  portion: string;
  calories?: number;
  isLocalFood: boolean;
  nutrients?: Nutrients;
}

export interface Nutrients {
  protein?: number; // in grams
  carbs?: number; // in grams
  fats?: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
}

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export interface NigerianFood {
  name: string;
  localName: string;
  category: FoodCategory;
  calories: number;
  nutrients: Nutrients;
  isPCOSFriendly: boolean;
  recommendations?: string;
}

export enum FoodCategory {
  PROTEIN = 'protein',
  CARBOHYDRATE = 'carbohydrate',
  VEGETABLE = 'vegetable',
  FRUIT = 'fruit',
  DAIRY = 'dairy',
  SNACK = 'snack',
  BEVERAGE = 'beverage',
}
