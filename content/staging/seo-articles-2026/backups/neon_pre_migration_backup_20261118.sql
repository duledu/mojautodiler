--
-- PostgreSQL database dump
--

\restrict 0gaBYjca09TvVMWMroFxn2epU9XgWeYtXCdvQ1CMdt122wBpmsdSrVEy2tFVbi8

-- Dumped from database version 17.12 (14c6cec)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA neon_auth;


--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminRole" AS ENUM (
    'ADMIN',
    'MANAGER'
);


--
-- Name: DealerStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DealerStatus" AS ENUM (
    'ACTIVE',
    'HIDDEN'
);


--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'CLOSED',
    'SPAM',
    'SCHEDULED',
    'RESERVED',
    'SOLD',
    'LOST'
);


--
-- Name: VatMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VatMode" AS ENUM (
    'INCLUDED',
    'EXCLUDED',
    'NONE'
);


--
-- Name: VehicleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VehicleStatus" AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'SOLD',
    'HIDDEN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" uuid NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: invitation; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.invitation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    email text NOT NULL,
    role text,
    status text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "inviterId" uuid NOT NULL
);


--
-- Name: jwks; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.jwks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "publicKey" text NOT NULL,
    "privateKey" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "expiresAt" timestamp with time zone
);


--
-- Name: member; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.member (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "organizationId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: organization; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.organization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    "createdAt" timestamp with time zone NOT NULL,
    metadata text
);


--
-- Name: project_config; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.project_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    endpoint_id text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    trusted_origins jsonb NOT NULL,
    social_providers jsonb NOT NULL,
    email_provider jsonb,
    email_and_password jsonb,
    allow_localhost boolean NOT NULL,
    plugin_configs jsonb,
    webhook_config jsonb
);


--
-- Name: session; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.session (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" uuid NOT NULL,
    "impersonatedBy" text,
    "activeOrganizationId" text
);


--
-- Name: user; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


--
-- Name: verification; Type: TABLE; Schema: neon_auth; Owner: -
--

CREATE TABLE neon_auth.verification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AdminUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminUser" (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    name text,
    role public."AdminRole" DEFAULT 'ADMIN'::public."AdminRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Dealer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Dealer" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo text,
    phone text NOT NULL,
    viber text,
    instagram text,
    facebook text,
    location text NOT NULL,
    address text,
    description text,
    "workingHours" text,
    "isVerified" boolean DEFAULT true NOT NULL,
    status public."DealerStatus" DEFAULT 'ACTIVE'::public."DealerStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "locationName" text,
    "googleMapsEmbedUrl" text,
    "googleMapsUrl" text
);


--
-- Name: DealerSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DealerSettings" (
    id text NOT NULL,
    "businessName" text DEFAULT 'Moj Auto Diler'::text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    city text DEFAULT 'Srbija'::text NOT NULL,
    country text DEFAULT 'Serbia'::text NOT NULL,
    "workingHours" text DEFAULT ''::text NOT NULL,
    viber text,
    whatsapp text,
    "facebookUrl" text,
    "instagramUrl" text,
    "tiktokUrl" text,
    "mapUrl" text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "smsPhone" text
);


--
-- Name: Lead; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    message text NOT NULL,
    source text,
    type text,
    "vehicleId" text,
    "vehicleTitle" text,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dealerId" text,
    "dealerName" text,
    intent text DEFAULT 'general_inquiry'::text NOT NULL,
    "preferredContactChannel" text DEFAULT 'web'::text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    attribution text,
    "deletedAt" timestamp(3) without time zone
);


--
-- Name: Vehicle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Vehicle" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    generation text,
    year integer NOT NULL,
    mileage integer NOT NULL,
    price double precision NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    "fuelType" text NOT NULL,
    transmission text NOT NULL,
    drivetrain text NOT NULL,
    "bodyType" text NOT NULL,
    condition text DEFAULT 'polovno'::text NOT NULL,
    "engineSize" integer,
    horsepower integer,
    kilowatts integer,
    doors integer DEFAULT 4 NOT NULL,
    seats integer DEFAULT 5 NOT NULL,
    color text NOT NULL,
    "interiorColor" text,
    vin text,
    registration text,
    origin text,
    description text NOT NULL,
    "dealerNotes" text,
    equipment text[],
    "safetyFeatures" text[],
    features text[],
    images text[],
    tags text[],
    "videoUrl" text,
    status public."VehicleStatus" DEFAULT 'AVAILABLE'::public."VehicleStatus" NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "vatMode" public."VatMode" DEFAULT 'NONE'::public."VatMode" NOT NULL,
    "dealerId" text,
    "contactPhone" text,
    "contactViber" text,
    "contactName" text,
    showcase boolean DEFAULT false NOT NULL,
    "onSale" boolean DEFAULT false NOT NULL
);


--
-- Name: VehicleMedia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VehicleMedia" (
    id text NOT NULL,
    "vehicleId" text NOT NULL,
    url text NOT NULL,
    "r2Key" text,
    type text DEFAULT 'image'::text NOT NULL,
    "mimeType" text,
    "sizeBytes" integer,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: account; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invitation; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.invitation (id, "organizationId", email, role, status, "expiresAt", "createdAt", "inviterId") FROM stdin;
\.


--
-- Data for Name: jwks; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.jwks (id, "publicKey", "privateKey", "createdAt", "expiresAt") FROM stdin;
\.


--
-- Data for Name: member; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.member (id, "organizationId", "userId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.organization (id, name, slug, logo, "createdAt", metadata) FROM stdin;
\.


--
-- Data for Name: project_config; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.project_config (id, name, endpoint_id, created_at, updated_at, trusted_origins, social_providers, email_provider, email_and_password, allow_localhost, plugin_configs, webhook_config) FROM stdin;
9e797b58-b7ff-46d9-89ec-6ae92f406528	mojautodiler	ep-square-mountain-alfszku6	2026-05-13 21:36:08.489+00	2026-05-13 21:36:08.489+00	[]	[{"id": "google", "isShared": true}]	{"type": "shared"}	{"enabled": true, "disableSignUp": false, "emailVerificationMethod": "otp", "requireEmailVerification": false, "autoSignInAfterVerification": true, "sendVerificationEmailOnSignIn": false, "sendVerificationEmailOnSignUp": false}	t	{"magicLink": {"config": {"expiresIn": 5, "disableSignUp": false}, "enabled": false}, "phoneNumber": {"config": {"otp_expires_in": 300}, "enabled": false}, "organization": {"config": {"creatorRole": "owner", "membershipLimit": 100, "organizationLimit": 10, "sendInvitationEmail": false}, "enabled": true}}	{"enabled": false, "enabledEvents": [], "timeoutSeconds": 5}
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId", "impersonatedBy", "activeOrganizationId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role, banned, "banReason", "banExpires") FROM stdin;
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: neon_auth; Owner: -
--

COPY neon_auth.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AdminUser; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminUser" (id, email, "passwordHash", name, role, "createdAt", "updatedAt") FROM stdin;
cmp4kyzic0001u35sp6fdngoc	admin@autoelite.rs	$2b$12$PLACEHOLDER_HASH_REPLACE_BEFORE_PRODUCTION	AutoElite Admin	ADMIN	2026-05-13 21:37:37.86	2026-05-13 21:37:37.86
\.


--
-- Data for Name: Dealer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Dealer" (id, name, slug, logo, phone, viber, instagram, facebook, location, address, description, "workingHours", "isVerified", status, "createdAt", "updatedAt", "locationName", "googleMapsEmbedUrl", "googleMapsUrl") FROM stdin;
cmp8pugdy0000jy049ou3qred	+381637584819	Dursan	\N	+381637584819	+381637584819	\N	\N	Bujanovac	\N	\N	\N	t	ACTIVE	2026-05-16 19:05:09.235	2026-06-01 08:02:58.084	\N	\N	\N
default-dealer	AutoFerari Preševo	moj-auto-diler	\N	+381 63 123 4567	+381 63 123 4567	https://www.instagram.com/mojautodiler/	https://facebook.com/autoelite	Preševo	Preševo, Srbija, Preševo	Default dealer used for vehicles created before partner dealer assignment.	Pon-Pet: 09:00 - 18:00 | Sub: 09:00 - 14:00	t	HIDDEN	2026-05-16 10:16:37.158	2026-05-16 19:05:14.581	\N	\N	\N
cmp8p4vc90000l804ym3mce1x	+381631850324	381631850324	\N	+381631850324	+381631850324	\N	\N	Presevo	\N	\N	\N	t	ACTIVE	2026-05-16 18:45:15.562	2026-06-08 08:15:46.998	\N	https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1043.324769024254!2d21.67780394155475!3d42.30054659092786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135457fd375cd137%3A0x688c9d175cd81250!2sVase%20Smajevi%C4%87a%2053%2C%20Pre%C5%A1evo!5e0!3m2!1sen!2srs!4v1780906266314!5m2!1sen!2srs	https://maps.app.goo.gl/VRPU6NsCu2u9fURA9
cmqhujf910000l1049vzp9cjs	Vebi	+381629717391	\N	+381629717391	+381629717391	\N	\N	Bujanovac Srbija	\N	\N	\N	t	ACTIVE	2026-06-17 09:06:10.549	2026-06-17 09:27:44.304	BMW 520	https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d735.8560618759279!2d21.7679576!3d42.4612649!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srs!4v1781688323175!5m2!1sen!2srs	https://maps.app.goo.gl/GmjYDg59Waad3RhT6
cmue1c2mo0000lg04iyrqr6xz	Stefan - Jove	stefan---jove	\N	+381669025162	+381669025162	\N	\N	Bujanovac	\N	\N	\N	t	ACTIVE	2026-09-23 11:44:09.552	2026-09-23 11:44:09.552	\N	\N	\N
cmwj79jxo0000l508xkaz7rxp	AUTO HENCO-J	AUTO HENCO-J	\N	+38163 189 2800	+38163 189 2800	https://www.instagram.com/autohencoj/	https://www.facebook.com/p/Auto-Henco-J-100063557651613/	Presevo Srbija	Seljamije Halačija	### HENCO-J – Pouzdan partner za kupovinu polovnih automobila\n\n**HENCO-J iz Preševa** je firma specijalizovana za uvoz i prodaju kvalitetnih polovnih automobila iz evropskih zemalja.\n\nSa dugogodišnjim iskustvom u automobilskoj industriji, HENCO-J je izgradio reputaciju zasnovanu na kvalitetu, pouzdanosti i pažljivom odabiru vozila.\n\nAutomobili se uvoze iz **Švajcarske, Francuske, Nemačke, Holandije i Belgije**, a nabavljaju se od proverenih lizing kompanija i fizičkih lica.\n\nSvako vozilo prolazi kroz pažljiv proces odabira, uz poseban fokus na poreklo, tehničko stanje i kvalitet. U ponudi su isključivo legalno uvezena vozila, bez prethodnih havarija i ozbiljnih oštećenja.\n\nNa našem auto-placu u svakom trenutku možete pronaći **oko 20 pažljivo odabranih automobila**, prilagođenih različitim potrebama i budžetima.\n\n**HENCO-J – Dugogodišnje iskustvo, provereno poreklo i kvalitet kojem možete verovati.**	\N	t	ACTIVE	2026-11-16 11:48:25.256	2026-11-16 12:12:26.992	Seljamije Halačija, Preševo	https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2950.503852191769!2d21.6544675!3d42.310451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1354f7c0baff58c9%3A0x8b6a08fffb9e6169!2sAuto%20Pllac%20Henco-J!5e0!3m2!1sen!2srs!4v1794829386549!5m2!1sen!2srs	https://maps.app.goo.gl/2qHuGakmx9uy6fbBA
\.


