from fpdf import FPDF
import os

def create_official_pdf():
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", size=10)
    
    content = [
        "REPORTABLE",
        "IN THE SUPREME COURT OF INDIA",
        "CRIMINAL APPELLATE JURISDICTION",
        "CRIMINAL APPEAL NO. 2232 OF 2016",
        "",
        "SHARAT BABU DIGUMARTI ... APPELLANT",
        "VERSUS",
        "GOVERNMENT OF NCT OF DELHI ... RESPONDENT",
        "",
        "JUDGMENT DATE: 2016-12-14",
        "",
        "JUDGMENT",
        "",
        "Dipak Misra, J.",
        "The appellant was the Senior Manager (Performance Production) of M/s. Bazee.com India Pvt. Ltd. (now known as EBAY.com). The core issue involves the prosecution under Section 67 of the Information Technology Act, 2000 vs Section 292 of the Indian Penal Code.",
        "",
        "The High Court of Delhi had previously dismissed the petition for quashing of the charges. The appellant contends that since the IT Act is a special legislation, its provisions should prevail over the general provisions of the IPC.",
        "",
        "COURT FINDINGS:",
        "We have carefully examined the provisions of Section 67, 67A and 67B of the IT Act. It is a settled principle of law that once the special statute covers the field, the general law shall not be invoked. The legislative intent was to provide a specific framework for electronic records.",
        "",
        "DIRECTIVE:",
        "The order passed by the High Court of Delhi is set aside. The criminal proceedings against the appellant under Section 292 of the IPC are hereby quashed. The respondent is directed to ensure that the electronic records are returned to the appellant within 30 days.",
        "",
        "The State Government is further directed to issue a circular to all police stations clarifying the primacy of the IT Act in cases of electronic records within 90 days of this order.",
        "",
        "Compliance Deadline: 2017-03-14",
        "",
        "IT IS SO ORDERED.",
    ]
    
    for line in content:
        pdf.multi_cell(190, 8, text=line, align='L')
    
    os.makedirs('tests/samples', exist_ok=True)
    pdf.output("tests/samples/official_test_case.pdf")
    print("Created official_test_case.pdf")

if __name__ == "__main__":
    create_official_pdf()
