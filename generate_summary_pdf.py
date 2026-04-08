from fpdf import FPDF

class TracovaPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(31, 139, 76)  # Tracova Green
        self.cell(0, 10, 'TRACOVA BURUNDI', 0, 1, 'C')
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(113, 128, 150)
        self.cell(0, 10, 'GERMAN ENGINEERING - EAST AFRICAN GROWTH', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, '(c) 2026 Tracova International AG - Page ' + str(self.page_no()), 0, 0, 'C')

def create_pdf():
    pdf = TracovaPDF()
    pdf.add_page()
    
    # Intro
    pdf.set_font('Helvetica', 'B', 14)
    pdf.set_text_color(45, 55, 72)
    pdf.cell(0, 10, 'Official Business Prospectus', 0, 1, 'L')
    pdf.ln(2)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(26, 32, 44)
    pdf.multi_cell(0, 6, "Tracova is a German-engineered agricultural platform that bridges high-tech solutions with East African farming. By acquiring our Farm Packages, you fund the deployment of advanced machinery across Burundi, Rwanda, Uganda, and Kenya, receiving guaranteed daily yields.")
    pdf.ln(10)

    # Why Trust
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, 'Why Investors Trust Tracova', 0, 1, 'L')
    pdf.set_font('Helvetica', '', 11)
    trust_points = [
        "- German Precision: Automated precision payouts every 24 hours.",
        "- Daily Profits: See your balance grow every day in real-time.",
        "- Local Integration: Instant withdrawals via Lumicash and EcoCash.",
        "- Physical Assets: Backed by real-world agricultural machinery."
    ]
    for pt in trust_points:
        pdf.cell(0, 6, pt, 0, 1, 'L')
    pdf.ln(10)

    # Table
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_fill_color(247, 250, 252)
    pdf.cell(50, 10, 'Plan Name', 1, 0, 'C', True)
    pdf.cell(30, 10, 'Capital (BIF)', 1, 0, 'C', True)
    pdf.cell(25, 10, 'Daily ROI %', 1, 0, 'C', True)
    pdf.cell(35, 10, 'Daily Profit', 1, 0, 'C', True)
    pdf.cell(40, 10, 'Total (30d)', 1, 1, 'C', True)

    pdf.set_font('Helvetica', '', 10)
    plans = [
        ["Tractor X200", "50,000", "3.0%", "1,500", "95,000"],
        ["Mini Cultivator", "100,000", "3.1%", "3,100", "193,000"],
        ["Plow Deluxe", "150,000", "3.2%", "4,800", "294,000"],
        ["Harvester Pro", "200,000", "3.3%", "6,600", "398,000"],
        ["Silo Storage", "300,000", "3.4%", "10,200", "606,000"],
        ["Seeder M1", "350,000", "3.5%", "12,250", "717,500"],
        ["Miller 250", "400,000", "3.6%", "14,400", "832,000"],
        ["Soil Lab", "450,000", "3.7%", "16,650", "949,500"],
        ["Well Driller", "500,000", "3.8%", "19,000", "1,070,000"],
        ["Crop Duster", "550,000", "3.9%", "21,450", "1,193,500"],
        ["Irrigation", "600,000", "4.1%", "24,600", "1,338,000"],
        ["Harvest Titan", "700,000", "4.3%", "30,100", "1,603,000"],
        ["Crop Rover", "800,000", "4.5%", "36,000", "1,880,000"],
        ["Pro Seeder", "900,000", "4.7%", "42,300", "2,169,000"],
        ["Mega Combine", "1,000,000", "5.0%", "50,000", "2,500,000"]
    ]

    for p in plans:
        pdf.cell(50, 8, p[0], 1, 0, 'L')
        pdf.cell(30, 8, p[1], 1, 0, 'R')
        pdf.cell(25, 8, p[2], 1, 0, 'C')
        pdf.cell(35, 8, p[3], 1, 0, 'R')
        pdf.cell(40, 8, p[4], 1, 1, 'R')

    pdf.ln(10)
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, 'Scale Your Wealth: The Re-investment Secret', 0, 1, 'L')
    pdf.set_font('Helvetica', '', 11)
    pdf.multi_cell(0, 6, "Use the Re-invest button to buy more machines using your current balance. This is the fastest way to compound your daily yields and reach financial freedom.")

    # Output to artifacts directory or workspace
    pdf.output('Tracova_Burundi_Business_Summary.pdf')

if __name__ == '__main__':
    create_pdf()