--
-- Data for Name: DealerSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DealerSettings" (id, "businessName", phone, email, address, city, country, "workingHours", viber, whatsapp, "facebookUrl", "instagramUrl", "tiktokUrl", "mapUrl", "updatedAt", "smsPhone") FROM stdin;
cmp4kyze40000u35sjyoxo1zd	Moj Auto Diler	+381 63 123 4567	info@mojautodiler.com	Srbija	Preševo	Serbia	Pon-Pet: 09:00 - 18:00\nSub: 09:00 - 14:00	+381 63 123 4567	\N	https://www.facebook.com/profile.php?id=61590535682700	https://www.instagram.com/mojautodiler/	\N	https://maps.google.com/?q=Presevo,Serbia	2026-06-06 21:40:37.002	\N
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lead" (id, name, phone, email, message, source, type, "vehicleId", "vehicleTitle", status, "createdAt", "updatedAt", "dealerId", "dealerName", intent, "preferredContactChannel", "ipAddress", "userAgent", attribution, "deletedAt") FROM stdin;
cmq2tsve90002jv0457w9xtk9	Kontakt akcija	+381637584819	\N	Zakazi gledanje: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 20:48:59.122	2026-06-06 21:38:57.704	cmp8pugdy0000jy049ou3qred	+381637584819	schedule_viewing	web	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"referrer":"https://www.mojautodiler.com/sr/admin/leads","landingPage":"/sr","capturedAt":"2026-06-06T08:25:22.594Z"}	2026-06-06 21:38:57.065
cmq2tlman0000jv04vcoxt5s3	test novi final	0604409341	duledu25@gmail.com	asdfasdasdasdasdasdasdasd	email	contact	\N	\N	NEW	2026-06-06 20:43:20.73	2026-06-06 21:39:00.656	\N	\N	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 21:39:00.655
cmq2t728a0000l4045bj7ab87	test 16	0604409341	duledu25@gmail.com	ajde radi vec jednom	email	contact	\N	\N	NEW	2026-06-06 20:32:01.543	2026-06-06 21:39:03.216	\N	\N	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 21:39:03.215
cmq2l5fso0000l504o5b1eg33	test test	0604409341	duledu25@gmail.com	test_test_test11	email	contact	\N	\N	NEW	2026-06-06 16:46:48.888	2026-06-06 21:39:04.901	\N	\N	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 21:39:04.9
cmq2gofd50000l80470vmg9c5	test	0604409341	duledu25@gmail.com	test test test	email	contact	\N	\N	NEW	2026-06-06 14:41:36.713	2026-06-06 21:39:06.599	\N	\N	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 21:39:06.598
cmq2fjna10004l5044wbw6pcy	dusan	0604409341	duledu25@gmail.com	test test test	email	contact	\N	\N	NEW	2026-06-06 14:09:53.508	2026-06-06 21:39:10.356	\N	\N	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 21:39:10.355
cmq2f3tua0003l504fe8sdw23	test	test	duledu25@gmail.com	test taets	email	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 13:57:36.082	2026-06-06 21:39:12.096	cmp8pugdy0000jy049ou3qred	+381637584819	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"landingPage":"/sr/vehicle/polovni-automobili-vw-golf-6-1-6-tdi-uvoz-nemacka","capturedAt":"2026-06-06T13:56:30.461Z"}	2026-06-06 21:39:12.095
cmq2f3ahl0001l504f7a08y59	Kontakt akcija	+381637584819	\N	Zakazi gledanje: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 13:57:11.001	2026-06-06 21:39:13.787	cmp8pugdy0000jy049ou3qred	+381637584819	schedule_viewing	web	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"landingPage":"/sr/vehicle/polovni-automobili-vw-golf-6-1-6-tdi-uvoz-nemacka","capturedAt":"2026-06-06T13:56:30.461Z"}	2026-06-06 21:39:13.786
cmq240d3b0001jv04nbavhq2d	test	test	duledu25@gmail.com	test_11	email	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 08:46:58.632	2026-06-06 21:39:15.49	cmp8pugdy0000jy049ou3qred	+381637584819	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-06T08:46:16.182Z"}	2026-06-06 21:39:15.489
cmq23zqaq0001lg04lj2kzc7s	Kontakt akcija	+381637584819	\N	Zakazi gledanje: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 08:46:29.09	2026-06-06 21:39:17.084	cmp8pugdy0000jy049ou3qred	+381637584819	schedule_viewing	web	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-06T08:46:16.182Z"}	2026-06-06 21:39:17.083
cmq2398fu0003jr04th9mi9ex	dusan	stevanovic	duledu25@gmail.com	Zakazi gledanje: Volkswagen Golf 6 Variant 1.6 TDI Automatik	email	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 08:25:52.89	2026-06-06 21:39:20.159	cmp8pugdy0000jy049ou3qred	+381637584819	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"referrer":"https://www.mojautodiler.com/sr/admin/leads","landingPage":"/sr","capturedAt":"2026-06-06T08:25:22.594Z"}	2026-06-06 21:39:20.158
cmq238qey0001jr04yaohsfun	Kontakt akcija	+381637584819	\N	Zakazi gledanje: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 08:25:29.53	2026-06-06 21:39:21.739	cmp8pugdy0000jy049ou3qred	+381637584819	schedule_viewing	web	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"referrer":"https://www.mojautodiler.com/sr/admin/leads","landingPage":"/sr","capturedAt":"2026-06-06T08:25:22.594Z"}	2026-06-06 21:39:21.738
cmpzycmkl0001kz04908khmay	Kontakt akcija	+381637584819	\N	Zakazi gledanje: Volkswagen Golf 7	web	inquiry	4	Volkswagen Golf 7	NEW	2026-06-04 20:33:00.741	2026-06-06 21:39:23.766	cmp8pugdy0000jy049ou3qred	+381637584819	schedule_viewing	web	46.240.189.19	Mozilla/5.0 (Linux; Android 16; SM-S908B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.46 Mobile Safari/537.36 Instagram 432.0.0.42.80 Android (36/16; 420dpi; 2316x1080; samsung; SM-S908B; b0s; s5e9925; sr_RS_#Latn; 984954532; IABMV/1)	{"referrer":"https://l.instagram.com/","landingPage":"/sr/vehicle/bmw-x3-polovni-automobili","capturedAt":"2026-06-04T20:29:48.850Z"}	2026-06-06 21:39:23.765
cmpxvfwk60003jr04glrzdgcj	Kontakt akcija	+381637584819	\N	viber_click: Volkswagen Golf 6 Variant 1.6 TDI Automatik	viber	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-03 09:36:02.455	2026-06-06 21:39:25.448	cmp8pugdy0000jy049ou3qred	+381637584819	viber_click	viber	212.200.164.99	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-06 21:39:25.447
cmpxvfif60001jr04k5d95vn7	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 6 Variant 1.6 TDI Automatik	phone	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-03 09:35:44.13	2026-06-06 21:39:27.058	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	212.200.164.99	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	\N	2026-06-06 21:39:27.056
cmpx6jeps0001u3bkb98n1iff	Visible Phone Link Test	+381 60 000 0099	\N	Visible phone number link click	phone	inquiry	cmprj0krp0000la04rgoffe30	BMW 120D M Paket	NEW	2026-06-02 21:58:55.552	2026-06-08 06:06:23.642	\N	\N	phone_call	phone	127.0.0.1	visible-phone-link-verification-agent	\N	2026-06-08 06:06:23.638
cmq7jplcm0001kt04cxyn1vft	Kontakt akcija	+381631850324	\N	whatsapp_click: VW Tiguan	whatsapp	inquiry	cmprgofg20003jv04y0dimwul	VW Tiguan	NEW	2026-06-10 04:05:20.855	2026-06-10 04:05:20.855	cmp8p4vc90000l804ym3mce1x	+381631850324	whatsapp_click	whatsapp	95.107.144.135	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr/vehicle/vw-tiguan-2-0-tdi-4motion-2014","capturedAt":"2026-06-10T04:05:11.533Z"}	\N
cmq8ja97i0001l104m91t7vpo	Kontakt akcija	+381631850324	\N	phone_call: Škoda Octavia	phone	inquiry	cmprgc2la001ilc044l6mjjaq	Škoda Octavia	NEW	2026-06-10 20:41:11.454	2026-06-10 20:41:11.454	cmp8p4vc90000l804ym3mce1x	+381631850324	phone_call	phone	178.220.154.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-10T20:40:57.842Z"}	\N
cmq2fvloq0000l404gptje8gb	test	0604409341	duledu25@gmail.com	test_test_+1qasw	email	contact	\N	\N	NEW	2026-06-06 14:19:11.883	2026-06-06 21:39:08.556	\N	\N	general_inquiry	email	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	\N	2026-06-06 21:39:08.555
cmq23fm4w0001kw041bbtdxt6	Kontakt akcija	+381637584819	\N	Zakazi gledanje: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-06 08:30:50.576	2026-06-06 21:39:18.597	cmp8pugdy0000jy049ou3qred	+381637584819	schedule_viewing	web	178.220.154.64	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"referrer":"https://www.mojautodiler.com/sr/admin/leads","landingPage":"/sr","capturedAt":"2026-06-06T08:25:22.594Z"}	2026-06-06 21:39:18.596
cmq8s5ubu0001l504sw69annt	Kontakt akcija	+381631850324	\N	viber_click: BMW X3 xDrive20d	viber	inquiry	1	BMW X3 xDrive20d	NEW	2026-06-11 00:49:42.09	2026-06-11 00:49:42.09	cmp8p4vc90000l804ym3mce1x	+381631850324	viber_click	viber	178.220.55.117	Mozilla/5.0 (Linux; Android 16; 24117RN76E Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.83 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/564.0.0.48.74;IABMV/1;]	{"utm_source":"fb","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"http://m.facebook.com/","landingPage":"/sr/vehicle/bmw-x3-polovni-automobili","capturedAt":"2026-06-11T00:45:51.924Z"}	\N
cmq95ghyk0001ju04zh7cy79o	Kontakt akcija	+381631850324	\N	phone_call: BMW X3 xDrive20d	phone	inquiry	1	BMW X3 xDrive20d	NEW	2026-06-11 07:01:54.284	2026-06-11 07:01:54.284	cmp8p4vc90000l804ym3mce1x	+381631850324	phone_call	phone	46.99.100.111	Mozilla/5.0 (Linux; Android 16; SM-A336B Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.83 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/564.0.0.48.74;IABMV/1;]	{"utm_source":"fb","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"http://m.facebook.com/","landingPage":"/sr/vehicle/bmw-x3-polovni-automobili","capturedAt":"2026-06-11T07:01:15.373Z"}	\N
cmq9jgnv30001l5043oa0kx9t	Kontakt akcija	+381631850324	\N	Proveri dostupnost: BMW X3 xDrive20d	web	inquiry	1	BMW X3 xDrive20d	NEW	2026-06-11 13:33:56.559	2026-06-11 13:33:56.559	cmp8p4vc90000l804ym3mce1x	+381631850324	general_inquiry	web	213.196.111.66	Mozilla/5.0 (Linux; Android 14; 22101316UG Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.46 Mobile Safari/537.36 Instagram 432.1.0.44.80 Android (34/14; 440dpi; 1080x2400; Xiaomi/Redmi; 22101316UG; rubypro; mt6877; en_US; 986923712; IABMV/1)	{"utm_source":"ig","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"https://instagram.com/","landingPage":"/sr/vehicle/bmw-x3-polovni-automobili","capturedAt":"2026-06-11T13:32:13.262Z"}	\N
cmq9k2szl0001l504z03dwaan	Kontakt akcija	+381637584819	\N	Proveri dostupnost: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-11 13:51:09.633	2026-06-11 13:51:09.633	cmp8pugdy0000jy049ou3qred	+381637584819	general_inquiry	web	178.220.154.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-11T13:50:35.375Z"}	\N
cmq9onhu70001lb04q7lbfpeu	Kontakt akcija	+381637584819	\N	whatsapp_click: Volkswagen Golf 6 Variant 1.6 TDI Automatik	whatsapp	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-11 15:59:13.424	2026-06-11 15:59:13.424	cmp8pugdy0000jy049ou3qred	+381637584819	whatsapp_click	whatsapp	178.220.154.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-11T15:55:46.558Z"}	\N
cmq9onlbo0003lb049nga418e	Kontakt akcija	+381637584819	\N	viber_click: Volkswagen Golf 6 Variant 1.6 TDI Automatik	viber	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-11 15:59:17.941	2026-06-11 15:59:17.941	cmp8pugdy0000jy049ou3qred	+381637584819	viber_click	viber	178.220.154.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-11T15:55:46.558Z"}	\N
cmq9ycuha0001jo04c1spaf2t	Ljubiša Žorđević	063423074	ljupce.dj3@gmail.com	Interesuje me. Gde je vozilo,i dali je cena na ime u Srbiji?	email	inquiry	1	BMW X3 xDrive20d	NEW	2026-06-11 20:30:52.751	2026-06-11 20:30:52.751	cmp8p4vc90000l804ym3mce1x	+381631850324	general_inquiry	email	178.223.130.128	Mozilla/5.0 (Linux; Android 16; 24117RN76E Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.83 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/564.0.0.48.74;IABMV/1;]	{"utm_source":"fb","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"http://m.facebook.com/","landingPage":"/sr/vehicle/bmw-x3-polovni-automobili","capturedAt":"2026-06-11T20:27:07.531Z"}	\N
cmqas1y1e0001l804xwhn9kw2	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 6 Variant 1.6 TDI Automatik	phone	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-12 10:22:12.626	2026-06-12 10:22:12.626	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	109.245.34.154	Mozilla/5.0 (Linux; Android 15; REA-NX9 Build/HONORREA-N39; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/148.0.7778.215 Mobile Safari/537.36 com.hihonor.magazine	{"referrer":"https://honor.92fornew.com/","landingPage":"/sr","capturedAt":"2026-06-12T10:21:23.836Z"}	\N
cmqasdjpf0001ky04ubnfxzhl	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 6 Variant 1.6 TDI Automatik	phone	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-12 10:31:13.923	2026-06-12 10:31:13.923	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	37.19.110.79	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-11T20:29:56.230Z"}	\N
cmqbcxe1j0001ju04ubn5v5xm	Kontakt akcija	+381631850324	\N	phone_call: BMW X3 xDrive20d	phone	inquiry	1	BMW X3 xDrive20d	NEW	2026-06-12 20:06:32.023	2026-06-12 20:06:32.023	cmp8p4vc90000l804ym3mce1x	+381631850324	phone_call	phone	178.220.154.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-12T20:06:15.820Z"}	\N
cmqbewfmo0001l404b5n2zf7p	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 7	phone	inquiry	4	Volkswagen Golf 7	NEW	2026-06-12 21:01:46.656	2026-06-12 21:01:46.656	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	46.240.189.19	Mozilla/5.0 (Linux; Android 16; SM-S908B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.87 Mobile Safari/537.36 Instagram 433.0.0.47.68 Android (36/16; 420dpi; 1080x2316; samsung; SM-S908B; b0s; s5e9925; sr_RS_#Latn; 990700936; IABMV/1)	{"referrer":"https://l.instagram.com/","landingPage":"/sr","capturedAt":"2026-06-12T20:59:00.002Z"}	\N
cmqfnupos0001l804y2kgh0l9	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 7	phone	inquiry	4	Volkswagen Golf 7	NEW	2026-06-15 20:23:27.628	2026-06-15 20:23:27.628	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	178.220.154.82	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-15T19:11:35.706Z"}	\N
cmqbypnkr0001jp04dizhk460	Kontakt akcija	+381631850324	\N	Zatraži video: BMW X3 xDrive20d	web	inquiry	1	BMW X3 xDrive20d	NEW	2026-06-13 06:16:22.683	2026-06-13 06:16:22.683	cmp8p4vc90000l804ym3mce1x	+381631850324	request_video	web	109.245.37.169	Mozilla/5.0 (Linux; Android 16; SM-S908B Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.83 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/564.0.0.48.74;IABMV/1;]	{"utm_source":"fb","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"http://m.facebook.com/","landingPage":"/sr/vehicle/bmw-x3-polovni-automobili","capturedAt":"2026-06-13T06:14:33.062Z"}	\N
cmqglpfxi0001lb04ip07a2dy	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 6 Variant 1.6 TDI Automatik	phone	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-16 12:11:08.647	2026-06-16 12:11:08.647	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	109.245.35.135	Mozilla/5.0 (Linux; Android 12; M2004J19C Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/148.0.7778.215 Mobile Safari/537.36	{"referrer":"https://googleads.g.doubleclick.net/","landingPage":"/sr","capturedAt":"2026-06-16T12:10:44.322Z"}	\N
cmqgp94ge0001kz04m7q29k8a	Kontakt akcija	+381637584819	\N	viber_click: Volkswagen Golf 7	viber	inquiry	4	Volkswagen Golf 7	NEW	2026-06-16 13:50:25.742	2026-06-16 13:50:25.742	cmp8pugdy0000jy049ou3qred	+381637584819	viber_click	viber	178.149.64.103	Mozilla/5.0 (Linux; Android 16; 23117RA68G Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.83 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/564.0.0.48.74;IABMV/1;]	{"utm_source":"fb","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"http://m.facebook.com/","landingPage":"/sr/vehicle/polovni-automobili-vw-golf-7-1-6-tdi-2013-uvoz-nemacka","capturedAt":"2026-06-16T13:47:45.786Z"}	\N
cmqgqbnak0001l504wynt1utv	Kontakt akcija	+381637584819	\N	viber_click: Volkswagen Golf 6 Variant 1.6 TDI Automatik	viber	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-06-16 14:20:23.084	2026-06-16 14:20:23.084	cmp8pugdy0000jy049ou3qred	+381637584819	viber_click	viber	178.220.154.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-16T14:20:10.738Z"}	\N
cmqgqd58c0001js04rp7q9jwh	Kontakt akcija	+381637584819	\N	whatsapp_click: Volkswagen Golf 7	whatsapp	inquiry	4	Volkswagen Golf 7	NEW	2026-06-16 14:21:32.988	2026-06-16 14:21:32.988	cmp8pugdy0000jy049ou3qred	+381637584819	whatsapp_click	whatsapp	178.220.154.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-16T14:21:23.590Z"}	\N
cmqgqdp0a0001ib04iv9y772q	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 7	phone	inquiry	4	Volkswagen Golf 7	NEW	2026-06-16 14:21:58.618	2026-06-16 14:21:58.618	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	178.220.154.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-06-16T14:21:23.590Z"}	\N
cmqnk89f90001ih04dd31lmew	Kontakt akcija	381631850324	\N	whatsapp_click: VW Tiguan 2.0 TDI R-Line DSG 4Motion	whatsapp	inquiry	cmqkj4s9s0000l704957qxfqo	VW Tiguan 2.0 TDI R-Line DSG 4Motion	NEW	2026-06-21 09:04:10.677	2026-06-21 09:04:10.677	cmp8p4vc90000l804ym3mce1x	+381631850324	whatsapp_click	whatsapp	77.243.28.143	Mozilla/5.0 (Linux; Android 16; DNY-NX9 Build/HONORDNY-N39; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/148.0.7778.217 Mobile Safari/537.36 com.hihonor.magazine	{"referrer":"https://honor.92fornew.com/","landingPage":"/sr","capturedAt":"2026-06-21T09:04:00.439Z"}	\N
cmqtaob5e0001jv04dzxp4o5l	Kontakt akcija	+381637584819	\N	phone_call: Volkswagen Golf 7	phone	inquiry	4	Volkswagen Golf 7	NEW	2026-06-25 09:23:20.306	2026-06-25 09:23:20.306	cmp8pugdy0000jy049ou3qred	+381637584819	phone_call	phone	74.125.182.103	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36	{"landingPage":"/sr/vehicle/polovni-automobili-vw-golf-7-1-6-tdi-2013-uvoz-nemacka","capturedAt":"2026-06-25T09:23:13.313Z"}	\N
cmr3gz65t0001jy04akk3btd5	Kontakt akcija	+381637584819	\N	Rezerviši vozilo: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-07-02 12:17:26.514	2026-07-02 12:17:26.514	cmp8pugdy0000jy049ou3qred	+381637584819	reservation_request	web	109.92.153.216	Mozilla/5.0 (Linux; Android 15; V2310 Build/AP3A.240905.015.A2_CS; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.192 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/567.1.0.52.74;IABMV/1;]	{"utm_source":"fb","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"http://m.facebook.com/","landingPage":"/sr","capturedAt":"2026-07-02T12:16:01.002Z"}	\N
cmr3l37i40001jo043e86yi65	Kontakt akcija	+381637584819	\N	Rezerviši vozilo: Volkswagen Golf 6 Variant 1.6 TDI Automatik	web	inquiry	3	Volkswagen Golf 6 Variant 1.6 TDI Automatik	NEW	2026-07-02 14:12:33.341	2026-07-02 14:12:33.341	cmp8pugdy0000jy049ou3qred	+381637584819	reservation_request	web	178.220.154.82	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36	{"referrer":"https://www.google.com/","landingPage":"/sr","capturedAt":"2026-07-02T14:11:43.950Z"}	\N
cmr4b7o2s0001lc04b3upbypb	Kontakt akcija	381631850324	\N	phone_call: VW Tiguan 2.0 TDI R-Line DSG 4Motion	phone	inquiry	cmqkj4s9s0000l704957qxfqo	VW Tiguan 2.0 TDI R-Line DSG 4Motion	NEW	2026-07-03 02:23:51.46	2026-07-03 02:23:51.46	cmp8p4vc90000l804ym3mce1x	+381631850324	phone_call	phone	185.71.90.177	Mozilla/5.0 (Linux; Android 15; 23108RN04Y Build/AP3A.240905.015.A2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.163 Mobile Safari/537.36	{"utm_source":"an","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"https://l.facebook.com/","landingPage":"/sr","capturedAt":"2026-07-03T02:23:42.130Z"}	\N
cmr4b8axn0003lc04aktod0v9	Kontakt akcija	381631850324	\N	phone_call: VW Tiguan 2.0 TDI R-Line DSG 4Motion	phone	inquiry	cmqkj4s9s0000l704957qxfqo	VW Tiguan 2.0 TDI R-Line DSG 4Motion	NEW	2026-07-03 02:24:21.083	2026-07-03 02:24:21.083	cmp8p4vc90000l804ym3mce1x	+381631850324	phone_call	phone	109.245.35.251	Mozilla/5.0 (Linux; Android 15; 23108RN04Y Build/AP3A.240905.015.A2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.163 Mobile Safari/537.36	{"utm_source":"an","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"https://l.facebook.com/","landingPage":"/sr","capturedAt":"2026-07-03T02:23:42.130Z"}	\N
cmrkhhr3z0001l404i5qttnl0	Kontakt akcija	+381631850324	\N	viber_click: Audi A4 2.0 TDI Quattro	viber	inquiry	cmprfkrmf0001lc048odd6iye	Audi A4 2.0 TDI Quattro	NEW	2026-07-14 10:03:58.464	2026-07-14 10:03:58.464	cmp8p4vc90000l804ym3mce1x	+381631850324	viber_click	viber	178.197.222.242	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36	{"referrer":"https://bujanovacke.co.rs/","landingPage":"/sr","capturedAt":"2026-07-14T09:53:28.681Z"}	\N
cmsdv3x150001l105z7z1rtzd	Kontakt akcija	381631850324	\N	whatsapp_click: VW Tiguan 2.0 TDI R-Line DSG 4Motion	whatsapp	inquiry	cmqkj4s9s0000l704957qxfqo	VW Tiguan 2.0 TDI R-Line DSG 4Motion	NEW	2026-08-03 23:30:26.682	2026-08-03 23:30:26.682	cmp8p4vc90000l804ym3mce1x	+381631850324	whatsapp_click	whatsapp	178.220.6.58	Mozilla/5.0 (Linux; Android 8.0.0; WAS-LX1 Build/HUAWEIWAS-LX1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.179 Mobile Safari/537.36	{"utm_source":"an","utm_medium":"paid","utm_campaign":"52536654139593","utm_content":"52536654139793","utm_term":"52536654139393","referrer":"https://l.facebook.com/","landingPage":"/sr","capturedAt":"2026-08-03T23:30:10.615Z"}	\N
cmt8l5bn40001l804avq7znsz	Kontakt akcija	+381600653979	\N	phone_call: Opel Insignia A facelift	phone	inquiry	cmt8bvawa0000l5045myi1c2t	Opel Insignia A facelift	NEW	2026-08-25 11:32:27.569	2026-08-25 11:32:27.569	\N	\N	phone_call	phone	109.245.32.133	Mozilla/5.0 (Linux; Android 16; SM-S908B Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.162 Mobile Safari/537.36 Instagram 443.0.0.48.82 Android (36/16; 420dpi; 1080x2316; samsung; SM-S908B; b0s; s5e9925; sr_RS_#Latn; 1043215449; IABMV/1)	{"referrer":"https://l.instagram.com/","landingPage":"/sr","capturedAt":"2026-08-25T11:30:57.864Z"}	\N
cmtartadz0001la04j8j15olh	Kontakt akcija	+381600653979	\N	phone_call: Opel Insignia A facelift	phone	inquiry	cmt8bvawa0000l5045myi1c2t	Opel Insignia A facelift	NEW	2026-08-27 00:14:35.735	2026-08-27 00:14:35.735	\N	\N	phone_call	phone	188.120.96.73	Mozilla/5.0 (Linux; Android 11; Redmi Note 8 Pro Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.150 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/566.0.0.48.73;IABMV/1;]	{"referrer":"http://m.facebook.com/","landingPage":"/sr","capturedAt":"2026-08-27T00:13:37.325Z"}	\N
cmtbx8k5w0001l804oev7g730	Kontakt akcija	+381600653979	\N	viber_click: Opel Insignia A facelift	viber	inquiry	cmt8bvawa0000l5045myi1c2t	Opel Insignia A facelift	NEW	2026-08-27 19:34:12.5	2026-08-27 19:34:12.5	\N	\N	viber_click	viber	213.196.109.20	Mozilla/5.0 (Linux; Android 16; SM-A165F Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/152.0.7977.52 Mobile Safari/537.36 Instagram 444.0.0.46.85 Android (36/16; 450dpi; 1080x2340; samsung; SM-A165F; a16; mt6789; sr_RS_#Latn; 1049157598; IABMV/1)	{"referrer":"http://www.mojautodiler.com/","landingPage":"/sr","capturedAt":"2026-08-27T19:27:12.297Z"}	\N
cmtejqlvt0001jr0478c9d2e8	Kontakt akcija	+381600653979	\N	viber_click: Opel Insignia A facelift	viber	inquiry	cmt8bvawa0000l5045myi1c2t	Opel Insignia A facelift	NEW	2026-08-29 15:39:38.441	2026-08-29 15:39:38.441	\N	\N	viber_click	viber	194.8.63.38	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1	{"referrer":"https://bujanovacke.co.rs/","landingPage":"/sr","capturedAt":"2026-08-29T15:28:30.999Z"}	\N
cmv3tqanm0001jq04sj2ppun5	Kontakt akcija	+381669025162	\N	phone_call: Volkswagen Passat CC 2.0 bluemotion	phone	inquiry	cmue1pdsw0000k104948q632a	Volkswagen Passat CC 2.0 bluemotion	NEW	2026-10-11 12:53:16.787	2026-10-11 12:53:16.787	cmue1c2mo0000lg04iyrqr6xz	Stefan - Jove	phone_call	phone	46.40.39.70	Mozilla/5.0 (Linux; Android 13; 2201117SY Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/155.0.8059.34 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/582.0.0.50.54;IABMV/1;]	{"referrer":"https://lm.facebook.com/","landingPage":"/sr","capturedAt":"2026-10-11T12:53:04.340Z"}	\N
cmweoglb40001ku04v3gumjm5	Kontakt akcija	+381631850324	\N	phone_call: BMW X3 xDrive20d	phone	inquiry	1	BMW X3 xDrive20d	NEW	2026-11-13 07:50:56.224	2026-11-13 07:50:56.224	cmp8p4vc90000l804ym3mce1x	+381631850324	phone_call	phone	212.200.164.106	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36	{"landingPage":"/sr","capturedAt":"2026-11-13T07:33:53.016Z"}	\N
\.


--
-- Data for Name: Vehicle; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Vehicle" (id, slug, title, brand, model, generation, year, mileage, price, currency, "fuelType", transmission, drivetrain, "bodyType", condition, "engineSize", horsepower, kilowatts, doors, seats, color, "interiorColor", vin, registration, origin, description, "dealerNotes", equipment, "safetyFeatures", features, images, tags, "videoUrl", status, featured, "createdAt", "updatedAt", "vatMode", "dealerId", "contactPhone", "contactViber", "contactName", showcase, "onSale") FROM stdin;
cmprgc2la001ilc044l6mjjaq	skoda-octavia-combi-2-0-tdi-4x4-dsg-2018	Škoda Octavia	Škoda	Octavia	Mk3 Facelift (5E)	2018	249500	11890	EUR	dizel	automatski	4x4	karavan	polovno	1968	150	110	4	5	Siva MEtalik	Crni platneni enterijer sa grejanjem sedišta	\N	Na Ime Kupca	Švajcarska	Full oprema: velika navigacija, Bluetooth, kamera za rikverc, grejanje sedišta, tempomat, praćenje trake, 360° senzori, automatska klima, multifunkcionalni volan, DSG menjač, Auto Hold, Start/Stop, LED dnevna svetla.\n\nVeoma očuvan i atraktivan primerak, kako spolja tako i unutra. Auto poseduje bogat paket opreme i odličan je za duža putovanja zahvaljujući udobnosti, maloj potrošnji i pouzdanom 2.0 TDI motoru. Redovno održavan, maksimalno utegnut i spreman za vožnju bez dodatnih ulaganja.	\N	{"Metalik boja","Branici u boji auta","Servo volan","Multifunkcionalni volan",Tempomat,"Daljinsko zaključavanje","Putni računar","Električni prozori","Električni retrovizori","Grejači retrovizora","Sedišta podesiva po visini","Grejanje sedišta","Svetla za maglu","Senzori za svetla","Senzori za kišu","Parking senzori","Aluminijumske felne","Kuka za vuču",Navigacija,Radio/Kasetofon,Bluetooth,"Radio CD","Adaptivni tempomat","Hands free",Kamera,"Start-stop sistem","Naslon za ruku","DPF filter","Dnevna svetla","Kožni volan",USB,"Podešavanje volana po visini","Držači za čaše"}	{"Airbag za vozača","Airbag za suvozača","Child lock",ESP,ABS,"Bočni airbag","Kodiran ključ","Blokada motora","Centralno zaključavanje"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7492dc37/1780091133594-img-20260528-wa0150.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6835db2c/1780091134896-img-20260528-wa0151.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6288ba8d/1780091135683-img-20260528-wa0152.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8c3aac4c/1780091136568-img-20260528-wa0153.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2c37969d/1780091137343-img-20260528-wa0154.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3cce9e2c/1780091138281-img-20260528-wa0155.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7803c285/1780091138953-img-20260528-wa0156.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-23d4a2f5/1780091139857-img-20260528-wa0157.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fe8d0a08/1780091140515-img-20260528-wa0158.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3441d495/1780091141093-img-20260528-wa0159.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-087d11d5/1780091141678-img-20260528-wa0160.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-000a5d1c/1780091142358-img-20260528-wa0161.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-42490af8/1780091143061-img-20260528-wa0162.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2aa37984/1780091143756-img-20260528-wa0163.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-80ea445c/1780091144478-img-20260528-wa0164.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-084e3fd2/1780091145108-img-20260528-wa0165.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ea80fe32/1780091145738-img-20260528-wa0166.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-927bdd0b/1780091146563-img-20260528-wa0167.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3183befc/1780091147225-img-20260528-wa0168.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1c80d3fe/1780091147938-img-20260528-wa0169.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a35ea4c9/1780091148522-img-20260528-wa0170.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d5d60b86/1780091149299-img-20260528-wa0171.jpg}	{}	\N	SOLD	f	2026-05-29 21:46:31.785	2026-06-13 09:02:26.688	NONE	cmp8p4vc90000l804ym3mce1x	+381631850324	+381631850324	Faton	f	f
cmwj7x2fk0000k30899dtqrur	`bmw-520d-g30-sport-line-2017-automatik`	BMW 520d G30 Sport Line Automatik	BMW	520d	G30	2017	195	23500	EUR	dizel	automatski	zadnji	limuzina	polovno	2000	190	140	4	5	Metalik Crna	Braon	\N	\N	Švajcarska	### BMW 520d G30 Sport Line – 2017 | Automatik | 190 KS\n\nNa prodaju **BMW 520d G30 Sport Line**, 2017. godište, sa 2.0 dizel motorom od 190 KS i automatskim menjačem.\n\nAutomobil je uvezen iz Švajcarske, ocarinjen i spreman za registraciju na ime kupca.\n\nPrema navodima prodavca, vozilo je maksimalno očuvano, redovno servisirano i održavano, bez potrebe za dodatnim ulaganjima. Poseduje servisnu knjigu, nove gume i garanciju na kilometražu.\n\n**Kilometraža:** 195.000 km  \n**Cena:** 23.500 €\n\nMoguća zamena za jeftinije vozilo uz doplatu.\n\n**Kontakt: 063 189 2800**\n\nIsključivo pozivi. Na poruke se ne odgovara.\n\n**HENCO-J, Preševo** – Dugogodišnje iskustvo u uvozu i prodaji pažljivo odabranih polovnih automobila iz Evrope.	Isključivo pozivi. Na poruke se ne odgovara.	{"Metalik boja","Servo volan",Tempomat,"Putni računar","Električni prozori","Branici u boji auta","Multifunkcionalni volan","Daljinsko zaključavanje",Šiber,"Tonirana stakla","Električni retrovizori","Grejači retrovizora","Elektro podesiva sedišta","Sedišta podesiva po visini","Grejanje sedišta","Parking senzori","Senzori za svetla","Svetla za maglu","Xenon svetla","Senzori za kišu","Aluminijumske felne",Navigacija,Radio/Kasetofon,Bluetooth,"LED zadnja svetla","Hands free",Kamera,"Start-stop sistem",Multimedija,"Naslon za ruku","Glasovne komande","Memorija sedišta","DPF filter","Dnevna svetla","Ekran na dodir","Kožni volan",USB,"Paljenje bez ključa",MP3,"Automatsko zatamnjivanje retrovizora","Elektronska ručna kočnica","AUX konekcija","Modovi vožnje","Elektro otvaranje prtljažnika"}	{"Airbag za vozača","Bočni airbag",ABS,ASR,"Kodiran ključ","Centralno zaključavanje","Airbag za suvozača","Child lock",ESP,"Blokada motora","Ulazak bez ključa","Asistencija praćenja trake"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3dbf4856/1794830644146-whatsapp-image-2026-11-15-at-10.50.09.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d851d97b/1794830640597-whatsapp-image-2026-11-15-at-10.50.08.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-07d7cc85/1794830641829-whatsapp-image-2026-11-15-at-10.50.09-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e4989b6c/1794830642569-whatsapp-image-2026-11-15-at-10.50.09-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9bda010b/1794830643312-whatsapp-image-2026-11-15-at-10.50.09-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d0a65b5e/1794830644812-whatsapp-image-2026-11-15-at-10.50.10-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fddf2592/1794830645446-whatsapp-image-2026-11-15-at-10.50.10-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-762a4b2e/1794830646395-whatsapp-image-2026-11-15-at-10.50.10-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6c7bba75/1794830647075-whatsapp-image-2026-11-15-at-10.50.10.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-db5f4405/1794830647866-whatsapp-image-2026-11-15-at-10.50.11-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-791d8bdc/1794830648724-whatsapp-image-2026-11-15-at-10.50.11-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-23455580/1794830649385-whatsapp-image-2026-11-15-at-10.50.11.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d4574009/1794830650029-whatsapp-image-2026-11-15-at-10.50.12-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c900c06/1794830650725-whatsapp-image-2026-11-15-at-10.50.12-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-65d444e6/1794830651439-whatsapp-image-2026-11-15-at-10.50.12.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0426ad46/1794830652083-whatsapp-image-2026-11-15-at-10.50.13-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7245a467/1794830652760-whatsapp-image-2026-11-15-at-10.50.13.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6df2a665/1794830653491-whatsapp-image-2026-11-15-at-10.50.14-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-94a3f6e0/1794830654302-whatsapp-image-2026-11-15-at-10.50.14-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-293aafc7/1794830654968-whatsapp-image-2026-11-15-at-10.50.14.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4747e10a/1794830655620-whatsapp-image-2026-11-15-at-10.50.15-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-90202c42/1794830656287-whatsapp-image-2026-11-15-at-10.50.15.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b6ce068b/1794830657015-whatsapp-image-2026-11-15-at-10.50.16.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-105d12c2/1794830657702-whatsapp-image-2026-11-15-at-10.50.17.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-239ec2c6/1794830658457-whatsapp-image-2026-11-15-at-10.50.18.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9198e8d1/1794830659200-whatsapp-image-2026-11-15-at-10.50.20-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9ca8905f/1794830659858-whatsapp-image-2026-11-15-at-10.50.20.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cb6c7b33/1794830660482-whatsapp-image-2026-11-15-at-10.50.21.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a13408ac/1794830661251-whatsapp-image-2026-11-15-at-10.54.38.jpeg}	{"BMW 520","BMW G30","BMW Serija 5","Sport Line",Automatik,Dizel,"2.0 Dizel",Švajcarska,"Uvoz iz Švajcarske","Polovni automobili"}	\N	AVAILABLE	f	2026-11-16 12:06:42.32	2026-11-16 12:07:59.121	NONE	cmwj79jxo0000l508xkaz7rxp	+381631892800	+381631892800	Jetmir Henco	t	f
8	skoda-octavia-rs-2021	Škoda Octavia RS 245	Škoda	Octavia	Mk4	2021	55000	24900	EUR	benzin	automatski	prednji	karavan	polovno	1984	245	180	5	5	Siva	Crna koža	\N	07/2022	Češka	Škoda Octavia RS 245 Combi u odličnom stanju. Sportski paket, kompletna servisna knjiga.	\N	{"RS paket","Canton audio sistem","Virtualni kokpit","Columbus navigacija","Panoramski krov","Grejanje sedišta","LED svetla","Alu felne 19\\"","Parking senzori",Kamera,"Apple CarPlay","Wireless punjač","DCC vešanje"}	{"Front Assist","Blind Spot Detection","Rear Traffic Alert","Lane Assist",ABS,ESP,XDS,"Fatigue Detection"}	{"RS 245 paket","DCC vešanje","Canton audio","Virtualni kokpit"}	{https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80}	{sport,karavan,rs}	\N	SOLD	f	2023-12-20 10:00:00	2026-05-16 19:26:35.781	NONE	default-dealer	\N	\N	\N	f	f
cmqhv4jnz0000jn04wb54ihtb	bmw-520d-xdrive-touring-f11-2011	BMW 520d	BMW	520d xDrive	F11	2011	240000	11400	EUR	dizel	automatski	4x4	karavan	polovno	1995	184	135	4	5	Plava	Dakota Braun	\N	05/2027	Švajcarska	BMW 520d xDrive Touring (F11) u odličnom stanju, redovno održavan i sa urednom servisnom istorijom. Vozilo je uvezeno iz Švajcarske i poseduje servisnu knjižicu sa evidentiranim održavanjem.\n\nPokreće ga provereni BMW 2.0 dizel motor od 184 KS u kombinaciji sa automatskim menjačem i xDrive pogonom na sva četiri točka, što pruža vrhunsku udobnost, sigurnost i stabilnost u svim uslovima vožnje.\n\nPlava metalik boja u kombinaciji sa braon kožnim enterijerom ostavlja premium utisak, dok Touring karoserija nudi veliki prtljažni prostor i izuzetnu praktičnost za porodicu i duža putovanja.	\N	{"Metalik boja","Branici u boji auta","Servo volan","Multifunkcionalni volan",Tempomat,"Daljinsko zaključavanje","Putni računar","Električni retrovizori","Grejači retrovizora","Električni prozori","Elektro podesiva sedišta","Grejanje sedišta","Xenon svetla","Senzori za svetla","Svetla za maglu","Senzori za kišu","Kuka za vuču","Aluminijumske felne",Bluetooth,"Radio CD",Radio/Kasetofon,Navigacija,"Hands free","ISOFIX sistem","Naslon za ruku","Kožni volan","Držači za čaše","Elektronska ručna kočnica"}	{"Airbag za vozača","Airbag za suvozača","Child lock",ESP,ABS,"Kodiran ključ","Centralno zaključavanje","Blokada motora"}	{"Servisna knjižica"}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2ca1fd28/1781687967136-img-56ae8ef8970332747859c28e8cd5a904-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1c57c354/1781687962867-img-4c99a8d7c959e0cc2581d3932316c2b2-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2fa2a71d/1781687963467-img-5b2e9317d9d23313eca22dc86219d727-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2d138025/1781687964208-img-6ef3dde97e0f6f55fafa9b5cbc3d82cb-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-801215a0/1781687964846-img-8efd4919624e00efafa9354d931d2c90-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bd87ee72/1781687965397-img-35b80397e4f80eae27b82dfcea0e6f1d-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-159fb4dc/1781687965998-img-42bb0852daed7a47252bc18033d1a189-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-07e0b1f2/1781687966541-img-50c011c4607aacf8c0ac54267faa2f4b-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-66a971e9/1781687967723-img-59e505a6a7b834b07136ccfc42c4117e-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-50a0574b/1781687968242-img-77c4f39f4d97da29099ac8e4abc0d61a-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-98458a1f/1781687968774-img-78fa1473fdd25e0cb0fb279aeb7accd3-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6158e0d7/1781687969357-img-98edf7771d8c8c21e1d242da7a8131a0-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-38749b90/1781687969953-img-595cc1d2f796eb6dbc6e871954050931-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0aa08777/1781687970519-img-799f23783a409fcd7b09d9a561b57f2e-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5e479526/1781687971255-img-864c790e68bb466126d24bc7f0a17286-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-788f8ea5/1781687958318-20260617-103044.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-af52d373/1781687959668-20260617-103050.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f1c6abf8/1781687961024-20260617-103101.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-988af696/1781687961911-20260617-103103.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-85d02ac6/1781687971782-img-5641fbb43c1bf331d94048da721559e4-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e5aacddf/1781687972292-img-7140f8c1014f8ee3ee479bce4102f18a-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-51780524/1781687973002-img-7577aa6704a092ec0002de485a0f3b7a-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-48746be5/1781687973496-img-8790ad4b5bfdc14a128dff84fab7f1be-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-60821f3d/1781687974008-img-245322ccae0c058503813cd4d786cbd2-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-69aac79d/1781687974502-img-bf54aa4798bc9107d1098cf63f568039-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8c9327f5/1781687975067-img-bfcbfa86622c877a9b6a3d608ecbaa95-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bd48f89f/1781687975749-img-ca6608accfd7ee85ba9a54a7b6885183-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5d31cce8/1781687976301-img-d45ab77860a06f9ac6e8a5301bd4c754-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e8306843/1781687976864-img-da9a69e930b46f3cd44ee5e233b3e216-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d0d6a24a/1781687977461-img-dc86a9bffe3b6ac04124d4faed7bbd6f-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2269d42b/1781687978016-img-eb20a40e4bcc4742d33f880979d86f90-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a7c8ad05/1781687978576-img-ede4247fd5f8f4ee01bf7fba403e77aa-v.jpg}	{}	\N	AVAILABLE	f	2026-06-17 09:22:36.047	2026-09-23 12:00:41.905	NONE	cmqhujf910000l1049vzp9cjs	+381629717391	+381629717391	Vebi	t	f
3	polovni-automobili-vw-golf-6-1-6-tdi-uvoz-nemacka	Volkswagen Golf 6 Variant 1.6 TDI Automatik	Volkswagen	Golf 6	Mk6	2011	245000	5300	EUR	dizel	automatski	prednji	karavan	polovno	1600	105	77	4	5	Crna metalik	crni / tamno sivi	\N	09/2022	Belgija	Volkswagen Golf 6 Variant 1.6 TDI DSG Automatik\n2011 godište • 77kw / 105ks\n\nUvezen iz Belgije, automobil koji je pažljivo održavan i očuvan kako spolja tako i unutra.\n\nMotor radi mirno i tiho, DSG automatski menjač šalta perfektno bez trzaja, a kompletan auto je u veoma dobrom stanju i spreman za svakodnevnu vožnju bez dodatnih ulaganja.\n\nEnterijer maksimalno očuvan, bez pocepanih sedišta i većih tragova korišćenja. Auto poseduje 2 ključa, Bluetooth povezivanje i nove gume.\n\nVeoma udoban, pouzdan i ekonomičan automobil, idealan kako za gradsku vožnju tako i za duža putovanja. Golf 6 Variant je poznat po maloj potrošnji, dobrom kvalitetu izrade i odličnom osećaju u vožnji.\n\nMoguć svaki vid provere.\nNa ime kupca.	\N	{"Parking senzori","Metalik boja","Servo volan","Putni računar","Branici u boji auta","Daljinsko zaključavanje","Električni prozori","Sedišta podesiva po visini","Grejači retrovizora",Radio/Kasetofon,"Naslon za ruku"}	{ABS,ESP,"Blokada motora","Kodiran ključ","Centralno zaključavanje","Airbag za vozača","Airbag za suvozača","Bočni airbag","Child lock"}	{Garažiran,"Rezervni ključ"}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174652921-img-20260530-wa0020.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174651907-img-20260530-wa0019.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174653733-img-20260530-wa0021.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174654318-img-20260530-wa0022.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174654927-img-20260530-wa0023.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174655361-img-20260530-wa0024.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174655874-img-20260530-wa0025.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174656320-img-20260530-wa0026.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174656764-img-20260530-wa0027.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174657243-img-20260530-wa0028.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174657707-img-20260530-wa0029.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174658142-img-20260530-wa0030.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174660904-img-20260530-wa0031.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174661344-img-20260530-wa0032.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174661749-img-20260530-wa0033.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174662185-img-20260530-wa0034.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174662578-img-20260530-wa0035.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174663312-img-20260530-wa0036.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174663771-img-20260530-wa0037.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174664191-img-20260530-wa0038.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174664781-img-20260530-wa0039.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174665387-img-20260530-wa0040.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174665761-img-20260530-wa0041.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174666164-img-20260530-wa0042.jpg}	{premium}	<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/DY-r-3cFJtq/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/DY-r-3cFJtq/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/DY-r-3cFJtq/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Moja auto diler (@mojautodiler)</a></p></div></blockquote>\n<script async src="//www.instagram.com/embed.js"></script>	AVAILABLE	f	2024-01-08 10:00:00	2026-11-13 10:52:52.967	NONE	cmp8pugdy0000jy049ou3qred	+381637584819	+381637584819	Dursan	t	t
4	polovni-automobili-vw-golf-7-1-6-tdi-2013-uvoz-nemacka	Volkswagen Golf 7	Volkswagen	Golf 7	Mk7	2013	223000	7990	EUR	dizel	manuelni	prednji	hatchback	polovno	1600	105	77	5	5	crna metalik	crni / tamno sivi	\N	Na Ime Kupca	Belgija	Volkswagen Golf 7 1.6 TDI\n2013 godište • 77kw / 105ks\n\nUvezen iz Nemačke, veoma lepo očuvan i redovno održavan automobil.\n\nMotor radi mirno i tiho, menjač precizan, a kompletan auto je u odličnom stanju i spreman za svakodnevnu vožnju bez dodatnih ulaganja.\n\nEnterijer maksimalno očuvan, čist i uredan, bez većih tragova korišćenja. Auto je veoma udoban za vožnju, stabilan na putu i poznat po maloj potrošnji i pouzdanosti.\n\nVeoma atraktivan i tražen model, idealan kako za gradsku vožnju tako i za duža putovanja.\n\nMoguć svaki vid provere.\nNa ime kupca.	\N	{Kamera,"Metalik boja","Branici u boji auta","Servo volan","Multifunkcionalni volan",Tempomat,"Daljinsko zaključavanje","Putni računar","Tonirana stakla","Električni prozori","Električni retrovizori","Grejači retrovizora","Sedišta podesiva po visini","Svetla za maglu","Senzori za kišu","Parking senzori",Navigacija,Bluetooth,"Radio CD","Adaptivni tempomat","Start-stop sistem","Naslon za ruku",USB,"Utičnica od 12V","Podešavanje volana po visini","Držači za čaše","Rezervni točak","Elektronska ručna kočnica"}	{ABS,ESP,"Airbag za vozača","Airbag za suvozača","Child lock","Bočni airbag","Kodiran ključ","Centralno zaključavanje","Blokada motora"}	{"GTI Sport paket",IQ.LIGHT,"DCC vešanje","Travel Assist"}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959497178-r.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959498476-whatsapp-image-2026-05-16-at-11.13.12.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959499199-whatsapp-image-2026-05-16-at-11.13.12e.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959499919-whatsapp-image-2026-05-16-at-11.13.12q.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959500592-whatsapp-image-2026-05-16-at-11.13.12rt.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959501286-whatsapp-image-2026-05-16-at-11.13.12w.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959502005-whatsapp-image-2026-05-16-at-11.13.13b.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959502636-whatsapp-image-2026-05-16-at-11.13.13ert.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959503143-whatsapp-image-2026-05-16-at-11.13.13fd.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959503805-whatsapp-image-2026-05-16-at-11.13.13ghfgj.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959504285-whatsapp-image-2026-05-16-at-11.13.13tertwww.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959504821-whatsapp-image-2026-05-16-at-11.13.13ttre.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959505343-whatsapp-image-2026-05-16-at-11.13.13tttre.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959505916-whatsapp-image-2026-05-16-at-11.13.13u.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959506599-whatsapp-image-2026-05-16-at-11.13.13y.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959507297-whatsapp-image-2026-05-16-at-11.13.13ytn.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461781061-whatsapp-image-2026-06-14-at-20.26.01-7-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461782283-whatsapp-image-2026-06-14-at-20.26.01-6-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461783449-whatsapp-image-2026-06-14-at-20.26.01-5-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461784275-whatsapp-image-2026-06-14-at-20.26.01-4-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461785081-whatsapp-image-2026-06-14-at-20.26.01-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461785894-whatsapp-image-2026-06-14-at-20.26.01-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461786771-whatsapp-image-2026-06-14-at-20.26.01-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461787646-whatsapp-image-2026-06-14-at-20.26.01.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461788498-whatsapp-image-2026-06-14-at-20.26.00-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461789369-whatsapp-image-2026-06-14-at-20.26.00.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461790263-whatsapp-image-2026-06-14-at-20.25.58-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461791210-whatsapp-image-2026-06-14-at-20.25.58-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461792154-whatsapp-image-2026-06-14-at-20.25.58-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461793099-whatsapp-image-2026-06-14-at-20.25.58.jpeg}	{sport,hatchback,gti}	\N	SOLD	f	2024-01-05 10:00:00	2026-07-11 21:38:37.298	NONE	cmp8pugdy0000jy049ou3qred	+381637584819	+381637584819	Dursan	f	f
cmwj8m5av0000la08x34r5ft1	bmw-x5-2015	BMW X5 M50d xDrive M Paket	BMW	X5	F15	2015	228	28500	EUR	dizel	automatski	4x4	suv	polovno	2	381	280	4	5	Siva	Crna (prirodna koža)	\N	\N	Švajcarska	BMW X5 M50d xDrive M Paket – 2015 | 381 KS | Automatik\n\nNa prodaju BMW X5 M50d xDrive, 2015. godište, sa snažnim 3.0 dizel motorom od 381 KS, automatskim menjačem i inteligentnim xDrive pogonom na sva četiri točka.\n\nAutomobil je uvezen iz Švajcarske, ocarinjen i opremljen bogatim M paketom opreme koji pruža izuzetnu kombinaciju luksuza, sportskih performansi i udobnosti.\n\nVozilo poseduje luksuzni kožni enterijer, električna sedišta sa memorijom, grejanje i ventilaciju sedišta, Head-Up Display, Professional navigaciju, Harman Kardon ozvučenje, adaptivna LED svetla, kamere od 360° i brojne sisteme asistencije vozaču.\n\nMoguća zamena za jeftinije vozilo uz doplatu.\n\nKontakt: 063 189 2800\n\nIsključivo telefonski pozivi. Na poruke se ne odgovara.\n\nHENCO-J, Preševo – Dugogodišnje iskustvo u uvozu i prodaji pažljivo odabranih polovnih automobila iz Evrope.	Isključivo telefonski pozivi. Na poruke se ne odgovara.	{"Metalik boja","Branici u boji auta","Servo volan","Multifunkcionalni volan","Daljinsko zaključavanje",Tempomat,"Putni računar","Panoramski krov","Tonirana stakla","Električni retrovizori","Električni prozori","Grejači retrovizora","Sedišta podesiva po visini","Grejanje sedišta","Elektro podesiva sedišta","Svetla za maglu","Senzori za svetla","Parking senzori","Aluminijumske felne",Bluetooth,"Radio CD",Navigacija,"Senzori za kišu",Radio/Kasetofon,"LED prednja svetla","LED zadnja svetla","Adaptivna svetla",Multimedija,"DPF filter","Kožni volan",MP3,"Držači za čaše","Indikator niskog pritiska u gumama","Modovi vožnje","Head-up display","Memorija sedišta","Dnevna svetla","Utičnica od 12V","Ručice za menjanje brzina na volanu","Elektronska ručna kočnica","Naslon za ruku","ISOFIX sistem","Podešavanje volana po visini","Asistencija za kretanje na uzbrdici","Vazdušno vešanje","Retrovizor se obara pri rikvercu",Kamera,"360 kamera","Ambijentalno osvetljenje","Automatsko zatamnjivanje retrovizora"}	{"Airbag za vozača","Bočni airbag",ABS,"Kodiran ključ","Centralno zaključavanje","Blokada motora",ESP,"Child lock","Airbag za suvozača"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5efbc3c9/1794831874552-whatsapp-image-2026-11-15-at-11.01.20-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ae948791/1794831857224-whatsapp-image-2026-11-15-at-11.00.28.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e6b0f3a2/1794831858206-whatsapp-image-2026-11-15-at-11.00.29.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7050a6a6/1794831858904-whatsapp-image-2026-11-15-at-11.00.30-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4f232da7/1794831859707-whatsapp-image-2026-11-15-at-11.00.30.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-62511a05/1794831860373-whatsapp-image-2026-11-15-at-11.00.31-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0737a983/1794831861049-whatsapp-image-2026-11-15-at-11.00.31.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-70fca5ac/1794831861806-whatsapp-image-2026-11-15-at-11.00.32-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-66465fc5/1794831862587-whatsapp-image-2026-11-15-at-11.00.32.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-024ceecf/1794831863223-whatsapp-image-2026-11-15-at-11.00.33-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-329f52cc/1794831863890-whatsapp-image-2026-11-15-at-11.00.33.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a0114417/1794831864544-whatsapp-image-2026-11-15-at-11.00.34-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4deaf19a/1794831865214-whatsapp-image-2026-11-15-at-11.00.34.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6979cd1c/1794831865960-whatsapp-image-2026-11-15-at-11.00.35-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-aa75bf2c/1794831866606-whatsapp-image-2026-11-15-at-11.00.35.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-453be871/1794831867345-whatsapp-image-2026-11-15-at-11.00.36.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f3a560b1/1794831868211-whatsapp-image-2026-11-15-at-11.00.37.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fd82c102/1794831868856-whatsapp-image-2026-11-15-at-11.00.38.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-50154ce9/1794831869480-whatsapp-image-2026-11-15-at-11.00.39-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6afc6b69/1794831870155-whatsapp-image-2026-11-15-at-11.00.39.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0c4f910c/1794831870820-whatsapp-image-2026-11-15-at-11.00.40-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-99d5effa/1794831871568-whatsapp-image-2026-11-15-at-11.00.40.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-956a9906/1794831872220-whatsapp-image-2026-11-15-at-11.00.41.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2d0fc130/1794831872961-whatsapp-image-2026-11-15-at-11.01.12.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8d619b04/1794831873845-whatsapp-image-2026-11-15-at-11.01.20-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0a4bcd11/1794831875276-whatsapp-image-2026-11-15-at-11.01.20-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9f3f5f1e/1794831876098-whatsapp-image-2026-11-15-at-11.01.20.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a9813a0c/1794831876982-whatsapp-image-2026-11-15-at-11.01.30.jpeg}	{"BMW F15","BMW X5 M50","M Paket, 2015",Automatik,Dizel,"Polovni Automobili",BMW,"Uvoz iz Švajcarske"}	\N	AVAILABLE	f	2026-11-16 12:26:12.436	2026-11-16 12:28:11.663	NONE	cmwj79jxo0000l508xkaz7rxp	+381631892800	+381631892800	Jetmir Henco	t	f
cmprfkrmf0001lc048odd6iye	audi-a4-2017	Audi A4 2.0 TDI Quattro	Audi	A4	B9	2017	272213	11000	EUR	dizel	manuelni	4x4	karavan	polovno	1986	122	90	4	5	Crna metalik	Crna / tamno siva kombinacija	\N	Na Ime Kupca	Švajcarska	Audi A4 2.0 TDI Quattro, 2017. godište, sa manuelnim menjačem i garantovanom kilometražom. Vozilo poseduje bogatu opremu, uključujući navigaciju, Bluetooth, grejanje sedišta, tempomat, Start/Stop sistem i Xenon farove. Odličan izbor za kupce koji traže pouzdan, ekonomičan i udoban automobil sa Quattro pogonom.	\N	{"Metalik boja","Servo volan",Tempomat,"Putni računar","Električni prozori","Branici u boji auta","Multifunkcionalni volan","Daljinsko zaključavanje","Električni retrovizori","Grejači retrovizora","Sedišta podesiva po visini","Xenon svetla","Svetla za maglu","Senzori za kišu","Parking senzori",Navigacija,Radio/Kasetofon,"Aluminijumske felne",Bluetooth,"Radio CD","ISOFIX sistem","Naslon za ruku",Multimedija,"Dnevna svetla","Kožni volan","Utičnica od 12V","Elektro otvaranje prtljažnika","Podešavanje volana po visini","Držači za čaše","Elektronska ručna kočnica"}	{"Airbag za vozača","Airbag za suvozača","Child lock",ABS,ASR,"Blokada motora","Kodiran ključ"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b300ec42/1780089843733-img-20260528-wa0091.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ce291fb5/1780089842479-img-20260528-wa0090.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e423832b/1780089845036-img-20260528-wa0092.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a96b7ff9/1780089845963-img-20260528-wa0093.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-941ff532/1780089846852-img-20260528-wa0094.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b4542bed/1780089847879-img-20260528-wa0095.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-379e4085/1780089848697-img-20260528-wa0096.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bf24d7b3/1780089849601-img-20260528-wa0097.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c2bdb66f/1780089850534-img-20260528-wa0098.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5814ac98/1780089851515-img-20260528-wa0099.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-34397a68/1780089852486-img-20260528-wa0100.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-94172506/1780089853321-img-20260528-wa0101.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-408afbb7/1780089854132-img-20260528-wa0102.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-baa58742/1780089855053-img-20260528-wa0103.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-dd3b29bc/1780089855611-img-20260528-wa0104.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b155c44e/1780089857012-img-20260528-wa0105.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-dba32996/1780089857603-img-20260528-wa0106.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-17636ba8/1780089858289-img-20260528-wa0107.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-943e03db/1780089858896-img-20260528-wa0108.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9a5e150c/1780089859552-img-20260528-wa0109.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5a7df6c4/1780089860210-img-20260528-wa0110.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c57ccd61/1780089860667-img-20260528-wa0111.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-61e43637/1780089861325-img-20260528-wa0112.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-57d92048/1780089862221-img-20260528-wa0113.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c4e08246/1780089862833-img-20260528-wa0114.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b995f4a1/1780089863490-img-20260528-wa0115.jpg}	{}	\N	AVAILABLE	f	2026-05-29 21:25:18.418	2026-10-15 20:42:07.834	NONE	cmp8p4vc90000l804ym3mce1x	+381631850324	+381631850324	Faton	t	f
2	bmw-530d-2012-svajcarska	BMW 5	BMW	530	F11	2012	190000	11800	EUR	dizel	automatski	zadnji	karavan	polovno	3	245	180	4	5	Crna	Svetlija Konjak Braon	\N	Na Ime Kupca	Švajcarska	3.0 diesel • Automatik • Premium oprema\n\nPažljivo održavan i veoma atraktivan BMW 530d Touring u odličnoj kombinaciji crne boje i braon enterijera. Automobil poseduje prepoznatljiv BMW komfor, snažan i pouzdan 3.0 šestocilindarski motor i odličan automatski menjač, idealan kako za duža putovanja tako i za svakodnevnu vožnju.\n\nVozilo je veoma lepo očuvano spolja i iznutra, bez ulaganja, sa bogatom opremom i odličnim izgledom na putu.	\N	{"AMG Line paket","Burmester audio sistem","MBUX navigacija","Adaptivni tempomat","Grejanje sedišta","Električna sedišta","LED svetla","Alu felne 19\\"","Apple CarPlay","Android Auto","Parking senzori","Kamera za vožnju unazad","Wireless punjač","Ambijentalno osvetljenje","Krovni nosači","Metalik boja","Servo volan",Tempomat,"Putni računar","Električni prozori","Grejači retrovizora","Elektro podesiva sedišta","Svetla za maglu","Senzori za svetla","Krovni nosač","Aluminijumske felne",Bluetooth,"Radio CD","Branici u boji auta","Multifunkcionalni volan","Daljinsko zaključavanje","Tonirana stakla","Električni retrovizori","Sedišta podesiva po visini","Xenon svetla","Senzori za kišu",Webasto,"Kuka za vuču",Navigacija,Radio/Kasetofon,"Hands free","Head-up display","Start-stop sistem",Multimedija,Kamera,"ISOFIX sistem","Naslon za ruku","Elektro sklopivi retrovizori","Dnevna svetla","Elektro zatvaranje prtljažnika","CD changer","Memorija sedišta","DPF filter","360 kamera","Kožni volan","Grejanje volana","Zavesice na zadnjim prozorima",USB,"Paljenje bez ključa","Ručice za menjanje brzina na volanu","Asistencija za kretanje na uzbrdici","Držači za čaše","Podešavanje volana po visini","Virtuelna tabla","Automatsko zatamnjivanje retrovizora","Elektronska ručna kočnica"}	{"Bočni airbag",ABS,ESP,"Lane Keeping Assist","Kodni ključ","Centralno zaključavanje","Kodiran ključ","Ulazak bez ključa"}	{"Rezervni ključ","Servisna knjižica"}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089165103-img-20260528-wa0172.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089165957-img-20260528-wa0173.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089166751-img-20260528-wa0174.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089167535-img-20260528-wa0175.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089168341-img-20260528-wa0176.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089169352-img-20260528-wa0177.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089170234-img-20260528-wa0178.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089171255-img-20260528-wa0179.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089172000-img-20260528-wa0180.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089172893-img-20260528-wa0181.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089173826-img-20260528-wa0182.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089174693-img-20260528-wa0183.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089175483-img-20260528-wa0184.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089176438-img-20260528-wa0185.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089177220-img-20260528-wa0186.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089178122-img-20260528-wa0187.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089178934-img-20260528-wa0188.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089179667-img-20260528-wa0189.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089180482-img-20260528-wa0190.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089181227-img-20260528-wa0191.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089181784-img-20260528-wa0192.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089182409-img-20260528-wa0193.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089183047-img-20260528-wa0194.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089183775-img-20260528-wa0195.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089184504-img-20260528-wa0196.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1778881454942-20260408-141113.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089185118-img-20260528-wa0197.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089185790-img-20260528-wa0198.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089186458-img-20260528-wa0199.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089187175-img-20260528-wa0200.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089187934-img-20260528-wa0201.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089188684-img-20260528-wa0202.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089189445-img-20260528-wa0203.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089190235-img-20260528-wa0204.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089191003-img-20260528-wa0205.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089191711-img-20260528-wa0206.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089192476-img-20260528-wa0207.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089193294-img-20260528-wa0208.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089193955-img-20260528-wa0209.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089194735-img-20260528-wa0210.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089195515-img-20260528-wa0211.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089196337-img-20260528-wa0212.jpg}	{luxury}	\N	SOLD	f	2024-01-10 10:00:00	2026-08-09 14:09:46.115	NONE	cmp8p4vc90000l804ym3mce1x	+381631850324	+381631850324	Faton	f	f
cmqkj4s9s0000l704957qxfqo	vw-tiguan-2-0-tdi-r-line-dsg-4motion-2013	VW Tiguan 2.0 TDI R-Line DSG 4Motion	Volkswagen	Tiguan	I Facelift (5N)	2013	267482	12500	EUR	dizel	automatski	4x4	suv	polovno	1968	177	130	4	5	Bela	Crna	\N	07/2026	Švajcarska	VW Tiguan 2.0 TDI R-Line DSG 4Motion, 2013. godište, uvezen iz Švajcarske. Vozilo poseduje bogat nivo opreme, automatski DSG menjač i 4Motion pogon na sva četiri točka. Uredno održavan, maksimalno očuvan kako spolja tako i iznutra.	\N	{"Metalik boja","Branici u boji auta","Servo volan","Multifunkcionalni volan",Tempomat,"Daljinsko zaključavanje","Putni računar","Panoramski krov","Tonirana stakla","Električni prozori","Električni retrovizori","Grejači retrovizora","Sedišta podesiva po visini","Grejanje sedišta","Xenon svetla","Svetla za maglu","Senzori za svetla","Senzori za kišu","Parking senzori",Navigacija,Bluetooth,"Hands free","Start-stop sistem","Naslon za ruku","Kožni volan","Podešavanje volana po visini","Držači za čaše"}	{"Airbag za vozača","Airbag za suvozača","Bočni airbag","Child lock",ESP,"Blokada motora","Kodiran ključ","Centralno zaključavanje"}	{Garažiran}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-76ce4145/1781849333291-4.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-942801aa/1781849333825-5.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ce737857/1781849331920-2.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0b27c7eb/1781849332662-3.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-270ab5a1/1781849334571-6.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-51343e19/1781849335127-7.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-360bcc64/1781849335700-8.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-86b611c8/1781849336445-9.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-60287091/1781849337118-11.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cdd7f4e3/1781849337873-12.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-02ff3dd2/1781849330790-1.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e117fb75/1781849338616-14.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-512cc6a1/1781849339287-22.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1cfb4981/1781849339810-23.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-00fe9e21/1781849340533-24.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8d737395/1781849341208-25.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-038c53da/1781849341715-whatsapp-image-2026-06-16-at-15.37.25-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-be28491f/1781849342348-whatsapp-image-2026-06-16-at-15.37.25-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-50e53f61/1781849342982-whatsapp-image-2026-06-16-at-15.37.2713.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cc901c11/1781849343621-whatsapp-image-2026-06-16-at-15.37.2810.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1e095376/1781849344176-whatsapp-image-2026-06-16-at-15.37.2815.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e3a03e69/1781849344713-whatsapp-image-2026-06-16-at-15.37.2816.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-725532b8/1781849345408-whatsapp-image-2026-06-16-at-15.37.2817.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ff6c6233/1781849346190-whatsapp-image-2026-06-16-at-15.37.2818.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1b361637/1781849346860-whatsapp-image-2026-06-16-at-15.37.2819.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4ad4b453/1781849347514-whatsapp-image-2026-06-16-at-15.37.2926.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8d601e5f/1781849348087-whatsapp-image-2026-06-16-at-15.37.2927.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-689e9e42/1781849348815-whatsapp-image-2026-06-16-at-15.37.2928.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-231e47aa/1781849349320-whatsapp-image-2026-06-16-at-15.37.2929.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c2f4eec/1781849350033-whatsapp-image-2026-06-16-at-15.37.2930.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4e199b5f/1781849350649-whatsapp-image-2026-06-16-at-15.37.3033.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a8e0f1f1/1781849351158-whatsapp-image-2026-06-16-at-15.37.3034.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ffad5f17/1781849351892-whatsapp-image-2026-06-16-at-15.37.3145.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4f5b5b23/1781849352434-whatsapp-image-2026-06-16-at-15.37.31222.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b645b357/1781849352996-whatsapp-image-2026-06-16-at-15.37.312323.jpeg}	{}	\N	SOLD	f	2026-06-19 06:10:10.337	2026-09-13 19:59:06.491	NONE	cmp8p4vc90000l804ym3mce1x	381631850324	381631850324	Faton	f	f
cmprgofg20003jv04y0dimwul	vw-tiguan-2-0-tdi-4motion-2014	VW Tiguan	VW	Tiguan	Mk1 Facelift	2014	232900	12000	EUR	dizel	automatski	4x4	suv	polovno	1968	140	103	4	5	Crna Metalik	Crni CUP enterijer sa grejanjem sedišta	\N	Na Ime Kupca	Švajcarska	Full oprema: navigacija, Bluetooth, kamera za rikverc, multifunkcionalni volan sa komandama, tempomat, grejanje sedišta, automatsko parkiranje, xenon farovi, LED dnevna svetla, automatska dvozonska klima, 2 ključa, parking senzori, automatski menjač i veliki paket dodatne opreme.\n\nVeoma lep i očuvan CUP model sa atraktivnim izgledom i odličnim paketom opreme. Enterijer maksimalno očuvan, auto utegnut i spreman za vožnju bez dodatnih ulaganja. Pouzdan i snažan 2.0 TDI motor u kombinaciji sa 4Motion pogonom pruža sigurnu i udobnu vožnju u svim uslovima.	\N	{"Metalik boja","Branici u boji auta","Servo volan","Multifunkcionalni volan",Tempomat,"Daljinsko zaključavanje","Putni računar","Električni prozori","Električni retrovizori","Grejači retrovizora","Sedišta podesiva po visini","Grejanje sedišta","Svetla za maglu","Xenon svetla","Senzori za svetla","Senzori za kišu","Parking senzori",Navigacija,"Aluminijumske felne",Bluetooth,Radio/Kasetofon,"Radio CD","Hands free","Naslon za ruku","DPF filter","Držači za čaše"}	{"Airbag za vozača","Airbag za suvozača","Child lock","Bočni airbag",ABS,"Blokada motora"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-558a8286/1780091719086-img-20260528-wa0052.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4912211a/1780091719961-img-20260528-wa0053.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c002ea37/1780091720661-img-20260528-wa0054.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bd3e0623/1780091721700-img-20260528-wa0055.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d002e965/1780091722587-img-20260528-wa0056.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-29a661c9/1780091723459-img-20260528-wa0057.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-38aa5db9/1780091724404-img-20260528-wa0058.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-80b5cfde/1780091725273-img-20260528-wa0059.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bffaf1e0/1780091726122-img-20260528-wa0060.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f281929b/1780091727033-img-20260528-wa0061.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-28d92981/1780091728022-img-20260528-wa0062.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-72dc404e/1780091728746-img-20260528-wa0063.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-badce2f0/1780091729633-img-20260528-wa0064.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1419efe2/1780091730297-img-20260528-wa0065.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d04e2e1d/1780091731216-img-20260528-wa0066.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f6911706/1780091732052-img-20260528-wa0067.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a53962ec/1780091732771-img-20260528-wa0068.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d3a88f9e/1780091733578-img-20260528-wa0069.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ce96ec64/1780091734298-img-20260528-wa0070.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c3e19d13/1780091735016-img-20260528-wa0071.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3ed5923e/1780091735730-img-20260528-wa0072.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9280ef94/1780091736298-img-20260528-wa0073.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-99e7d634/1780091737006-img-20260528-wa0074.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2f6f5114/1780091737725-img-20260528-wa0075.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ca69c8cf/1780091738736-img-20260528-wa0076.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-86d76de1/1780091739509-img-20260528-wa0077.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4844743c/1780091740350-img-20260528-wa0078.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3997a025/1780091741121-img-20260528-wa0079.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-78e104c9/1780091741897-img-20260528-wa0080.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0aa6200a/1780091742711-img-20260528-wa0081.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e1948a05/1780091743547-img-20260528-wa0082.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2de96d15/1780091744284-img-20260528-wa0083.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-dddfd78c/1780091744895-img-20260528-wa0084.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b7b805bd/1780091745625-img-20260528-wa0085.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3f6b0ce4/1780091746482-img-20260528-wa0086.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4eb2df67/1780091747271-img-20260528-wa0087.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-51f59d03/1780091748020-img-20260528-wa0088.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cf08d799/1780091748776-img-20260528-wa0089.jpg}	{}	\N	SOLD	f	2026-05-29 21:56:07.719	2026-09-23 11:54:57.728	NONE	cmp8p4vc90000l804ym3mce1x	\N	\N	\N	f	f
cmt8bvawa0000l5045myi1c2t	opel-insignia-sports-tourer-2-0-cdti-2014	Opel Insignia A facelift	Opel	Insignia A facelift	Insignia A	2014	184000	5600	EUR	dizel	automatski	prednji	karavan	polovno	2	131	96	4	5	Plava	Crna	\N	08/2027	\N	Opel Insignia Sports Tourer 2.0 CDTI, facelift model, 2014. godište.\n\nAutomobil je maksimalno održavan, redovno servisiran i nalazi se u odličnom stanju. Korišćen je kao porodični automobil i održavan bez odlaganja potrebnih servisa.\n\nRegistrovan je cele godine i trenutno ne zahteva nikakva dodatna ulaganja, spreman je za vožnju.\n\nUz automobil dolaze dva kompleta praktično novih guma, letnje i zimske, tako da je budući vlasnik miran za obe sezone.\n\nAuto je veoma udoban i stabilan na putu, odličan kako za svakodnevnu vožnju tako i za duža putovanja. Sports Tourer verzija pruža dosta prostora za putnike i veliki i praktičan prtljažnik, što ga čini odličnim porodičnim automobilom.	\N	{"Metalik boja","Servo volan",Tempomat,"Putni računar","Električni prozori","Branici u boji auta","Multifunkcionalni volan","Daljinsko zaključavanje","Tonirana stakla","Elektro podesiva sedišta","Svetla za maglu","Senzori za svetla","Parking senzori","Senzori za kišu","Xenon svetla","Sedišta podesiva po visini","Radio CD",Radio/Kasetofon,Navigacija,"Hands free","ISOFIX sistem","Naslon za ruku",Multimedija,"Kožni volan","Rezervni točak","projektorski prednji farovi"}	{"Airbag za vozača","Airbag za suvozača","Child lock",ESP,"Blokada motora","Kodiran ključ","Centralno zaključavanje"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3a818e76/1787641788537-20260824-133246-1-.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4bed5d07/1787641786771-20260824-133233.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-36d91a08/1787641787726-20260824-133240.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c1de047a/1787641789377-20260824-133318.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-65cec1a1/1787641790267-20260824-133324.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3ce0c371/1787641790990-20260824-133335.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c4821d51/1787641791796-20260824-133340.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-75f88474/1787641792519-20260824-133345.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5a4fc955/1787641793332-20260824-133431.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-daf7384e/1787641794055-20260824-133435.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-40f14807/1787641794926-20260824-133439.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3f842834/1787641795696-20260824-133441.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-68368479/1787641796354-20260824-133445.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4963088f/1787641797044-20260824-133447.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c09b455/1787641797728-20260824-133451.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-49d23844/1787641798359-20260824-133502.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f4b383f7/1787641799060-20260824-133509.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9a86273a/1787641799832-20260824-133513.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2e1b55e6/1787641800803-20260824-133518.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f4275799/1787641801524-20260824-133519.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2e241f4c/1787641802376-20260824-133523.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-91b9ac5e/1787641803245-20260824-133529.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c3f66667/1787641804067-20260824-133532.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d753577e/1787641804944-20260824-133534.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e436d4b4/1787641805617-20260824-133550.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-89380211/1787641806357-20260824-133620.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-30ed68fa/1787641807154-20260824-133622.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ed8b2def/1787641807914-20260824-133624.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-beba9c1e/1787641808694-20260824-133627.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ede44806/1787641809539-20260824-133702.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fbdd522f/1787641810322-20260824-133705.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-93e3a716/1787641811305-20260824-133746.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f20b6059/1787641811967-20260824-133748.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-368bf555/1787641812624-20260824-133750.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9b3ff161/1787641813328-20260824-134103.jpg}	{"Opel Insignia Insignia Sports Tourer Opel Insignia 2014 2.0 CDTI Dizel Karavan Facelift Sports Tourer Polovni automobili Porodični automobil Registrovan Bez ulaganja Redovno održavan Letnje i zimske gume"}	\N	AVAILABLE	f	2026-08-25 07:12:43.495	2026-09-23 12:00:20.741	NONE	\N	+381600653979	+381600653979	Dima	t	t
cmwj7ypu50001k308a63acgqk	bmw-520d-2017	BMW 520d G30 Sport Line Automatik	BMW	520d	G30	2017	195	23500	EUR	dizel	automatski	zadnji	limuzina	polovno	2000	190	140	4	5	Metalik Crna	Braon	\N	\N	Švajcarska	### BMW 520d G30 Sport Line – 2017 | Automatik | 190 KS\n\nNa prodaju **BMW 520d G30 Sport Line**, 2017. godište, sa 2.0 dizel motorom od 190 KS i automatskim menjačem.\n\nAutomobil je uvezen iz Švajcarske, ocarinjen i spreman za registraciju na ime kupca.\n\nPrema navodima prodavca, vozilo je maksimalno očuvano, redovno servisirano i održavano, bez potrebe za dodatnim ulaganjima. Poseduje servisnu knjigu, nove gume i garanciju na kilometražu.\n\n**Kilometraža:** 195.000 km  \n**Cena:** 23.500 €\n\nMoguća zamena za jeftinije vozilo uz doplatu.\n\n**Kontakt: 063 189 2800**\n\nIsključivo pozivi. Na poruke se ne odgovara.\n\n**HENCO-J, Preševo** – Dugogodišnje iskustvo u uvozu i prodaji pažljivo odabranih polovnih automobila iz Evrope.	Isključivo pozivi. Na poruke se ne odgovara.	{"Metalik boja","Servo volan",Tempomat,"Putni računar","Električni prozori","Branici u boji auta","Multifunkcionalni volan","Daljinsko zaključavanje",Šiber,"Tonirana stakla","Električni retrovizori","Grejači retrovizora","Elektro podesiva sedišta","Sedišta podesiva po visini","Grejanje sedišta","Parking senzori","Senzori za svetla","Svetla za maglu","Xenon svetla","Senzori za kišu","Aluminijumske felne",Navigacija,Radio/Kasetofon,Bluetooth,"LED zadnja svetla","Hands free",Kamera,"Start-stop sistem",Multimedija,"Naslon za ruku","Glasovne komande","Memorija sedišta","DPF filter","Dnevna svetla","Ekran na dodir","Kožni volan",USB,"Paljenje bez ključa",MP3,"Automatsko zatamnjivanje retrovizora","Elektronska ručna kočnica","AUX konekcija","Modovi vožnje","Elektro otvaranje prtljažnika"}	{"Airbag za vozača","Bočni airbag",ABS,ASR,"Kodiran ključ","Centralno zaključavanje","Airbag za suvozača","Child lock",ESP,"Blokada motora","Ulazak bez ključa","Asistencija praćenja trake"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3dbf4856/1794830644146-whatsapp-image-2026-11-15-at-10.50.09.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d851d97b/1794830640597-whatsapp-image-2026-11-15-at-10.50.08.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-07d7cc85/1794830641829-whatsapp-image-2026-11-15-at-10.50.09-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e4989b6c/1794830642569-whatsapp-image-2026-11-15-at-10.50.09-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9bda010b/1794830643312-whatsapp-image-2026-11-15-at-10.50.09-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d0a65b5e/1794830644812-whatsapp-image-2026-11-15-at-10.50.10-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fddf2592/1794830645446-whatsapp-image-2026-11-15-at-10.50.10-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-762a4b2e/1794830646395-whatsapp-image-2026-11-15-at-10.50.10-3-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6c7bba75/1794830647075-whatsapp-image-2026-11-15-at-10.50.10.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-db5f4405/1794830647866-whatsapp-image-2026-11-15-at-10.50.11-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-791d8bdc/1794830648724-whatsapp-image-2026-11-15-at-10.50.11-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-23455580/1794830649385-whatsapp-image-2026-11-15-at-10.50.11.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d4574009/1794830650029-whatsapp-image-2026-11-15-at-10.50.12-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c900c06/1794830650725-whatsapp-image-2026-11-15-at-10.50.12-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-65d444e6/1794830651439-whatsapp-image-2026-11-15-at-10.50.12.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0426ad46/1794830652083-whatsapp-image-2026-11-15-at-10.50.13-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7245a467/1794830652760-whatsapp-image-2026-11-15-at-10.50.13.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6df2a665/1794830653491-whatsapp-image-2026-11-15-at-10.50.14-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-94a3f6e0/1794830654302-whatsapp-image-2026-11-15-at-10.50.14-2-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-293aafc7/1794830654968-whatsapp-image-2026-11-15-at-10.50.14.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4747e10a/1794830655620-whatsapp-image-2026-11-15-at-10.50.15-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-90202c42/1794830656287-whatsapp-image-2026-11-15-at-10.50.15.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b6ce068b/1794830657015-whatsapp-image-2026-11-15-at-10.50.16.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-105d12c2/1794830657702-whatsapp-image-2026-11-15-at-10.50.17.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-239ec2c6/1794830658457-whatsapp-image-2026-11-15-at-10.50.18.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9198e8d1/1794830659200-whatsapp-image-2026-11-15-at-10.50.20-1-.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9ca8905f/1794830659858-whatsapp-image-2026-11-15-at-10.50.20.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cb6c7b33/1794830660482-whatsapp-image-2026-11-15-at-10.50.21.jpeg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a13408ac/1794830661251-whatsapp-image-2026-11-15-at-10.54.38.jpeg}	{"BMW 520","BMW G30","BMW Serija 5","Sport Line",Automatik,Dizel,"2.0 Dizel",Švajcarska,"Uvoz iz Švajcarske","Polovni automobili",cv:no_vin}	\N	AVAILABLE	t	2026-11-16 12:07:59.309	2026-11-16 12:34:48.935	NONE	cmwj79jxo0000l508xkaz7rxp	+381631892800	+381631892800	Jetmir Henco	f	f
cmprj0krp0000la04rgoffe30	bmw-120d-m-paket-xdrive-2012	BMW 120D M Paket	BMW	120D M	F20	2012	209692	8500	EUR	dizel	manuelni	4x4	hatchback	polovno	1995	184	135	3	5	Crna Metalik	M Sport enterijer sa grejanjem sedišta	\N	Na Ime Kupca	Švajcarska	Full oprema: velika navigacija, Bluetooth, parking senzori, grejanje sedišta, Start/Stop sistem, tempomat, Sport+ i Eco Pro režimi vožnje, multifunkcionalni M volan, ambijentalno osvetljenje, 2 ključa, automatska dvozonska klima, M pragovi, M felne i bogat paket dodatne opreme.\n\nVeoma atraktivan i maksimalno očuvan primerak u M Paketu sa xDrive pogonom. Auto poseduje odličnu kombinaciju sportskog izgleda, snažnog motora i vrhunske opreme. Enterijer i spoljašnjost u odličnom stanju, utegnut i spreman za vožnju bez dodatnih ulaganja.	\N	{"Metalik boja","Branici u boji auta","Servo volan","Multifunkcionalni volan",Tempomat,"Daljinsko zaključavanje","Putni računar","Električni prozori","Električni retrovizori","Tonirana stakla","Grejači retrovizora","Sedišta podesiva po visini","Grejanje sedišta","Xenon svetla","Senzori za kišu","Senzori za svetla","Svetla za maglu","Parking senzori","Aluminijumske felne",Navigacija,Bluetooth,Radio/Kasetofon,"Automatska dvozonska klima","M pragovi","Naslon za ruku","Ambijentalno osvetljenje",Multimedija,"AUX konekcija","ISOFIX sistem"}	{"Airbag za vozača","Airbag za suvozača","Child lock",ABS,"Kodiran ključ","Blokada motora"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7727eeda/1780095665137-img-20260530-wa0000.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-aaa038de/1780095666044-img-20260530-wa0001.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a3bdd5ad/1780095666628-img-20260530-wa0002.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cf0c4a89/1780095667347-img-20260530-wa0003.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3ca30f35/1780095668053-img-20260530-wa0004.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b6789385/1780095668957-img-20260530-wa0005.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f9833ed7/1780095669618-img-20260530-wa0006.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6ef749b1/1780095670215-img-20260530-wa0007.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bda628fe/1780095670844-img-20260530-wa0008.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a8328fe6/1780095671517-img-20260530-wa0009.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4864a76f/1780095672082-img-20260530-wa0010.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-794ea705/1780095672657-img-20260530-wa0011.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0fe7eea1/1780095673199-img-20260530-wa0012.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-35f5ceb3/1780095673763-img-20260530-wa0013.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ca6c83f5/1780095674258-img-20260530-wa0014.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3a737991/1780095674801-img-20260530-wa0015.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b42f9a54/1780095675240-img-20260530-wa0016.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f9e89753/1780095675756-img-20260530-wa0017.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-820b5507/1780095676333-img-20260530-wa0018.jpg}	{}	\N	AVAILABLE	f	2026-05-29 23:01:34.881	2026-08-13 23:18:30.294	NONE	cmp8p4vc90000l804ym3mce1x	+381631850324	+381631850324	Faton	f	f
cmue1pdsw0000k104948q632a	volkswagen-passat-cc-2011	Volkswagen Passat CC 2.0 bluemotion	Volkswagen	Passat CC	PQ46	2011	297710	8850	EUR	dizel	manuelni	prednji	limuzina	polovno	2000	136	100	4	4	Siva	Smeđa	\N	\N	\N	Volkswagen Passat CC 2.0 TDI BlueMotion, 2011. godište, 136 KS, manuelni menjač sa 6 brzina.\n\nIzuzetno očuvan primerak, kako spolja tako i iznutra. Automobil je maksimalno održavan, svi servisi su urađeni i trenutno je bez ikakvih potrebnih ulaganja. Stanje automobila najbolje se može oceniti uživo, ovako očuvan Passat CC ovog godišta sve je teže pronaći.\n\nAutomobil je dodatno zaštićen keramičkom zaštitom i garažiran.\n\nOd opreme poseduje, između ostalog: kombinovani kožni enterijer, električno podesiva i grejana sedišta, xenon svetla, navigaciju, parking senzore, tempomat, Bluetooth, multifunkcionalni volan, automatsku klimu, senzore za kišu i svetla, elektro-sklopive retrovizore i još dosta opreme.\n\nUz automobil ide i kompletan zimski set – 18" aluminijumske felne sa novim zimskim gumama.\n\n• Dva ključa\n• Zeder mehanička zaštita\n• Servisna knjiga\n• Letnji + zimski set 18" alu felni\n• Nove zimske gume\n• Keramička zaštita\n• Registrovan do 12/2026.\n\nAutomobil se prodaje isključivo zbog kupovine novijeg vozila.\n\nCena nije fiksna i korekcija je moguća nakon pregleda automobila.	\N	{"Metalik boja","Servo volan",Tempomat,"Putni računar","Električni prozori","Branici u boji auta","Multifunkcionalni volan","Daljinsko zaključavanje","Tonirana stakla","Električni retrovizori","Grejači retrovizora","Svetla za maglu","Senzori za svetla","Xenon svetla","Senzori za kišu","Parking senzori","Aluminijumske felne",Bluetooth,Navigacija,Radio/Kasetofon,"Radio CD","Hands free","Start-stop sistem",Multimedija,"Naslon za ruku","ISOFIX sistem","DPF filter","Dnevna svetla","Kožni volan",USB,"Digitalni radio","Utičnica od 12V","Podešavanje volana po visini","Držači za čaše","Automatsko zatamnjivanje retrovizora","Rezervni točak","AUX konekcija"}	{"Airbag za vozača","Airbag za suvozača",ABS,ESP,"Bočni airbag","Child lock",Alarm,"Kodiran ključ","Centralno zaključavanje","Mehanička zaštita"}	{}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-02fbacf8/1790164449429-img-c14a5479a8a10854bcbeeb588dbd415b-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-aca829f4/1790164424987-img-7a6befc4835156e579b01a5d7650bfd7-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2c41df98/1790164455063-img-f1d64177443d54b51cc105638e1044dc-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ef40decc/1790164419692-img-003f408d3bcc0cbc3d3279177f3d73a8-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8c89ce51/1790164420994-img-3f08cb3c52feeb52e04ed519dd472955-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7fd44629/1790164421986-img-4c9a03b0c1ebe3c83549ccbb047abdd8-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b16705ae/1790164422961-img-05cd3566d3b0c7816e70898557246df1-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3af21e3f/1790164424022-img-6e36d3e5bfcf2b28a041e7ee0b949e97-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-62545d6d/1790164425952-img-7c3bb77b5631e036ad0cfbae33a7cdb8-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ee3f0577/1790164426952-img-7c98082114a23e3e511730178f6a38aa-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6d68b9c0/1790164427962-img-7e7e20ee253a594c1bba48244095f6a1-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7ba18824/1790164429003-img-7f8510ee573948dea9e5fda1bc31c76b-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7553854d/1790164430078-img-8b90ed6f570175170ce0a6eaaec3f464-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-94d1c365/1790164431267-img-8be0007d14584555af35055dd9469629-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ef6880fd/1790164432210-img-27caeb987c9e6f19081feacdf117547c-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d79d62f0/1790164433123-img-44cad6fb7c176dceb98c543f65c05136-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e6330064/1790164434008-img-314ecd0e54747424b04e38bd9b8ff0fa-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ef2d3fe8/1790164434988-img-464b6e80228674cd7b2a20dad1784101-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-757082a4/1790164435987-img-499f007265ee6ee2361823fe4c9fab75-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6812775d/1790164436908-img-655a6b06323315899d7696e8b0b054b9-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-da29ddd5/1790164437839-img-823a542cf41859b76d6c8b7325544b54-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d98c5f14/1790164438837-img-1782f57b702f7ec0e5747b1a8b5c19e1-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4ac06ff1/1790164439912-img-5008c98a8c8b6077673aa81d172441ef-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-247de45e/1790164440935-img-35936d65de0254040d08ee570f3673e7-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8dcdac00/1790164441993-img-58522bb2ca10200dd96afc571234a698-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8cc078ff/1790164442929-img-85836c6fefa9c425605e9e77b8742c36-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4b30d8dc/1790164443852-img-8649887fce239e919c1bb7e1e69d47b3-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-99285363/1790164444823-img-ab5a171a006056d383c5dc8e89d7d77d-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fe9ea7ca/1790164445830-img-abab678f661c9a49a2f50ea9ef0114c6-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-91990d67/1790164446694-img-b2ee465bbf7c662101fc35bbac44f2dc-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cbe6622e/1790164447611-img-bace763469fbac1abb736c89b315f9e5-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-102a4e58/1790164448524-img-bc2aeca2241761bde29c10427250052d-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c9af833/1790164450414-img-d632cfe84b8995a59e574044c8d8b46b-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c2c73adf/1790164451423-img-e3ee826535bc1aa2e286da0b77dd52e4-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a8bfca8d/1790164452425-img-e5dd142e8816b2ed350baec0c09864ce-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-da2cfcff/1790164453365-img-e1007afd0e59ee6563765fa9f203a9d0-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-12aeb990/1790164454182-img-ef8d89988a30721050cefe88d0381c73-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2e177b04/1790164456034-img-f93eeec599648b5b390fe7b324813d5c-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9830420b/1790164457062-img-fea32869ffcfa781c2896bd6388092a5-v.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-af741c8b/1790164457986-img-febc8a526f120f6223ee799e02c37041-v.jpg}	{"Passat CC","Volkswagen CC","2.0 TDI",Dizel}	\N	SOLD	f	2026-09-23 11:54:30.56	2026-10-17 15:42:21.959	NONE	cmue1c2mo0000lg04iyrqr6xz	+381669025162	+381669025162	+381669025162	t	f
1	bmw-x3-polovni-automobili	BMW X3 xDrive20d	BMW	X3	F25	2012	195000	11999	EUR	dizel	automatski	4x4	suv	polovno	2000	184	135	5	5	Siva metalik	Crna koža	\N	Na Ime Kupca	Švajcarska	Vozilo u vrhunskom stanju, pažljivo održavano i redovno servisirano. Uvezen iz Švajcarske, poseduje servisnu knjigu i kompletnu istoriju održavanja. Prošao švajcarski tehnički pregled i spreman je za registraciju bez dodatnih ulaganja. Maksimalno očuvan kako spolja tako i iznutra, mehanički potpuno ispravan i vožen sa pažnjom. Automobil pruža odličnu udobnost, sigurnost i pouzdanost u vožnji, a kompletno održavanje je rađeno redovno i profesionalno.	Vozilo je prošlo kompletan servis pre prodaje. Dostupan test vožnja.	{"Parking senzori","Grejanje sedišta",Navigacija,"Metalik boja","Servo volan",Tempomat,"Putni računar","Branici u boji auta","Multifunkcionalni volan","Daljinsko zaključavanje","Tonirana stakla","Električni retrovizori","Sedišta podesiva po visini","Električni prozori","Grejači retrovizora","Elektro podesiva sedišta","Svetla za maglu","Senzori za svetla","Senzori za kišu","Xenon svetla","Aluminijumske felne",Radio/Kasetofon,Bluetooth,"Radio CD","Hands free","Start-stop sistem",Multimedija,"Naslon za ruku","DPF filter","Podešavanje volana po visini","Držači za čaše","Parking Kamera","Elektronska ručna kočnica"}	{"Airbag vozača","Airbag suvozača","Bočni airbag",ABS,ESP,ASR,"Hill Hold Control","Kodni ključ","Centralno zaključavanje"}	{"Parking kamera 360°"}	{https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089081150-img-20260528-wa0014.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089082344-img-20260528-wa0015.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089083252-img-20260528-wa0016.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089084001-img-20260528-wa0017.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089084832-img-20260528-wa0018.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089085781-img-20260528-wa0019.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089086687-img-20260528-wa0020.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089087707-img-20260528-wa0021.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089088572-img-20260528-wa0022.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089089414-img-20260528-wa0023.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089090241-img-20260528-wa0024.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089091160-img-20260528-wa0025.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089092072-img-20260528-wa0026.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089092911-img-20260528-wa0027.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089093902-img-20260528-wa0028.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089094751-img-20260528-wa0029.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089095612-img-20260528-wa0030.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089096292-img-20260528-wa0031.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089097038-img-20260528-wa0032.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089097656-img-20260528-wa0033.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089098311-img-20260528-wa0034.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089098998-img-20260528-wa0035.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089099670-img-20260528-wa0036.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089100295-img-20260528-wa0037.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089100888-img-20260528-wa0038.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089101516-img-20260528-wa0039.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089102091-img-20260528-wa0040.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089103029-img-20260528-wa0041.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089103808-img-20260528-wa0042.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089104572-img-20260528-wa0043.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089105357-img-20260528-wa0044.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089106085-img-20260528-wa0045.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089106935-img-20260528-wa0046.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089107652-img-20260528-wa0047.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089108394-img-20260528-wa0048.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089109153-img-20260528-wa0049.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089109879-img-20260528-wa0050.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089110606-img-20260528-wa0051.jpg,https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1778840246313-bmw-x3-10-.jpg}	{premium,suv,awd,cv:no_vin}	\N	AVAILABLE	f	2024-01-15 10:00:00	2026-11-16 12:35:41.264	NONE	cmp8p4vc90000l804ym3mce1x	+381631850324	+381631850324	Faton	t	f
\.


--
-- Data for Name: VehicleMedia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VehicleMedia" (id, "vehicleId", url, "r2Key", type, "mimeType", "sizeBytes", "sortOrder", "isPrimary", "createdAt", "updatedAt") FROM stdin;
cmprgdeie002blc04alhhiy34	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2aa37984/1780091143756-img-20260528-wa0163.jpg	vehicles/tmp-2aa37984/1780091143756-img-20260528-wa0163.jpg	image	\N	\N	13	f	2026-05-29 21:47:34.454	2026-06-02 11:51:04.782
cmprfkvq6000zlc047qls1x5l	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-dba32996/1780089857603-img-20260528-wa0106.jpg	vehicles/tmp-dba32996/1780089857603-img-20260528-wa0106.jpg	image	\N	\N	16	f	2026-05-29 21:25:23.742	2026-08-13 23:17:50.08
cmprfl51z0017lc046hgnbjbr	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5a7df6c4/1780089860210-img-20260528-wa0110.jpg	vehicles/tmp-5a7df6c4/1780089860210-img-20260528-wa0110.jpg	image	\N	\N	20	f	2026-05-29 21:25:35.832	2026-08-13 23:18:30.288
cmprfl5cl001flc048zb4zw3f	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c4e08246/1780089862833-img-20260528-wa0114.jpg	vehicles/tmp-c4e08246/1780089862833-img-20260528-wa0114.jpg	image	\N	\N	24	f	2026-05-29 21:25:36.213	2026-08-13 23:18:30.666
cmprfl6lc001hlc04zuze10dx	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b995f4a1/1780089863490-img-20260528-wa0115.jpg	vehicles/tmp-b995f4a1/1780089863490-img-20260528-wa0115.jpg	image	\N	\N	25	f	2026-05-29 21:25:37.824	2026-08-13 23:18:30.76
cmt8gk5jz0003l10428htikro	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4bed5d07/1787641786771-20260824-133233.jpg	\N	image	\N	\N	1	f	2026-08-25 09:24:01.346	2026-09-23 12:00:23.26
cmprfacjw0029le04c3sp10ye	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089185118-img-20260528-wa0197.jpg	\N	image	\N	\N	26	f	2026-05-29 21:17:12.332	2026-06-02 11:52:30.613
cmprgd9oi001zlc04gw2ava9b	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-23d4a2f5/1780091139857-img-20260528-wa0157.jpg	vehicles/tmp-23d4a2f5/1780091139857-img-20260528-wa0157.jpg	image	\N	\N	7	f	2026-05-29 21:47:28.194	2026-06-02 11:51:04.218
cmprf56vv000rle04g87xiohl	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089172000-img-20260528-wa0180.jpg	vehicles/2/1780089172000-img-20260528-wa0180.jpg	image	\N	\N	8	f	2026-05-29 21:13:11.708	2026-06-02 11:51:49.015
cmprf5nlm001xle04zbswcjvs	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089183775-img-20260528-wa0195.jpg	\N	image	\N	\N	23	f	2026-05-29 21:13:33.37	2026-06-02 11:52:30.294
cmprfkwx00013lc0410ckbzi2	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-943e03db/1780089858896-img-20260528-wa0108.jpg	vehicles/tmp-943e03db/1780089858896-img-20260528-wa0108.jpg	image	\N	\N	18	f	2026-05-29 21:25:25.284	2026-08-13 23:18:16.871
cmprfl57a001blc040g57vd4q	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-61e43637/1780089861325-img-20260528-wa0112.jpg	vehicles/tmp-61e43637/1780089861325-img-20260528-wa0112.jpg	image	\N	\N	22	f	2026-05-29 21:25:36.022	2026-08-13 23:18:30.477
cmprfl59x001dlc04xtzg4wyv	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-57d92048/1780089862221-img-20260528-wa0113.jpg	vehicles/tmp-57d92048/1780089862221-img-20260528-wa0113.jpg	image	\N	\N	23	f	2026-05-29 21:25:36.118	2026-08-13 23:18:30.572
cmprfl4zc0015lc04wpk0uzhx	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9a5e150c/1780089859552-img-20260528-wa0109.jpg	vehicles/tmp-9a5e150c/1780089859552-img-20260528-wa0109.jpg	image	\N	\N	19	f	2026-05-29 21:25:35.576	2026-08-13 23:18:16.966
cmprfl54n0019lc04w8m8gzsz	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c57ccd61/1780089860667-img-20260528-wa0111.jpg	vehicles/tmp-c57ccd61/1780089860667-img-20260528-wa0111.jpg	image	\N	\N	21	f	2026-05-29 21:25:35.927	2026-08-13 23:18:30.383
cmprgd9r30021lc04et0jwd3d	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fe8d0a08/1780091140515-img-20260528-wa0158.jpg	vehicles/tmp-fe8d0a08/1780091140515-img-20260528-wa0158.jpg	image	\N	\N	8	f	2026-05-29 21:47:28.288	2026-06-02 11:51:04.312
cmprgddn60023lc04qlsnv6r5	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3441d495/1780091141093-img-20260528-wa0159.jpg	vehicles/tmp-3441d495/1780091141093-img-20260528-wa0159.jpg	image	\N	\N	9	f	2026-05-29 21:47:33.33	2026-06-02 11:51:04.406
cmprgdds80025lc04hy1b95gq	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-087d11d5/1780091141678-img-20260528-wa0160.jpg	vehicles/tmp-087d11d5/1780091141678-img-20260528-wa0160.jpg	image	\N	\N	10	f	2026-05-29 21:47:33.512	2026-06-02 11:51:04.5
cmprgded70027lc040gtecrki	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-000a5d1c/1780091142358-img-20260528-wa0161.jpg	vehicles/tmp-000a5d1c/1780091142358-img-20260528-wa0161.jpg	image	\N	\N	11	f	2026-05-29 21:47:34.268	2026-06-02 11:51:04.594
cmprgdefs0029lc04v571ixcq	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-42490af8/1780091143061-img-20260528-wa0162.jpg	vehicles/tmp-42490af8/1780091143061-img-20260528-wa0162.jpg	image	\N	\N	12	f	2026-05-29 21:47:34.361	2026-06-02 11:51:04.688
cmprfkvsu0011lc04x9c59486	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-17636ba8/1780089858289-img-20260528-wa0107.jpg	vehicles/tmp-17636ba8/1780089858289-img-20260528-wa0107.jpg	image	\N	\N	17	f	2026-05-29 21:25:23.838	2026-08-13 23:18:16.683
cmprgd9lw001wlc04wnha43l9	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7803c285/1780091138953-img-20260528-wa0156.jpg	vehicles/tmp-7803c285/1780091138953-img-20260528-wa0156.jpg	image	\N	\N	6	f	2026-05-29 21:47:28.1	2026-06-02 11:50:58.865
b127fec7-5d64-416e-a09e-4db84fcd5693	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1778881454942-20260408-141113.jpg	\N	image	\N	\N	25	f	2026-05-16 08:47:57.094	2026-06-02 11:52:30.484
cmprfkvi4000tlc04kq8a5stg	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-baa58742/1780089855053-img-20260528-wa0103.jpg	vehicles/tmp-baa58742/1780089855053-img-20260528-wa0103.jpg	image	\N	\N	13	f	2026-05-29 21:25:23.452	2026-08-13 23:17:49.796
cmprfkvnh000xlc04obk3drtu	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b155c44e/1780089857012-img-20260528-wa0105.jpg	vehicles/tmp-b155c44e/1780089857012-img-20260528-wa0105.jpg	image	\N	\N	15	f	2026-05-29 21:25:23.646	2026-08-13 23:17:49.986
0ea14605-cf4a-4b6c-937d-57f1e8ebe875	8	https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80	\N	image	\N	\N	0	t	2026-05-16 08:47:57.094	2026-05-16 08:47:57.094
cmprfkv20000hlc04ed7vvsu9	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bf24d7b3/1780089849601-img-20260528-wa0097.jpg	vehicles/tmp-bf24d7b3/1780089849601-img-20260528-wa0097.jpg	image	\N	\N	7	f	2026-05-29 21:25:22.872	2026-08-13 23:17:36.387
cmprfkv9y000nlc04861e5ops	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-34397a68/1780089852486-img-20260528-wa0100.jpg	vehicles/tmp-34397a68/1780089852486-img-20260528-wa0100.jpg	image	\N	\N	10	f	2026-05-29 21:25:23.158	2026-08-13 23:17:36.684
cmprfkvct000plc0455fit64d	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-94172506/1780089853321-img-20260528-wa0101.jpg	vehicles/tmp-94172506/1780089853321-img-20260528-wa0101.jpg	image	\N	\N	11	f	2026-05-29 21:25:23.261	2026-08-13 23:17:49.513
cmqhv4lxh0004jn04rnk06ikb	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1c57c354/1781687962867-img-4c99a8d7c959e0cc2581d3932316c2b2-v.jpg	vehicles/tmp-1c57c354/1781687962867-img-4c99a8d7c959e0cc2581d3932316c2b2-v.jpg	image	\N	\N	1	f	2026-06-17 09:22:38.981	2026-09-23 12:00:44.77
cmprf5no90023le043hic36iy	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089184504-img-20260528-wa0196.jpg	\N	image	\N	\N	24	f	2026-05-29 21:13:33.466	2026-06-02 11:52:30.389
3fdb5f30-4b88-45d0-9c25-f9d8fe13dfd6	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1778840246313-bmw-x3-10-.jpg	\N	image	\N	\N	38	f	2026-05-16 08:47:57.094	2026-06-02 11:54:25.261
cmpsu115p0003u37wu5tmi8el	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174651907-img-20260530-wa0019.jpg	vehicles/3/1780174651907-img-20260530-wa0019.jpg	image	\N	\N	1	f	2026-05-30 20:57:38.077	2026-11-13 10:52:53.357
cmprfkuom0007lc04q9ei9pea	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e423832b/1780089845036-img-20260528-wa0092.jpg	vehicles/tmp-e423832b/1780089845036-img-20260528-wa0092.jpg	image	\N	\N	2	f	2026-05-29 21:25:22.391	2026-09-23 12:01:02.993
cmprfkura0009lc042969kb39	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a96b7ff9/1780089845963-img-20260528-wa0093.jpg	vehicles/tmp-a96b7ff9/1780089845963-img-20260528-wa0093.jpg	image	\N	\N	3	f	2026-05-29 21:25:22.486	2026-09-23 12:01:03.088
cmprfkuwp000dlc04ikuoc4cm	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b4542bed/1780089847879-img-20260528-wa0095.jpg	vehicles/tmp-b4542bed/1780089847879-img-20260528-wa0095.jpg	image	\N	\N	5	f	2026-05-29 21:25:22.681	2026-09-23 12:01:03.729
cmprfkv4n000jlc04rh2c4x59	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c2bdb66f/1780089850534-img-20260528-wa0098.jpg	vehicles/tmp-c2bdb66f/1780089850534-img-20260528-wa0098.jpg	image	\N	\N	8	f	2026-05-29 21:25:22.967	2026-08-13 23:17:36.481
cmprfkrt80003lc04ydd67rp3	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b300ec42/1780089843733-img-20260528-wa0091.jpg	vehicles/tmp-b300ec42/1780089843733-img-20260528-wa0091.jpg	image	\N	\N	0	t	2026-05-29 21:25:18.669	2026-09-23 12:00:59.798
cmprfkulz0005lc049pfbl7kc	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ce291fb5/1780089842479-img-20260528-wa0090.jpg	vehicles/tmp-ce291fb5/1780089842479-img-20260528-wa0090.jpg	image	\N	\N	1	f	2026-05-29 21:25:22.295	2026-09-23 12:01:02.898
cmprfkutx000blc04twipuybw	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-941ff532/1780089846852-img-20260528-wa0094.jpg	vehicles/tmp-941ff532/1780089846852-img-20260528-wa0094.jpg	image	\N	\N	4	f	2026-05-29 21:25:22.582	2026-09-23 12:01:03.183
cmprfkvfg000rlc045htc3j4n	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-408afbb7/1780089854132-img-20260528-wa0102.jpg	vehicles/tmp-408afbb7/1780089854132-img-20260528-wa0102.jpg	image	\N	\N	12	f	2026-05-29 21:25:23.356	2026-08-13 23:17:49.702
cmue1xu2v007ok104svrctogy	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2e1b55e6/1787641800803-20260824-133518.jpg	\N	image	\N	\N	18	f	2026-09-23 12:01:04.904	2026-09-23 12:01:04.904
cmue1xu5k007qk1044o1m3mhd	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f4275799/1787641801524-20260824-133519.jpg	\N	image	\N	\N	19	f	2026-09-23 12:01:05	2026-09-23 12:01:05
cmue1xu88007sk1042dyeey9a	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2e241f4c/1787641802376-20260824-133523.jpg	\N	image	\N	\N	20	f	2026-09-23 12:01:05.096	2026-09-23 12:01:05.096
cmue1xubz007uk1044utsi4xo	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-91b9ac5e/1787641803245-20260824-133529.jpg	\N	image	\N	\N	21	f	2026-09-23 12:01:05.232	2026-09-23 12:01:05.232
cmprfkuzc000flc04iqzfasx6	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-379e4085/1780089848697-img-20260528-wa0096.jpg	vehicles/tmp-379e4085/1780089848697-img-20260528-wa0096.jpg	image	\N	\N	6	f	2026-05-29 21:25:22.776	2026-08-13 23:17:36.292
cmprfkv7b000llc04x65bf3u6	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5814ac98/1780089851515-img-20260528-wa0099.jpg	vehicles/tmp-5814ac98/1780089851515-img-20260528-wa0099.jpg	image	\N	\N	9	f	2026-05-29 21:25:23.063	2026-08-13 23:17:36.576
cmprgd9e3001qlc047rplk6iz	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8c3aac4c/1780091136568-img-20260528-wa0153.jpg	vehicles/tmp-8c3aac4c/1780091136568-img-20260528-wa0153.jpg	image	\N	\N	3	f	2026-05-29 21:47:27.82	2026-06-02 11:50:58.581
cmprgd9gp001slc04bm8bnl6p	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2c37969d/1780091137343-img-20260528-wa0154.jpg	vehicles/tmp-2c37969d/1780091137343-img-20260528-wa0154.jpg	image	\N	\N	4	f	2026-05-29 21:47:27.913	2026-06-02 11:50:58.676
cmprgd9ja001ulc040ule6ytw	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3cce9e2c/1780091138281-img-20260528-wa0155.jpg	vehicles/tmp-3cce9e2c/1780091138281-img-20260528-wa0155.jpg	image	\N	\N	5	f	2026-05-29 21:47:28.007	2026-06-02 11:50:58.771
cmprgc2qs001klc04d53clny3	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7492dc37/1780091133594-img-20260528-wa0150.jpg	vehicles/tmp-7492dc37/1780091133594-img-20260528-wa0150.jpg	image	\N	\N	0	t	2026-05-29 21:46:32.549	2026-06-02 11:50:56.467
cmprgd98x001mlc04hqu6kt34	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6835db2c/1780091134896-img-20260528-wa0151.jpg	vehicles/tmp-6835db2c/1780091134896-img-20260528-wa0151.jpg	image	\N	\N	1	f	2026-05-29 21:47:27.542	2026-06-02 11:50:58.392
cmprgd9bi001olc04psxalf5h	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6288ba8d/1780091135683-img-20260528-wa0152.jpg	vehicles/tmp-6288ba8d/1780091135683-img-20260528-wa0152.jpg	image	\N	\N	2	f	2026-05-29 21:47:27.726	2026-06-02 11:50:58.487
cmue1xu08007mk104nexqdbmc	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9a86273a/1787641799832-20260824-133513.jpg	\N	image	\N	\N	17	f	2026-09-23 12:01:04.808	2026-09-23 12:01:04.808
cmpsu116u0005u37wjqbaaax3	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174653733-img-20260530-wa0021.jpg	vehicles/3/1780174653733-img-20260530-wa0021.jpg	image	\N	\N	2	f	2026-05-30 20:57:38.118	2026-11-13 10:52:53.386
cmpsu117x0007u37ww6996fwg	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174654318-img-20260530-wa0022.jpg	vehicles/3/1780174654318-img-20260530-wa0022.jpg	image	\N	\N	3	f	2026-05-30 20:57:38.158	2026-11-13 10:52:53.416
cmprfkvku000vlc04zhm0ojxp	cmprfkrmf0001lc048odd6iye	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-dd3b29bc/1780089855611-img-20260528-wa0104.jpg	vehicles/tmp-dd3b29bc/1780089855611-img-20260528-wa0104.jpg	image	\N	\N	14	f	2026-05-29 21:25:23.55	2026-08-13 23:17:49.891
cmp8qodkd000bl704ljjna5ob	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959499919-whatsapp-image-2026-05-16-at-11.13.12q.jpeg	vehicles/4/1778959499919-whatsapp-image-2026-05-16-at-11.13.12q.jpeg	image	\N	\N	3	f	2026-05-16 19:28:25.261	2026-07-11 21:38:46.709
cmprf3war001pl704f7e7zerd	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089095612-img-20260528-wa0030.jpg	\N	image	\N	\N	16	f	2026-05-29 21:12:11.332	2026-06-02 11:54:23.14
cmp8qodz5000nl704hqscjr0y	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959503143-whatsapp-image-2026-05-16-at-11.13.13fd.jpeg	vehicles/4/1778959503143-whatsapp-image-2026-05-16-at-11.13.13fd.jpeg	image	\N	\N	8	f	2026-05-16 19:28:25.794	2026-07-11 21:38:52.95
cmp8qoh0m0013l7049a8enxd1	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959505343-whatsapp-image-2026-05-16-at-11.13.13tttre.jpeg	vehicles/4/1778959505343-whatsapp-image-2026-05-16-at-11.13.13tttre.jpeg	image	\N	\N	12	f	2026-05-16 19:28:29.734	2026-07-11 21:38:53.419
cmp8qodmz000dl704kzfeou8m	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959500592-whatsapp-image-2026-05-16-at-11.13.12rt.jpeg	vehicles/4/1778959500592-whatsapp-image-2026-05-16-at-11.13.12rt.jpeg	image	\N	\N	4	f	2026-05-16 19:28:25.356	2026-07-11 21:38:46.804
cmprf54jq000jle04myhrkva5	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089168341-img-20260528-wa0176.jpg	vehicles/2/1780089168341-img-20260528-wa0176.jpg	image	\N	\N	4	f	2026-05-29 21:13:07.931	2026-06-02 11:51:36.577
cmp8qoh3a0019l704mhkpq67g	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959505916-whatsapp-image-2026-05-16-at-11.13.13u.jpeg	vehicles/4/1778959505916-whatsapp-image-2026-05-16-at-11.13.13u.jpeg	image	\N	\N	13	f	2026-05-16 19:28:29.831	2026-07-11 21:38:53.516
cmp8qoh8l001hl704x9h1rvh1	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959507297-whatsapp-image-2026-05-16-at-11.13.13ytn.jpeg	vehicles/4/1778959507297-whatsapp-image-2026-05-16-at-11.13.13ytn.jpeg	image	\N	\N	15	f	2026-05-16 19:28:30.021	2026-07-11 21:38:53.761
cmprf5g1l001jle04bj266c0d	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089181784-img-20260528-wa0192.jpg	\N	image	\N	\N	20	f	2026-05-29 21:13:23.577	2026-06-02 11:52:30.011
cmp8qla3s0005l7047kep89dw	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959497178-r.jpeg	vehicles/4/1778959497178-r.jpeg	image	\N	\N	0	t	2026-05-16 19:26:00.809	2026-07-11 21:38:38.075
cmprf5g49001nle043lafaj4n	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089182409-img-20260528-wa0193.jpg	\N	image	\N	\N	21	f	2026-05-29 21:13:23.673	2026-06-02 11:52:30.106
cmp8qodf20007l704asts4mcf	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959498476-whatsapp-image-2026-05-16-at-11.13.12.jpeg	vehicles/4/1778959498476-whatsapp-image-2026-05-16-at-11.13.12.jpeg	image	\N	\N	1	f	2026-05-16 19:28:24.978	2026-07-11 21:38:46.519
cmp8qogsp000tl704pm4c3yzx	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959503805-whatsapp-image-2026-05-16-at-11.13.13ghfgj.jpeg	vehicles/4/1778959503805-whatsapp-image-2026-05-16-at-11.13.13ghfgj.jpeg	image	\N	\N	9	f	2026-05-16 19:28:29.45	2026-07-11 21:38:53.137
cmp8qogvc000xl7048bbo5pd7	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959504285-whatsapp-image-2026-05-16-at-11.13.13tertwww.jpeg	vehicles/4/1778959504285-whatsapp-image-2026-05-16-at-11.13.13tertwww.jpeg	image	\N	\N	10	f	2026-05-16 19:28:29.545	2026-07-11 21:38:53.231
cmp8qodpn000fl704d6flr9ce	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959501286-whatsapp-image-2026-05-16-at-11.13.12w.jpeg	vehicles/4/1778959501286-whatsapp-image-2026-05-16-at-11.13.12w.jpeg	image	\N	\N	5	f	2026-05-16 19:28:25.451	2026-07-11 21:38:46.899
cmp8qodsa000hl704xyilsztm	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959502005-whatsapp-image-2026-05-16-at-11.13.13b.jpeg	vehicles/4/1778959502005-whatsapp-image-2026-05-16-at-11.13.13b.jpeg	image	\N	\N	6	f	2026-05-16 19:28:25.546	2026-07-11 21:38:46.993
cmprf5g9h001tle04s4f292jw	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089183047-img-20260528-wa0194.jpg	\N	image	\N	\N	22	f	2026-05-29 21:13:23.768	2026-06-02 11:52:30.2
cmp8qogxz000zl704roz0dx6g	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959504821-whatsapp-image-2026-05-16-at-11.13.13ttre.jpeg	vehicles/4/1778959504821-whatsapp-image-2026-05-16-at-11.13.13ttre.jpeg	image	\N	\N	11	f	2026-05-16 19:28:29.639	2026-07-11 21:38:53.325
cmp8qodhp0009l704zq4toj8r	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959499199-whatsapp-image-2026-05-16-at-11.13.12e.jpeg	vehicles/4/1778959499199-whatsapp-image-2026-05-16-at-11.13.12e.jpeg	image	\N	\N	2	f	2026-05-16 19:28:25.166	2026-07-11 21:38:46.614
cmp8qodux000jl704i73fuunw	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959502636-whatsapp-image-2026-05-16-at-11.13.13ert.jpeg	vehicles/4/1778959502636-whatsapp-image-2026-05-16-at-11.13.13ert.jpeg	image	\N	\N	7	f	2026-05-16 19:28:25.641	2026-07-11 21:38:47.087
cmprf4vpc0009le04s316014e	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089167535-img-20260528-wa0175.jpg	vehicles/2/1780089167535-img-20260528-wa0175.jpg	image	\N	\N	3	f	2026-05-29 21:12:57.216	2026-06-02 11:51:36.482
cmprf2zad0007l704ywv0t7pk	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089083252-img-20260528-wa0016.jpg	vehicles/1/1780089083252-img-20260528-wa0016.jpg	image	\N	\N	2	f	2026-05-29 21:11:28.55	2026-06-02 11:49:27.777
cmprf57ha000tle04s2k41pyr	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089172893-img-20260528-wa0181.jpg	vehicles/2/1780089172893-img-20260528-wa0181.jpg	image	\N	\N	9	f	2026-05-29 21:13:12.478	2026-06-02 11:51:59.594
cmue1xuhw007wk1042cltxh8k	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c3f66667/1787641804067-20260824-133532.jpg	\N	image	\N	\N	22	f	2026-09-23 12:01:05.444	2026-09-23 12:01:05.444
cmprf3t9w000xl704j44qkgxr	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089089414-img-20260528-wa0023.jpg	\N	image	\N	\N	9	f	2026-05-29 21:12:07.413	2026-06-02 11:49:41.651
cmprf583v000vle04j1f9me32	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089173826-img-20260528-wa0182.jpg	\N	image	\N	\N	10	f	2026-05-29 21:13:13.291	2026-06-02 11:51:59.691
cmprf4ud50005le045gpzpol3	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089165957-img-20260528-wa0173.jpg	vehicles/2/1780089165957-img-20260528-wa0173.jpg	image	\N	\N	1	f	2026-05-29 21:12:55.482	2026-06-02 11:51:36.293
cmprf2z7p0005l704oiigvjtt	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089082344-img-20260528-wa0015.jpg	vehicles/1/1780089082344-img-20260528-wa0015.jpg	image	\N	\N	1	f	2026-05-29 21:11:28.454	2026-06-02 11:49:20.27
cmprf2zd20009l704m0tfq55q	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089084001-img-20260528-wa0017.jpg	vehicles/1/1780089084001-img-20260528-wa0017.jpg	image	\N	\N	3	f	2026-05-29 21:11:28.646	2026-06-02 11:49:39.234
cmprf2zfq000bl7043ybcm464	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089084832-img-20260528-wa0018.jpg	vehicles/1/1780089084832-img-20260528-wa0018.jpg	image	\N	\N	4	f	2026-05-29 21:11:28.742	2026-06-02 11:49:39.565
cmprf2zie000dl704xz325hyh	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089085781-img-20260528-wa0019.jpg	vehicles/1/1780089085781-img-20260528-wa0019.jpg	image	\N	\N	5	f	2026-05-29 21:11:28.838	2026-06-02 11:49:39.972
cmprf3s5c000rl704bcegsljz	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089086687-img-20260528-wa0020.jpg	vehicles/1/1780089086687-img-20260528-wa0020.jpg	image	\N	\N	6	f	2026-05-29 21:12:05.952	2026-06-02 11:49:40.137
cmprf3t4l000tl704i40tx97d	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089087707-img-20260528-wa0021.jpg	vehicles/1/1780089087707-img-20260528-wa0021.jpg	image	\N	\N	7	f	2026-05-29 21:12:07.222	2026-06-02 11:49:40.3
cmprf3t79000vl704ivg7v5ja	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089088572-img-20260528-wa0022.jpg	\N	image	\N	\N	8	f	2026-05-29 21:12:07.317	2026-06-02 11:49:41.463
cmprf4v3o0007le04jkihbn22	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089166751-img-20260528-wa0174.jpg	vehicles/2/1780089166751-img-20260528-wa0174.jpg	image	\N	\N	2	f	2026-05-29 21:12:56.436	2026-06-02 11:51:36.387
cmprf554x000lle04t9y6nir7	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089169352-img-20260528-wa0177.jpg	vehicles/2/1780089169352-img-20260528-wa0177.jpg	image	\N	\N	5	f	2026-05-29 21:13:09.441	2026-06-02 11:51:36.673
cmprf55qv000nle04z9350vu7	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089170234-img-20260528-wa0178.jpg	vehicles/2/1780089170234-img-20260528-wa0178.jpg	image	\N	\N	6	f	2026-05-29 21:13:10.231	2026-06-02 11:51:48.734
cmprf56c7000ple043u2ciubu	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089171255-img-20260528-wa0179.jpg	vehicles/2/1780089171255-img-20260528-wa0179.jpg	image	\N	\N	7	f	2026-05-29 21:13:10.999	2026-06-02 11:51:48.921
cmprf3vut0019l704z8x3bvyl	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089092072-img-20260528-wa0026.jpg	\N	image	\N	\N	12	f	2026-05-29 21:12:10.758	2026-06-02 11:54:22.083
cmprf3vpk0011l704pbhktmpe	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089090241-img-20260528-wa0024.jpg	\N	image	\N	\N	10	f	2026-05-29 21:12:10.568	2026-06-02 11:49:43.306
cmprf3vs70015l704xx8dj070	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089091160-img-20260528-wa0025.jpg	\N	image	\N	\N	11	f	2026-05-29 21:12:10.663	2026-06-02 11:49:43.701
cmprf4sd50001le0407itnh39	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089165103-img-20260528-wa0172.jpg	vehicles/2/1780089165103-img-20260528-wa0172.jpg	image	\N	\N	0	t	2026-05-29 21:12:49.804	2026-06-02 11:51:31.426
cmprf3vxg001dl704vo7dqj76	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089092911-img-20260528-wa0027.jpg	\N	image	\N	\N	13	f	2026-05-29 21:12:10.853	2026-06-02 11:54:22.85
cmprf3w03001hl704k97jtbf2	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089093902-img-20260528-wa0028.jpg	\N	image	\N	\N	14	f	2026-05-29 21:12:10.948	2026-06-02 11:54:22.945
cmprf3w2s001ll704vw65iatr	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089094751-img-20260528-wa0029.jpg	\N	image	\N	\N	15	f	2026-05-29 21:12:11.044	2026-06-02 11:54:23.043
cmprf2yzk0001l7048zpljwny	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089081150-img-20260528-wa0014.jpg	vehicles/1/1780089081150-img-20260528-wa0014.jpg	image	\N	\N	0	t	2026-05-29 21:11:28.16	2026-06-02 11:49:18.947
cmprf58m7000xle048vglshm6	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089174693-img-20260528-wa0183.jpg	\N	image	\N	\N	11	f	2026-05-29 21:13:13.952	2026-06-02 11:51:59.785
cmprf597x000zle04etf9d9aq	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089175483-img-20260528-wa0184.jpg	\N	image	\N	\N	12	f	2026-05-29 21:13:14.733	2026-06-02 11:51:59.879
cmprf59tj0011le049o2bhbka	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089176438-img-20260528-wa0185.jpg	\N	image	\N	\N	13	f	2026-05-29 21:13:15.512	2026-06-02 11:51:59.973
cmprf5age0013le04y8l346fv	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089177220-img-20260528-wa0186.jpg	\N	image	\N	\N	14	f	2026-05-29 21:13:16.334	2026-06-02 11:52:00.067
cmprf5dvs0017le04efl3w14p	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089178934-img-20260528-wa0188.jpg	\N	image	\N	\N	16	f	2026-05-29 21:13:20.776	2026-06-02 11:52:00.255
cmprf5dyf0019le047ckgvx9z	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089179667-img-20260528-wa0189.jpg	\N	image	\N	\N	17	f	2026-05-29 21:13:20.871	2026-06-02 11:52:29.635
cmprf5fwa001dle04bw5569wz	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089180482-img-20260528-wa0190.jpg	\N	image	\N	\N	18	f	2026-05-29 21:13:23.387	2026-06-02 11:52:29.822
cmprf5fyx001fle04b66jxydi	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089181227-img-20260528-wa0191.jpg	\N	image	\N	\N	19	f	2026-05-29 21:13:23.482	2026-06-02 11:52:29.917
cmp8qoh5x001bl7043hg33te6	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1778959506599-whatsapp-image-2026-05-16-at-11.13.13y.jpeg	vehicles/4/1778959506599-whatsapp-image-2026-05-16-at-11.13.13y.jpeg	image	\N	\N	14	f	2026-05-16 19:28:29.925	2026-07-11 21:38:53.661
cmpsu10yx0001u37waa2xfbn4	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174652921-img-20260530-wa0020.jpg	vehicles/3/1780174652921-img-20260530-wa0020.jpg	image	\N	\N	0	t	2026-05-30 20:57:37.833	2026-11-13 10:52:53.287
cmprgdexy002nlc042guoixr4	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1c80d3fe/1780091147938-img-20260528-wa0169.jpg	vehicles/tmp-1c80d3fe/1780091147938-img-20260528-wa0169.jpg	image	\N	\N	19	f	2026-05-29 21:47:35.014	2026-06-02 11:51:11.686
cmprgdf0j002plc043v3yhdzw	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a35ea4c9/1780091148522-img-20260528-wa0170.jpg	vehicles/tmp-a35ea4c9/1780091148522-img-20260528-wa0170.jpg	image	\N	\N	20	f	2026-05-29 21:47:35.107	2026-06-02 11:51:11.78
cmprgogo6000bjv04v93fwho8	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bd3e0623/1780091721700-img-20260528-wa0055.jpg	vehicles/tmp-bd3e0623/1780091721700-img-20260528-wa0055.jpg	image	\N	\N	3	f	2026-05-29 21:56:10.47	2026-09-23 11:55:03.888
cmprgdesr002jlc043mqb4e6h	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-927bdd0b/1780091146563-img-20260528-wa0167.jpg	vehicles/tmp-927bdd0b/1780091146563-img-20260528-wa0167.jpg	image	\N	\N	17	f	2026-05-29 21:47:34.827	2026-06-02 11:51:05.158
cmprgohx90011jv046notx2s0	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a53962ec/1780091732771-img-20260528-wa0068.jpg	vehicles/tmp-a53962ec/1780091732771-img-20260528-wa0068.jpg	image	\N	\N	16	f	2026-05-29 21:56:12.093	2026-09-23 11:57:07.141
cmprgdeq5002hlc04k50xc48q	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ea80fe32/1780091145738-img-20260528-wa0166.jpg	vehicles/tmp-ea80fe32/1780091145738-img-20260528-wa0166.jpg	image	\N	\N	16	f	2026-05-29 21:47:34.734	2026-06-02 11:51:05.064
cmprgogtg000fjv04e32j66ff	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-29a661c9/1780091723459-img-20260528-wa0057.jpg	vehicles/tmp-29a661c9/1780091723459-img-20260528-wa0057.jpg	image	\N	\N	5	f	2026-05-29 21:56:10.661	2026-09-23 11:55:04.1
cmprgogw3000hjv046zj3kw0t	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-38aa5db9/1780091724404-img-20260528-wa0058.jpg	vehicles/tmp-38aa5db9/1780091724404-img-20260528-wa0058.jpg	image	\N	\N	6	f	2026-05-29 21:56:10.756	2026-09-23 11:55:04.194
cmprgogyq000jjv04r5gblwov	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-80b5cfde/1780091725273-img-20260528-wa0059.jpg	vehicles/tmp-80b5cfde/1780091725273-img-20260528-wa0059.jpg	image	\N	\N	7	f	2026-05-29 21:56:10.851	2026-09-23 11:55:04.289
cmprgoh1d000ljv04aq1euixq	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bffaf1e0/1780091726122-img-20260528-wa0060.jpg	vehicles/tmp-bffaf1e0/1780091726122-img-20260528-wa0060.jpg	image	\N	\N	8	f	2026-05-29 21:56:10.946	2026-09-23 11:55:04.389
cmprgoh42000njv04lg7pi1ow	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f281929b/1780091727033-img-20260528-wa0061.jpg	vehicles/tmp-f281929b/1780091727033-img-20260528-wa0061.jpg	image	\N	\N	9	f	2026-05-29 21:56:11.043	2026-09-23 11:55:04.507
cmprgoh6u000pjv04cyf4i94s	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-28d92981/1780091728022-img-20260528-wa0062.jpg	vehicles/tmp-28d92981/1780091728022-img-20260528-wa0062.jpg	image	\N	\N	10	f	2026-05-29 21:56:11.142	2026-09-23 11:55:05.092
cmprgoh9h000rjv040ga71wvi	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-72dc404e/1780091728746-img-20260528-wa0063.jpg	vehicles/tmp-72dc404e/1780091728746-img-20260528-wa0063.jpg	image	\N	\N	11	f	2026-05-29 21:56:11.237	2026-09-23 11:55:15.804
cmprgohc4000tjv04buq3a5rf	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-badce2f0/1780091729633-img-20260528-wa0064.jpg	vehicles/tmp-badce2f0/1780091729633-img-20260528-wa0064.jpg	image	\N	\N	12	f	2026-05-29 21:56:11.332	2026-09-23 11:57:06.591
cmprgohes000vjv049sqdzyq6	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1419efe2/1780091730297-img-20260528-wa0065.jpg	vehicles/tmp-1419efe2/1780091730297-img-20260528-wa0065.jpg	image	\N	\N	13	f	2026-05-29 21:56:11.428	2026-09-23 11:57:06.856
cmprgohn7000xjv046r1st8qx	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d04e2e1d/1780091731216-img-20260528-wa0066.jpg	vehicles/tmp-d04e2e1d/1780091731216-img-20260528-wa0066.jpg	image	\N	\N	14	f	2026-05-29 21:56:11.732	2026-09-23 11:57:06.951
cmprgohs8000zjv044j2jkaws	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f6911706/1780091732052-img-20260528-wa0067.jpg	vehicles/tmp-f6911706/1780091732052-img-20260528-wa0067.jpg	image	\N	\N	15	f	2026-05-29 21:56:11.912	2026-09-23 11:57:07.046
cmprgdf34002rlc046o00zvid	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d5d60b86/1780091149299-img-20260528-wa0171.jpg	vehicles/tmp-d5d60b86/1780091149299-img-20260528-wa0171.jpg	image	\N	\N	21	f	2026-05-29 21:47:35.201	2026-06-02 11:51:11.877
cmprgoi2q0013jv04ctsjzszd	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d3a88f9e/1780091733578-img-20260528-wa0069.jpg	vehicles/tmp-d3a88f9e/1780091733578-img-20260528-wa0069.jpg	image	\N	\N	17	f	2026-05-29 21:56:12.291	2026-09-23 11:57:07.236
cmprgoi5d0015jv04nllqw7at	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ce96ec64/1780091734298-img-20260528-wa0070.jpg	vehicles/tmp-ce96ec64/1780091734298-img-20260528-wa0070.jpg	image	\N	\N	18	f	2026-05-29 21:56:12.386	2026-09-23 11:57:07.331
cmprgofn10005jv047gtigg8s	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-558a8286/1780091719086-img-20260528-wa0052.jpg	vehicles/tmp-558a8286/1780091719086-img-20260528-wa0052.jpg	image	\N	\N	0	t	2026-05-29 21:56:09.133	2026-09-23 11:54:58.388
cmprgofya0007jv04egn3kshy	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4912211a/1780091719961-img-20260528-wa0053.jpg	vehicles/tmp-4912211a/1780091719961-img-20260528-wa0053.jpg	image	\N	\N	1	f	2026-05-29 21:56:09.539	2026-09-23 11:55:03.697
cmprgog580009jv04b1pus1cz	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c002ea37/1780091720661-img-20260528-wa0054.jpg	vehicles/tmp-c002ea37/1780091720661-img-20260528-wa0054.jpg	image	\N	\N	2	f	2026-05-29 21:56:09.789	2026-09-23 11:55:03.793
cmprgogqt000djv04cuv0alxj	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d002e965/1780091722587-img-20260528-wa0056.jpg	vehicles/tmp-d002e965/1780091722587-img-20260528-wa0056.jpg	image	\N	\N	4	f	2026-05-29 21:56:10.565	2026-09-23 11:55:03.986
cmprgdevc002llc048au8e1k5	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3183befc/1780091147225-img-20260528-wa0168.jpg	vehicles/tmp-3183befc/1780091147225-img-20260528-wa0168.jpg	image	\N	\N	18	f	2026-05-29 21:47:34.921	2026-06-02 11:51:11.499
cmprgdenk002flc0449bt8bb6	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-084e3fd2/1780091145108-img-20260528-wa0165.jpg	vehicles/tmp-084e3fd2/1780091145108-img-20260528-wa0165.jpg	image	\N	\N	15	f	2026-05-29 21:47:34.641	2026-06-02 11:51:04.97
cmprgqgyp001fjv04g6dkcr6k	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2f6f5114/1780091737725-img-20260528-wa0075.jpg	vehicles/tmp-2f6f5114/1780091737725-img-20260528-wa0075.jpg	image	\N	\N	23	f	2026-05-29 21:57:44.161	2026-09-23 11:57:32.254
cmprgqh3c001hjv04m2illh7g	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ca69c8cf/1780091738736-img-20260528-wa0076.jpg	vehicles/tmp-ca69c8cf/1780091738736-img-20260528-wa0076.jpg	image	\N	\N	24	f	2026-05-29 21:57:44.329	2026-09-23 11:57:32.35
cmwj7yqcd0003k308bdxm3l7u	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3dbf4856/1794830644146-whatsapp-image-2026-11-15-at-10.50.09.jpeg	vehicles/tmp-3dbf4856/1794830644146-whatsapp-image-2026-11-15-at-10.50.09.jpeg	image	\N	\N	0	t	2026-11-16 12:07:59.965	2026-11-16 12:07:59.965
cmwj8295b0005k308eumpzoml	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d851d97b/1794830640597-whatsapp-image-2026-11-15-at-10.50.08.jpeg	vehicles/tmp-d851d97b/1794830640597-whatsapp-image-2026-11-15-at-10.50.08.jpeg	image	\N	\N	1	f	2026-11-16 12:10:44.211	2026-11-16 12:10:44.211
cmwj8297y0007k308i2lbmzss	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-07d7cc85/1794830641829-whatsapp-image-2026-11-15-at-10.50.09-1-.jpeg	vehicles/tmp-07d7cc85/1794830641829-whatsapp-image-2026-11-15-at-10.50.09-1-.jpeg	image	\N	\N	2	f	2026-11-16 12:10:44.399	2026-11-16 12:10:44.399
cmwj829al0009k3087f8mibm3	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e4989b6c/1794830642569-whatsapp-image-2026-11-15-at-10.50.09-2-.jpeg	vehicles/tmp-e4989b6c/1794830642569-whatsapp-image-2026-11-15-at-10.50.09-2-.jpeg	image	\N	\N	3	f	2026-11-16 12:10:44.493	2026-11-16 12:10:44.493
cmwj829db000bk308a1cplvkz	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9bda010b/1794830643312-whatsapp-image-2026-11-15-at-10.50.09-3-.jpeg	vehicles/tmp-9bda010b/1794830643312-whatsapp-image-2026-11-15-at-10.50.09-3-.jpeg	image	\N	\N	4	f	2026-11-16 12:10:44.591	2026-11-16 12:10:44.591
cmwj829fy000dk308zqpzus1x	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d0a65b5e/1794830644812-whatsapp-image-2026-11-15-at-10.50.10-1-.jpeg	vehicles/tmp-d0a65b5e/1794830644812-whatsapp-image-2026-11-15-at-10.50.10-1-.jpeg	image	\N	\N	5	f	2026-11-16 12:10:44.687	2026-11-16 12:10:44.687
cmwj829il000fk308p9acaekh	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fddf2592/1794830645446-whatsapp-image-2026-11-15-at-10.50.10-2-.jpeg	vehicles/tmp-fddf2592/1794830645446-whatsapp-image-2026-11-15-at-10.50.10-2-.jpeg	image	\N	\N	6	f	2026-11-16 12:10:44.781	2026-11-16 12:10:44.781
cmwj829l9000hk308qr4d9ofg	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-762a4b2e/1794830646395-whatsapp-image-2026-11-15-at-10.50.10-3-.jpeg	vehicles/tmp-762a4b2e/1794830646395-whatsapp-image-2026-11-15-at-10.50.10-3-.jpeg	image	\N	\N	7	f	2026-11-16 12:10:44.877	2026-11-16 12:10:44.877
cmwj83en1000jk308fmqch5ac	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6c7bba75/1794830647075-whatsapp-image-2026-11-15-at-10.50.10.jpeg	vehicles/tmp-6c7bba75/1794830647075-whatsapp-image-2026-11-15-at-10.50.10.jpeg	image	\N	\N	8	f	2026-11-16 12:11:37.984	2026-11-16 12:11:37.984
cmprgoi810017jv049waa1x9t	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c3e19d13/1780091735016-img-20260528-wa0071.jpg	vehicles/tmp-c3e19d13/1780091735016-img-20260528-wa0071.jpg	image	\N	\N	19	f	2026-05-29 21:56:12.482	2026-09-23 11:57:07.426
cmprgoif20019jv04bwe848sr	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3ed5923e/1780091735730-img-20260528-wa0072.jpg	vehicles/tmp-3ed5923e/1780091735730-img-20260528-wa0072.jpg	image	\N	\N	20	f	2026-05-29 21:56:12.734	2026-09-23 11:57:31.775
cmprgqedx001bjv04kk0iczbi	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9280ef94/1780091736298-img-20260528-wa0073.jpg	vehicles/tmp-9280ef94/1780091736298-img-20260528-wa0073.jpg	image	\N	\N	21	f	2026-05-29 21:57:40.195	2026-09-23 11:57:32.063
cmprgqek7001djv04eswchrtr	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-99e7d634/1780091737006-img-20260528-wa0074.jpg	vehicles/tmp-99e7d634/1780091737006-img-20260528-wa0074.jpg	image	\N	\N	22	f	2026-05-29 21:57:41.047	2026-09-23 11:57:32.159
cmpwkrfdv000zkz04aasnzrp4	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089096292-img-20260528-wa0031.jpg	\N	image	\N	\N	17	f	2026-06-02 11:49:18.115	2026-06-02 11:54:23.234
cmprgu8qv001zjv04a3hhmx80	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b7b805bd/1780091745625-img-20260528-wa0085.jpg	vehicles/tmp-b7b805bd/1780091745625-img-20260528-wa0085.jpg	image	\N	\N	33	f	2026-05-29 22:00:40.136	2026-09-23 11:57:47.813
cmprj0uos0006la042282cien	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a3bdd5ad/1780095666628-img-20260530-wa0002.jpg	vehicles/tmp-a3bdd5ad/1780095666628-img-20260530-wa0002.jpg	image	\N	\N	2	f	2026-05-29 23:01:47.74	2026-06-02 11:50:35.115
cmprgu8ti0021jv04kx1gagf0	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3f6b0ce4/1780091746482-img-20260528-wa0086.jpg	vehicles/tmp-3f6b0ce4/1780091746482-img-20260528-wa0086.jpg	image	\N	\N	34	f	2026-05-29 22:00:40.23	2026-09-23 11:57:47.908
cmprgu8w60023jv04wr5jprqp	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4eb2df67/1780091747271-img-20260528-wa0087.jpg	vehicles/tmp-4eb2df67/1780091747271-img-20260528-wa0087.jpg	image	\N	\N	35	f	2026-05-29 22:00:40.326	2026-09-23 11:57:48.004
cmprgu8yt0025jv047hnuzwvt	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-51f59d03/1780091748020-img-20260528-wa0088.jpg	vehicles/tmp-51f59d03/1780091748020-img-20260528-wa0088.jpg	image	\N	\N	36	f	2026-05-29 22:00:40.421	2026-09-23 11:57:48.099
cmprgdekz002dlc04t06g8ow6	cmprgc2la001ilc044l6mjjaq	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-80ea445c/1780091144478-img-20260528-wa0164.jpg	vehicles/tmp-80ea445c/1780091144478-img-20260528-wa0164.jpg	image	\N	\N	14	f	2026-05-29 21:47:34.547	2026-06-02 11:51:04.876
cmpwkrfgs0011kz04w1hjsr8y	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089097038-img-20260528-wa0032.jpg	\N	image	\N	\N	18	f	2026-06-02 11:49:18.221	2026-06-02 11:54:23.342
cmpwkrvxo001xkz04p87bzb6k	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089105357-img-20260528-wa0044.jpg	\N	image	\N	\N	30	f	2026-06-02 11:49:39.234	2026-06-02 11:54:24.495
cmpwkrw8z0021kz042kw2knh6	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089106085-img-20260528-wa0045.jpg	\N	image	\N	\N	31	f	2026-06-02 11:49:39.971	2026-06-02 11:54:24.59
cmprgu8iv001tjv0458kjrlma	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e1948a05/1780091743547-img-20260528-wa0082.jpg	vehicles/tmp-e1948a05/1780091743547-img-20260528-wa0082.jpg	image	\N	\N	30	f	2026-05-29 22:00:39.848	2026-09-23 11:57:47.526
cmprgu8ll001vjv040bhf6mj4	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2de96d15/1780091744284-img-20260528-wa0083.jpg	vehicles/tmp-2de96d15/1780091744284-img-20260528-wa0083.jpg	image	\N	\N	31	f	2026-05-29 22:00:39.945	2026-09-23 11:57:47.622
cmprgu8o8001xjv04fwd7881u	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-dddfd78c/1780091744895-img-20260528-wa0084.jpg	vehicles/tmp-dddfd78c/1780091744895-img-20260528-wa0084.jpg	image	\N	\N	32	f	2026-05-29 22:00:40.041	2026-09-23 11:57:47.718
cmprgu91s0027jv04d4b99fs3	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cf08d799/1780091748776-img-20260528-wa0089.jpg	vehicles/tmp-cf08d799/1780091748776-img-20260528-wa0089.jpg	image	\N	\N	37	f	2026-05-29 22:00:40.528	2026-09-23 11:57:48.195
cmwj83epo000lk308krmvdi0f	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-db5f4405/1794830647866-whatsapp-image-2026-11-15-at-10.50.11-1-.jpeg	vehicles/tmp-db5f4405/1794830647866-whatsapp-image-2026-11-15-at-10.50.11-1-.jpeg	image	\N	\N	9	f	2026-11-16 12:11:38.172	2026-11-16 12:11:38.172
cmprgu85m001jjv04vu79434a	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-86d76de1/1780091739509-img-20260528-wa0077.jpg	vehicles/tmp-86d76de1/1780091739509-img-20260528-wa0077.jpg	image	\N	\N	25	f	2026-05-29 22:00:39.276	2026-09-23 11:57:32.445
cmprgu889001ljv047ditm48p	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4844743c/1780091740350-img-20260528-wa0078.jpg	vehicles/tmp-4844743c/1780091740350-img-20260528-wa0078.jpg	image	\N	\N	26	f	2026-05-29 22:00:39.465	2026-09-23 11:57:32.54
cmpwkrfjf0013kz04wipu4fay	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089097656-img-20260528-wa0033.jpg	\N	image	\N	\N	19	f	2026-06-02 11:49:18.316	2026-06-02 11:54:23.441
cmpwkrfm30015kz04uajlwg0x	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089098311-img-20260528-wa0034.jpg	\N	image	\N	\N	20	f	2026-06-02 11:49:18.411	2026-06-02 11:54:23.536
cmpwkrfop0017kz04gqyilm49	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089098998-img-20260528-wa0035.jpg	\N	image	\N	\N	21	f	2026-06-02 11:49:18.506	2026-06-02 11:54:23.63
cmpwkrfrc0019kz048877pu1a	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089099670-img-20260528-wa0036.jpg	\N	image	\N	\N	22	f	2026-06-02 11:49:18.601	2026-06-02 11:54:23.725
cmpwkrftz001bkz04s0jc5z7x	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089100295-img-20260528-wa0037.jpg	\N	image	\N	\N	23	f	2026-06-02 11:49:18.695	2026-06-02 11:54:23.819
cmpwkrfwm001dkz04xdawhl46	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089100888-img-20260528-wa0038.jpg	\N	image	\N	\N	24	f	2026-06-02 11:49:18.79	2026-06-02 11:54:23.914
cmpwkrfz9001fkz04b0apw3x8	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089101516-img-20260528-wa0039.jpg	\N	image	\N	\N	25	f	2026-06-02 11:49:18.886	2026-06-02 11:54:24.009
cmpwkrgwl001jkz048p2uz045	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089102091-img-20260528-wa0040.jpg	\N	image	\N	\N	26	f	2026-06-02 11:49:20.085	2026-06-02 11:54:24.104
cmpwkrh1r001nkz04kxp3v2q8	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089103029-img-20260528-wa0041.jpg	\N	image	\N	\N	27	f	2026-06-02 11:49:20.27	2026-06-02 11:54:24.198
cmpwkrmu8001pkz04jz1828ex	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089103808-img-20260528-wa0042.jpg	\N	image	\N	\N	28	f	2026-06-02 11:49:27.776	2026-06-02 11:54:24.297
cmpwkrn59001tkz04xvs7nxc1	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089104572-img-20260528-wa0043.jpg	\N	image	\N	\N	29	f	2026-06-02 11:49:28.174	2026-06-02 11:54:24.4
cmprgu8aw001njv04mxze7vpe	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3997a025/1780091741121-img-20260528-wa0079.jpg	vehicles/tmp-3997a025/1780091741121-img-20260528-wa0079.jpg	image	\N	\N	27	f	2026-05-29 22:00:39.56	2026-09-23 11:57:32.635
cmprgu8dk001pjv0422y01c3m	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-78e104c9/1780091741897-img-20260528-wa0080.jpg	vehicles/tmp-78e104c9/1780091741897-img-20260528-wa0080.jpg	image	\N	\N	28	f	2026-05-29 22:00:39.656	2026-09-23 11:57:47.242
cmpwkrwdj0025kz04ltnr6qip	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089106935-img-20260528-wa0046.jpg	\N	image	\N	\N	32	f	2026-06-02 11:49:40.136	2026-06-02 11:54:24.684
cmprgu8g6001rjv04evmllbzm	cmprgofg20003jv04y0dimwul	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0aa6200a/1780091742711-img-20260528-wa0081.jpg	vehicles/tmp-0aa6200a/1780091742711-img-20260528-wa0081.jpg	image	\N	\N	29	f	2026-05-29 22:00:39.75	2026-09-23 11:57:47.43
cmprj0v1w000gla04gduzkjut	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6ef749b1/1780095670215-img-20260530-wa0007.jpg	vehicles/tmp-6ef749b1/1780095670215-img-20260530-wa0007.jpg	image	\N	\N	7	f	2026-05-29 23:01:48.212	2026-06-02 11:50:38.361
cmprj0v4i000ila049vfzw69w	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bda628fe/1780095670844-img-20260530-wa0008.jpg	vehicles/tmp-bda628fe/1780095670844-img-20260530-wa0008.jpg	image	\N	\N	8	f	2026-05-29 23:01:48.306	2026-06-02 11:50:38.455
cmprj0v77000kla042zfk6rgs	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a8328fe6/1780095671517-img-20260530-wa0009.jpg	vehicles/tmp-a8328fe6/1780095671517-img-20260530-wa0009.jpg	image	\N	\N	9	f	2026-05-29 23:01:48.403	2026-06-02 11:50:38.55
cmprj0v9u000mla04p5z57jv0	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4864a76f/1780095672082-img-20260530-wa0010.jpg	vehicles/tmp-4864a76f/1780095672082-img-20260530-wa0010.jpg	image	\N	\N	10	f	2026-05-29 23:01:48.498	2026-06-02 11:50:38.644
cmprj103n000yla04t4e3read	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b42f9a54/1780095675240-img-20260530-wa0016.jpg	vehicles/tmp-b42f9a54/1780095675240-img-20260530-wa0016.jpg	image	\N	\N	16	f	2026-05-29 23:01:54.756	2026-06-02 11:50:43.988
cmprj108u0010la045ft6ch8b	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f9e89753/1780095675756-img-20260530-wa0017.jpg	vehicles/tmp-f9e89753/1780095675756-img-20260530-wa0017.jpg	image	\N	\N	17	f	2026-05-29 23:01:54.942	2026-06-02 11:50:44.082
cmprj10bh0012la04irjisfs2	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-820b5507/1780095676333-img-20260530-wa0018.jpg	vehicles/tmp-820b5507/1780095676333-img-20260530-wa0018.jpg	image	\N	\N	18	f	2026-05-29 23:01:55.038	2026-06-02 11:50:44.177
cmwj83fhn000nk308xxa2g92u	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-791d8bdc/1794830648724-whatsapp-image-2026-11-15-at-10.50.11-2-.jpeg	vehicles/tmp-791d8bdc/1794830648724-whatsapp-image-2026-11-15-at-10.50.11-2-.jpeg	image	\N	\N	10	f	2026-11-16 12:11:39.179	2026-11-16 12:11:39.179
cmwj83fka000pk308t0hjwtqj	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-23455580/1794830649385-whatsapp-image-2026-11-15-at-10.50.11.jpeg	vehicles/tmp-23455580/1794830649385-whatsapp-image-2026-11-15-at-10.50.11.jpeg	image	\N	\N	11	f	2026-11-16 12:11:39.274	2026-11-16 12:11:39.274
cmwj84gg8000rk30801nnmqvq	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d4574009/1794830650029-whatsapp-image-2026-11-15-at-10.50.12-1-.jpeg	vehicles/tmp-d4574009/1794830650029-whatsapp-image-2026-11-15-at-10.50.12-1-.jpeg	image	\N	\N	12	f	2026-11-16 12:12:26.987	2026-11-16 12:12:26.987
cmwj84giv000tk308fepfz61a	cmwj7ypu50001k308a63acgqk	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c900c06/1794830650725-whatsapp-image-2026-11-15-at-10.50.12-2-.jpeg	vehicles/tmp-7c900c06/1794830650725-whatsapp-image-2026-11-15-at-10.50.12-2-.jpeg	image	\N	\N	13	f	2026-11-16 12:12:27.175	2026-11-16 12:12:27.175
cmprj0urf0008la04hrjg012i	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cf0c4a89/1780095667347-img-20260530-wa0003.jpg	vehicles/tmp-cf0c4a89/1780095667347-img-20260530-wa0003.jpg	image	\N	\N	3	f	2026-05-29 23:01:47.835	2026-06-02 11:50:35.209
cmprj0uu2000ala04rdalkv1p	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3ca30f35/1780095668053-img-20260530-wa0004.jpg	vehicles/tmp-3ca30f35/1780095668053-img-20260530-wa0004.jpg	image	\N	\N	4	f	2026-05-29 23:01:47.93	2026-06-02 11:50:35.304
cmprj0uwo000cla04cs5lulq5	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b6789385/1780095668957-img-20260530-wa0005.jpg	vehicles/tmp-b6789385/1780095668957-img-20260530-wa0005.jpg	image	\N	\N	5	f	2026-05-29 23:01:48.024	2026-06-02 11:50:35.399
cmprj0uza000ela04cz1jp48p	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f9833ed7/1780095669618-img-20260530-wa0006.jpg	vehicles/tmp-f9833ed7/1780095669618-img-20260530-wa0006.jpg	image	\N	\N	6	f	2026-05-29 23:01:48.118	2026-06-02 11:50:35.493
cmprj0vci000ola04ukv6cpuz	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-794ea705/1780095672657-img-20260530-wa0011.jpg	vehicles/tmp-794ea705/1780095672657-img-20260530-wa0011.jpg	image	\N	\N	11	f	2026-05-29 23:01:48.595	2026-06-02 11:50:38.738
cmprj0wy2000qla045p7g5x45	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0fe7eea1/1780095673199-img-20260530-wa0012.jpg	vehicles/tmp-0fe7eea1/1780095673199-img-20260530-wa0012.jpg	image	\N	\N	12	f	2026-05-29 23:01:48.69	2026-06-02 11:50:43.609
cmprj0x6m000sla04ggxauony	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-35f5ceb3/1780095673763-img-20260530-wa0013.jpg	vehicles/tmp-35f5ceb3/1780095673763-img-20260530-wa0013.jpg	image	\N	\N	13	f	2026-05-29 23:01:50.975	2026-06-02 11:50:43.704
cmprj0x9a000ula04o7un3wai	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ca6c83f5/1780095674258-img-20260530-wa0014.jpg	vehicles/tmp-ca6c83f5/1780095674258-img-20260530-wa0014.jpg	image	\N	\N	14	f	2026-05-29 23:01:51.07	2026-06-02 11:50:43.799
cmprj0xby000wla04gguc09ri	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3a737991/1780095674801-img-20260530-wa0015.jpg	vehicles/tmp-3a737991/1780095674801-img-20260530-wa0015.jpg	image	\N	\N	15	f	2026-05-29 23:01:51.166	2026-06-02 11:50:43.893
cmpsu11900009u37wmyjlpcxn	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174654927-img-20260530-wa0023.jpg	vehicles/3/1780174654927-img-20260530-wa0023.jpg	image	\N	\N	4	f	2026-05-30 20:57:38.196	2026-11-13 10:52:53.447
cmpsu1die0015u37wbgrs1ha9	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174661749-img-20260530-wa0033.jpg	vehicles/3/1780174661749-img-20260530-wa0033.jpg	image	\N	\N	14	f	2026-05-30 20:57:54.086	2026-11-13 10:52:53.759
cmpsu1djg0017u37wnbagyy0j	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174662185-img-20260530-wa0034.jpg	vehicles/3/1780174662185-img-20260530-wa0034.jpg	image	\N	\N	15	f	2026-05-30 20:57:54.125	2026-11-13 10:52:53.788
cmpsu11a6000bu37wwlwloyc5	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174655361-img-20260530-wa0024.jpg	vehicles/3/1780174655361-img-20260530-wa0024.jpg	image	\N	\N	5	f	2026-05-30 20:57:38.238	2026-11-13 10:52:53.476
cmpsu1d9y000pu37wu6hphj80	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174655874-img-20260530-wa0025.jpg	vehicles/3/1780174655874-img-20260530-wa0025.jpg	image	\N	\N	6	f	2026-05-30 20:57:53.782	2026-11-13 10:52:53.505
cmpsu1db0000ru37w4emum8oc	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174656320-img-20260530-wa0026.jpg	vehicles/3/1780174656320-img-20260530-wa0026.jpg	image	\N	\N	7	f	2026-05-30 20:57:53.82	2026-11-13 10:52:53.534
cmpsu1dki0019u37ws0rryku3	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174662578-img-20260530-wa0035.jpg	vehicles/3/1780174662578-img-20260530-wa0035.jpg	image	\N	\N	16	f	2026-05-30 20:57:54.163	2026-11-13 10:52:53.818
cmwj8npjr0004la08nbk4j4aq	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ae948791/1794831857224-whatsapp-image-2026-11-15-at-11.00.28.jpeg	vehicles/tmp-ae948791/1794831857224-whatsapp-image-2026-11-15-at-11.00.28.jpeg	image	\N	\N	1	f	2026-11-16 12:27:25.243	2026-11-16 12:27:25.243
cmwj8npme0006la0867nxfjkw	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e6b0f3a2/1794831858206-whatsapp-image-2026-11-15-at-11.00.29.jpeg	vehicles/tmp-e6b0f3a2/1794831858206-whatsapp-image-2026-11-15-at-11.00.29.jpeg	image	\N	\N	2	f	2026-11-16 12:27:25.43	2026-11-16 12:27:25.43
cmpsu1dc2000tu37w4m9rx90d	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174656764-img-20260530-wa0027.jpg	vehicles/3/1780174656764-img-20260530-wa0027.jpg	image	\N	\N	8	f	2026-05-30 20:57:53.859	2026-11-13 10:52:53.563
cmwj8npp00008la08aoaqeviy	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7050a6a6/1794831858904-whatsapp-image-2026-11-15-at-11.00.30-1-.jpeg	vehicles/tmp-7050a6a6/1794831858904-whatsapp-image-2026-11-15-at-11.00.30-1-.jpeg	image	\N	\N	3	f	2026-11-16 12:27:25.524	2026-11-16 12:27:25.524
cmwj8nprq000ala08s00fw792	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4f232da7/1794831859707-whatsapp-image-2026-11-15-at-11.00.30.jpeg	vehicles/tmp-4f232da7/1794831859707-whatsapp-image-2026-11-15-at-11.00.30.jpeg	image	\N	\N	4	f	2026-11-16 12:27:25.623	2026-11-16 12:27:25.623
cmwj8npue000cla08w8xt9w21	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-62511a05/1794831860373-whatsapp-image-2026-11-15-at-11.00.31-1-.jpeg	vehicles/tmp-62511a05/1794831860373-whatsapp-image-2026-11-15-at-11.00.31-1-.jpeg	image	\N	\N	5	f	2026-11-16 12:27:25.718	2026-11-16 12:27:25.718
cmpsu1dd4000vu37wc7bpdq8m	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174657243-img-20260530-wa0028.jpg	vehicles/3/1780174657243-img-20260530-wa0028.jpg	image	\N	\N	9	f	2026-05-30 20:57:53.896	2026-11-13 10:52:53.592
cmpsu1de6000xu37w1ae6gn5c	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174657707-img-20260530-wa0029.jpg	vehicles/3/1780174657707-img-20260530-wa0029.jpg	image	\N	\N	10	f	2026-05-30 20:57:53.934	2026-11-13 10:52:53.621
cmpsu1df8000zu37wznpbxuij	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174658142-img-20260530-wa0030.jpg	vehicles/3/1780174658142-img-20260530-wa0030.jpg	image	\N	\N	11	f	2026-05-30 20:57:53.972	2026-11-13 10:52:53.672
cmpsu1dga0011u37w1txweirf	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174660904-img-20260530-wa0031.jpg	vehicles/3/1780174660904-img-20260530-wa0031.jpg	image	\N	\N	12	f	2026-05-30 20:57:54.01	2026-11-13 10:52:53.7
cmpsu1dhc0013u37wf11d1y0z	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174661344-img-20260530-wa0032.jpg	vehicles/3/1780174661344-img-20260530-wa0032.jpg	image	\N	\N	13	f	2026-05-30 20:57:54.049	2026-11-13 10:52:53.729
cmwj8nq7l000nla08q8og9kni	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-329f52cc/1794831863890-whatsapp-image-2026-11-15-at-11.00.33.jpeg	vehicles/tmp-329f52cc/1794831863890-whatsapp-image-2026-11-15-at-11.00.33.jpeg	image	\N	\N	10	f	2026-11-16 12:27:26.193	2026-11-16 12:27:26.193
cmwj8nqa7000pla08yue319hu	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a0114417/1794831864544-whatsapp-image-2026-11-15-at-11.00.34-1-.jpeg	vehicles/tmp-a0114417/1794831864544-whatsapp-image-2026-11-15-at-11.00.34-1-.jpeg	image	\N	\N	11	f	2026-11-16 12:27:26.287	2026-11-16 12:27:26.287
cmwj8opuv0013la08etqlsiwf	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-50154ce9/1794831869480-whatsapp-image-2026-11-15-at-11.00.39-1-.jpeg	vehicles/tmp-50154ce9/1794831869480-whatsapp-image-2026-11-15-at-11.00.39-1-.jpeg	image	\N	\N	18	f	2026-11-16 12:28:12.392	2026-11-16 12:28:12.392
cmpsu1dlr001bu37wz1ucq3u3	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174663312-img-20260530-wa0036.jpg	vehicles/3/1780174663312-img-20260530-wa0036.jpg	image	\N	\N	17	f	2026-05-30 20:57:54.208	2026-11-13 10:52:53.847
cmpsu1dn1001du37ws7acjnd1	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174663771-img-20260530-wa0037.jpg	vehicles/3/1780174663771-img-20260530-wa0037.jpg	image	\N	\N	18	f	2026-05-30 20:57:54.254	2026-11-13 10:52:53.879
cmpsu1dol001fu37w1mqgrbeh	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174664191-img-20260530-wa0038.jpg	vehicles/3/1780174664191-img-20260530-wa0038.jpg	image	\N	\N	19	f	2026-05-30 20:57:54.309	2026-11-13 10:52:53.909
cmpsu1dpp001hu37wvorzye10	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174664781-img-20260530-wa0039.jpg	vehicles/3/1780174664781-img-20260530-wa0039.jpg	image	\N	\N	20	f	2026-05-30 20:57:54.349	2026-11-13 10:52:53.939
cmpsu1dqr001ju37wp521vbv9	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174665387-img-20260530-wa0040.jpg	vehicles/3/1780174665387-img-20260530-wa0040.jpg	image	\N	\N	21	f	2026-05-30 20:57:54.387	2026-11-13 10:52:53.968
cmpsu1drs001lu37w2eyqy0nv	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174665761-img-20260530-wa0041.jpg	vehicles/3/1780174665761-img-20260530-wa0041.jpg	image	\N	\N	22	f	2026-05-30 20:57:54.424	2026-11-13 10:52:54.001
cmpsu1dsy001nu37w3avcc8fn	3	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/3/1780174666164-img-20260530-wa0042.jpg	vehicles/3/1780174666164-img-20260530-wa0042.jpg	image	\N	\N	23	f	2026-05-30 20:57:54.467	2026-11-13 10:52:54.03
cmpwkrwi40029kz04ck021bjz	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089107652-img-20260528-wa0047.jpg	\N	image	\N	\N	33	f	2026-06-02 11:49:40.3	2026-06-02 11:54:24.781
cmpwkrxef002fkz04lk13bi8b	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089108394-img-20260528-wa0048.jpg	\N	image	\N	\N	34	f	2026-06-02 11:49:41.464	2026-06-02 11:54:24.875
cmpwkrxjn002hkz04y5zvnj4g	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089109153-img-20260528-wa0049.jpg	\N	image	\N	\N	35	f	2026-06-02 11:49:41.651	2026-06-02 11:54:24.97
cmpwkrytk002lkz049p4hwjdd	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089109879-img-20260528-wa0050.jpg	\N	image	\N	\N	36	f	2026-06-02 11:49:43.305	2026-06-02 11:54:25.067
cmwj8npx1000fla08qsyhjbvv	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0737a983/1794831861049-whatsapp-image-2026-11-15-at-11.00.31.jpeg	vehicles/tmp-0737a983/1794831861049-whatsapp-image-2026-11-15-at-11.00.31.jpeg	image	\N	\N	6	f	2026-11-16 12:27:25.813	2026-11-16 12:27:25.813
cmwj8npzp000hla08tomgci3r	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-70fca5ac/1794831861806-whatsapp-image-2026-11-15-at-11.00.32-1-.jpeg	vehicles/tmp-70fca5ac/1794831861806-whatsapp-image-2026-11-15-at-11.00.32-1-.jpeg	image	\N	\N	7	f	2026-11-16 12:27:25.909	2026-11-16 12:27:25.909
cmwj8nq2b000jla08ny2vn6fr	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-66465fc5/1794831862587-whatsapp-image-2026-11-15-at-11.00.32.jpeg	vehicles/tmp-66465fc5/1794831862587-whatsapp-image-2026-11-15-at-11.00.32.jpeg	image	\N	\N	8	f	2026-11-16 12:27:26.004	2026-11-16 12:27:26.004
cmwj8nq4y000lla08dvuxkocw	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-024ceecf/1794831863223-whatsapp-image-2026-11-15-at-11.00.33-1-.jpeg	vehicles/tmp-024ceecf/1794831863223-whatsapp-image-2026-11-15-at-11.00.33-1-.jpeg	image	\N	\N	9	f	2026-11-16 12:27:26.098	2026-11-16 12:27:26.098
cmwj8opf3000rla08gvbkcbqk	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4deaf19a/1794831865214-whatsapp-image-2026-11-15-at-11.00.34.jpeg	vehicles/tmp-4deaf19a/1794831865214-whatsapp-image-2026-11-15-at-11.00.34.jpeg	image	\N	\N	12	f	2026-11-16 12:28:11.731	2026-11-16 12:28:11.731
cmwj8ophq000tla08732kbzim	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6979cd1c/1794831865960-whatsapp-image-2026-11-15-at-11.00.35-1-.jpeg	vehicles/tmp-6979cd1c/1794831865960-whatsapp-image-2026-11-15-at-11.00.35-1-.jpeg	image	\N	\N	13	f	2026-11-16 12:28:11.919	2026-11-16 12:28:11.919
cmwj8opkd000vla087yc5vtou	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-aa75bf2c/1794831866606-whatsapp-image-2026-11-15-at-11.00.35.jpeg	vehicles/tmp-aa75bf2c/1794831866606-whatsapp-image-2026-11-15-at-11.00.35.jpeg	image	\N	\N	14	f	2026-11-16 12:28:12.014	2026-11-16 12:28:12.014
cmwj8opn0000xla082d0hhaut	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-453be871/1794831867345-whatsapp-image-2026-11-15-at-11.00.36.jpeg	vehicles/tmp-453be871/1794831867345-whatsapp-image-2026-11-15-at-11.00.36.jpeg	image	\N	\N	15	f	2026-11-16 12:28:12.108	2026-11-16 12:28:12.108
cmwj8oppn000zla08dmv07w2p	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f3a560b1/1794831868211-whatsapp-image-2026-11-15-at-11.00.37.jpeg	vehicles/tmp-f3a560b1/1794831868211-whatsapp-image-2026-11-15-at-11.00.37.jpeg	image	\N	\N	16	f	2026-11-16 12:28:12.203	2026-11-16 12:28:12.203
cmwj8ops90011la088eqpn80j	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fd82c102/1794831868856-whatsapp-image-2026-11-15-at-11.00.38.jpeg	vehicles/tmp-fd82c102/1794831868856-whatsapp-image-2026-11-15-at-11.00.38.jpeg	image	\N	\N	17	f	2026-11-16 12:28:12.297	2026-11-16 12:28:12.297
cmwj8m5x70002la08gj05st5n	cmwj8m5av0000la08x34r5ft1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5efbc3c9/1794831874552-whatsapp-image-2026-11-15-at-11.01.20-2-.jpeg	vehicles/tmp-5efbc3c9/1794831874552-whatsapp-image-2026-11-15-at-11.01.20-2-.jpeg	image	\N	\N	0	t	2026-11-16 12:26:13.243	2026-11-16 12:28:12.427
cmprj0lco0002la0454nz9ry0	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7727eeda/1780095665137-img-20260530-wa0000.jpg	vehicles/tmp-7727eeda/1780095665137-img-20260530-wa0000.jpg	image	\N	\N	0	t	2026-05-29 23:01:35.64	2026-06-02 11:50:34.007
cmprj0um40004la04pbqe6teh	cmprj0krp0000la04rgoffe30	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-aaa038de/1780095666044-img-20260530-wa0001.jpg	vehicles/tmp-aaa038de/1780095666044-img-20260530-wa0001.jpg	image	\N	\N	1	f	2026-05-29 23:01:47.645	2026-06-02 11:50:35.021
cmprf5dt50015le043toycnwm	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089178122-img-20260528-wa0187.jpg	\N	image	\N	\N	15	f	2026-05-29 21:13:20.681	2026-06-02 11:52:00.161
cmpwkvkeh004tjj04ijxf9b6z	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089185790-img-20260528-wa0198.jpg	\N	image	\N	\N	27	f	2026-06-02 11:52:31.241	2026-06-02 11:52:31.241
cmpwkvkx40055jj04xthl18r7	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089186458-img-20260528-wa0199.jpg	\N	image	\N	\N	28	f	2026-06-02 11:52:31.349	2026-06-02 11:52:31.349
cmpwkvlh20057jj04p61dc1bk	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089187175-img-20260528-wa0200.jpg	\N	image	\N	\N	29	f	2026-06-02 11:52:32.631	2026-06-02 11:52:32.631
cmpwkw6og0059jj04ggcuptl2	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089187934-img-20260528-wa0201.jpg	\N	image	\N	\N	30	f	2026-06-02 11:52:59.923	2026-06-02 11:52:59.923
cmpwkw6r2005bjj04isfbx3ce	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089188684-img-20260528-wa0202.jpg	\N	image	\N	\N	31	f	2026-06-02 11:53:00.207	2026-06-02 11:53:00.207
cmpwkw6tp005djj049gpqq98z	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089189445-img-20260528-wa0203.jpg	\N	image	\N	\N	32	f	2026-06-02 11:53:00.301	2026-06-02 11:53:00.301
cmpwkw6wc005fjj04h8jj8mpn	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089190235-img-20260528-wa0204.jpg	\N	image	\N	\N	33	f	2026-06-02 11:53:00.396	2026-06-02 11:53:00.396
cmpwkw6yy005hjj04okjc5x26	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089191003-img-20260528-wa0205.jpg	\N	image	\N	\N	34	f	2026-06-02 11:53:00.49	2026-06-02 11:53:00.49
cmpwkwm1b005jjj04ao4fvyzj	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089191711-img-20260528-wa0206.jpg	\N	image	\N	\N	35	f	2026-06-02 11:53:19.923	2026-06-02 11:53:19.923
cmpwkwm3y005ljj04xmm10vdk	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089192476-img-20260528-wa0207.jpg	\N	image	\N	\N	36	f	2026-06-02 11:53:20.11	2026-06-02 11:53:20.11
cmpwkwm6k005njj04g5f3fo5z	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089193294-img-20260528-wa0208.jpg	\N	image	\N	\N	37	f	2026-06-02 11:53:20.205	2026-06-02 11:53:20.205
cmpwkwm96005pjj046ct7v4vf	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089193955-img-20260528-wa0209.jpg	\N	image	\N	\N	38	f	2026-06-02 11:53:20.299	2026-06-02 11:53:20.299
cmpwkwmbt005rjj04mn1tkqeb	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089194735-img-20260528-wa0210.jpg	\N	image	\N	\N	39	f	2026-06-02 11:53:20.393	2026-06-02 11:53:20.393
cmpwkwmef005tjj047xwod4c7	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089195515-img-20260528-wa0211.jpg	\N	image	\N	\N	40	f	2026-06-02 11:53:20.487	2026-06-02 11:53:20.487
cmpwkwmi6005vjj04e3jn0p5i	2	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/2/1780089196337-img-20260528-wa0212.jpg	\N	image	\N	\N	41	f	2026-06-02 11:53:20.622	2026-06-02 11:53:20.622
cmpwkryy9002pkz04zkuboci7	1	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/1/1780089110606-img-20260528-wa0051.jpg	\N	image	\N	\N	37	f	2026-06-02 11:49:43.473	2026-06-02 11:54:25.162
cmqhv4m060006jn04qso7y00w	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2fa2a71d/1781687963467-img-5b2e9317d9d23313eca22dc86219d727-v.jpg	vehicles/tmp-2fa2a71d/1781687963467-img-5b2e9317d9d23313eca22dc86219d727-v.jpg	image	\N	\N	2	f	2026-06-17 09:22:39.078	2026-09-23 12:00:44.865
cmqhv4m2v0008jn04rwg8b3i2	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2d138025/1781687964208-img-6ef3dde97e0f6f55fafa9b5cbc3d82cb-v.jpg	vehicles/tmp-2d138025/1781687964208-img-6ef3dde97e0f6f55fafa9b5cbc3d82cb-v.jpg	image	\N	\N	3	f	2026-06-17 09:22:39.176	2026-09-23 12:00:44.96
cmqhv4nhd000ajn04y9dl99g6	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-801215a0/1781687964846-img-8efd4919624e00efafa9354d931d2c90-v.jpg	vehicles/tmp-801215a0/1781687964846-img-8efd4919624e00efafa9354d931d2c90-v.jpg	image	\N	\N	4	f	2026-06-17 09:22:40.994	2026-09-23 12:00:45.055
cmqhv4nny000cjn04z2l6qayr	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bd87ee72/1781687965397-img-35b80397e4f80eae27b82dfcea0e6f1d-v.jpg	vehicles/tmp-bd87ee72/1781687965397-img-35b80397e4f80eae27b82dfcea0e6f1d-v.jpg	image	\N	\N	5	f	2026-06-17 09:22:41.231	2026-09-23 12:00:45.15
cmqhv4oxa000ejn04o26l21o7	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-159fb4dc/1781687965998-img-42bb0852daed7a47252bc18033d1a189-v.jpg	vehicles/tmp-159fb4dc/1781687965998-img-42bb0852daed7a47252bc18033d1a189-v.jpg	image	\N	\N	6	f	2026-06-17 09:22:42.862	2026-09-23 12:00:45.245
cmqhv4p25000gjn04haaqro2e	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-07e0b1f2/1781687966541-img-50c011c4607aacf8c0ac54267faa2f4b-v.jpg	vehicles/tmp-07e0b1f2/1781687966541-img-50c011c4607aacf8c0ac54267faa2f4b-v.jpg	image	\N	\N	7	f	2026-06-17 09:22:43.037	2026-09-23 12:00:45.56
cmqhv4p7p000ijn04aqrg8u17	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-66a971e9/1781687967723-img-59e505a6a7b834b07136ccfc42c4117e-v.jpg	vehicles/tmp-66a971e9/1781687967723-img-59e505a6a7b834b07136ccfc42c4117e-v.jpg	image	\N	\N	8	f	2026-06-17 09:22:43.237	2026-09-23 12:00:46.359
cmqhv4pad000kjn04ktcppmv6	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-50a0574b/1781687968242-img-77c4f39f4d97da29099ac8e4abc0d61a-v.jpg	vehicles/tmp-50a0574b/1781687968242-img-77c4f39f4d97da29099ac8e4abc0d61a-v.jpg	image	\N	\N	9	f	2026-06-17 09:22:43.333	2026-09-23 12:00:46.537
cmqhv4pd1000mjn04iempkdo1	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-98458a1f/1781687968774-img-78fa1473fdd25e0cb0fb279aeb7accd3-v.jpg	vehicles/tmp-98458a1f/1781687968774-img-78fa1473fdd25e0cb0fb279aeb7accd3-v.jpg	image	\N	\N	10	f	2026-06-17 09:22:43.429	2026-09-23 12:00:54.346
cmqhv4pfo000ojn047r3skqfh	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6158e0d7/1781687969357-img-98edf7771d8c8c21e1d242da7a8131a0-v.jpg	vehicles/tmp-6158e0d7/1781687969357-img-98edf7771d8c8c21e1d242da7a8131a0-v.jpg	image	\N	\N	11	f	2026-06-17 09:22:43.525	2026-09-23 12:00:54.442
cmqkj4wkf000el704myy96fgd	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-360bcc64/1781849335700-8.jpeg	vehicles/tmp-360bcc64/1781849335700-8.jpeg	image	\N	\N	6	f	2026-06-19 06:10:15.903	2026-09-13 19:59:24.814
cmqhv4u2c000sjn048la3iz83	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0aa08777/1781687970519-img-799f23783a409fcd7b09d9a561b57f2e-v.jpg	vehicles/tmp-0aa08777/1781687970519-img-799f23783a409fcd7b09d9a561b57f2e-v.jpg	image	\N	\N	13	f	2026-06-17 09:22:49.524	2026-09-23 12:00:54.633
cmqhv4u50000ujn04yt2dffuz	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5e479526/1781687971255-img-864c790e68bb466126d24bc7f0a17286-v.jpg	vehicles/tmp-5e479526/1781687971255-img-864c790e68bb466126d24bc7f0a17286-v.jpg	image	\N	\N	14	f	2026-06-17 09:22:49.621	2026-09-23 12:00:54.73
cmqhv4u7o000wjn044i58v7st	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-788f8ea5/1781687958318-20260617-103044.jpg	vehicles/tmp-788f8ea5/1781687958318-20260617-103044.jpg	image	\N	\N	15	f	2026-06-17 09:22:49.716	2026-09-23 12:00:59.223
cmqhv4uap000yjn042ihixr4j	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-af52d373/1781687959668-20260617-103050.jpg	vehicles/tmp-af52d373/1781687959668-20260617-103050.jpg	image	\N	\N	16	f	2026-06-17 09:22:49.825	2026-09-23 12:00:59.318
cmqhv4ute0010jn04oqe4iizn	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f1c6abf8/1781687961024-20260617-103101.jpg	vehicles/tmp-f1c6abf8/1781687961024-20260617-103101.jpg	image	\N	\N	17	f	2026-06-17 09:22:50.498	2026-09-23 12:00:59.413
cmqhv4v220012jn04ooar2oug	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-988af696/1781687961911-20260617-103103.jpg	vehicles/tmp-988af696/1781687961911-20260617-103103.jpg	image	\N	\N	18	f	2026-06-17 09:22:50.81	2026-09-23 12:00:59.508
cmqhv4v7k0014jn0469j3mrn8	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-85d02ac6/1781687971782-img-5641fbb43c1bf331d94048da721559e4-v.jpg	vehicles/tmp-85d02ac6/1781687971782-img-5641fbb43c1bf331d94048da721559e4-v.jpg	image	\N	\N	19	f	2026-06-17 09:22:51.008	2026-09-23 12:00:59.606
cmqhv4vjs0016jn04gwvkqeqg	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e5aacddf/1781687972292-img-7140f8c1014f8ee3ee479bce4102f18a-v.jpg	vehicles/tmp-e5aacddf/1781687972292-img-7140f8c1014f8ee3ee479bce4102f18a-v.jpg	image	\N	\N	20	f	2026-06-17 09:22:51.355	2026-09-23 12:00:59.701
cmqhv4vmg0018jn04qi2253aj	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-51780524/1781687973002-img-7577aa6704a092ec0002de485a0f3b7a-v.jpg	vehicles/tmp-51780524/1781687973002-img-7577aa6704a092ec0002de485a0f3b7a-v.jpg	image	\N	\N	21	f	2026-06-17 09:22:51.544	2026-09-23 12:01:02.712
cmqhv4vp3001ajn04m6cx1nw0	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-48746be5/1781687973496-img-8790ad4b5bfdc14a128dff84fab7f1be-v.jpg	vehicles/tmp-48746be5/1781687973496-img-8790ad4b5bfdc14a128dff84fab7f1be-v.jpg	image	\N	\N	22	f	2026-06-17 09:22:51.64	2026-09-23 12:01:02.807
cmqhv4vrq001cjn04ea7bky2e	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-60821f3d/1781687974008-img-245322ccae0c058503813cd4d786cbd2-v.jpg	vehicles/tmp-60821f3d/1781687974008-img-245322ccae0c058503813cd4d786cbd2-v.jpg	image	\N	\N	23	f	2026-06-17 09:22:51.735	2026-09-23 12:01:02.902
cmqhv4vuf001ejn04mcfmwgx1	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-69aac79d/1781687974502-img-bf54aa4798bc9107d1098cf63f568039-v.jpg	vehicles/tmp-69aac79d/1781687974502-img-bf54aa4798bc9107d1098cf63f568039-v.jpg	image	\N	\N	24	f	2026-06-17 09:22:51.832	2026-09-23 12:01:02.996
cmqhv4xds001gjn048e4vrfai	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8c9327f5/1781687975067-img-bfcbfa86622c877a9b6a3d608ecbaa95-v.jpg	vehicles/tmp-8c9327f5/1781687975067-img-bfcbfa86622c877a9b6a3d608ecbaa95-v.jpg	image	\N	\N	25	f	2026-06-17 09:22:53.824	2026-09-23 12:01:03.09
cmqhv4xiq001ijn04sboabg9j	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-bd48f89f/1781687975749-img-ca6608accfd7ee85ba9a54a7b6885183-v.jpg	vehicles/tmp-bd48f89f/1781687975749-img-ca6608accfd7ee85ba9a54a7b6885183-v.jpg	image	\N	\N	26	f	2026-06-17 09:22:54.002	2026-09-23 12:01:03.197
cmqhv4xld001kjn04fao66fiz	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5d31cce8/1781687976301-img-d45ab77860a06f9ac6e8a5301bd4c754-v.jpg	vehicles/tmp-5d31cce8/1781687976301-img-d45ab77860a06f9ac6e8a5301bd4c754-v.jpg	image	\N	\N	27	f	2026-06-17 09:22:54.098	2026-09-23 12:01:03.729
cmqhv4xo1001mjn04oervc5j5	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e8306843/1781687976864-img-da9a69e930b46f3cd44ee5e233b3e216-v.jpg	vehicles/tmp-e8306843/1781687976864-img-da9a69e930b46f3cd44ee5e233b3e216-v.jpg	image	\N	\N	28	f	2026-06-17 09:22:54.193	2026-06-17 09:28:07.49
cmqhv4xqp001ojn04bazu8rkb	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d0d6a24a/1781687977461-img-dc86a9bffe3b6ac04124d4faed7bbd6f-v.jpg	vehicles/tmp-d0d6a24a/1781687977461-img-dc86a9bffe3b6ac04124d4faed7bbd6f-v.jpg	image	\N	\N	29	f	2026-06-17 09:22:54.289	2026-06-17 09:28:07.584
cmqhv4xtc001qjn04cchd35vx	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2269d42b/1781687978016-img-eb20a40e4bcc4742d33f880979d86f90-v.jpg	vehicles/tmp-2269d42b/1781687978016-img-eb20a40e4bcc4742d33f880979d86f90-v.jpg	image	\N	\N	30	f	2026-06-17 09:22:54.385	2026-06-17 09:28:07.678
cmqhv4xw0001sjn043axzt34y	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a7c8ad05/1781687978576-img-ede4247fd5f8f4ee01bf7fba403e77aa-v.jpg	vehicles/tmp-a7c8ad05/1781687978576-img-ede4247fd5f8f4ee01bf7fba403e77aa-v.jpg	image	\N	\N	31	f	2026-06-17 09:22:54.48	2026-06-17 09:28:07.772
cmqhv4k910002jn04qgfk5jrr	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2ca1fd28/1781687967136-img-56ae8ef8970332747859c28e8cd5a904-v.jpg	vehicles/tmp-2ca1fd28/1781687967136-img-56ae8ef8970332747859c28e8cd5a904-v.jpg	image	\N	\N	0	t	2026-06-17 09:22:36.805	2026-09-23 12:00:42.476
cmqhv4pic000qjn04bwziqv4s	cmqhv4jnz0000jn04wb54ihtb	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-38749b90/1781687969953-img-595cc1d2f796eb6dbc6e871954050931-v.jpg	vehicles/tmp-38749b90/1781687969953-img-595cc1d2f796eb6dbc6e871954050931-v.jpg	image	\N	\N	12	f	2026-06-17 09:22:43.62	2026-09-23 12:00:54.537
cmqkj4vyw0006l704wlau2aut	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ce737857/1781849331920-2.jpeg	vehicles/tmp-ce737857/1781849331920-2.jpeg	image	\N	\N	2	f	2026-06-19 06:10:15.129	2026-09-13 19:59:24.433
cmqkj4w8a000al704f8j6fi6a	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-270ab5a1/1781849334571-6.jpeg	vehicles/tmp-270ab5a1/1781849334571-6.jpeg	image	\N	\N	4	f	2026-06-19 06:10:15.466	2026-09-13 19:59:24.623
cmqkj4uem0004l704o3bpznps	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-942801aa/1781849333825-5.jpeg	vehicles/tmp-942801aa/1781849333825-5.jpeg	image	\N	\N	1	f	2026-06-19 06:10:13.102	2026-09-13 19:59:24.245
cmqkj56il001sl704yuddp039	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a8e0f1f1/1781849351158-whatsapp-image-2026-06-16-at-15.37.3034.jpeg	vehicles/tmp-a8e0f1f1/1781849351158-whatsapp-image-2026-06-16-at-15.37.3034.jpeg	image	\N	\N	31	f	2026-06-19 06:10:28.797	2026-06-19 06:10:28.797
cmqkj57kz001ul70413zeeqki	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ffad5f17/1781849351892-whatsapp-image-2026-06-16-at-15.37.3145.jpeg	vehicles/tmp-ffad5f17/1781849351892-whatsapp-image-2026-06-16-at-15.37.3145.jpeg	image	\N	\N	32	f	2026-06-19 06:10:30.18	2026-06-19 06:10:30.18
cmqkj567y001kl704ksaqhc1o	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-689e9e42/1781849348815-whatsapp-image-2026-06-16-at-15.37.2928.jpeg	vehicles/tmp-689e9e42/1781849348815-whatsapp-image-2026-06-16-at-15.37.2928.jpeg	image	\N	\N	27	f	2026-06-19 06:10:28.415	2026-09-13 19:59:27.173
cmqkj54k0000ul704yjflgfxy	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-00fe9e21/1781849340533-24.jpeg	vehicles/tmp-00fe9e21/1781849340533-24.jpeg	image	\N	\N	14	f	2026-06-19 06:10:26.256	2026-09-13 19:59:07.801
cmqkj54n1000wl7045hnd3oe9	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8d737395/1781849341208-25.jpeg	vehicles/tmp-8d737395/1781849341208-25.jpeg	image	\N	\N	15	f	2026-06-19 06:10:26.365	2026-09-13 19:59:24.153
cmqkj549d000ml704t7s1pkyi	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-02ff3dd2/1781849330790-1.jpeg	vehicles/tmp-02ff3dd2/1781849330790-1.jpeg	image	\N	\N	10	f	2026-06-19 06:10:25.873	2026-09-13 19:59:26.987
cmqkj55ay001el7041r8f5gyv	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1b361637/1781849346860-whatsapp-image-2026-06-16-at-15.37.2819.jpeg	vehicles/tmp-1b361637/1781849346860-whatsapp-image-2026-06-16-at-15.37.2819.jpeg	image	\N	\N	24	f	2026-06-19 06:10:27.227	2026-09-13 19:59:26.892
cmqkj54c1000ol704qkb3lt4b	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e117fb75/1781849338616-14.jpeg	vehicles/tmp-e117fb75/1781849338616-14.jpeg	image	\N	\N	11	f	2026-06-19 06:10:25.969	2026-09-13 19:59:27.082
cmqkj54xm0014l70498dfe6k7	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cc901c11/1781849343621-whatsapp-image-2026-06-16-at-15.37.2810.jpeg	vehicles/tmp-cc901c11/1781849343621-whatsapp-image-2026-06-16-at-15.37.2810.jpeg	image	\N	\N	19	f	2026-06-19 06:10:26.746	2026-09-13 19:59:24.62
cmqkj54eo000ql704ivbuphlb	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-512cc6a1/1781849339287-22.jpeg	vehicles/tmp-512cc6a1/1781849339287-22.jpeg	image	\N	\N	12	f	2026-06-19 06:10:26.065	2026-09-13 19:59:27.176
cmqkj56fw001ql704qmypbmxt	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4e199b5f/1781849350649-whatsapp-image-2026-06-16-at-15.37.3033.jpeg	vehicles/tmp-4e199b5f/1781849350649-whatsapp-image-2026-06-16-at-15.37.3033.jpeg	image	\N	\N	30	f	2026-06-19 06:10:28.701	2026-08-13 23:16:18.502
cmqkj55090016l7047hk2p1ma	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1e095376/1781849344176-whatsapp-image-2026-06-16-at-15.37.2815.jpeg	vehicles/tmp-1e095376/1781849344176-whatsapp-image-2026-06-16-at-15.37.2815.jpeg	image	\N	\N	20	f	2026-06-19 06:10:26.841	2026-09-13 19:59:24.714
cmqkj552w0018l704a6913exr	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e3a03e69/1781849344713-whatsapp-image-2026-06-16-at-15.37.2816.jpeg	vehicles/tmp-e3a03e69/1781849344713-whatsapp-image-2026-06-16-at-15.37.2816.jpeg	image	\N	\N	21	f	2026-06-19 06:10:26.936	2026-09-13 19:59:24.808
cmqkj555k001al704i05b43iz	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-725532b8/1781849345408-whatsapp-image-2026-06-16-at-15.37.2817.jpeg	vehicles/tmp-725532b8/1781849345408-whatsapp-image-2026-06-16-at-15.37.2817.jpeg	image	\N	\N	22	f	2026-06-19 06:10:27.032	2026-09-13 19:59:24.901
cmqkj5587001cl704i3aise4o	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ff6c6233/1781849346190-whatsapp-image-2026-06-16-at-15.37.2818.jpeg	vehicles/tmp-ff6c6233/1781849346190-whatsapp-image-2026-06-16-at-15.37.2818.jpeg	image	\N	\N	23	f	2026-06-19 06:10:27.127	2026-09-13 19:59:24.995
cmqkj50zh000il7047zadilpf	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-60287091/1781849337118-11.jpeg	vehicles/tmp-60287091/1781849337118-11.jpeg	image	\N	\N	8	f	2026-06-19 06:10:21.629	2026-09-13 19:59:25.004
cmqkj5124000kl704efdqybyx	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cdd7f4e3/1781849337873-12.jpeg	vehicles/tmp-cdd7f4e3/1781849337873-12.jpeg	image	\N	\N	9	f	2026-06-19 06:10:21.724	2026-09-13 19:59:26.892
cmqkj54sb0010l704cx0iyoxz	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-be28491f/1781849342348-whatsapp-image-2026-06-16-at-15.37.25-3-.jpeg	vehicles/tmp-be28491f/1781849342348-whatsapp-image-2026-06-16-at-15.37.25-3-.jpeg	image	\N	\N	17	f	2026-06-19 06:10:26.556	2026-09-13 19:59:24.432
cmqkj560r001gl704nvir8not	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4ad4b453/1781849347514-whatsapp-image-2026-06-16-at-15.37.2926.jpeg	vehicles/tmp-4ad4b453/1781849347514-whatsapp-image-2026-06-16-at-15.37.2926.jpeg	image	\N	\N	25	f	2026-06-19 06:10:28.155	2026-09-13 19:59:26.986
cmqkj565b001il704127md3pr	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8d601e5f/1781849348087-whatsapp-image-2026-06-16-at-15.37.2927.jpeg	vehicles/tmp-8d601e5f/1781849348087-whatsapp-image-2026-06-16-at-15.37.2927.jpeg	image	\N	\N	26	f	2026-06-19 06:10:28.319	2026-09-13 19:59:27.08
cmqkj56am001ml7043flju9yi	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-231e47aa/1781849349320-whatsapp-image-2026-06-16-at-15.37.2929.jpeg	vehicles/tmp-231e47aa/1781849349320-whatsapp-image-2026-06-16-at-15.37.2929.jpeg	image	\N	\N	28	f	2026-06-19 06:10:28.51	2026-08-13 23:15:31.404
cmqkj56d9001ol7043kfl52b0	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c2f4eec/1781849350033-whatsapp-image-2026-06-16-at-15.37.2930.jpeg	vehicles/tmp-7c2f4eec/1781849350033-whatsapp-image-2026-06-16-at-15.37.2930.jpeg	image	\N	\N	29	f	2026-06-19 06:10:28.606	2026-08-13 23:15:52.04
cmqkj54hc000sl704le6bv8bn	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1cfb4981/1781849339810-23.jpeg	vehicles/tmp-1cfb4981/1781849339810-23.jpeg	image	\N	\N	13	f	2026-06-19 06:10:26.16	2026-09-13 19:59:07.708
cmqkj57px001wl704z6e8b5va	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4f5b5b23/1781849352434-whatsapp-image-2026-06-16-at-15.37.31222.jpeg	vehicles/tmp-4f5b5b23/1781849352434-whatsapp-image-2026-06-16-at-15.37.31222.jpeg	image	\N	\N	33	f	2026-06-19 06:10:30.357	2026-06-19 06:10:30.357
cmqkj57td001yl704kio3jsfz	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b645b357/1781849352996-whatsapp-image-2026-06-16-at-15.37.312323.jpeg	vehicles/tmp-b645b357/1781849352996-whatsapp-image-2026-06-16-at-15.37.312323.jpeg	image	\N	\N	34	f	2026-06-19 06:10:30.481	2026-06-19 06:10:30.481
cmt8bvb2t0002l504pdrip2ng	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-1eee3c99/1787641890447-20260824-133635.mp4	vehicles/tmp-1eee3c99/1787641890447-20260824-133635.mp4	video	video/mp4	25088102	0	f	2026-08-25 07:12:43.733	2026-09-23 12:00:21.438
cmqkj54po000yl704i89eosmh	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-038c53da/1781849341715-whatsapp-image-2026-06-16-at-15.37.25-2-.jpeg	vehicles/tmp-038c53da/1781849341715-whatsapp-image-2026-06-16-at-15.37.25-2-.jpeg	image	\N	\N	16	f	2026-06-19 06:10:26.46	2026-09-13 19:59:24.339
cmrgw00rg000xl504qloyi65g	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461781061-whatsapp-image-2026-06-14-at-20.26.01-7-.jpeg	\N	image	\N	\N	16	f	2026-07-11 21:39:00.7	2026-07-11 21:39:00.7
cmrgw00ud000zl504yg3h197c	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461782283-whatsapp-image-2026-06-14-at-20.26.01-6-.jpeg	\N	image	\N	\N	17	f	2026-07-11 21:39:00.806	2026-07-11 21:39:00.806
cmrgw00x00011l5049u9ikt49	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461783449-whatsapp-image-2026-06-14-at-20.26.01-5-.jpeg	\N	image	\N	\N	18	f	2026-07-11 21:39:00.9	2026-07-11 21:39:00.9
cmrgw00zn0013l504pg7dahuv	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461784275-whatsapp-image-2026-06-14-at-20.26.01-4-.jpeg	\N	image	\N	\N	19	f	2026-07-11 21:39:00.995	2026-07-11 21:39:00.995
cmrgw01290015l504qbtnezs0	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461785081-whatsapp-image-2026-06-14-at-20.26.01-3-.jpeg	\N	image	\N	\N	20	f	2026-07-11 21:39:01.09	2026-07-11 21:39:01.09
cmrgw014v0017l504uporirlp	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461785894-whatsapp-image-2026-06-14-at-20.26.01-2-.jpeg	\N	image	\N	\N	21	f	2026-07-11 21:39:01.184	2026-07-11 21:39:01.184
cmrgw01rv0019l504b0t0ye3v	4	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/4/1781461786771-whatsapp-image-2026-06-14-at-20.26.01-1-.jpeg	\N	image	\N	\N	22	f	2026-07-11 21:39:02.011	2026-07-11 21:39:02.011
cmqkj4way000cl704m5muyu9h	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-51343e19/1781849335127-7.jpeg	vehicles/tmp-51343e19/1781849335127-7.jpeg	image	\N	\N	5	f	2026-06-19 06:10:15.562	2026-09-13 19:59:24.718
cmqkj54uz0012l70451r20eek	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-50e53f61/1781849342982-whatsapp-image-2026-06-16-at-15.37.2713.jpeg	vehicles/tmp-50e53f61/1781849342982-whatsapp-image-2026-06-16-at-15.37.2713.jpeg	image	\N	\N	18	f	2026-06-19 06:10:26.651	2026-09-13 19:59:24.526
cmqkj4wn7000gl7042rqqxwyj	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-86b611c8/1781849336445-9.jpeg	vehicles/tmp-86b611c8/1781849336445-9.jpeg	image	\N	\N	7	f	2026-06-19 06:10:16.003	2026-09-13 19:59:24.909
cmt8gjtvs0001l104wgpuy36j	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3a818e76/1787641788537-20260824-133246-1-.jpg	\N	image	\N	\N	0	t	2026-08-25 09:23:46.312	2026-09-23 12:00:21.438
cmqkj4w3n0008l704nkrenac7	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-0b27c7eb/1781849332662-3.jpeg	vehicles/tmp-0b27c7eb/1781849332662-3.jpeg	image	\N	\N	3	f	2026-06-19 06:10:15.299	2026-09-13 19:59:24.528
cmt8gk5mn0005l104elpxog8c	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-36d91a08/1787641787726-20260824-133240.jpg	\N	image	\N	\N	2	f	2026-08-25 09:24:01.535	2026-09-23 12:00:23.371
cmt8gk5pa0007l104w15mhzgx	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c1de047a/1787641789377-20260824-133318.jpg	\N	image	\N	\N	3	f	2026-08-25 09:24:01.63	2026-09-23 12:00:23.467
cmt8gk5ry0009l104vfxgfdzs	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-65cec1a1/1787641790267-20260824-133324.jpg	\N	image	\N	\N	4	f	2026-08-25 09:24:01.727	2026-09-23 12:00:23.563
cmt8gk5um000bl1044qadouqk	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3ce0c371/1787641790990-20260824-133335.jpg	\N	image	\N	\N	5	f	2026-08-25 09:24:01.822	2026-09-23 12:00:23.659
cmt8gk5x9000dl104mmp52ywx	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c4821d51/1787641791796-20260824-133340.jpg	\N	image	\N	\N	6	f	2026-08-25 09:24:01.917	2026-09-23 12:00:23.759
cmt8gk5zw000fl10474tp49gi	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-75f88474/1787641792519-20260824-133345.jpg	\N	image	\N	\N	7	f	2026-08-25 09:24:02.012	2026-09-23 12:00:24.301
cmt8gk62j000hl1045zvvpe3u	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-5a4fc955/1787641793332-20260824-133431.jpg	\N	image	\N	\N	8	f	2026-08-25 09:24:02.107	2026-09-23 12:00:24.505
cmt8gk673000jl1049c58l5pb	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-daf7384e/1787641794055-20260824-133435.jpg	\N	image	\N	\N	9	f	2026-08-25 09:24:02.271	2026-09-23 12:00:33.618
cmt8gk7e1000ll104lvdudhwk	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-40f14807/1787641794926-20260824-133439.jpg	\N	image	\N	\N	10	f	2026-08-25 09:24:03.818	2026-09-23 12:01:03.738
cmt8gk7lg000nl104bvjoy9xu	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3f842834/1787641795696-20260824-133441.jpg	\N	image	\N	\N	11	f	2026-08-25 09:24:04.084	2026-09-23 12:01:04.142
cmt8gk7o3000pl104k78k1sci	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-68368479/1787641796354-20260824-133445.jpg	\N	image	\N	\N	12	f	2026-08-25 09:24:04.179	2026-09-23 12:01:04.324
cmt8gk7qq000rl104tgkb0qcp	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4963088f/1787641797044-20260824-133447.jpg	\N	image	\N	\N	13	f	2026-08-25 09:24:04.274	2026-09-23 12:01:04.42
cmt8gk7td000tl104olbd4mzz	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c09b455/1787641797728-20260824-133451.jpg	\N	image	\N	\N	14	f	2026-08-25 09:24:04.369	2026-09-23 12:01:04.516
cmt8gk7w0000vl10424xm37ez	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-49d23844/1787641798359-20260824-133502.jpg	\N	image	\N	\N	15	f	2026-08-25 09:24:04.464	2026-09-23 12:01:04.616
cmqkj4suq0002l70402jxvj0z	cmqkj4s9s0000l704957qxfqo	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-76ce4145/1781849333291-4.jpeg	vehicles/tmp-76ce4145/1781849333291-4.jpeg	image	\N	\N	0	t	2026-06-19 06:10:11.091	2026-09-13 19:59:07.825
cmue1snrb000plb04ntcn6lpi	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-94d1c365/1790164431267-img-8be0007d14584555af35055dd9469629-v.jpg	\N	image	\N	\N	12	f	2026-09-23 11:57:03.431	2026-09-23 12:00:12.829
cmue1snty000rlb0459b21izr	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ef6880fd/1790164432210-img-27caeb987c9e6f19081feacdf117547c-v.jpg	\N	image	\N	\N	13	f	2026-09-23 11:57:03.526	2026-09-23 12:00:24.486
cmue1snwk000tlb04abgc9oly	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d79d62f0/1790164433123-img-44cad6fb7c176dceb98c543f65c05136-v.jpg	\N	image	\N	\N	14	f	2026-09-23 11:57:03.621	2026-09-23 12:00:24.707
cmue1snz7000vlb04socwl4k6	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-e6330064/1790164434008-img-314ecd0e54747424b04e38bd9b8ff0fa-v.jpg	\N	image	\N	\N	15	f	2026-09-23 11:57:03.716	2026-09-23 12:00:24.802
cmue1sopv000xlb04jzs3o4q6	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ef2d3fe8/1790164434988-img-464b6e80228674cd7b2a20dad1784101-v.jpg	\N	image	\N	\N	16	f	2026-09-23 11:57:04.675	2026-09-23 12:00:24.897
cmue1sow80011lb04kxiyyevj	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6812775d/1790164436908-img-655a6b06323315899d7696e8b0b054b9-v.jpg	\N	image	\N	\N	18	f	2026-09-23 11:57:04.904	2026-09-23 12:00:25.087
cmue1soyv0013lb04pncwul59	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-da29ddd5/1790164437839-img-823a542cf41859b76d6c8b7325544b54-v.jpg	\N	image	\N	\N	19	f	2026-09-23 11:57:04.999	2026-09-23 12:00:25.182
cmue1sp1i0015lb04dihh0qai	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-d98c5f14/1790164438837-img-1782f57b702f7ec0e5747b1a8b5c19e1-v.jpg	\N	image	\N	\N	20	f	2026-09-23 11:57:05.094	2026-09-23 12:00:25.276
cmue1sp450019lb0495kp3syq	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4ac06ff1/1790164439912-img-5008c98a8c8b6077673aa81d172441ef-v.jpg	\N	image	\N	\N	21	f	2026-09-23 11:57:05.189	2026-09-23 12:00:25.373
cmue1sp6s001blb04qydwf4e6	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-247de45e/1790164440935-img-35936d65de0254040d08ee570f3673e7-v.jpg	\N	image	\N	\N	22	f	2026-09-23 11:57:05.284	2026-09-23 12:00:25.467
cmue1sp9g001flb0441uz0d9r	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8dcdac00/1790164441993-img-58522bb2ca10200dd96afc571234a698-v.jpg	\N	image	\N	\N	23	f	2026-09-23 11:57:05.38	2026-09-23 12:00:25.562
cmue1spc3001jlb04woem7vmz	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8cc078ff/1790164442929-img-85836c6fefa9c425605e9e77b8742c36-v.jpg	\N	image	\N	\N	24	f	2026-09-23 11:57:05.475	2026-09-23 12:00:25.656
cmue1spf8001nlb04ks4bnbv9	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-4b30d8dc/1790164443852-img-8649887fce239e919c1bb7e1e69d47b3-v.jpg	\N	image	\N	\N	25	f	2026-09-23 11:57:05.588	2026-09-23 12:00:25.752
cmue1spi4001rlb049ze06h9s	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-99285363/1790164444823-img-ab5a171a006056d383c5dc8e89d7d77d-v.jpg	\N	image	\N	\N	26	f	2026-09-23 11:57:05.692	2026-09-23 12:00:25.847
cmue1sq6l001tlb04sbsaxjzc	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-fe9ea7ca/1790164445830-img-abab678f661c9a49a2f50ea9ef0114c6-v.jpg	\N	image	\N	\N	27	f	2026-09-23 11:57:06.573	2026-09-23 12:00:31.711
cmt8gk7yq000xl104on4k2avk	cmt8bvawa0000l5045myi1c2t	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-f4b383f7/1787641799060-20260824-133509.jpg	\N	image	\N	\N	16	f	2026-08-25 09:24:04.562	2026-09-23 12:01:04.712
cmue1r56t0001lb04wd1s5oiy	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2c41df98/1790164455063-img-f1d64177443d54b51cc105638e1044dc-v.jpg	\N	image	\N	\N	2	f	2026-09-23 11:55:52.709	2026-10-17 15:44:26.619
cmue1snbh000dlb04r47tj1yv	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-aca829f4/1790164424987-img-7a6befc4835156e579b01a5d7650bfd7-v.jpg	\N	image	\N	\N	1	f	2026-09-23 11:57:02.861	2026-10-17 15:44:26.431
cmue1smy90003lb0497xyomgu	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ef40decc/1790164419692-img-003f408d3bcc0cbc3d3279177f3d73a8-v.jpg	\N	image	\N	\N	3	f	2026-09-23 11:57:02.292	2026-10-17 15:44:26.714
cmue1sn0v0005lb04u1vt9gc9	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-8c89ce51/1790164420994-img-3f08cb3c52feeb52e04ed519dd472955-v.jpg	\N	image	\N	\N	4	f	2026-09-23 11:57:02.48	2026-10-17 15:44:26.81
cmue1snon000nlb04800t17uf	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7553854d/1790164430078-img-8b90ed6f570175170ce0a6eaaec3f464-v.jpg	\N	image	\N	\N	11	f	2026-09-23 11:57:03.335	2026-09-23 11:59:55.655
cmue1sn660009lb042bl7fcwr	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-b16705ae/1790164422961-img-05cd3566d3b0c7816e70898557246df1-v.jpg	\N	image	\N	\N	6	f	2026-09-23 11:57:02.671	2026-09-23 11:59:40.793
cmue1sn8u000blb04liqj0nc8	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-3af21e3f/1790164424022-img-6e36d3e5bfcf2b28a041e7ee0b949e97-v.jpg	\N	image	\N	\N	7	f	2026-09-23 11:57:02.766	2026-09-23 11:59:40.886
cmue1sne4000flb04amvbhrsd	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-62545d6d/1790164425952-img-7c3bb77b5631e036ad0cfbae33a7cdb8-v.jpg	\N	image	\N	\N	8	f	2026-09-23 11:57:02.956	2026-09-23 11:59:40.98
cmue1snje000jlb04hh5q5c3s	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-6d68b9c0/1790164427962-img-7e7e20ee253a594c1bba48244095f6a1-v.jpg	\N	image	\N	\N	9	f	2026-09-23 11:57:03.146	2026-09-23 11:59:41.677
cmue1sngr000hlb04hw5rnmti	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-ee3f0577/1790164426952-img-7c98082114a23e3e511730178f6a38aa-v.jpg	\N	image	\N	\N	9	f	2026-09-23 11:57:03.051	2026-09-23 11:59:41.074
cmue1snm0000llb045ladqvuh	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7ba18824/1790164429003-img-7f8510ee573948dea9e5fda1bc31c76b-v.jpg	\N	image	\N	\N	10	f	2026-09-23 11:57:03.24	2026-09-23 11:59:55.469
cmue1tsp0002xkw04mg75uni3	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-da2cfcff/1790164453365-img-e1007afd0e59ee6563765fa9f203a9d0-v.jpg	\N	image	\N	\N	35	f	2026-09-23 11:57:56.484	2026-09-23 12:01:03.741
cmue1sotk000zlb04vexsj7ij	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-757082a4/1790164435987-img-499f007265ee6ee2361823fe4c9fab75-v.jpg	\N	image	\N	\N	17	f	2026-09-23 11:57:04.809	2026-09-23 12:00:24.992
cmue1t98i0025kw04d9jmkue8	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-91990d67/1790164446694-img-b2ee465bbf7c662101fc35bbac44f2dc-v.jpg	\N	image	\N	\N	28	f	2026-09-23 11:57:31.266	2026-09-23 12:00:31.806
cmue1t9mi0027kw04jqehr7bu	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-cbe6622e/1790164447611-img-bace763469fbac1abb736c89b315f9e5-v.jpg	\N	image	\N	\N	29	f	2026-09-23 11:57:31.771	2026-09-23 12:00:31.901
cmue1tsbq002bkw046mxnawkk	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-102a4e58/1790164448524-img-bc2aeca2241761bde29c10427250052d-v.jpg	\N	image	\N	\N	30	f	2026-09-23 11:57:55.828	2026-09-23 12:00:31.996
cmue1tsh1002lkw04oc427iwo	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7c9af833/1790164450414-img-d632cfe84b8995a59e574044c8d8b46b-v.jpg	\N	image	\N	\N	32	f	2026-09-23 11:57:56.197	2026-09-23 12:00:32.185
cmue1tsjo002pkw046u07dglx	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-c2c73adf/1790164451423-img-e3ee826535bc1aa2e286da0b77dd52e4-v.jpg	\N	image	\N	\N	33	f	2026-09-23 11:57:56.293	2026-09-23 12:00:32.279
cmue1tsmc002tkw04hvpdjss0	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-a8bfca8d/1790164452425-img-e5dd142e8816b2ed350baec0c09864ce-v.jpg	\N	image	\N	\N	34	f	2026-09-23 11:57:56.389	2026-09-23 12:00:33.345
cmue1tsro0031kw04j6gf6ukx	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-12aeb990/1790164454182-img-ef8d89988a30721050cefe88d0381c73-v.jpg	\N	image	\N	\N	36	f	2026-09-23 11:57:56.58	2026-09-23 12:01:05.454
cmue1u4d10035kw04hm0hvz90	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-2e177b04/1790164456034-img-f93eeec599648b5b390fe7b324813d5c-v.jpg	\N	image	\N	\N	37	f	2026-09-23 11:58:11.512	2026-09-23 12:01:11.136
cmue1u4fo0039kw04xgcjrnco	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-9830420b/1790164457062-img-fea32869ffcfa781c2896bd6388092a5-v.jpg	\N	image	\N	\N	38	f	2026-09-23 11:58:11.7	2026-09-23 12:01:11.328
cmue1u4ib003dkw04t0k773k9	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-af741c8b/1790164457986-img-febc8a526f120f6223ee799e02c37041-v.jpg	\N	image	\N	\N	39	f	2026-09-23 11:58:11.795	2026-09-23 12:01:11.422
cmue1tnjo0026k104zfi6dbl9	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-02fbacf8/1790164449429-img-c14a5479a8a10854bcbeeb588dbd415b-v.jpg	\N	image	\N	\N	0	t	2026-09-23 11:57:48.02	2026-10-17 15:42:22.727
cmue1sn3i0007lb040vtuasse	cmue1pdsw0000k104948q632a	https://pub-76bf667a4709449da674772315258009.r2.dev/vehicles/tmp-7fd44629/1790164421986-img-4c9a03b0c1ebe3c83549ccbb047abdd8-v.jpg	\N	image	\N	\N	5	f	2026-09-23 11:57:02.575	2026-10-17 15:44:26.908
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
de14b920-808a-4fba-bb42-e0faa5f427cb	a023585c8aee1319cd8967664a66027a1f365d50c8ff6bddc7d5af77ce304160	2026-05-15 08:44:29.515867+00	20260515000000_initial		\N	2026-05-15 08:44:29.515867+00	0
11a13311-edfc-4e81-bc75-5d4d1dc4ea77	56249324c426ef1d8f004e82098a3783461370abb8ad37d92fd907b8de85ef66	2026-05-15 19:48:17.334661+00	20260515190000_add_vehicle_vat_mode	\N	\N	2026-05-15 19:48:17.094153+00	1
fe48f16f-c864-41f5-91f8-c2d04bd0cf79	7e78faff38cf1880df30b24cd632e60d744f8dee254c0bb35c1593d6ac53db9b	2026-05-15 21:02:18.412658+00	20260515200000_add_dealer_sms_phone	\N	\N	2026-05-15 21:02:18.136089+00	1
26bbf0c9-3505-417a-bb10-c317f8fe095c	032d9bdf6adc714f36051782d5fd79c008551265166d3b5504cedf2cf643dd5d	2026-05-16 08:47:56.764141+00	20260515220000_add_vehicle_media	\N	\N	2026-05-16 08:47:56.488876+00	1
ac56b7ec-3a31-4145-82a8-c0d7059819f4	19e330663b53e2466e92a6f657a65b8a2627f7d716cd269afe4d92f5f8e6acf2	2026-05-16 10:16:51.582449+00	20260516143000_repair_vehicle_dealer_relation		\N	2026-05-16 10:16:51.582449+00	0
f13c91b5-7004-4219-981f-aeb880f84147	25927e36afff39ca287bd44a202a3f852cf4d415087115a91423c5b212a2decd	2026-05-16 10:19:40.982385+00	20260516144500_repair_vehicle_contact_columns		\N	2026-05-16 10:19:40.982385+00	0
64fe1782-8b95-4aad-b5f7-ce48dd40c16b	8e2a5cc72ad7620c8c4e61a077e52e2c6df9489d477d573658f197dc83254b98	2026-05-16 18:38:05.010056+00	20260516120000_add_curated_dealers_and_lead_pipeline	\N	\N	2026-05-16 18:38:04.714832+00	1
efead7da-bff1-45d2-ae59-e34c244d59a4	de331f50a38b5a53dc2ae5557b745a0566e3888dacf175da34f42e09d8c928ae	2026-05-16 20:38:28.633868+00	20260516160000_add_vehicle_showcase	\N	\N	2026-05-16 20:38:28.384057+00	1
b54d0799-50e5-41d7-b171-3c018ba50b9e	0268168a6765872e2dc4ccaf9761b09c9da21c36af2aca6eba604ada59b412af	2026-06-02 21:31:53.325628+00	20260602190000_add_lead_request_dedup_metadata		\N	2026-06-02 21:31:53.325628+00	0
650c0c5b-9d15-414b-b720-7d8e70e1c0ac	c1b1c325dd33e92558f99ebbec4ec0ff97922f403b6e0f152f5e9aaf0b86a403	2026-06-02 21:41:04.763834+00	20260530120000_add_vehicle_on_sale		\N	2026-06-02 21:41:04.763834+00	0
7debca57-7b09-4ba4-9608-c4fcdd67d74d	482226ceb975ebe95b09cf5e0b19d5522c8c68c72aaa3f09c2996a1ffa70907a	2026-06-04 16:35:34.767258+00	20260603120000_add_lead_attribution	\N	\N	2026-06-04 16:35:34.458094+00	1
fd3659e7-2f8d-4445-b099-b6280f733ed2	3844770e84d6ad75550f967513a3d999f66580b63c2a88330a9dd0f02e8e4e56	2026-06-06 21:34:24.887279+00	20260606120000_add_lead_soft_delete	\N	\N	2026-06-06 21:34:24.646905+00	1
0d617dab-69ea-41df-9c17-ef8051126477	7a0057c98a92bce5c2cbeaf114aa826c66703f74b5016b02f7d5c53cbe554fa4	2026-06-08 06:15:41.275935+00	20260608120000_add_dealer_google_maps	\N	\N	2026-06-08 06:15:41.11162+00	1
\.


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id);


--
-- Name: jwks jwks_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.jwks
    ADD CONSTRAINT jwks_pkey PRIMARY KEY (id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: organization organization_slug_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.organization
    ADD CONSTRAINT organization_slug_key UNIQUE (slug);


--
-- Name: project_config project_config_endpoint_id_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_endpoint_id_key UNIQUE (endpoint_id);


--
-- Name: project_config project_config_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.project_config
    ADD CONSTRAINT project_config_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: AdminUser AdminUser_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminUser"
    ADD CONSTRAINT "AdminUser_pkey" PRIMARY KEY (id);


--
-- Name: DealerSettings DealerSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DealerSettings"
    ADD CONSTRAINT "DealerSettings_pkey" PRIMARY KEY (id);


--
-- Name: Dealer Dealer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: VehicleMedia VehicleMedia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VehicleMedia"
    ADD CONSTRAINT "VehicleMedia_pkey" PRIMARY KEY (id);


--
-- Name: VehicleMedia VehicleMedia_vehicleId_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VehicleMedia"
    ADD CONSTRAINT "VehicleMedia_vehicleId_url_key" UNIQUE ("vehicleId", url);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "account_userId_idx" ON neon_auth.account USING btree ("userId");


--
-- Name: invitation_email_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX invitation_email_idx ON neon_auth.invitation USING btree (email);


--
-- Name: invitation_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "invitation_organizationId_idx" ON neon_auth.invitation USING btree ("organizationId");


--
-- Name: member_organizationId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_organizationId_idx" ON neon_auth.member USING btree ("organizationId");


--
-- Name: member_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "member_userId_idx" ON neon_auth.member USING btree ("userId");


--
-- Name: organization_slug_uidx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE UNIQUE INDEX organization_slug_uidx ON neon_auth.organization USING btree (slug);


--
-- Name: session_userId_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX "session_userId_idx" ON neon_auth.session USING btree ("userId");


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: neon_auth; Owner: -
--

CREATE INDEX verification_identifier_idx ON neon_auth.verification USING btree (identifier);


--
-- Name: AdminUser_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AdminUser_email_key" ON public."AdminUser" USING btree (email);


--
-- Name: Dealer_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Dealer_slug_idx" ON public."Dealer" USING btree (slug);


--
-- Name: Dealer_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Dealer_slug_key" ON public."Dealer" USING btree (slug);


--
-- Name: Dealer_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Dealer_status_idx" ON public."Dealer" USING btree (status);


--
-- Name: Lead_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_createdAt_idx" ON public."Lead" USING btree ("createdAt");


--
-- Name: Lead_dealerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_dealerId_idx" ON public."Lead" USING btree ("dealerId");


--
-- Name: Lead_deletedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_deletedAt_idx" ON public."Lead" USING btree ("deletedAt");


--
-- Name: Lead_intent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_intent_idx" ON public."Lead" USING btree (intent);


--
-- Name: Lead_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_status_idx" ON public."Lead" USING btree (status);


--
-- Name: Lead_vehicleId_intent_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_vehicleId_intent_createdAt_idx" ON public."Lead" USING btree ("vehicleId", intent, "createdAt");


--
-- Name: Lead_vehicleId_intent_ipAddress_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_vehicleId_intent_ipAddress_createdAt_idx" ON public."Lead" USING btree ("vehicleId", intent, "ipAddress", "createdAt");


--
-- Name: VehicleMedia_vehicleId_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VehicleMedia_vehicleId_sortOrder_idx" ON public."VehicleMedia" USING btree ("vehicleId", "sortOrder");


--
-- Name: Vehicle_brand_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Vehicle_brand_idx" ON public."Vehicle" USING btree (brand);


--
-- Name: Vehicle_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Vehicle_createdAt_idx" ON public."Vehicle" USING btree ("createdAt");


--
-- Name: Vehicle_dealerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Vehicle_dealerId_idx" ON public."Vehicle" USING btree ("dealerId");


--
-- Name: Vehicle_featured_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Vehicle_featured_idx" ON public."Vehicle" USING btree (featured);


--
-- Name: Vehicle_onSale_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Vehicle_onSale_idx" ON public."Vehicle" USING btree ("onSale");


--
-- Name: Vehicle_showcase_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Vehicle_showcase_idx" ON public."Vehicle" USING btree (showcase);


--
-- Name: Vehicle_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Vehicle_slug_key" ON public."Vehicle" USING btree (slug);


--
-- Name: Vehicle_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Vehicle_status_idx" ON public."Vehicle" USING btree (status);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_inviterId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: invitation invitation_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.invitation
    ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_organizationId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES neon_auth.organization(id) ON DELETE CASCADE;


--
-- Name: member member_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.member
    ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: neon_auth; Owner: -
--

ALTER TABLE ONLY neon_auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES neon_auth."user"(id) ON DELETE CASCADE;


--
-- Name: Lead Lead_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VehicleMedia VehicleMedia_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VehicleMedia"
    ADD CONSTRAINT "VehicleMedia_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Vehicle Vehicle_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 0gaBYjca09TvVMWMroFxn2epU9XgWeYtXCdvQ1CMdt122wBpmsdSrVEy2tFVbi8

