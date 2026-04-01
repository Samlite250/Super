from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

W, H = A4

# ── Palette ──────────────────────────────────────────────────────────────────
DARK      = colors.HexColor("#1A1A2E")
ACCENT    = colors.HexColor("#4F46E5")
ACCENT_LT = colors.HexColor("#EEF2FF")
DANGER    = colors.HexColor("#DC2626")
DANGER_LT = colors.HexColor("#FEF2F2")
WARNING   = colors.HexColor("#D97706")
WARNING_LT= colors.HexColor("#FFFBEB")
SUCCESS   = colors.HexColor("#16A34A")
SUCCESS_LT= colors.HexColor("#F0FDF4")
GRAY      = colors.HexColor("#6B7280")
LIGHT     = colors.HexColor("#F9FAFB")
BORDER    = colors.HexColor("#E5E7EB")
WHITE     = colors.white

# ── Styles ────────────────────────────────────────────────────────────────────
def make_styles():
    return {
        "cover_title": ParagraphStyle("cover_title", fontName="Helvetica-Bold",
            fontSize=28, textColor=WHITE, leading=34, spaceAfter=6),
        "cover_sub": ParagraphStyle("cover_sub", fontName="Helvetica",
            fontSize=13, textColor=colors.HexColor("#C7D2FE"), leading=18),
        "cover_meta": ParagraphStyle("cover_meta", fontName="Helvetica",
            fontSize=10, textColor=colors.HexColor("#A5B4FC"), leading=14),
        "section_head": ParagraphStyle("section_head", fontName="Helvetica-Bold",
            fontSize=9, textColor=ACCENT, leading=12, spaceBefore=18, spaceAfter=8,
            letterSpacing=1.2),
        "finding_title": ParagraphStyle("finding_title", fontName="Helvetica-Bold",
            fontSize=11, textColor=DARK, leading=14, spaceAfter=3),
        "body": ParagraphStyle("body", fontName="Helvetica",
            fontSize=10, textColor=GRAY, leading=15, spaceAfter=4),
        "fix": ParagraphStyle("fix", fontName="Helvetica-Oblique",
            fontSize=9.5, textColor=ACCENT, leading=14, spaceAfter=0),
        "page_name": ParagraphStyle("page_name", fontName="Helvetica-Bold",
            fontSize=10, textColor=DARK, leading=13),
        "page_body": ParagraphStyle("page_body", fontName="Helvetica",
            fontSize=9.5, textColor=GRAY, leading=14),
        "action_title": ParagraphStyle("action_title", fontName="Helvetica-Bold",
            fontSize=10.5, textColor=DARK, leading=13, spaceAfter=2),
        "action_body": ParagraphStyle("action_body", fontName="Helvetica",
            fontSize=9.5, textColor=GRAY, leading=14),
        "vision_body": ParagraphStyle("vision_body", fontName="Helvetica",
            fontSize=10, textColor=colors.HexColor("#1E40AF"), leading=16),
        "label": ParagraphStyle("label", fontName="Helvetica-Bold",
            fontSize=8, textColor=GRAY, leading=10, letterSpacing=0.8),
        "verdict": ParagraphStyle("verdict", fontName="Helvetica-Bold",
            fontSize=22, textColor=DANGER, leading=28),
    }

S = make_styles()

def hr(): return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8, spaceBefore=0)

def section_title(txt):
    return Paragraph(txt.upper(), S["section_head"])

def prio_badge(level):
    colors_map = {
        "CRITIQUE": (DANGER, DANGER_LT),
        "MOYEN":    (WARNING, WARNING_LT),
        "FAIBLE":   (SUCCESS, SUCCESS_LT),
        "P1": (DANGER, DANGER_LT),
        "P2": (DANGER, DANGER_LT),
        "P3": (DANGER, DANGER_LT),
        "P4": (WARNING, WARNING_LT),
        "P5": (WARNING, WARNING_LT),
    }
    fg, bg = colors_map.get(level, (GRAY, LIGHT))
    data = [[Paragraph(f'<font color="{fg.hexval()}" size="8"><b>{level}</b></font>', S["label"])]]
    t = Table(data, colWidths=[45])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("ROUNDEDCORNERS", [4]),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("BOX", (0,0), (-1,-1), 0.5, fg),
    ]))
    return t

