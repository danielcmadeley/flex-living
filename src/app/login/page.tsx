"use client";

import { useState } from "react";
import { createClientBrowser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { validateData } from "@/lib/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, User, Key, LogIn } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const supabase = createClientBrowser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    // Validate form data
    const validation = validateData(loginSchema, formData);

    if (!validation.success) {
      setError(validation.error);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fillAssessmentCredentials = () => {
    setFormData({
      email: "manager@theflex.global",
      password: "manager@123",
    });
    setError("");
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>

        {/* Login Card */}
        <Card className="bg-card/95 backdrop-blur-sm border shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Manager Login</CardTitle>
            <CardDescription>
              Sign in to access the Flex Living dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assessment Credentials Card */}
            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Assessment Login Credentials
                </h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Email:</span>{" "}
                  manager@theflex.global
                </p>
                <p>
                  <span className="font-medium text-foreground">Password:</span>{" "}
                  manager@123
                </p>
              </div>
              <Button
                type="button"
                onClick={fillAssessmentCredentials}
                variant="default"
                size="sm"
                className="mt-4 w-full"
              >
                Use Assessment Credentials
              </Button>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email address
                  </label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="h-10"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Need help?{" "}
                <Link
                  href="/"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Visit our homepage
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
