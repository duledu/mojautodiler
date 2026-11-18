# carVertical Affiliate Integration — Canonical Reference

**Project:** MojAutoDiler.com  
**Purpose:** Single source of truth for carVertical affiliate destinations, attribution, and implementation rules.  
**Status:** Partner-provided links. Do not alter without explicit approval.  
**Last documented:** 2026-11-18

> AI agents: Read this file before editing carVertical CTAs, banners, listing integrations, blog promotions, footer links, or social campaign URLs. Reuse existing application URL-building utilities where available; do not create competing implementations.

## 1. Immutable partner identifiers

| Parameter | Value | Meaning |
| --- | --- | --- |
| Base URL | `https://www.carvertical.deal/4FCPMH4/JRZRQN/` | Partner destination |
| `source_id` | `AFF` | Affiliate source |
| `sub1` | `mojautodiler` | Affiliate campaign identifier |
| `sub2` | Varies by placement | Attribution channel |
| `uid` | `594` | Only in the partner-provided listing pre-check URL with VIN |
| `sub3` | Valid, publicly shareable vehicle VIN | Only in the VIN-enabled listing URL |

Do not confuse the affiliate tracking identifier `sub1=mojautodiler` with a customer-facing discount code. Do not change any identifiers, parameter names, or placements without partner confirmation.

## 2. Approved URLs by placement

### 2.1 Vehicle listing — VIN-enabled pre-check

```text
https://www.carvertical.deal/4FCPMH4/JRZRQN/?uid=594&source_id=AFF&sub1=mojautodiler&sub2=listing&sub3=xxxxxxxxxxxxxxxxx
```

Replace the 17 `x` characters with the **actual, valid 17-character VIN** only when the vehicle's VIN is authorized for public use and the existing application setting permits sharing it. Encode the VIN as a query parameter. Never expose a private or hidden VIN.

### 2.2 Vehicle listing — without VIN

```text
https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=listing
```

**Fallback rule:** Use this URL whenever the VIN is missing, invalid, not approved for sharing, or the application is configured not to share VINs. Do not send an empty `sub3` or a placeholder VIN.

### 2.3 Homepage

```text
https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=homepage
```

### 2.4 Footer

```text
https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=footer
```

### 2.5 Blog articles

```text
https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=blog
```

### 2.6 Instagram — bio, posts, and stories

```text
https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=instagram
```

### 2.7 Sellers and dealerships

```text
https://www.carvertical.deal/4FCPMH4/JRZRQN/?source_id=AFF&sub1=mojautodiler&sub2=dealers
```

**Scope note:** No separate Facebook, TikTok, or other platform-specific URL was supplied. Do not invent attribution parameters for those channels; obtain partner approval first.

## 3. Implementation requirements

1. **Preserve existing integration.** Inspect the current affiliate URL helper, listing CTA, blog system, homepage/footer banners, and configuration before making changes. This document is a reference, not an instruction to rebuild working components.
2. **Use the exact URL for each placement.** Keep the base path, `source_id`, `sub1`, `sub2`, and VIN-specific `uid` intact. Do not replace partner-provided URLs with carVertical's general homepage.
3. **VIN privacy is mandatory.** The VIN-enabled URL must be used only for valid 17-character VINs and only if the site's existing public-VIN permission/configuration permits it. Otherwise use the no-VIN listing URL. Never leak VINs from private database fields into URLs, logs, analytics, HTML, or public metadata.
4. **Affiliate SEO attributes.** For HTML links, use `rel="sponsored nofollow"`; when using `target="_blank"`, also use `noopener noreferrer`. The partner's SEO guidelines explicitly require `nofollow` on all affiliate links.
5. **Affiliate disclosure.** Clearly identify promotional/affiliate links as appropriate, without suggesting that MojAutoDiler independently guarantees vehicle history or condition.
6. **Discount copy.** The existing approved consumer promotion is **20% off** with code **`MOJAUTODILER`**, subject to partner terms. Keep the discount code distinct from `sub1`. Do not claim the discount is automatically applied unless that behavior has been verified for the destination.
7. **Brand rules.** Always write `carVertical` (lowercase c, uppercase V). Use the full, unmodified official logo and properly attribute official imagery where required. Do not repurpose carVertical brand assets as MojAutoDiler's own branding.
8. **Paid ads restriction.** Partner guidance says Google Ads targeting VIN checks, vehicle history, and similar terms are generally prohibited without an approved exception. Organic blog content does not itself authorize paid campaigns.
9. **Changes require review.** Never silently change affiliate identifiers, append unapproved tracking parameters, publish campaigns, push commits, or deploy changes.

## 4. QA checklist for AI agents

- [ ] Homepage CTA uses `sub2=homepage`.
- [ ] Footer CTA uses `sub2=footer`.
- [ ] Blog CTA uses `sub2=blog`.
- [ ] Listing without public VIN uses `sub2=listing` and **no** `sub3`.
- [ ] Listing with approved public VIN uses `uid=594`, `sub2=listing`, and `sub3=<actual VIN>`.
- [ ] Instagram uses `sub2=instagram`.
- [ ] Seller/dealership placements use `sub2=dealers`.
- [ ] All affiliate links include `nofollow` (prefer `sponsored nofollow`).
- [ ] The user-facing discount is represented accurately.
- [ ] Brand names, logo usage, and image attributions are compliant.
- [ ] No unapproved changes to production data or deployment.

## 5. Source of authority

These exact URLs were supplied by the carVertical partner contact and repeated in the project conversation. The attached partner guidance documents are:

- `AG-SEO tips-121126-221531(2).pdf`
- `AG-Paid ads-121126-221600(2).pdf`
- `AG-Brand Asset Usage Rules-121126-221631(2).pdf`

Keep those source documents in an approved, accessible internal documentation location if the AI agent is expected to independently verify compliance. This Markdown file summarizes operational rules but does not replace the signed affiliate agreement or future partner instructions.

## 6. Recommended AI-agent discovery

Add this line to the repository's existing root `AGENTS.md` (or equivalent agent instruction file), preserving all other instructions:

```text
Before modifying any carVertical integration, affiliate CTA, promotional content, tracking link, or blog affiliate placement, read docs/CARVERTICAL_AFFILIATE.md and follow its exact URLs, VIN privacy safeguards, and partner compliance rules. Do not modify affiliate identifiers without explicit approval.
```

**Note:** A documentation file is only consistently consulted if the AI agent is instructed to read it. Do not assume all AI tools automatically discover every file in `docs/`.