def finding_block(prio, title, desc, fix=None):
    badge = prio_badge(prio)
    content = [
        Paragraph(title, S["finding_title"]),
        Paragraph(desc, S["body"]),
    ]
    if fix:
        content.append(Paragraph(f"→ {fix}", S["fix"]))
    right = Table([[c] for c in content], colWidths=[130*mm])
    right.setStyle(TableStyle([
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ]))
    row = Table([[badge, right]], colWidths=[52, 130*mm])
    row.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
        ("BACKGROUND", (0,0), (-1,-1), WHITE),
        ("BOX", (0,0), (-1,-1), 0.5, BORDER),
        ("ROUNDEDCORNERS", [6]),
    ]))
    return KeepTogether([row, Spacer(1, 6)])

def meter_row(label, score, out_of=10):
    pct = score / out_of
    if pct < 0.4:   c = DANGER
    elif pct < 0.6: c = WARNING
    else:           c = SUCCESS
    bar_w = 80*mm
    filled = bar_w * pct
    score_txt = f"{score}/10"
    lbl_p  = Paragraph(label, S["body"])
    score_p = Paragraph(f'<font color="{c.hexval()}"><b>{score_txt}</b></font>', S["body"])
    bar = Table([[""]], colWidths=[bar_w], rowHeights=[6])
    bar.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BORDER),
        ("ROUNDEDCORNERS", [3]),
    ]))
    fill = Table([[""]], colWidths=[filled], rowHeights=[6])
    fill.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), c),
        ("ROUNDEDCORNERS", [3]),
    ]))
    row = Table([[lbl_p, bar, score_p]], colWidths=[50*mm, bar_w, 15*mm])
    row.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ]))
    return row

