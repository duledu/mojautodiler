<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  exclude-result-prefixes="sm xhtml image">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="sr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>XML Sitemap | Moj Auto Diler</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px 20px 64px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #F7F7F9;
            color: #0F0F14;
            line-height: 1.5;
          }
          .wrap { max-width: 1120px; margin: 0 auto; }
          .hero {
            background: #0F0F14;
            color: #FFFFFF;
            border-radius: 16px;
            padding: 28px 32px;
            margin-bottom: 24px;
            border-bottom: 3px solid #C9A84C;
          }
          .eyebrow {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #E8C97A;
            margin-bottom: 6px;
          }
          h1 { margin: 0 0 8px; font-size: 26px; font-weight: 800; }
          .sub { margin: 0; font-size: 14px; color: #C8C8D2; max-width: 720px; }
          .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
          }
          .stat {
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(201,168,76,0.28);
            border-radius: 10px;
            padding: 10px 16px;
            font-size: 13px;
          }
          .stat strong { color: #E8C97A; font-size: 16px; margin-right: 6px; }
          .card {
            background: #FFFFFF;
            border: 1px solid #E2E2EA;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(15,15,20,0.04);
          }
          .table-wrap { overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          thead th {
            text-align: left;
            padding: 13px 16px;
            background: #F1F1F5;
            color: #3A3A4A;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 1px solid #E2E2EA;
            white-space: nowrap;
          }
          tbody td {
            padding: 12px 16px;
            border-bottom: 1px solid #EFEFF4;
            vertical-align: top;
          }
          tbody tr:hover { background: #FBF6E8; }
          tbody tr:last-child td { border-bottom: none; }
          .idx { color: #6B6B7C; font-variant-numeric: tabular-nums; width: 42px; }
          a.loc {
            color: #0F0F14;
            font-weight: 600;
            text-decoration: none;
            word-break: break-all;
          }
          a.loc:hover { color: #9A7A2E; text-decoration: underline; }
          .pill {
            display: inline-block;
            padding: 2px 7px;
            margin: 0 4px 4px 0;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            background: #FBF6E8;
            color: #9A7A2E;
            border: 1px solid rgba(201,168,76,0.3);
          }
          .muted { color: #6B6B7C; font-size: 12px; }
          .date { white-space: nowrap; font-variant-numeric: tabular-nums; color: #3A3A4A; }
          .footer {
            margin-top: 18px;
            font-size: 12px;
            color: #6B6B7C;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="hero">
            <div class="eyebrow">Moj Auto Diler • Tehnički SEO</div>
            <h1>XML Sitemap</h1>
            <p class="sub">
              Automatski generisana mapa sajta za pretraživače (Google, Bing) u skladu sa sitemaps.org 0.9 protokolom,
              uključujući dvojezične hreflang veze i mape slika.
            </p>
            <div class="stats">
              <div class="stat">
                <strong><xsl:value-of select="count(sm:urlset/sm:url)" /></strong>
                indeksabilnih URL-ova
              </div>
              <div class="stat">
                <strong><xsl:value-of select="count(sm:urlset/sm:url/image:image)" /></strong>
                slika u mapi
              </div>
              <div class="stat">
                <strong><xsl:value-of select="count(sm:urlset/sm:url[xhtml:link])" /></strong>
                dvojezičnih stranica (hreflang)
              </div>
            </div>
          </div>

          <div class="card">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>URL stranice</th>
                    <th>Jezici (hreflang)</th>
                    <th>Slike</th>
                    <th>Poslednja izmena (UTC)</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sm:urlset/sm:url">
                    <tr>
                      <td class="idx"><xsl:value-of select="position()" /></td>
                      <td>
                        <a class="loc" href="{sm:loc}">
                          <xsl:value-of select="sm:loc" />
                        </a>
                      </td>
                      <td>
                        <xsl:choose>
                          <xsl:when test="xhtml:link">
                            <xsl:for-each select="xhtml:link">
                              <span class="pill"><xsl:value-of select="@hreflang" /></span>
                            </xsl:for-each>
                          </xsl:when>
                          <xsl:otherwise>
                            <span class="muted">sr</span>
                          </xsl:otherwise>
                        </xsl:choose>
                      </td>
                      <td>
                        <xsl:choose>
                          <xsl:when test="count(image:image) &gt; 0">
                            <span class="pill"><xsl:value-of select="count(image:image)" /></span>
                          </xsl:when>
                          <xsl:otherwise>
                            <span class="muted">0</span>
                          </xsl:otherwise>
                        </xsl:choose>
                      </td>
                      <td class="date">
                        <xsl:choose>
                          <xsl:when test="sm:lastmod">
                            <xsl:value-of select="substring(sm:lastmod, 1, 19)" />
                          </xsl:when>
                          <xsl:otherwise>
                            <span class="muted">Nije navedeno</span>
                          </xsl:otherwise>
                        </xsl:choose>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </div>

          <div class="footer">
            Moj Auto Diler • https://www.mojautodiler.com/sitemap.xml
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
