CREATE TABLE "hostaway_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"token_type" varchar(20) DEFAULT 'Bearer' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"rating" integer,
	"public_review" text NOT NULL,
	"review_category" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"submitted_at" timestamp NOT NULL,
	"guest_name" varchar(200) NOT NULL,
	"listing_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