def build_pdf(path):
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=18*mm, bottomMargin=18*mm)

    story = []

    # ── COVER BLOCK ───────────────────────────────────────────────────────────
    cover_data = [[
        Paragraph("DESIGN &amp; UX AUDIT", S["cover_meta"]),
        Paragraph("CONFIDENTIAL", S["cover_meta"]),
    ]]
    cover_top = Table(cover_data, colWidths=[85*mm, 85*mm])
    cover_top.setStyle(TableStyle([
        ("ALIGN", (1,0), (1,0), "RIGHT"),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ]))

    cover_inner = [
        cover_top,
        Spacer(1, 14),
        Paragraph("jcsmartt.com", S["cover_title"]),
        Paragraph("Agence Tech / Digital · Site vitrine · Mars 2026", S["cover_sub"]),
        Spacer(1, 10),
        Paragraph("Analyse UX/UI · Branding · Accessibilité · SEO Technique · Responsive", S["cover_meta"]),
    ]
    cover_tbl = Table([[cover_inner]], colWidths=[170*mm])
    cover_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), DARK),
        ("ROUNDEDCORNERS", [10]),
        ("TOPPADDING", (0,0), (-1,-1), 24),
        ("BOTTOMPADDING", (0,0), (-1,-1), 24),
        ("LEFTPADDING", (0,0), (-1,-1), 20),
        ("RIGHTPADDING", (0,0), (-1,-1), 20),
    ]))
    story.append(cover_tbl)
    story.append(Spacer(1, 16))

    # ── SCORE CARDS ───────────────────────────────────────────────────────────
    scores = [
        ("3.5/10", "Note globale", DANGER),
        ("2/10",   "Visibilité SEO", DANGER),
        ("4/10",   "Identité visuelle", WARNING),
        ("4/10",   "UX / Navigation", WARNING),
        ("3/10",   "Système design", DANGER),
    ]
    score_cells = []
    for val, lbl, col in scores:
        cell = Table([
            [Paragraph(f'<font color="{col.hexval()}" size="18"><b>{val}</b></font>', S["body"])],
            [Paragraph(lbl, S["label"])],
        ], colWidths=[30*mm])
        cell.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), LIGHT),
            ("ROUNDEDCORNERS", [6]),
            ("TOPPADDING", (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ("LEFTPADDING", (0,0), (-1,-1), 6),
            ("RIGHTPADDING", (0,0), (-1,-1), 6),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("BOX", (0,0), (-1,-1), 0.5, BORDER),
        ]))
        score_cells.append(cell)

    score_row = Table([score_cells], colWidths=[33*mm]*5)
    score_row.setStyle(TableStyle([
        ("LEFTPADDING", (0,0), (-1,-1), 2),
        ("RIGHTPADDING", (0,0), (-1,-1), 2),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(score_row)
    story.append(Spacer(1, 18))

    # ── 1. ANALYSE VISUELLE ───────────────────────────────────────────────────
    story.append(section_title("1 — Analyse visuelle globale"))
    story.append(hr())
    story.append(finding_block("CRITIQUE", "Positionnement visuel non défini",
        "Le site ne dégage pas d'identité forte. Pour une agence tech/digital, l'attente est une esthétique qui inspire confiance : typographie maîtrisée, palette délibérée, compositions aérées. Aucun de ces marqueurs n'est suffisamment présent pour qu'un visiteur comprenne immédiatement à qui il fait face.",
        "Définir un moodboard clair et l'appliquer systématiquement (tech sombre premium ou blanc minimal scandinave)."))
    story.append(finding_block("CRITIQUE", "Hero section : photos de templates — pas de vraie identité",
        "Les visuels utilisés dans la section hero sont des captures d'écran de templates existants. C'est le premier élément qu'un visiteur voit, et il ne reflète pas le travail réel de l'agence. Cela crée une dissonance immédiate et nuit à la crédibilité.",
        "Remplacer par des captures de vrais projets livrés, des illustrations custom, ou des portraits d'équipe authentiques."))
    story.append(finding_block("CRITIQUE", "Logo & identité de marque sans charte",
        "Sans icon-mark mémorisable, sans version mono, sans règles d'usage, la marque s'efface dès qu'on quitte la homepage.",
        "Créer un logo avec symbole distinctif + versions (blanc/couleur/favicon) et un brandbook minimum."))
    story.append(Spacer(1, 6))

    # ── 2. AUDIT PAGE PAR PAGE ────────────────────────────────────────────────
    story.append(section_title("2 — Audit page par page"))
    story.append(hr())

    pages = [
        ("Accueil (Homepage)",
         "Hero : La proposition de valeur n'est pas formulée en 5 secondes. Un visiteur ne comprend pas ce que fait JCS Martt, pour qui, et pourquoi vous choisir. CTA principal absent ou trop timide. Aucune preuve sociale visible (témoignages, logos clients, chiffres clés) — c'est le manque le plus coûteux pour la conversion."),
        ("Services",
         "Les offres semblent listées sous forme de texte générique sans différenciation claire. On ne sait pas à qui chaque service s'adresse, ni quel résultat concret il produit. Absence de prix ou fourchettes tarifaires — ce qui crée de la friction pour les prospects sérieux."),
        ("À propos",
         "Sans photos d'équipe ni chiffres clés ('fondée en X, Y projets livrés'), la page ne crée pas de connexion émotionnelle. En B2B, la confiance se bâtit sur les personnes, pas les logos."),
        ("Contact",
         "Absence d'un délai de réponse indicatif, d'une adresse physique ou d'un numéro visible. Une mention de localisation (Kigali, Rwanda) renforcerait l'ancrage et la confiance."),
    ]
    for name, desc in pages:
        pg = Table([
            [Paragraph(name, S["page_name"])],
            [Paragraph(desc, S["page_body"])],
        ], colWidths=[166*mm])
        pg.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), LIGHT),
            ("ROUNDEDCORNERS", [6]),
            ("TOPPADDING", (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ("LEFTPADDING", (0,0), (-1,-1), 12),
            ("RIGHTPADDING", (0,0), (-1,-1), 12),
            ("BOX", (0,0), (-1,-1), 0.5, BORDER),
        ]))
        story.append(pg)
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 6))

    # ── 3. SYSTÈME DE DESIGN ─────────────────────────────────────────────────
    story.append(section_title("3 — Système de design"))
    story.append(hr())

    meters = [
        ("Cohérence palette", 3),
        ("Typographie", 3.5),
        ("Espacement & grille", 3),
        ("Contraste WCAG AA", 4),
        ("Composants réutilisables", 2.5),
    ]
    for lbl, val in meters:
        story.append(meter_row(lbl, val))
    story.append(Spacer(1, 10))
    story.append(finding_block("CRITIQUE", "Absence d'un design system",
        "Sans tokens de design (couleurs, échelle typographique, grille 8px), chaque section diverge visuellement. Le résultat : une incohérence perçue qui signale un manque de professionnalisme — exactement l'opposé du message d'une agence tech.",
        "Définir 1 couleur primaire, 1 accent, 2 neutres. 2 polices max. Grille 8px. Documenter dans Figma."))
    story.append(Spacer(1, 6))

    # ── 4. UX ─────────────────────────────────────────────────────────────────
    story.append(section_title("4 — UX & expérience utilisateur"))
    story.append(hr())
    story.append(finding_block("CRITIQUE", "Site invisible sur Google — robots.txt bloquant",
        "Le fichier robots.txt bloque les crawlers. Google ne peut pas indexer les pages. Résultat : zéro trafic organique possible. C'est la priorité absolue avant tout travail de design.",
        "Corriger le robots.txt immédiatement. Soumettre un sitemap.xml à Google Search Console."))
    story.append(finding_block("CRITIQUE", "Absence de CTA hiérarchisés",
        "Sur un site vitrine B2B, il doit y avoir 1 CTA primaire (contact/devis) et 1 CTA secondaire (voir services) sur chaque page clé. Sans hiérarchie, le visiteur ne sait pas quoi faire ensuite.",
        "Ajouter un CTA primaire dans le header fixe + dans le hero + en bas de chaque section services."))
    story.append(finding_block("MOYEN", "Responsive mobile non optimisé",
        "Sur le marché rwandais et est-africain, l'accès mobile est dominant. Un site non optimisé pour des écrans 360–414px avec des connexions variables est rédhibitoire.",
        "Tester sur Chrome DevTools (375px, 414px, 768px). Viser un Lighthouse Mobile Performance > 75."))
    story.append(Spacer(1, 6))

    # ── 5. POINTS FORTS ───────────────────────────────────────────────────────
    story.append(section_title("5 — Points forts"))
    story.append(hr())
    strengths = [
        ("Site custom", "Le choix de ne pas utiliser Wix ou Squarespace démontre une intention technique réelle. C'est une base solide sur laquelle construire."),
        ("Positionnement géographique", "Être une agence tech basée à Kigali est un avantage compétitif réel sur le marché Afrique de l'Est. Le site ne l'exploite pas encore — c'est une opportunité."),
        ("Démarche d'audit", "Solliciter un audit à ce stade est la bonne décision. Beaucoup d'agences attendent trop longtemps."),
    ]
    for title, desc in strengths:
        row = Table([[
            Paragraph("✓", ParagraphStyle("chk", fontName="Helvetica-Bold", fontSize=12, textColor=SUCCESS)),
            Table([[Paragraph(title, S["finding_title"])], [Paragraph(desc, S["body"])]], colWidths=[148*mm])
        ]], colWidths=[14*mm, 148*mm])
        row.setStyle(TableStyle([
            ("VALIGN", (0,0), (-1,-1), "TOP"),
            ("TOPPADDING", (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ]))
        story.append(row)
    story.append(Spacer(1, 6))

    # ── 6. RECOMMANDATIONS ───────────────────────────────────────────────────
    story.append(section_title("6 — Problèmes & recommandations priorisées"))
    story.append(hr())
    recs = [
        ("P1", "SEO technique bloqué", "robots.txt bloque tout crawling. Zéro visiteur organique possible.",
         "Corriger robots.txt · Ajouter sitemap.xml · Vérifier Search Console"),
        ("P2", "Proposition de valeur illisible", "Un visiteur ne comprend pas en 5 secondes ce que fait JCS Martt, pour qui, et pourquoi vous choisir.",
         "Rédiger un headline unique et le placer en H1 above the fold"),
        ("P3", "Hero avec photos de templates", "Les captures d'écran de templates dans le hero nuisent à la crédibilité et ne montrent pas votre travail réel.",
         "Remplacer par des captures de vrais projets ou des visuels custom"),
        ("P4", "Absence de social proof", "Zéro témoignage client, logo client ou étude de cas. C'est le facteur de conversion #1 en B2B.",
         "Ajouter 3 témoignages · 5–8 logos clients · 1–2 case studies"),
        ("P5", "CTA absents ou inefficaces", "Sans CTA clairs, le site est une brochure sans issue. Taux de conversion proche de 0%.",
         "1 CTA primaire dans le header fixe · 1 dans le hero · 1 en fin de chaque section"),
    ]
    for prio, title, desc, fix in recs:
        story.append(finding_block(prio, title, desc, fix))
    story.append(Spacer(1, 6))

    # ── 7. ACTIONS PRIORITAIRES ───────────────────────────────────────────────
    story.append(section_title("7 — 5 actions à lancer cette semaine"))
    story.append(hr())
    actions = [
        ("1", "Corriger le robots.txt (Jour 1)",
         "Supprimer les règles 'Disallow: /' pour Googlebot. Soumettre à Google Search Console. Durée : 30 minutes. Impact : énorme."),
        ("2", "Réécrire le hero en 1 headline percutant (Semaine 1)",
         "Formuler 3 versions de headline. Objectif : compréhension en 5 secondes. Pas de jargon, pas de générique."),
        ("3", "Ajouter un CTA primaire visible dans le header (Semaine 1)",
         "Bouton 'Démarrons votre projet' en couleur contrastée dans la navbar. Sticky au scroll."),
        ("4", "Construire un mini brandbook (Semaine 2)",
         "5 couleurs, 2 typographies, logo avec déclinaisons. Réalisable dans Figma en 2 jours."),
        ("5", "Ajouter 3 témoignages clients + logos (Semaine 2–3)",
         "Contacter 3 clients satisfaits, leur demander 2 phrases. C'est la modification avec le meilleur ROI en B2B."),
    ]
    for num, title, desc in actions:
        num_cell = Table([[Paragraph(f'<font color="white"><b>{num}</b></font>',
            ParagraphStyle("n", fontName="Helvetica-Bold", fontSize=11, alignment=TA_CENTER))]],
            colWidths=[22], rowHeights=[22])
        num_cell.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), ACCENT),
            ("ROUNDEDCORNERS", [11]),
            ("TOPPADDING", (0,0), (-1,-1), 4),
            ("BOTTOMPADDING", (0,0), (-1,-1), 4),
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
            ("ALIGN", (0,0), (-1,-1), "CENTER"),
            ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ]))
        txt = Table([
            [Paragraph(title, S["action_title"])],
            [Paragraph(desc, S["action_body"])],
        ], colWidths=[148*mm])
        txt.setStyle(TableStyle([
            ("TOPPADDING", (0,0), (-1,-1), 0),
            ("BOTTOMPADDING", (0,0), (-1,-1), 2),
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ]))
        row = Table([[num_cell, txt]], colWidths=[30, 148*mm])
        row.setStyle(TableStyle([
            ("VALIGN", (0,0), (-1,-1), "TOP"),
            ("TOPPADDING", (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
            ("LINEBELOW", (0,0), (-1,-1), 0.5, BORDER),
        ]))
        story.append(row)
    story.append(Spacer(1, 14))

    # ── VISION FINALE ─────────────────────────────────────────────────────────
    vision_content = [
        Paragraph("Vision — Ce que jcsmartt.com peut devenir", ParagraphStyle("vt",
            fontName="Helvetica-Bold", fontSize=12, textColor=colors.HexColor("#1E40AF"), spaceAfter=8)),
        Paragraph(
            "JCS Martt a le potentiel de devenir la référence tech digitale de l'Afrique de l'Est — un positionnement que personne n'occupe clairement aujourd'hui. Le site devrait refléter cette ambition : une esthétique premium, des case studies concrets livrés sur le continent, une navigation bilingue français/anglais, et un blog technique actif pour asseoir l'autorité SEO. Avec les corrections prioritaires appliquées, jcsmartt.com peut générer 10x le trafic actuel et doubler les demandes entrantes en 6 mois.",
            S["vision_body"]),
    ]
    vision = Table([[vision_content]], colWidths=[166*mm])
    vision.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), ACCENT_LT),
        ("ROUNDEDCORNERS", [8]),
        ("TOPPADDING", (0,0), (-1,-1), 16),
        ("BOTTOMPADDING", (0,0), (-1,-1), 16),
        ("LEFTPADDING", (0,0), (-1,-1), 16),
        ("RIGHTPADDING", (0,0), (-1,-1), 16),
        ("BOX", (0,0), (-1,-1), 0.5, ACCENT),
    ]))
    story.append(vision)
    story.append(Spacer(1, 14))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    footer_data = [[
        Paragraph("Audit Design & UX · jcsmartt.com · Mars 2026", S["label"]),
        Paragraph("Réalisé avec expertise CDO", S["label"]),
    ]]
    footer = Table(footer_data, colWidths=[100*mm, 66*mm])
    footer.setStyle(TableStyle([
        ("ALIGN", (1,0), (1,0), "RIGHT"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("LINEABOVE", (0,0), (-1,0), 0.5, BORDER),
    ]))
    story.append(footer)

    doc.build(story)
    print(f"PDF generated: {path}")

if __name__ == "__main__":
    build_pdf("audit_report.pdf")
