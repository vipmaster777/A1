import { ZodiacSign } from "@/lib/constants";

export type RoleProfileDto = {
  id: number;
  roleName: string;
  preferredZodiacSigns: ZodiacSign[];
  preferredBirthMonths: number[];
  minAge: number;
  maxAge: number;
  weights: {
    zodiacWeight: number;
    ageWeight: number;
    monthWeight: number;
  };
};

export type CheckResult = {
  full_name: string;
  role_name: string;
  zodiac_sign: ZodiacSign;
  age_years: number;
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW" | "NO";
  breakdown: {
    zodiac_points: number;
    age_points: number;
    month_points: number;
  };
  reasons: string[];
};
